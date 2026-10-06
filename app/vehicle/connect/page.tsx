'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  clearOBDConnection,
  getOBDConnection,
  isWebBluetoothSupported,
  requestBluetoothDevice,
  saveOBDConnection,
} from '@/lib/obd/web-bluetooth';
import { connectELM327, disconnectELM327 } from '@/lib/obd/elm327';

const VEHICLE_MAKES = ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Hyundai', 'Suzuki'];
const VEHICLE_YEARS = Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i);

export default function ConnectVehiclePage() {
  const router = useRouter();
  const [deviceName, setDeviceName] = useState('');
  const [vehicleMake, setVehicleMake] = useState('');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleYear, setVehicleYear] = useState('');
  const [vin, setVin] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<BluetoothDevice | null>(null);
  const bluetoothSupported = isWebBluetoothSupported();

  useEffect(() => {
    const connection = getOBDConnection();
    if (!connection?.isConnected) return;

    setDeviceName(connection.deviceName || '');
    setVehicleMake(connection.vehicleMake || '');
    setVehicleModel(connection.vehicleModel || '');
    setVehicleYear(connection.vehicleYear || '');
    setVin(connection.vin || '');
    setConnectionStatus('connected');
    setStatusMessage('An OBD-II adapter is already connected on this browser profile.');
  }, []);

  const handleScanDevices = async () => {
    if (!bluetoothSupported) {
      setConnectionStatus('error');
      setStatusMessage('Web Bluetooth is not available. Use Chrome/Edge on HTTPS or localhost.');
      return;
    }

    setIsScanning(true);
    setStatusMessage('');
    setConnectionStatus('idle');

    try {
      const device = await requestBluetoothDevice();
      setSelectedDevice(device);
      setDeviceName(device.name || device.id || 'OBD-II Device');
      setStatusMessage('Device selected. Fill vehicle details, then click Connect Device.');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'NotFoundError') {
        setStatusMessage('No device selected. Open scanner pairing mode and try again.');
      } else {
        setConnectionStatus('error');
        setStatusMessage(error instanceof Error ? error.message : 'Failed to scan Bluetooth devices.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnect = async () => {
    if (!deviceName || !vehicleMake || !vehicleModel || !vehicleYear) {
      setConnectionStatus('error');
      setStatusMessage('Please fill all required fields before connecting.');
      return;
    }

    if (!selectedDevice) {
      setConnectionStatus('error');
      setStatusMessage('Please scan and select your OBD-II Bluetooth device first.');
      return;
    }

    setConnectionStatus('connecting');
    setStatusMessage('');

    try {
      await connectELM327(selectedDevice);
      saveOBDConnection({
        deviceId: selectedDevice.id,
        deviceName: selectedDevice.name || deviceName,
        vehicleYear,
        vehicleMake,
        vehicleModel,
        vin: vin || undefined,
        transport: 'web-bluetooth',
        isConnected: true,
        connectedAt: new Date().toISOString(),
      });
      setConnectionStatus('connected');
      setStatusMessage('Connected through Web Bluetooth. You can now open Vehicle Dashboard.');
    } catch (error) {
      setConnectionStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Failed to connect to OBD device.');
    }
  };

  const handleDisconnect = () => {
    disconnectELM327();
    clearOBDConnection();
    setConnectionStatus('idle');
    setStatusMessage('Disconnected.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Connect Your Vehicle</h1>
          <p className="text-slate-300">Set up OBD-II device for real-time diagnostics</p>
        </div>

        {/* Connection Status */}
        {connectionStatus === 'connected' && (
          <Alert className="bg-green-50 border-green-300 text-green-800">
            <AlertTitle>Connected Successfully</AlertTitle>
            <AlertDescription>Your OBD-II device is connected and ready to monitor your vehicle</AlertDescription>
          </Alert>
        )}

        {connectionStatus === 'error' && (
          <Alert className="bg-red-50 border-red-300 text-red-800">
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>{statusMessage || 'Please fill in all required fields and try again'}</AlertDescription>
          </Alert>
        )}

        {!bluetoothSupported && (
          <Alert className="bg-amber-50 border-amber-300 text-amber-800">
            <AlertTitle>Web Bluetooth Not Supported</AlertTitle>
            <AlertDescription>
              Use latest Chrome or Edge on HTTPS (or localhost). Safari/Firefox do not fully support Web Bluetooth.
            </AlertDescription>
          </Alert>
        )}

        {statusMessage && connectionStatus !== 'error' && (
          <Alert className="bg-blue-50 border-blue-300 text-blue-800">
            <AlertTitle>Status</AlertTitle>
            <AlertDescription>{statusMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Device Setup */}
          <Card className="lg:col-span-2 bg-white border-slate-200">
            <CardHeader>
              <CardTitle>Device Information</CardTitle>
              <CardDescription>Configure your OBD-II scanner</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Scan for Devices */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  OBD-II Device
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Device name (e.g., Viecar OBD-II)"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    disabled={isScanning || connectionStatus === 'connecting'}
                  />
                  <Button
                    onClick={handleScanDevices}
                    disabled={!bluetoothSupported || isScanning || connectionStatus === 'connecting'}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    {isScanning ? 'Scanning...' : 'Scan'}
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Make sure your OBD-II device is powered on and in pairing mode
                </p>
              </div>

              {/* Vehicle Information */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-4">Vehicle Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">Year</label>
                    <Select value={vehicleYear} onValueChange={setVehicleYear}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {VEHICLE_YEARS.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2">Make</label>
                    <Select value={vehicleMake} onValueChange={setVehicleMake}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select make" />
                      </SelectTrigger>
                      <SelectContent>
                        {VEHICLE_MAKES.map((make) => (
                          <SelectItem key={make} value={make}>
                            {make}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-2">Model</label>
                    <Input
                      placeholder="e.g., Camry, Civic, F-150"
                      value={vehicleModel}
                      onChange={(e) => setVehicleModel(e.target.value)}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-2">
                      VIN (Optional)
                    </label>
                    <Input
                      placeholder="Vehicle Identification Number"
                      value={vin}
                      onChange={(e) => setVin(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Connection Button */}
              <Button
                onClick={handleConnect}
                disabled={!bluetoothSupported || connectionStatus === 'connecting'}
                size="lg"
                className="w-full"
              >
                {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect Device'}
              </Button>
              {connectionStatus === 'connected' && (
                <Button
                  onClick={handleDisconnect}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  Disconnect Device
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Info Sidebar */}
          <div className="space-y-4">
            <Card className="bg-purple-50 border-purple-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">What is OBD-II?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700 space-y-2">
                <p>
                  On-Board Diagnostics (OBD-II) is a standardized system in modern vehicles that monitors engine
                  performance and emissions.
                </p>
                <p>
                  Our system connects to your vehicle through a Bluetooth-enabled OBD-II scanner to provide real-time
                  diagnostics and health monitoring.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Getting Started</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700 space-y-2">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Power on your OBD-II scanner</li>
                  <li>Activate Bluetooth pairing mode</li>
                  <li>Click Scan to find your device</li>
                  <li>Select your vehicle information</li>
                  <li>Connect to start monitoring</li>
                </ol>
              </CardContent>
            </Card>

            {connectionStatus === 'connected' && (
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="text-center space-y-2">
                    <div className="text-2xl">✅</div>
                    <p className="font-semibold text-green-900">Device Connected</p>
                    <Button
                      variant="outline"
                      className="w-full mt-4"
                      onClick={() => router.push('/vehicle/dashboard')}
                    >
                      View Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
