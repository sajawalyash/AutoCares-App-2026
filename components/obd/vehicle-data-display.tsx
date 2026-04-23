'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatRPM, formatSpeed, formatTemperature, formatFuelLevel } from '@/lib/obd/utils';
import type { VehicleData } from '@/lib/obd/types';

interface VehicleDataDisplayProps {
  data: VehicleData | null;
  isLoading?: boolean;
}

export function VehicleDataDisplay({ data, isLoading }: VehicleDataDisplayProps) {
  if (!data) {
    return (
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle>Vehicle Data</CardTitle>
          <CardDescription>Real-time sensor readings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-500 py-8">No data available</div>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      label: 'RPM',
      value: formatRPM(data.rpm),
      icon: '📊',
      category: 'Engine',
      color: data.rpm > 6000 ? '#ef4444' : data.rpm > 3000 ? '#f59e0b' : '#10b981',
    },
    {
      label: 'Speed',
      value: formatSpeed(data.speed),
      icon: '🚗',
      category: 'Movement',
      color: '#3b82f6',
    },
    {
      label: 'Engine Load',
      value: `${data.engineLoad.toFixed(1)}%`,
      icon: '⚙️',
      category: 'Engine',
      color: data.engineLoad > 85 ? '#ef4444' : data.engineLoad > 50 ? '#f59e0b' : '#10b981',
    },
    {
      label: 'Coolant Temp',
      value: formatTemperature(data.coolantTemp),
      icon: '🌡️',
      category: 'Temperature',
      color: data.coolantTemp > 105 ? '#ef4444' : data.coolantTemp > 90 ? '#f59e0b' : '#10b981',
    },
    {
      label: 'Fuel Level',
      value: formatFuelLevel(data.fuelLevel),
      icon: '⛽',
      category: 'Fuel',
      color: data.fuelLevel < 15 ? '#ef4444' : data.fuelLevel < 30 ? '#f59e0b' : '#10b981',
    },
    {
      label: 'Odometer',
      value: `${data.odometerDistance.toLocaleString('en-US')} km`,
      icon: '📍',
      category: 'Distance',
      color: '#6366f1',
    },
  ];

  // Group by category
  const grouped = metrics.reduce(
    (acc, metric) => {
      if (!acc[metric.category]) {
        acc[metric.category] = [];
      }
      acc[metric.category].push(metric);
      return acc;
    },
    {} as Record<string, typeof metrics>
  );

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <CardTitle>Vehicle Data</CardTitle>
        <CardDescription>
          Real-time sensor readings {data.timestamp && `(${new Date(data.timestamp).toLocaleTimeString()})`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, categoryMetrics]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">{category}</h3>
              <div className="grid grid-cols-2 gap-3">
                {categoryMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="p-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-slate-600">{metric.label}</span>
                      <span className="text-xl">{metric.icon}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl font-bold" style={{ color: metric.color }}>
                        {metric.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Warning Indicators */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <div className="space-y-2 text-sm">
            {data.coolantTemp > 100 && (
              <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-2 rounded">
                <span>⚠️</span>
                <span>Engine coolant temperature is elevated</span>
              </div>
            )}
            {data.coolantTemp > 110 && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded">
                <span>🚨</span>
                <span>CRITICAL: Engine overheating</span>
              </div>
            )}
            {data.fuelLevel < 15 && (
              <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-2 rounded">
                <span>⚠️</span>
                <span>Fuel level is low</span>
              </div>
            )}
            {data.engineLoad > 85 && (
              <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-2 rounded">
                <span>⚠️</span>
                <span>Engine load is high</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
