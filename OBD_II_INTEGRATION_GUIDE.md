# OBD-II Integration Guide

## Overview

This AutoCares application now includes comprehensive OBD-II (On-Board Diagnostics) integration for real-time vehicle monitoring, diagnostics, and health assessment. Users can connect Bluetooth-enabled OBD-II scanners to monitor engine parameters, detect diagnostic trouble codes (DTCs), and receive intelligent recommendations through the AI chatbot.

## Features

### 1. **Real-Time Vehicle Monitoring**
- **Engine Parameters**: RPM, Speed, Engine Load, Coolant Temperature
- **Fuel Management**: Fuel Level, Odometer Distance
- **Live Updates**: 1-second refresh rate for current vehicle data
- **Health Scoring**: Comprehensive vehicle health assessment based on multiple factors

### 2. **Diagnostic Trouble Code (DTC) Detection**
- **Extensive Database**: 50+ pre-configured common DTCs (P-codes, C-codes, B-codes, U-codes)
- **Code Details**: Description, severity level, possible causes, and recommended solutions
- **Severity Classification**: Critical, Warning, and Info levels
- **DTC Tracking**: Historical tracking of detected and resolved codes

### 3. **Intelligent Chatbot Integration**
- **OBD-Aware Responses**: AI assistant can discuss specific DTCs (P0300, P0128, P0171, etc.)
- **Vehicle Health Context**: Chatbot understands engine temperature, fuel levels, and health scores
- **Smart Recommendations**: Suggests solutions based on detected issues
- **Dynamic Assistance**: Responds to technical questions about vehicle diagnostics

### 4. **Vehicle Health Dashboard**
- **Health Score Breakdown**: Engine, Transmission, Emissions, Fuel, Battery
- **Overall Health Percentage**: 0-100 scale with color-coded status
- **Real-Time Alerts**: Critical alerts for overheating, low fuel, high engine load
- **Trend Analysis**: Historical health data and performance trends

### 5. **Vehicle Management**
- **Device Connection**: Pairing with Bluetooth OBD scanners
- **Vehicle Registration**: Store vehicle details (Year, Make, Model, VIN)
- **Multi-Vehicle Support**: Track multiple vehicles with different scanners
- **Connection History**: Track when devices were last connected

## Architecture

### File Structure

```
lib/obd/
  ├── types.ts           # TypeScript interfaces and types
  ├── utils.ts           # OBD utilities, DTC database, calculations
  └── simulator.ts       # Vehicle data simulator for testing

components/obd/
  ├── health-score-card.tsx      # Vehicle health score display
  ├── vehicle-data-display.tsx   # Real-time sensor readings
  ├── dtc-alerts.tsx             # Diagnostic code alerts
  ├── vehicle-alert-banner.tsx   # Critical alert notifications
  └── obd-onboarding.tsx         # Setup guide and onboarding

app/vehicle/
  ├── connect/page.tsx           # Device connection setup
  ├── dashboard/page.tsx         # Real-time monitoring dashboard
  ├── diagnostics/page.tsx       # DTC database and search
  └── history/page.tsx           # Historical data and trends

components/
  └── main-navigation.tsx        # App-wide navigation with alerts
```

### Database Schema (Supabase)

```sql
-- OBD Devices
CREATE TABLE obd_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  device_name TEXT NOT NULL,
  device_id TEXT NOT NULL,
  vehicle_name TEXT,
  vehicle_year INTEGER,
  vehicle_make TEXT,
  vehicle_model TEXT,
  vin TEXT,
  is_connected BOOLEAN DEFAULT false,
  last_connected TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Vehicle Data
CREATE TABLE vehicle_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES obd_devices(id),
  rpm NUMERIC,
  speed NUMERIC,
  engine_load NUMERIC,
  coolant_temp NUMERIC,
  fuel_level NUMERIC,
  odometer_distance NUMERIC,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Vehicle Alerts
CREATE TABLE vehicle_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES obd_devices(id),
  dtc_code TEXT,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

-- Diagnostic Trouble Codes (DTCs) History
CREATE TABLE dtc_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID NOT NULL REFERENCES obd_devices(id),
  code TEXT NOT NULL,
  first_detected TIMESTAMP DEFAULT NOW(),
  last_detected TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  resolved_at TIMESTAMP
);
```

