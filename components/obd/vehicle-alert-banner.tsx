'use client';

import { useEffect, useState } from 'react';
import { X, AlertTriangle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAlertMessage } from '@/lib/obd/utils';
import type { VehicleData } from '@/lib/obd/types';

interface VehicleAlertBannerProps {
  vehicleData: VehicleData | null;
  dtcCount: number;
  onDismiss?: () => void;
}

export function VehicleAlertBanner({
  vehicleData,
  dtcCount,
  onDismiss,
}: VehicleAlertBannerProps) {
  const [alerts, setAlerts] = useState<Array<{ id: string; message: string; severity: 'critical' | 'warning' }>>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const newAlerts = [];

    if (!vehicleData) return;

    // Check for critical conditions
    const alertMessage = getAlertMessage(
      vehicleData.coolantTemp,
      vehicleData.fuelLevel,
      vehicleData.engineLoad
    );

    if (alertMessage) {
      newAlerts.push({
        id: 'vehicle-condition',
        message: alertMessage,
        severity: vehicleData.coolantTemp > 110 ? 'critical' : 'warning',
      });
    }

    // Check for DTCs
    if (dtcCount > 0) {
      const severity = dtcCount > 2 ? 'critical' : 'warning';
      newAlerts.push({
        id: 'dtc-alert',
        message: `${dtcCount} diagnostic code${dtcCount > 1 ? 's' : ''} detected. Check diagnostics for details.`,
        severity,
      });
    }

    setAlerts(newAlerts);
  }, [vehicleData, dtcCount]);

  if (alerts.length === 0 || !isVisible) {
    return null;
  }

  // Show the most critical alert
  const alert = alerts.reduce((prev, curr) =>
    curr.severity === 'critical' ? curr : prev
  );

  const isCritical = alert.severity === 'critical';

  return (
    <div
      className={`fixed top-20 left-4 right-4 max-w-md z-40 rounded-lg shadow-lg animate-in slide-in-from-top-2 duration-300 ${
        isCritical ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'
      }`}
    >
      <div className="p-4 flex gap-4 items-start">
        <div className="flex-shrink-0 mt-0.5">
          {isCritical ? (
            <AlertTriangle className="w-5 h-5 text-red-600" />
          ) : (
            <AlertCircle className="w-5 h-5 text-blue-600" />
          )}
        </div>

        <div className="flex-1">
          <p
            className={`font-semibold text-sm ${
              isCritical ? 'text-red-900' : 'text-blue-900'
            }`}
          >
            {isCritical ? 'Critical Alert' : 'Warning'}
          </p>
          <p
            className={`text-sm mt-1 ${
              isCritical ? 'text-red-800' : 'text-blue-800'
            }`}
          >
            {alert.message}
          </p>
        </div>

        <button
          onClick={() => {
            setIsVisible(false);
            onDismiss?.();
          }}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
