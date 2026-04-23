// OBD-II Utilities and Helpers

import { COMMON_PIDS, type HealthScoreBreakdown } from './types';

/**
 * Encodes an OBD command into the proper format for transmission
 */
export function encodeOBDCommand(pid: string, mode: string = '01'): string {
  return `${mode}${pid.substring(2)}`;
}

/**
 * Parses OBD raw response data
 */
export function parseOBDResponse(pid: string, rawData: string): number | string | null {
  const command = COMMON_PIDS[Object.keys(COMMON_PIDS).find(
    (key) => COMMON_PIDS[key as keyof typeof COMMON_PIDS].pid === pid
  ) as keyof typeof COMMON_PIDS];

  if (!command) return null;

  try {
    return command.parser(rawData);
  } catch {
    return null;
  }
}

/**
 * Decodes a Diagnostic Trouble Code (DTC) format
 * DTCs are 5 characters: P/C/B/U + 0-3 + 0-9/A-F + 0-9/A-F + 0-9/A-F
 */
export function decodeDTC(code: string): {
  prefix: string;
  system: string;
  subsystem: string;
  specificCode: string;
} {
  const prefix = code[0]; // P=Powertrain, C=Chassis, B=Body, U=Network
  const digit1 = code[1]; // 0-1 = generic, 2-3 = manufacturer-specific
  const digit2 = code[2]; // specific system
  const digit3 = code.substring(3); // specific code

  const systemMap: Record<string, string> = {
    P: 'Powertrain',
    C: 'Chassis',
    B: 'Body',
    U: 'Network',
  };

  return {
    prefix: systemMap[prefix] || 'Unknown',
    system: digit1,
    subsystem: digit2,
    specificCode: digit3,
  };
}

/**
 * Common DTC Database - expanded set of common diagnostic codes
 */
export const DTC_DATABASE: Record<
  string,
  {
    description: string;
    severity: 'critical' | 'warning' | 'info';
    possibleCauses: string[];
    solutions: string[];
  }
> = {
  P0101: {
    description: 'Mass Air Flow (MAF) Sensor Range/Performance Problem',
    severity: 'warning',
    possibleCauses: [
      'Dirty or faulty MAF sensor',
      'Vacuum leak',
      'Intake air leak',
      'Fuel injector problem',
    ],
    solutions: [
      'Clean or replace MAF sensor',
      'Check for vacuum leaks',
      'Inspect fuel system',
      'Check engine control module',
    ],
  },
  P0128: {
    description: 'Coolant Thermostat (Coolant Temp Regulating Thermostat) Circuit',
    severity: 'warning',
    possibleCauses: [
      'Stuck thermostat',
      'Faulty coolant temperature sensor',
      'Wiring issue',
      'Engine control module fault',
    ],
    solutions: [
      'Replace thermostat',
      'Replace coolant temperature sensor',
      'Check wiring and connections',
      'Check ECM',
    ],
  },
  P0130: {
    description: 'Oxygen Sensor Circuit (Bank 1, Sensor 1)',
    severity: 'warning',
    possibleCauses: [
      'Faulty oxygen sensor',
      'Exhaust leak',
      'Wiring issue',
      'Engine control module fault',
    ],
    solutions: [
      'Replace oxygen sensor',
      'Inspect exhaust system',
      'Check wiring and connections',
      'Check ECM',
    ],
  },
  P0171: {
    description: 'System Too Lean (Bank 1)',
    severity: 'warning',
    possibleCauses: [
      'Vacuum leak',
      'Faulty fuel injector',
      'Faulty oxygen sensor',
      'Fuel pressure regulator leak',
      'MAF sensor problem',
    ],
    solutions: [
      'Check for vacuum leaks',
      'Inspect fuel injectors',
      'Replace oxygen sensor',
      'Test fuel pressure',
      'Clean MAF sensor',
    ],
  },
  P0300: {
    description: 'Random/Multiple Cylinder Misfire Detected',
    severity: 'critical',
    possibleCauses: [
      'Spark plug issue',
      'Coil pack failure',
      'Fuel injector problem',
      'Compression loss',
      'Vacuum leak',
    ],
    solutions: [
      'Replace spark plugs',
      'Check coil packs',
      'Inspect fuel injectors',
      'Perform compression test',
      'Check for vacuum leaks',
    ],
  },
  P0400: {
    description: 'Exhaust Gas Recirculation (EGR) Flow',
    severity: 'warning',
    possibleCauses: [
      'Stuck EGR valve',
      'EGR cooler leak',
      'Wiring issue',
      'Carbon buildup',
    ],
    solutions: [
      'Clean or replace EGR valve',
      'Check EGR cooler',
      'Check wiring and connectors',
      'Clean carbon deposits',
    ],
  },
  P0420: {
    description: 'Catalyst System Efficiency Below Threshold (Bank 1)',
    severity: 'warning',
    possibleCauses: [
      'Faulty catalytic converter',
      'Oxygen sensor issue',
      'Exhaust leak',
      'Engine misfire',
    ],
    solutions: [
      'Replace catalytic converter',
      'Replace oxygen sensors',
      'Check exhaust integrity',
      'Address any misfires',
    ],
  },
  P0500: {
    description: 'Vehicle Speed Sensor (VSS) Malfunction',
    severity: 'warning',
    possibleCauses: [
      'Faulty speed sensor',
      'Wiring issue',
      'Wheel bearing problem',
      'Transmission issue',
    ],
    solutions: [
      'Replace speed sensor',
      'Check wiring and connectors',
      'Inspect wheel bearings',
      'Check transmission',
    ],
  },
  P0606: {
    description: 'PCM/ECM Processor Fault',
    severity: 'critical',
    possibleCauses: [
      'ECM/PCM malfunction',
      'Wiring issue',
      'Battery voltage problem',
      'Software glitch',
    ],
    solutions: [
      'Reprogram ECM/PCM',
      'Check wiring and battery voltage',
      'Replace ECM/PCM if necessary',
      'Update firmware',
    ],
  },
  C0035: {
    description: 'ABS Wheel Speed Sensor Circuit (Right Rear)',
    severity: 'warning',
    possibleCauses: [
      'Faulty wheel speed sensor',
      'Wiring issue',
      'Wheel bearing problem',
      'ABS module fault',
    ],
    solutions: [
      'Replace wheel speed sensor',
      'Check wiring and connectors',
      'Inspect wheel bearings',
      'Check ABS module',
    ],
  },
};

