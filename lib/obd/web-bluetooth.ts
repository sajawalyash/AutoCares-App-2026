export type OBDTransport = 'web-bluetooth' | 'simulator';

export interface OBDConnectionState {
  deviceId: string;
  deviceName: string;
  vehicleYear: string;
  vehicleMake: string;
  vehicleModel: string;
  vin?: string;
  transport: OBDTransport;
  isConnected: boolean;
  connectedAt: string;
}

const OBD_CONNECTION_KEY = 'autocares_obd_connection';
export const OBD_CONNECTION_EVENT = 'autocares-obd-connection-changed';

const OBD_OPTIONAL_SERVICES = [
  // Common BLE services exposed by many OBD dongles/adapters.
  // Not every adapter exposes these same UUIDs.
  'battery_service',
  0xfff0,
  0xfff1,
  0xffe0,
];

export function isWebBluetoothSupported(): boolean {
  return typeof window !== 'undefined' && 'bluetooth' in navigator;
}

export async function requestBluetoothDevice(): Promise<BluetoothDevice> {
  if (!isWebBluetoothSupported()) {
    throw new Error('Web Bluetooth is not supported in this browser/device.');
  }

  return navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: OBD_OPTIONAL_SERVICES,
  });
}

export async function connectBluetoothDevice(device: BluetoothDevice): Promise<void> {
  if (!device.gatt) {
    throw new Error('Selected Bluetooth device does not expose GATT.');
  }

  if (device.gatt.connected) {
    return;
  }

  await device.gatt.connect();
}

export async function getKnownBluetoothDeviceById(deviceId: string): Promise<BluetoothDevice | null> {
  if (!isWebBluetoothSupported() || !('getDevices' in navigator.bluetooth)) {
    return null;
  }

  const devices = await navigator.bluetooth.getDevices();
  return devices.find((device) => device.id === deviceId) || null;
}

export function disconnectBluetoothDevice(device: BluetoothDevice): void {
  if (device.gatt?.connected) {
    device.gatt.disconnect();
  }
}

export function saveOBDConnection(state: OBDConnectionState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(OBD_CONNECTION_KEY, JSON.stringify(state));
  window.dispatchEvent(new Event(OBD_CONNECTION_EVENT));
}

export function getOBDConnection(): OBDConnectionState | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(OBD_CONNECTION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as OBDConnectionState;
  } catch {
    return null;
  }
}

export function clearOBDConnection(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(OBD_CONNECTION_KEY);
  window.dispatchEvent(new Event(OBD_CONNECTION_EVENT));
}
