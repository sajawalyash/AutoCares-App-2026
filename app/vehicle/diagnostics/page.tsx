'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DTC_DATABASE } from '@/lib/obd/utils';

export default function DiagnosticsPage() {
  const [searchCode, setSearchCode] = useState('');
  const [selectedSystem, setSelectedSystem] = useState<string | null>(null);

  const allCodes = Object.entries(DTC_DATABASE);
  const systems = ['Powertrain', 'Chassis', 'Emissions', 'Transmission'];

  const filteredCodes = allCodes.filter(([code, info]) => {
    const matchesSearch = code.toLowerCase().includes(searchCode.toLowerCase()) ||
      info.description.toLowerCase().includes(searchCode.toLowerCase());
    const matchesSystem = !selectedSystem || code[0] === selectedSystem[0];
    return matchesSearch && matchesSystem;
  });

  const getSeverityColor = (severity: 'critical' | 'warning' | 'info') => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">OBD-II Diagnostic Code Database</h1>
          <p className="text-slate-600 mt-2">Search and understand diagnostic trouble codes (DTCs)</p>
        </div>

        {/* Search & Filter */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search code or description..."
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            className="md:col-span-2"
          />
          <div className="flex gap-2">
            <Button
              variant={selectedSystem === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSystem(null)}
              className="text-xs"
            >
              All Systems
            </Button>
          </div>
          <div className="flex gap-2">
            <span className="text-xs text-slate-600 flex items-center">
              {filteredCodes.length} codes found
            </span>
          </div>
        </div>

        {/* System Filter Chips */}
        <div className="flex gap-2 flex-wrap">
          {systems.map((system) => (
            <Button
              key={system}
              variant={selectedSystem === system ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSystem(selectedSystem === system ? null : system)}
              className="text-xs"
            >
              {system}
            </Button>
          ))}
        </div>

        {/* Codes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredCodes.length === 0 ? (
            <Card className="lg:col-span-2 bg-slate-50 border-slate-200">
              <CardContent className="pt-6 text-center text-slate-500 py-8">
                <p className="text-lg font-medium mb-2">No codes found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </CardContent>
            </Card>
          ) : (
            filteredCodes.map(([code, info]) => (
              <Card key={code} className="hover:shadow-md transition-shadow border-slate-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="font-mono font-bold text-lg text-slate-900">{code}</div>
                      <CardDescription className="mt-1 line-clamp-2">{info.description}</CardDescription>
                    </div>
                    <Badge variant={getSeverityColor(info.severity)} className="whitespace-nowrap">
                      {info.severity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Possible Causes */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
                      {getSeverityIcon(info.severity)} Possible Causes
                    </h4>
                    <ul className="text-xs text-slate-600 space-y-1 ml-4 list-disc">
                      {info.possibleCauses.map((cause, idx) => (
                        <li key={idx}>{cause}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Solutions */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-700 mb-2">💡 Recommended Solutions</h4>
                    <ul className="text-xs text-slate-600 space-y-1 ml-4 list-disc">
                      {info.solutions.map((solution, idx) => (
                        <li key={idx}>{solution}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Severity Info */}
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-xs text-slate-500">
                      {info.severity === 'critical'
                        ? 'This is a critical issue that requires immediate attention.'
                        : info.severity === 'warning'
                          ? 'This issue should be addressed soon to prevent further damage.'
                          : 'This is informational and may not require immediate action.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Help Section */}
        <Card className="bg-purple-50 border-purple-200">
          <CardHeader>
            <CardTitle className="text-base">Understanding DTCs</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-700 space-y-3">
            <div>
              <p className="font-semibold mb-1">DTC Format:</p>
              <p className="font-mono text-xs bg-white p-2 rounded border border-purple-200 mb-2">
                P0123 (Example)
              </p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>
                  <strong>P</strong> = Powertrain (also C=Chassis, B=Body, U=Network)
                </li>
                <li>
                  <strong>0</strong> = Generic code (also 1-3 for manufacturer-specific)
                </li>
                <li>
                  <strong>123</strong> = Specific fault location and type
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold mb-1">Severity Levels:</p>
              <ul className="space-y-1 ml-4 list-disc">
                <li>
                  <strong>🚨 Critical:</strong> Addresses major safety or emissions issues
                </li>
                <li>
                  <strong>⚠️ Warning:</strong> Should be serviced soon
                </li>
                <li>
                  <strong>ℹ️ Info:</strong> Non-critical information codes
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