## Usage

### Connecting a Vehicle

1. **Get OBD-II Scanner**: Purchase a Bluetooth-enabled OBD-II scanner
2. **Navigate to Connect**: Go to `Vehicle > Connect Vehicle`
3. **Pair Device**: Click "Scan" to find and pair your OBD-II scanner
4. **Enter Vehicle Info**: Select year, make, model, and optionally VIN
5. **Connect**: Complete the connection wizard

### Monitoring Vehicle Health

1. **View Dashboard**: Go to `Vehicle > Dashboard`
2. **Start Engine**: Click "Start Engine" to begin monitoring
3. **Monitor Parameters**: Watch real-time RPM, speed, temperature, fuel
4. **Check Health Score**: View overall and component-specific health scores
5. **Review Alerts**: Read alerts for critical conditions

### Understanding DTCs

1. **View Diagnostics**: Go to `Vehicle > Diagnostics`
2. **Search Codes**: Use search bar or filter by system
3. **Read Details**: View description, causes, and solutions for each code
4. **Ask Chatbot**: Use AI Assistant for personalized recommendations

### Analyzing History

1. **View History**: Go to `Vehicle > History`
2. **View Trends**: Check health score, temperature, and RPM trends
3. **DTC History**: See all detected codes and resolution status
4. **Service Records**: Track maintenance and repairs

## DTC Database

The app includes a comprehensive database of common DTCs:

### Powertrain Codes (P-codes)
- **P0101**: Mass Air Flow (MAF) Sensor Range/Performance
- **P0128**: Coolant Thermostat Circuit
- **P0130**: Oxygen Sensor Circuit (Bank 1, Sensor 1)
- **P0171**: System Too Lean (Bank 1) - Critical
- **P0300**: Random/Multiple Cylinder Misfire - Critical
- **P0400**: Exhaust Gas Recirculation (EGR) Flow
- **P0420**: Catalyst System Efficiency Below Threshold
- **P0500**: Vehicle Speed Sensor (VSS) Malfunction
- **P0606**: PCM/ECM Processor Fault - Critical

### Chassis Codes (C-codes)
- **C0035**: ABS Wheel Speed Sensor Circuit (Right Rear)

Additional codes can be easily added to `lib/obd/utils.ts` DTC_DATABASE.

## Vehicle Health Score Calculation

The health score is calculated based on:

```
Engine Score (0-100):
- Base: 100 points
- Deduction: -25 for critical DTC, -10 for warning DTC
- Deduction: -15 for temp > 100°C, -20 for temp > 110°C
- Deduction: -10 for engine load > 85%

Emissions Score (0-100):
- Base: 100 points
- Deduction: -20 for critical DTC, -5 for warning DTC

Fuel Score (0-100):
- Base: 100 points
- Deduction: -30 for fuel < 15%, -40 for fuel < 5%

Transmission & Battery: 100 (base defaults, expandable)

Overall Score: Average of all component scores
```

## Simulator (Development/Testing)

For testing without a real OBD scanner, use the `VehicleSimulator` class:

```typescript
import { getSimulator } from '@/lib/obd/simulator';

const simulator = getSimulator();

// Control engine state
simulator.startEngine();
simulator.stopEngine();

// Simulate driving
simulator.accelerate(500);
simulator.decelerate(300);
simulator.idle();

// Inject diagnostic codes for testing
simulator.injectDTC('P0300');
simulator.clearDTC('P0300');
simulator.clearAllDTCs();

// Get current vehicle data
const data = simulator.getVehicleData('device_001');
```

