'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getHealthScoreColor } from '@/lib/obd/utils';
import type { HealthScoreBreakdown } from '@/lib/obd/types';

interface HealthScoreCardProps {
  score: HealthScoreBreakdown;
  isLoading?: boolean;
}

export function HealthScoreCard({ score, isLoading }: HealthScoreCardProps) {
  const categoryScores = [
    { label: 'Engine', value: score.engine, icon: '⚙️' },
    { label: 'Transmission', value: score.transmission, icon: '🔧' },
    { label: 'Emissions', value: score.emissions, icon: '💨' },
    { label: 'Fuel', value: score.fuel, icon: '⛽' },
    { label: 'Battery', value: score.battery, icon: '🔋' },
  ];

  const getScoreStatus = (value: number) => {
    if (value >= 80) return 'Excellent';
    if (value >= 60) return 'Good';
    if (value >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
      <CardHeader>
        <CardTitle>Vehicle Health Score</CardTitle>
        <CardDescription>Comprehensive system assessment</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Score */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-600">Overall Score</span>
            <span className="text-4xl font-bold" style={{ color: getHealthScoreColor(score.overall) }}>
              {score.overall}
            </span>
          </div>
          <div className="flex items-center justify-center w-24 h-24 rounded-full border-4" style={{ borderColor: getHealthScoreColor(score.overall), backgroundColor: `${getHealthScoreColor(score.overall)}15` }}>
            <span className="text-center">
              <div className="text-xs text-slate-600">Status</div>
              <div className="font-semibold">{getScoreStatus(score.overall)}</div>
            </span>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="grid grid-cols-2 gap-3">
          {categoryScores.map((category) => (
            <div key={category.label} className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{category.icon}</span>
                <span className="text-xs font-semibold text-slate-700">{category.label}</span>
              </div>
              <div className="space-y-2">
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${category.value}%`,
                      backgroundColor: getHealthScoreColor(category.value),
                    }}
                  />
                </div>
                <div className="text-sm font-bold" style={{ color: getHealthScoreColor(category.value) }}>
                  {category.value}%
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Status Legend */}
        <div className="pt-4 border-t border-slate-200">
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }} />
              <span className="text-slate-600">Excellent (80+)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
              <span className="text-slate-600">Good (60-79)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }} />
              <span className="text-slate-600">Poor (&lt;60)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
