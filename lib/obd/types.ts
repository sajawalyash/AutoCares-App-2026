// OBD-II Types and Interfaces

export interface OBDDevice {
  id: string;
  userId: string;
  deviceName: string;
  deviceId: string;
  vehicleName: string;
  vehicleYear: number;
  vehicleMake: string;
  vehicleModel: string;
  vin?: string;
  isConnected: boolean;
  lastConnected: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleData {
  id: string;
  deviceId: string;
  rpm: number;
  speed: number;
  engineLoad: number;
  coolantTemp: number;
  fuelLevel: number;
  odometerDistance: number;
  timestamp: Date;
}

export interface DiagnosticTroubleCode {
  id: string;
  code: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  system: string;
  possibleCauses: string[];
  solutions: string[];
}

export interface VehicleAlert {
  id: string;
  deviceId: string;
  dtcCode?: string;
  alertType: 'dtc' | 'temperature' | 'fuel' | 'pressure' | 'custom';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  isResolved: boolean;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface OBDCommand {
  pid: string;
  mode: string;
  description: string;
  responseLength: number;
  parser: (data: string) => number | string | boolean;
}

export interface BluetoothDevice {
  id: string;
  name: string;
  address: string;
}

// Common PID definitions for Mode 01 (Real-time data)
export const COMMON_PIDS: Record<string, OBDCommand> = {
  ENGINE_RPM: {
    pid: '010C',
    mode: '01',
    description: 'Engine RPM',
    responseLength: 4,
    parser: (data: string) => {
      const a = parseInt(data.substring(0, 2), 16);
      const b = parseInt(data.substring(2, 4), 16);
      return ((a * 256) + b) / 4;
    },
  },
  VEHICLE_SPEED: {
    pid: '010D',
    mode: '01',
    description: 'Vehicle Speed',
    responseLength: 2,
    parser: (data: string) => parseInt(data, 16),
  },
  ENGINE_LOAD: {
    pid: '0104',
    mode: '01',
    description: 'Engine Load',
    responseLength: 2,
    parser: (data: string) => (parseInt(data, 16) / 255) * 100,
  },
  COOLANT_TEMP: {
    pid: '0105',
    mode: '01',
    description: 'Engine Coolant Temperature',
    responseLength: 2,
    parser: (data: string) => parseInt(data, 16) - 40,
  },
  FUEL_LEVEL: {
    pid: '012F',
    mode: '01',
    description: 'Fuel Level Input',
    responseLength: 2,
    parser: (data: string) => (parseInt(data, 16) / 255) * 100,
  },
};

// Vehicle health score components
export interface HealthScoreBreakdown {
  engine: number; // 0-100
  transmission: number; // 0-100
  emissions: number; // 0-100
  fuel: number; // 0-100
  battery: number; // 0-100
  overall: number; // 0-100
}