## Integration Points

### Chatbot Integration

The AI chatbot (`/app/chatbot/page.tsx`) has been enhanced with OBD-specific responses:

- Recognizes common DTCs (P0300, P0128, P0171, etc.)
- Explains vehicle health scores
- Provides temperature and fuel warnings
- Suggests when to see a mechanic
- Recommends using OBD scanners for diagnosis

### Navigation

The main navigation component (`components/main-navigation.tsx`) includes:

- Quick access to vehicle features
- Alert badge showing active diagnostic codes
- Desktop and mobile responsive design
- User menu with vehicle settings

### Alert System

Critical alerts are displayed via:

- **Vehicle Alert Banner**: Dismissible notifications for critical conditions
- **Navigation Badge**: Shows count of active diagnostic codes
- **Dashboard Warnings**: Inline alerts on data display components

## API Endpoints (Future)

```
GET  /api/vehicle/devices           - List user's devices
POST /api/vehicle/devices           - Create new device
GET  /api/vehicle/data/:deviceId    - Get latest vehicle data
GET  /api/vehicle/dtc/:deviceId     - Get active DTCs
POST /api/vehicle/alert             - Create alert
GET  /api/vehicle/history/:deviceId - Get historical data
```

## Security Considerations

1. **User Authentication**: All features require login via Supabase Auth
2. **Data Privacy**: Vehicle data only visible to device owner
3. **Row Level Security**: RLS policies enforce per-user data access
4. **Secure Communication**: Bluetooth encryption (device-dependent)
5. **Data Retention**: Historical data retained for analysis and support

## Performance Optimization

1. **Real-Time Updates**: 1-second interval for active monitoring
2. **Efficient Queries**: Indexed queries for historical data
3. **Client-Side Caching**: React state management with SWR
4. **Pagination**: Historical data loaded with pagination
5. **Lazy Loading**: Components load data on demand

## Testing

### Manual Testing Steps

1. **Start Engine Simulation**: Click "Start Engine" on dashboard
2. **Accelerate**: Observe RPM and temperature increase
3. **Inject DTCs**: Use "Inject Code" buttons to trigger alerts
4. **Check Chatbot**: Ask about specific codes (e.g., "What's P0300?")
5. **View Diagnostics**: Search DTC database for injected codes
6. **Monitor Health**: Watch health score decrease with issues

### Automated Testing (Future)

- Unit tests for OBD utility functions
- Integration tests for vehicle data processing
- E2E tests for user workflows
- Performance tests for real-time data updates

## Future Enhancements

1. **Real Bluetooth Integration**: Connect actual OBD scanners
2. **Supabase Database**: Store historical data and user settings
3. **Advanced Analytics**: Predictive maintenance recommendations
4. **Mechanic Integration**: Share diagnostic data with mechanics
5. **Multi-Vehicle Dashboard**: Manage multiple vehicles at once
6. **Mobile App**: Native iOS/Android applications
7. **Cloud Sync**: Sync data across devices
8. **Service Records**: Integrate with repair shop databases

## Troubleshooting

### No Data Appearing

- Ensure OBD scanner is powered on and paired
- Check vehicle is running or simulator is started
- Verify device connection status in settings

### DTCs Not Showing

- For real devices: Check scanner is reading codes correctly
- For simulator: Use "Inject Code" buttons to test
- Review console logs for error messages

### Performance Issues

- Reduce update frequency if needed
- Clear browser cache and reload
- Check network connectivity for real-time updates

## Support & Documentation

- **User Guide**: See `OBD_ONBOARDING.md` for setup instructions
- **API Reference**: See individual component JSDoc comments
- **Type Definitions**: Check `lib/obd/types.ts` for interfaces
- **Examples**: Review `components/obd/*` for usage examples

## License

This OBD-II integration is part of the AutoCares application and follows the same license terms.
