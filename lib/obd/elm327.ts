import type { VehicleData } from './types';
import { connectBluetoothDevice, disconnectBluetoothDevice } from './web-bluetooth';

const NUS_SERVICE_UUID = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const NUS_TX_UUID = '6e400002-b5a3-f393-e0a9-e50e24dcca9e'; // write
const NUS_RX_UUID = '6e400003-b5a3-f393-e0a9-e50e24dcca9e'; // notify

const SERVICE_CANDIDATES = [NUS_SERVICE_UUID, 0xfff0, 0xffe0];

interface ELM327Session {
  device: BluetoothDevice;
  writeCharacteristic: BluetoothRemoteGATTCharacteristic;
  notifyCharacteristic: BluetoothRemoteGATTCharacteristic | null;
  readCharacteristic: BluetoothRemoteGATTCharacteristic | null;
}

let activeSession: ELM327Session | null = null;
let responseBuffer = '';
let notifyHandler: ((event: Event) => void) | null = null;

function toHexPid(value: number): string {
  return value.toString(16).toUpperCase().padStart(2, '0');
}

function cleanResponse(raw: string): string {
  return raw
    .replace(/\r/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/SEARCHING\.\.\./gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parsePidBytes(response: string, mode: string, pidHex: string): number[] | null {
  const cleaned = cleanResponse(response)
    .split(' ')
    .map((part) => part.trim().toUpperCase())
    .filter(Boolean);

  const modeResponse = (parseInt(mode, 16) + 0x40).toString(16).toUpperCase().padStart(2, '0');
  const startIdx = cleaned.findIndex((token, idx) => cleaned[idx] === modeResponse && cleaned[idx + 1] === pidHex);
  if (startIdx === -1) return null;

  const data = cleaned.slice(startIdx + 2).filter((token) => /^[0-9A-F]{2}$/.test(token));
  return data.map((token) => parseInt(token, 16));
}

async function discoverCharacteristics(
  server: BluetoothRemoteGATTServer
): Promise<{
  writeCharacteristic: BluetoothRemoteGATTCharacteristic;
  notifyCharacteristic: BluetoothRemoteGATTCharacteristic | null;
  readCharacteristic: BluetoothRemoteGATTCharacteristic | null;
}> {
  const services = await server.getPrimaryServices();

  for (const service of services) {
    const characteristics = await service.getCharacteristics();
    let writeCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
    let notifyCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
    let readCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;

    for (const characteristic of characteristics) {
      if (!writeCharacteristic && (characteristic.properties.write || characteristic.properties.writeWithoutResponse)) {
        writeCharacteristic = characteristic;
      }
      if (!notifyCharacteristic && (characteristic.properties.notify || characteristic.properties.indicate)) {
        notifyCharacteristic = characteristic;
      }
      if (!readCharacteristic && characteristic.properties.read) {
        readCharacteristic = characteristic;
      }
    }

    if (writeCharacteristic) {
      return { writeCharacteristic, notifyCharacteristic, readCharacteristic };
    }
  }

  for (const candidate of SERVICE_CANDIDATES) {
    try {
      const service = await server.getPrimaryService(candidate);
      const tx = await service.getCharacteristic(NUS_TX_UUID);
      let rx: BluetoothRemoteGATTCharacteristic | null = null;
      try {
        rx = await service.getCharacteristic(NUS_RX_UUID);
      } catch {
        rx = null;
      }
      return { writeCharacteristic: tx, notifyCharacteristic: rx, readCharacteristic: rx };
    } catch {
      // continue trying
    }
  }

  throw new Error('No writable BLE characteristic found for this OBD adapter.');
}

async function sendCommand(command: string, timeoutMs = 2000): Promise<string> {
  if (!activeSession) {
    throw new Error('ELM327 is not connected.');
  }

  responseBuffer = '';
  const payload = `${command}\r`;
  await activeSession.writeCharacteristic.writeValueWithoutResponse(new TextEncoder().encode(payload));

  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (!activeSession.notifyCharacteristic && activeSession.readCharacteristic) {
      try {
        const value = await activeSession.readCharacteristic.readValue();
        responseBuffer += new TextDecoder().decode(value.buffer);
      } catch {
        // Keep retrying until timeout
      }
    }

    if (responseBuffer.includes('>')) {
      return responseBuffer;
    }
    await new Promise((resolve) => setTimeout(resolve, 40));
  }

  throw new Error(`ELM327 timeout waiting for response to "${command}".`);
}

async function initializeAdapter(): Promise<void> {
  const initCommands = ['ATZ', 'ATE0', 'ATL0', 'ATS0', 'ATH0', 'ATSP0'];
  for (const command of initCommands) {
    await sendCommand(command, 3000);
  }
}

export async function connectELM327(device: BluetoothDevice): Promise<void> {
  await connectBluetoothDevice(device);

  if (!device.gatt?.connected) {
    throw new Error('Could not open GATT connection.');
  }

  const { writeCharacteristic, notifyCharacteristic, readCharacteristic } = await discoverCharacteristics(device.gatt);
  activeSession = { device, writeCharacteristic, notifyCharacteristic, readCharacteristic };

  if (notifyCharacteristic) {
    await notifyCharacteristic.startNotifications();
    notifyHandler = (event: Event) => {
      const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
      const value = characteristic.value;
      if (!value) return;
      responseBuffer += new TextDecoder().decode(value.buffer);
    };
    notifyCharacteristic.addEventListener('characteristicvaluechanged', notifyHandler);
  }

  await initializeAdapter();
}

export function disconnectELM327(): void {
  if (activeSession?.notifyCharacteristic && notifyHandler) {
    activeSession.notifyCharacteristic.removeEventListener('characteristicvaluechanged', notifyHandler);
  }
  if (activeSession?.device) {
    disconnectBluetoothDevice(activeSession.device);
  }
  activeSession = null;
  responseBuffer = '';
  notifyHandler = null;
}

export function hasELM327Session(): boolean {
  return !!activeSession?.device?.gatt?.connected;
}

export async function readPid(mode: string, pid: number): Promise<number[] | null> {
  const pidHex = toHexPid(pid);
  const response = await sendCommand(`${mode}${pidHex}`, 2000);
  return parsePidBytes(response, mode, pidHex);
}

export async function readVehicleSnapshot(deviceId: string): Promise<VehicleData> {
  const [rpmBytes, speedBytes, coolantBytes, fuelBytes, loadBytes] = await Promise.all([
    readPid('01', 0x0c),
    readPid('01', 0x0d),
    readPid('01', 0x05),
    readPid('01', 0x2f),
    readPid('01', 0x04),
  ]);

  const rpm = rpmBytes && rpmBytes.length >= 2 ? ((rpmBytes[0] * 256 + rpmBytes[1]) / 4) : 0;
  const speed = speedBytes && speedBytes.length >= 1 ? speedBytes[0] : 0;
  const coolantTemp = coolantBytes && coolantBytes.length >= 1 ? coolantBytes[0] - 40 : 0;
  const fuelLevel = fuelBytes && fuelBytes.length >= 1 ? (fuelBytes[0] * 100) / 255 : 0;
  const engineLoad = loadBytes && loadBytes.length >= 1 ? (loadBytes[0] * 100) / 255 : 0;

  return {
    id: `live_${Date.now()}`,
    deviceId,
    rpm: Math.round(rpm),
    speed: Math.round(speed * 10) / 10,
    engineLoad: Math.round(engineLoad * 10) / 10,
    coolantTemp: Math.round(coolantTemp * 10) / 10,
    fuelLevel: Math.round(fuelLevel * 10) / 10,
    odometerDistance: 0,
    timestamp: new Date(),
  };
}
