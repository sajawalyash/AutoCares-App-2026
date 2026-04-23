'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HealthScoreCard } from '@/components/obd/health-score-card';
import { VehicleDataDisplay } from '@/components/obd/vehicle-data-display';
import { DTCAlerts } from '@/components/obd/dtc-alerts';
import { getSimulator } from '@/lib/obd/simulator';
import { calculateHealthScore } from '@/lib/obd/utils';
import { DTC_DATABASE } from '@/lib/obd/utils';
import type { VehicleData } from '@/lib/obd/types';
import { connectELM327, hasELM327Session, readVehicleSnapshot } from '@/lib/obd/elm327';
import {
  getKnownBluetoothDeviceById,
  getOBDConnection,
  OBD_CONNECTION_EVENT,
  type OBDConnectionState,
} from '@/lib/obd/web-bluetooth';

export default function VehicleDashboardPage() {
  const router = useRouter();
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [dtcCodes, setDtcCodes] = useState<Array<{ code: string; timestamp?: Date }>>([]);
  const [isEngineRunning, setIsEngineRunning] = useState(false);
  const [obdConnection, setObdConnection] = useState<OBDConnectionState | null>(null);
  const [dataSource, setDataSource] = useState<'elm327' | 'simulator'>('simulator');
  const [transportError, setTransportError] = useState<string | null>(null);
  const [healthScore, setHealthScore] = useState({
    engine: 100,
    transmission: 100,
    emissions: 100,
    fuel: 100,
    battery: 100,
    overall: 100,
  });

  const simulator = getSimulator();

  useEffect(() => {
    const syncConnection = () => {
      setObdConnection(getOBDConnection());
    };

    syncConnection();
    window.addEventListener(OBD_CONNECTION_EVENT, syncConnection);
    return () => window.removeEventListener(OBD_CONNECTION_EVENT, syncConnection);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const initLiveTransport = async () => {
      if (!obdConnection?.isConnected) {
        setDataSource('simulator');
        return;
      }

      try {
        if (!hasELM327Session()) {
          const knownDevice = await getKnownBluetoothDeviceById(obdConnection.deviceId);
          if (!knownDevice) {
            throw new Error('Bluetooth permission was not found. Reconnect from Connect Vehicle page.');
          }
          await connectELM327(knownDevice);
        }

        if (!cancelled) {
          setDataSource('elm327');
          setTransportError(null);
        }
      } catch (error) {
        if (!cancelled) {
          setDataSource('simulator');
          setTransportError(error instanceof Error ? error.message : 'Failed to initialize live OBD transport.');
        }
      }
    };

    initLiveTransport();
    return () => {
      cancelled = true;
    };
  }, [obdConnection?.deviceId, obdConnection?.isConnected]);

  // Update vehicle data periodically
  useEffect(() => {
    let inFlight = false;
    const interval = setInterval(async () => {
      if (inFlight) return;
      inFlight = true;

      try {
        let data: VehicleData;
        let activeDTCs: string[] = [];

        if (dataSource === 'elm327' && obdConnection?.isConnected) {
          data = await readVehicleSnapshot(obdConnection.deviceId);
          setTransportError(null);
        } else {
          if (isEngineRunning) {
            simulator.simulateRealisticCycle();
          }
          data = simulator.getVehicleData(obdConnection?.deviceId || 'device_001');
          activeDTCs = simulator.getActiveDTCs();
        }

        setVehicleData(data);
        setDtcCodes(
          activeDTCs.map((code) => ({
            code,
            timestamp: new Date(),
          }))
        );

        const databaseDTCs = activeDTCs.map((code) => DTC_DATABASE[code]).filter(Boolean);
        const score = calculateHealthScore(databaseDTCs, data.coolantTemp, data.fuelLevel, data.engineLoad);
        setHealthScore(score);
      } catch (error) {
        setDataSource('simulator');
        setTransportError(error instanceof Error ? error.message : 'Live OBD read failed. Switched to simulator.');
      } finally {
        inFlight = false;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [dataSource, isEngineRunning, simulator, obdConnection?.deviceId, obdConnection?.isConnected]);

  const handleEngineToggle = () => {
    if (!isEngineRunning) {
      simulator.startEngine();
      setIsEngineRunning(true);
    } else {
      simulator.stopEngine();
      setIsEngineRunning(false);
    }
  };

  const handleInjectDTC = (code: string) => {
    simulator.injectDTC(code);
  };

  const handleClearDTCs = () => {
    simulator.clearAllDTCs();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Vehicle Info */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Vehicle Dashboard</h1>
            <p className="text-slate-600 mt-1">
              {obdConnection
                ? `${obdConnection.vehicleYear} ${obdConnection.vehicleMake} ${obdConnection.vehicleModel} - Real-time diagnostics`
                : 'Vehicle not connected yet - connect OBD-II to start'}
            </p>
          </div>
          <Button
            size="lg"
            onClick={handleEngineToggle}
            variant={isEngineRunning ? 'destructive' : 'default'}
            disabled={!obdConnection?.isConnected || dataSource === 'elm327'}
          >
            {dataSource === 'elm327' ? 'Live Mode Active' : isEngineRunning ? '🛑 Stop Engine' : '▶️ Start Engine'}
          </Button>
        </div>

        {/* Status Badge */}
        <div className="flex gap-2 flex-wrap">
          <Badge variant={isEngineRunning ? 'default' : 'secondary'}>
            {isEngineRunning ? 'Engine Running' : 'Engine Off'}
          </Badge>
          <Badge variant={obdConnection?.isConnected ? 'outline' : 'destructive'}>
            {obdConnection?.isConnected ? 'Bluetooth Connected' : 'Disconnected'}
          </Badge>
          <Badge variant="secondary">
            {dataSource === 'elm327' ? 'Data Source: Live ELM327' : 'Data Source: Simulator'}
          </Badge>
          <Badge variant={dtcCodes.length === 0 ? 'default' : 'destructive'}>
            {dtcCodes.length === 0 ? 'No Codes' : `${dtcCodes.length} Code(s)`}
          </Badge>
          {!obdConnection?.isConnected && (
            <Button size="sm" variant="outline" onClick={() => router.push('/vehicle/connect')}>
              Connect OBD-II
            </Button>
          )}
        </div>
        {transportError && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
            Live adapter read unavailable: {transportError}
          </p>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Health Score & Data */}
          <div className="lg:col-span-2 space-y-6">
            <HealthScoreCard score={healthScore} />
            <VehicleDataDisplay data={vehicleData} />
          </div>

          {/* Right Column - Quick Actions & Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-slate-600 mb-4">
                  {dataSource === 'elm327' ? 'Live mode active (simulator controls disabled)' : 'Simulator Controls (for testing)'}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => handleInjectDTC('P0300')}
                  disabled={dataSource === 'elm327'}
                >
                  Inject Misfire Code (P0300)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => handleInjectDTC('P0128')}
                  disabled={dataSource === 'elm327'}
                >
                  Inject Thermostat Code (P0128)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => handleInjectDTC('P0171')}
                  disabled={dataSource === 'elm327'}
                >
                  Inject Lean Code (P0171)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs text-red-600"
                  onClick={handleClearDTCs}
                  disabled={dtcCodes.length === 0 || dataSource === 'elm327'}
                >
                  Clear All Codes
                </Button>
              </CardContent>
            </Card>

            {/* Vehicle Info */}
            <Card className="bg-slate-50 border-slate-200">
              <CardHeader>
                <CardTitle className="text-base">Vehicle Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Year:</span>
                  <span className="font-medium">{obdConnection?.vehicleYear || '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Make:</span>
                  <span className="font-medium">{obdConnection?.vehicleMake || '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Model:</span>
                  <span className="font-medium">{obdConnection?.vehicleModel || '--'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">VIN:</span>
                  <span className="font-medium font-mono text-xs">{obdConnection?.vin || '--'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Last Updated */}
            <Card className="bg-purple-50 border-purple-200">
              <CardContent className="pt-6">
                <p className="text-xs text-slate-600">Last Updated</p>
                <p className="text-sm font-medium text-slate-900">
                  {vehicleData?.timestamp ? new Date(vehicleData.timestamp).toLocaleTimeString() : '--:--:--'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Diagnostic Alerts */}
        <DTCAlerts codes={dtcCodes} />

        {/* Additional Info */}
        <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">About Real-Time Monitoring</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-700 space-y-2">
            <p>
              This dashboard displays real-time data from your vehicle's OBD-II system, including engine RPM, speed,
              temperature, fuel level, and active diagnostic trouble codes (DTCs).
            </p>
            <p>
              Health Score combines multiple factors to provide an overall assessment of your vehicle's condition. Regular
              monitoring helps identify issues early before they become serious problems.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
