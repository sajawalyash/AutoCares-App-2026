'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Bluetooth, Gauge, BarChart3, AlertCircle } from 'lucide-react';

interface OBDOnboardingProps {
  onComplete?: () => void;
  currentStep?: number;
}

export function OBDOnboarding({ onComplete, currentStep = 0 }: OBDOnboardingProps) {
  const steps = [
    {
      title: 'Get an OBD-II Scanner',
      description: 'Purchase a Bluetooth-enabled OBD-II scanner compatible with your vehicle',
      icon: Bluetooth,
      details: [
        'Look for Bluetooth BLE scanners for compatibility',
        'Popular options: Viecar, OBDLink, XGIMI',
        'Usually $30-100 range',
      ],
    },
    {
      title: 'Connect Your Vehicle',
      description: 'Pair the scanner with your phone via Bluetooth and register your vehicle',
      icon: Gauge,
      details: [
        'Power on the OBD-II scanner',
        'Go to Vehicle > Connect Vehicle',
        'Follow the pairing wizard',
        'Enter your vehicle information',
      ],
    },
    {
      title: 'View Real-Time Data',
      description: 'Monitor engine RPM, temperature, fuel level, and more in real-time',
      icon: BarChart3,
      details: [
        'Check engine status and health score',
        'View live sensor readings',
        'Identify trends over time',
        'Get instant alerts for issues',
      ],
    },
    {
      title: 'Analyze Diagnostic Codes',
      description: 'Understand and resolve diagnostic trouble codes (DTCs) with our AI',
      icon: AlertCircle,
      details: [
        'View active and historical codes',
        'Get explanations and solutions',
        'Share with mechanics for faster diagnosis',
        'Track resolution status',
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Getting Started with OBD-II Monitoring</h2>
        <p className="text-slate-600 mt-2">Follow these steps to enable real-time vehicle diagnostics</p>
      </div>

      <div className="grid gap-4">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <Card
              key={idx}
              className={`transition-all ${
                isCompleted ? 'bg-green-50 border-green-200' : isCurrent ? 'border-purple-200' : 'border-slate-200'
              }`}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-green-100'
                        : isCurrent
                          ? 'bg-purple-100'
                          : 'bg-slate-100'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    ) : (
                      <Icon
                        className={`w-6 h-6 ${
                          isCurrent ? 'text-purple-600' : 'text-slate-600'
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">
                        Step {idx + 1}: {step.title}
                      </CardTitle>
                      {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                    </div>
                    <CardDescription className="mt-1">{step.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>

              {(isCompleted || isCurrent) && (
                <CardContent>
                  <ul className="space-y-2">
                    {step.details.map((detail, detailIdx) => (
                      <li key={detailIdx} className="flex items-start gap-3 text-sm text-slate-700">
                        <span className="text-purple-600 font-bold mt-0.5">•</span>
                        {detail}
                      </li>
                    ))}
                  </ul>

                  {isCurrent && (
                    <Button
                      onClick={() => onComplete?.()}
                      className="mt-4 w-full"
                    >
                      Continue to Next Step
                    </Button>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {currentStep === steps.length && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="text-4xl">🎉</div>
            <div>
              <h3 className="font-semibold text-green-900">Setup Complete!</h3>
              <p className="text-sm text-green-800 mt-1">
                Your vehicle is now connected and being monitored in real-time
              </p>
            </div>
            <Button onClick={() => (window.location.href = '/vehicle/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Benefits Section */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Why Monitor Your Vehicle?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <p>
              <strong>Early Problem Detection:</strong> Catch issues before they become expensive repairs
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <p>
              <strong>Better Maintenance:</strong> Know exactly when your vehicle needs service
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <p>
              <strong>Cost Savings:</strong> Prevent major repairs through preventive maintenance
            </p>
          </div>
          <div className="flex gap-3">
            <span className="text-green-600 font-bold">✓</span>
            <p>
              <strong>Peace of Mind:</strong> Always know your vehicle's health status
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
