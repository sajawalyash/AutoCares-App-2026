# OBD-II Quick Start Guide

## Fast Setup (2 minutes)

### 1. Test the OBD Features
```bash
# Navigate to vehicle dashboard
http://localhost:3000/vehicle/dashboard
```

### 2. Start Engine Simulation
Click the "▶️ Start Engine" button at the top

### 3. Inject Test Codes
Use the Quick Actions buttons:
- "Inject Misfire Code (P0300)" - Multiple cylinder misfires
- "Inject Thermostat Code (P0128)" - Coolant temperature issue
- "Inject Lean Code (P0171)" - Engine running too lean

### 4. Observe Results
Watch the health score decrease and alerts appear in real-time

## All Pages Overview

| Page | URL | Purpose |
|------|-----|---------|
| Connect Vehicle | `/vehicle/connect` | Pair OBD scanner and register vehicle |
| Dashboard | `/vehicle/dashboard` | Real-time monitoring with simulator |
| Diagnostics | `/vehicle/diagnostics` | Search DTC database |
| History | `/vehicle/history` | View trends and charts |

## Key Files to Know

```typescript
// OBD Utilities & Types
lib/obd/types.ts           // Interfaces: OBDDevice, VehicleData, DTC, etc.
lib/obd/utils.ts           // Functions: DTC_DATABASE, calculateHealthScore(), etc.
lib/obd/simulator.ts       // VehicleSimulator class for testing

// Components
components/obd/health-score-card.tsx       // Health score display
components/obd/vehicle-data-display.tsx    // Real-time sensor readings
components/obd/dtc-alerts.tsx              // Diagnostic alerts
components/obd/vehicle-alert-banner.tsx    // Critical notifications
components/obd/obd-onboarding.tsx          // Setup guide

// Pages
app/vehicle/connect/page.tsx                // Connection setup
app/vehicle/dashboard/page.tsx              // Main monitoring dashboard
app/vehicle/diagnostics/page.tsx            // DTC database search
app/vehicle/history/page.tsx                // Historical data & trends
```

## Common Tasks

### Use the Simulator
```typescript
import { getSimulator } from '@/lib/obd/simulator';

const simulator = getSimulator();

// Control engine
simulator.startEngine();
simulator.stopEngine();

// Simulate driving
simulator.accelerate(500);
simulator.decelerate(300);
simulator.idle();

// Inject DTCs for testing
simulator.injectDTC('P0300');
simulator.clearDTC('P0300');

// Get current data
const data = simulator.getVehicleData('device_001');
const dtcs = simulator.getActiveDTCs();
```

### Calculate Health Score
```typescript
import { calculateHealthScore, DTC_DATABASE } from '@/lib/obd/utils';

const dtcList = ['P0300', 'P0128'].map(code => DTC_DATABASE[code]).filter(Boolean);

const score = calculateHealthScore(
  dtcList,
  engineTemp,    // number (°C)
  fuelLevel,     // number (%)
  engineLoad     // number (%)
);

console.log(score.overall);  // 0-100
```

### Search DTC Database
```typescript
import { DTC_DATABASE, decodeDTC } from '@/lib/obd/utils';

// Find a specific code
const p0300 = DTC_DATABASE['P0300'];
console.log(p0300.description);
console.log(p0300.possibleCauses);
console.log(p0300.solutions);

// Decode a DTC
const decoded = decodeDTC('P0300');
console.log(decoded.prefix);        // 'Powertrain'
console.log(decoded.system);        // '0'
console.log(decoded.subsystem);     // '3'
console.log(decoded.specificCode);  // '00'
```

### Format Values
```typescript
import { 
  formatRPM, 
  formatSpeed, 
  formatTemperature, 
  formatFuelLevel 
} from '@/lib/obd/utils';

formatRPM(5500);              // "5,500"
formatSpeed(120);             // "120 km/h"
formatTemperature(95);        // "95°C (203°F)"
formatFuelLevel(45);          // "45%"
```

### Get Health Color
```typescript
import { getHealthScoreColor } from '@/lib/obd/utils';

const color = getHealthScoreColor(85);  // "#10b981" (green)
const color = getHealthScoreColor(65);  // "#f59e0b" (amber)
const color = getHealthScoreColor(45);  // "#ef4444" (red)
```

## Import Patterns

