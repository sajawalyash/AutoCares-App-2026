'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';

// Mock historical data
const mockHistoryData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  }),
  avgTemp: 92 + Math.random() * 15,
  avgRPM: 2000 + Math.random() * 2000,
  healthScore: 75 + Math.random() * 20,
  issues: Math.floor(Math.random() * 4),
}));

const mockDTCHistory = [
  { code: 'P0300', description: 'Random/Multiple Cylinder Misfire', date: '2024-04-08', resolved: true },
  { code: 'P0171', description: 'System Too Lean (Bank 1)', date: '2024-04-07', resolved: true },
  { code: 'P0128', description: 'Coolant Thermostat Circuit', date: '2024-04-05', resolved: false },
  { code: 'P0420', description: 'Catalyst System Efficiency Below Threshold', date: '2024-04-03', resolved: false },
  { code: 'P0101', description: 'Mass Air Flow (MAF) Sensor Range', date: '2024-03-28', resolved: true },
];

const mockServiceHistory = [
  { date: '2024-04-01', service: 'Oil Change', cost: '$45', notes: 'Routine maintenance' },
  { date: '2024-03-15', service: 'Tire Rotation', cost: '$35', notes: 'Balanced and rotated' },
  { date: '2024-03-01', service: 'Brake Inspection', cost: '$0', notes: 'Free inspection - no issues' },
  { date: '2024-02-10', service: 'Air Filter Replacement', cost: '$25', notes: 'Engine air filter replaced' },
];

export default function HistoryPage() {
  const [timeRange, setTimeRange] = useState('30days');
  const [activeTab, setActiveTab] = useState<'overview' | 'dtc' | 'service'>('overview');

  const CustomTooltip = (props: TooltipProps<number, string>) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded border border-slate-200 shadow-lg">
          <p className="text-xs font-semibold text-slate-900">{payload[0].payload.date}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Vehicle History</h1>
            <p className="text-slate-600 mt-1">Track diagnostics, issues, and maintenance records</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Button>
          <Button
            variant={activeTab === 'dtc' ? 'default' : 'outline'}
            onClick={() => setActiveTab('dtc')}
          >
            DTC History
          </Button>
          <Button
            variant={activeTab === 'service' ? 'default' : 'outline'}
            onClick={() => setActiveTab('service')}
          >
            Service History
          </Button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white border-slate-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-slate-600 mb-1">Average Health Score</p>
                    <p className="text-3xl font-bold text-green-600">
                      {Math.round(mockHistoryData.reduce((a, b) => a + b.healthScore, 0) / mockHistoryData.length)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-slate-600 mb-1">Total Issues</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {mockHistoryData.reduce((a, b) => a + b.issues, 0)}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-slate-600 mb-1">Avg Temp</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {Math.round(mockHistoryData.reduce((a, b) => a + b.avgTemp, 0) / mockHistoryData.length)}°C
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-slate-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-slate-600 mb-1">Avg RPM</p>
                    <p className="text-3xl font-bold text-slate-600">
                      {Math.round(mockHistoryData.reduce((a, b) => a + b.avgRPM, 0) / mockHistoryData.length).toLocaleString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Health Score Trend */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle>Health Score Trend</CardTitle>
                <CardDescription>30-day health score progression</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={mockHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" style={{ fontSize: 12 }} />
                    <YAxis style={{ fontSize: 12 }} domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="healthScore"
                      stroke="#10b981"
                      dot={{ fill: '#10b981', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Health Score"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Temperature & RPM Chart */}
            <Card className="bg-white border-slate-200">
              <CardHeader>
                <CardTitle>Engine Performance</CardTitle>
                <CardDescription>Temperature and RPM trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockHistoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" style={{ fontSize: 12 }} />
                    <YAxis yAxisId="left" style={{ fontSize: 12 }} />
                    <YAxis yAxisId="right" orientation="right" style={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="avgTemp" fill="#ef4444" name="Avg Temp (°C)" />
                    <Bar yAxisId="right" dataKey="avgRPM" fill="#3b82f6" name="Avg RPM" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* DTC History Tab */}
        {activeTab === 'dtc' && (
          <div className="space-y-4">
            <div className="flex gap-2 mb-4">
              <Badge variant="outline">All DTCs: {mockDTCHistory.length}</Badge>
              <Badge variant="default">
                Resolved: {mockDTCHistory.filter((d) => d.resolved).length}
              </Badge>
              <Badge variant="destructive">
                Active: {mockDTCHistory.filter((d) => !d.resolved).length}
              </Badge>
            </div>

            {mockDTCHistory.map((dtc, idx) => (
              <Card key={idx} className="bg-white border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-slate-900">{dtc.code}</span>
                        <Badge variant={dtc.resolved ? 'outline' : 'destructive'}>
                          {dtc.resolved ? 'Resolved' : 'Active'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{dtc.description}</p>
                      <p className="text-xs text-slate-500">First detected: {dtc.date}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Service History Tab */}
        {activeTab === 'service' && (
          <div className="space-y-4">
            <Button className="w-full md:w-auto">Record Service</Button>

            {mockServiceHistory.map((service, idx) => (
              <Card key={idx} className="bg-white border-slate-200">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{service.service}</h3>
                        <span className="text-sm font-medium text-green-600">{service.cost}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-1">{service.notes}</p>
                      <p className="text-xs text-slate-500">Date: {service.date}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