/**
 * Calculate vehicle health score based on DTC severity and other factors
 */
export function calculateHealthScore(
  dtcs: Array<{ severity: 'critical' | 'warning' | 'info' }>,
  engineTemp: number,
  fuelLevel: number,
  engineLoad: number
): HealthScoreBreakdown {
  // Start with 100 points
  let engineScore = 100;
  let transmissionScore = 100;
  let emissionsScore = 100;
  let fuelScore = 100;
  let batteryScore = 100;

  // Deduct points for DTCs
  dtcs.forEach((dtc) => {
    if (dtc.severity === 'critical') {
      engineScore -= 25;
      emissionsScore -= 20;
    } else if (dtc.severity === 'warning') {
      engineScore -= 10;
      emissionsScore -= 5;
    }
  });

  // Engine temperature check
  if (engineTemp > 100) engineScore -= 15;
  if (engineTemp > 110) engineScore -= 20;

  // Fuel level check
  if (fuelLevel < 15) fuelScore -= 30;
  if (fuelLevel < 5) fuelScore -= 40;

  // Engine load check
  if (engineLoad > 85) engineScore -= 10;

  // Clamp scores to 0-100
  engineScore = Math.max(0, Math.min(100, engineScore));
  transmissionScore = Math.max(0, Math.min(100, transmissionScore));
  emissionsScore = Math.max(0, Math.min(100, emissionsScore));
  fuelScore = Math.max(0, Math.min(100, fuelScore));
  batteryScore = Math.max(0, Math.min(100, batteryScore));

  const overall = Math.round(
    (engineScore + transmissionScore + emissionsScore + fuelScore + batteryScore) / 5
  );

  return {
    engine: Math.round(engineScore),
    transmission: Math.round(transmissionScore),
    emissions: Math.round(emissionsScore),
    fuel: Math.round(fuelScore),
    battery: Math.round(batteryScore),
    overall: Math.round(overall),
  };
}

/**
 * Format temperature in Celsius to readable string
 */
export function formatTemperature(celsius: number): string {
  return `${Math.round(celsius)}°C (${Math.round((celsius * 9) / 5 + 32)}°F)`;
}

/**
 * Format speed in km/h (OBD returns km/h by default)
 */
export function formatSpeed(kmh: number, useMiles: boolean = false): string {
  if (useMiles) {
    return `${Math.round(kmh * 0.621371)} mph`;
  }
  return `${Math.round(kmh)} km/h`;
}

/**
 * Format RPM with commas
 */
export function formatRPM(rpm: number): string {
  return rpm.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

/**
 * Format fuel level as percentage
 */
export function formatFuelLevel(percentage: number): string {
  return `${Math.round(percentage)}%`;
}

/**
 * Get color indicator for health score
 */
export function getHealthScoreColor(score: number): string {
  if (score >= 80) return '#10b981'; // green
  if (score >= 60) return '#f59e0b'; // amber
  if (score >= 40) return '#ef4444'; // red
  return '#7f1d1d'; // dark red
}

/**
 * Get alert message based on vehicle conditions
 */
export function getAlertMessage(
  coolantTemp: number,
  fuelLevel: number,
  engineLoad: number
): string | null {
  if (coolantTemp > 110) {
    return 'Engine overheating - Stop immediately and let cool';
  }
  if (coolantTemp < -10) {
    return 'Engine too cold - Allow warm-up time';
  }
  if (fuelLevel < 5) {
    return 'Critical fuel level - Refuel immediately';
  }
  if (engineLoad > 95) {
    return 'Engine at maximum load - Reduce speed';
  }
  return null;
}