```typescript
// Types
import type { 
  OBDDevice, 
  VehicleData, 
  DiagnosticTroubleCode,
  HealthScoreBreakdown 
} from '@/lib/obd/types';

// Utilities
import { 
  DTC_DATABASE,
  calculateHealthScore,
  decodeDTC,
  formatRPM,
  getHealthScoreColor
} from '@/lib/obd/utils';

// Simulator
import { getSimulator } from '@/lib/obd/simulator';

// Components
import { HealthScoreCard } from '@/components/obd/health-score-card';
import { VehicleDataDisplay } from '@/components/obd/vehicle-data-display';
import { DTCAlerts } from '@/components/obd/dtc-alerts';
import { VehicleAlertBanner } from '@/components/obd/vehicle-alert-banner';
```

## Component Usage Examples

### Health Score Card
```tsx
import { HealthScoreCard } from '@/components/obd/health-score-card';

<HealthScoreCard 
  score={{
    engine: 85,
    transmission: 90,
    emissions: 75,
    fuel: 80,
    battery: 95,
    overall: 85
  }}
  isLoading={false}
/>
```

### Vehicle Data Display
```tsx
import { VehicleDataDisplay } from '@/components/obd/vehicle-data-display';

<VehicleDataDisplay 
  data={{
    id: 'data_1',
    deviceId: 'device_001',
    rpm: 2500,
    speed: 80,
    engineLoad: 45,
    coolantTemp: 95,
    fuelLevel: 75,
    odometerDistance: 45250,
    timestamp: new Date()
  }}
/>
```

### DTC Alerts
```tsx
import { DTCAlerts } from '@/components/obd/dtc-alerts';

<DTCAlerts 
  codes={[
    { code: 'P0300', timestamp: new Date() },
    { code: 'P0128', timestamp: new Date() }
  ]}
/>
```

### Vehicle Alert Banner
```tsx
import { VehicleAlertBanner } from '@/components/obd/vehicle-alert-banner';

<VehicleAlertBanner 
  vehicleData={vehicleData}
  dtcCount={dtcList.length}
  onDismiss={() => console.log('Alert dismissed')}
/>
```

## Debugging Tips

### Enable Simulator Debug Logs
```typescript
const simulator = getSimulator();
console.log("[OBD] Simulator State:", simulator.getState());
```

### Check Active DTCs
```typescript
const simulator = getSimulator();
console.log("[OBD] Active DTCs:", simulator.getActiveDTCs());
```

### Verify Vehicle Data
```typescript
const simulator = getSimulator();
const data = simulator.getVehicleData('device_001');
console.log("[OBD] Vehicle Data:", data);
```

## Common DTC Codes Reference

| Code | Name | Severity | Fix |
|------|------|----------|-----|
| P0300 | Random Misfire | Critical | Replace spark plugs, check coils |
| P0128 | Thermostat | Warning | Replace thermostat |
| P0171 | System Too Lean | Warning | Check oxygen sensor, fuel injectors |
| P0420 | Catalyst Efficiency | Warning | Replace catalytic converter |
| P0500 | Speed Sensor | Warning | Replace speed sensor |

## Data Refresh Intervals

- Dashboard: 1 second (when engine running)
- History Charts: 30 second updates
- DTC Check: Real-time on detection
- Alerts: Immediate on critical conditions

## Color Legend

- Green (#10b981): Healthy, good condition
- Amber (#f59e0b): Warning, needs attention
- Red (#ef4444): Critical, needs immediate action
- Dark Red (#7f1d1d): Severe, high risk

## Status Ranges

- **Health Score**: 0-40 Poor | 40-60 Fair | 60-80 Good | 80-100 Excellent
- **Temperature**: <80°C Optimal | 80-95°C Normal | 95-110°C Warm | >110°C Critical
- **Fuel Level**: <5% Critical | 5-15% Low | 15-30% Adequate | >30% Good
- **Engine Load**: 0-50% Light | 50-85% Normal | >85% Heavy | >95% Maximum

## Next Steps

1. Explore the dashboard with simulator
2. Review DTC database in diagnostics page
3. Check chatbot responses about vehicle issues
4. Study the integration guide for deeper understanding
5. Review component source code for implementation details

## Need Help?

- Check `OBD_II_INTEGRATION_GUIDE.md` for detailed docs
- Review component JSDoc comments
- Check TypeScript types for interfaces
- Look at example pages for usage patterns
- Use browser DevTools to inspect components

## Performance Notes

- Simulator runs client-side (no server calls)
- State updates optimized with React hooks
- Charts use Recharts for efficient rendering
- Real-time updates via setInterval (configurable)
- No database calls in simulator mode

## Future Integration

When connecting real database:

1. Replace simulator with Supabase queries
2. Create API route: `/api/vehicle/data`
3. Setup WebSocket for real-time updates
4. Add RLS policies for user isolation
5. Implement data pagination for history

---

**Ready to build?** Start at `/vehicle/dashboard` and click "Start Engine"! 🚗
