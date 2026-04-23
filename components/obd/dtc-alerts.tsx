'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DTC_DATABASE } from '@/lib/obd/utils';

interface DTCCode {
  code: string;
  timestamp?: Date;
}

interface DTCAlertProps {
  codes: DTCCode[];
  isLoading?: boolean;
}

export function DTCAlerts({ codes, isLoading }: DTCAlertProps) {
  const getSeverityColor = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'warning':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      default:
        return 'bg-purple-100 border-purple-300 text-purple-800';
    }
  };

  const getSeverityBadgeColor = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getSeverityIcon = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  if (codes.length === 0) {
    return (
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle>Diagnostic Alerts</CardTitle>
          <CardDescription>Active trouble codes and issues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-slate-500 py-8">
            <div className="text-2xl mb-2">✅</div>
            <p>No active diagnostic codes</p>
            <p className="text-xs mt-2">Your vehicle is running normally</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Diagnostic Alerts</span>
          <Badge variant="outline" className="ml-auto">
            {codes.length} Code{codes.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
        <CardDescription>Active trouble codes requiring attention</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {codes.map((dtcCode) => {
          const dtcInfo = DTC_DATABASE[dtcCode.code];

          if (!dtcInfo) {
            return (
              <Alert key={dtcCode.code} className="border-slate-300 bg-slate-50">
                <AlertTitle className="font-mono">{dtcCode.code}</AlertTitle>
                <AlertDescription>Unknown diagnostic code</AlertDescription>
              </Alert>
            );
          }

          return (
            <Alert
              key={dtcCode.code}
              className={`border-2 ${getSeverityColor(dtcInfo.severity)}`}
            >
              <div className="flex gap-3">
                <span className="text-xl">{getSeverityIcon(dtcInfo.severity)}</span>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTitle className="font-mono text-base">{dtcCode.code}</AlertTitle>
                    <Badge variant={getSeverityBadgeColor(dtcInfo.severity)} className="text-xs">
                      {dtcInfo.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <AlertDescription className="space-y-3">
                    <p className="font-medium">{dtcInfo.description}</p>

                    <div>
                      <p className="text-xs font-semibold mb-1">Possible Causes:</p>
                      <ul className="text-xs space-y-1 ml-4">
                        {dtcInfo.possibleCauses.map((cause, idx) => (
                          <li key={idx} className="list-disc">
                            {cause}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <p className="text-xs font-semibold mb-1">Recommended Actions:</p>
                      <ul className="text-xs space-y-1 ml-4">
                        {dtcInfo.solutions.map((solution, idx) => (
                          <li key={idx} className="list-disc">
                            {solution}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {dtcCode.timestamp && (
                      <p className="text-xs text-slate-500 pt-2">
                        Detected: {new Date(dtcCode.timestamp).toLocaleString()}
                      </p>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          );
        })}

        {codes.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-semibold text-blue-900 mb-2">
              ⚠️ Recommended Next Steps
            </p>
            <ul className="text-sm text-blue-800 space-y-1 ml-4 list-disc">
              <li>Take your vehicle to a certified mechanic for diagnosis</li>
              <li>Do not ignore critical severity codes - they may affect safety</li>
              <li>Address issues promptly to prevent further damage</li>
              <li>Keep maintenance records for warranty purposes</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
