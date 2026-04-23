'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getHealthScoreColor } from '@/lib/obd/utils';
import { getSimulator } from '@/lib/obd/simulator';
import { calculateHealthScore } from '@/lib/obd/utils';
import { DTC_DATABASE } from '@/lib/obd/utils';
import type { VehicleData, HealthScoreBreakdown } from '@/lib/obd/types';
import Link from 'next/link';
import { Car, AlertTriangle, TrendingUp, Settings } from 'lucide-react';

interface OBDDashboardSummaryProps {
  userId?: string;
}

export function OBDDashboardSummary({ userId }: OBDDashboardSummaryProps) {
  const [hasOBDDevice, setHasOBDDevice] = useState(false);
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [healthScore, setHealthScore] = useState<HealthScoreBreakdown | null>(null);
  const [activeDTCs, setActiveDTCs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // For now, simulate checking if user has OBD device
    // In production, this would check the database for obd_connections
    const checkOBDStatus = async () => {
      try {
        // Simulate API call to check if user has OBD device
        // For demo purposes, we will assume they have one and use simulator data
        setHasOBDDevice(true);

        const simulator = getSimulator();
        const data = simulator.getVehicleData('device_001');
        const dtcs = simulator.getActiveDTCs();

        setVehicleData(data);
        setActiveDTCs(dtcs);

        // Calculate health score
        const databaseDTCs = dtcs.map(code => DTC_DATABASE[code]).filter(Boolean);
        const score = calculateHealthScore(
          databaseDTCs,
          data.coolantTemp,
          data.fuelLevel,
          data.engineLoad
        );
        setHealthScore(score);
      } catch (error) {
        console.error('Error loading OBD data:', error);
        setHasOBDDevice(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOBDStatus();
  }, [userId]);

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Vehicle Health Monitor
          </CardTitle>
          <CardDescription>Loading vehicle data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-blue-200 rounded w-3/4"></div>
            <div className="h-4 bg-blue-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasOBDDevice) {
    return (
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="w-5 h-5" />
            Vehicle Health Monitor
          </CardTitle>
          <CardDescription>Monitor your vehicle's health in real-time</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Connect an OBD-II device to your vehicle for real-time diagnostics, health monitoring, and early problem detection.
          </p>
          <Link href="/vehicle/connect">
            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              <Settings className="w-4 h-4 mr-2" />
              Connect OBD Device
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusText = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="w-5 h-5" />
          Vehicle Health Monitor
        </CardTitle>
        <CardDescription>Real-time vehicle diagnostics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health Score Summary */}
        {healthScore && (
          <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <TrendingUp className={`w-4 h-4 ${getStatusColor(healthScore.overall)}`} />
                <span className="font-semibold text-lg" style={{ color: getHealthScoreColor(healthScore.overall) }}>
                  {healthScore.overall}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">Overall Health</p>
                <p className="text-xs">
                  {getStatusText(healthScore.overall)}
                </p>
              </div>
            </div>
            {activeDTCs.length > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {activeDTCs.length} Issue{activeDTCs.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        )}

        {/* Quick Stats */}
        {vehicleData && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-xs text-gray-600">Engine</p>
              <p className="font-semibold">{vehicleData.rpm} RPM</p>
            </div>
            <div className="bg-white p-3 rounded-lg border">
              <p className="text-xs text-gray-600">Fuel Level</p>
              <p className="font-semibold">{vehicleData.fuelLevel}%</p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <Link href="/vehicle/dashboard">
          <Button variant="outline" className="w-full">
            View Full Dashboard
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
