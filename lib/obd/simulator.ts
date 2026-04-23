// OBD Vehicle Data Simulator for Development/Testing

import { type VehicleData, type DiagnosticTroubleCode } from './types';

export class VehicleSimulator {
  private rpm: number;
  private speed: number;
  private engineLoad: number;
  private coolantTemp: number;
  private fuelLevel: number;
  private odometerDistance: number;
  private isRunning: boolean;
  private activeDTCs: string[];

  constructor() {
    this.rpm = 0;
    this.speed = 0;
    this.engineLoad = 0;
    this.coolantTemp = 20;
    this.fuelLevel = 75;
    this.odometerDistance = 45250;
    this.isRunning = false;
    this.activeDTCs = [];
  }

  /**
   * Simulate engine startup
   */
  startEngine(): void {
    this.isRunning = true;
    this.rpm = 800 + Math.random() * 200;
    this.coolantTemp = Math.max(20, this.coolantTemp - 2);
  }

  /**
   * Simulate engine shutdown
   */
  stopEngine(): void {
    this.isRunning = false;
    this.rpm = 0;
    this.speed = 0;
    this.engineLoad = 0;
  }

  /**
   * Simulate acceleration
   */
  accelerate(amount: number = 500): void {
    if (!this.isRunning) return;

    this.rpm = Math.min(7000, this.rpm + amount);
    this.speed = Math.min(200, this.speed + (amount / 500) * 10);
    this.engineLoad = Math.min(95, (this.rpm / 7000) * 100);
    this.coolantTemp = Math.min(110, this.coolantTemp + (amount / 500) * 2);
    this.fuelLevel = Math.max(0, this.fuelLevel - (amount / 500) * 0.1);
    this.odometerDistance += (amount / 500) * 0.1;
  }

  /**
   * Simulate deceleration
   */
  decelerate(amount: number = 300): void {
    if (!this.isRunning) return;

    this.rpm = Math.max(800, this.rpm - amount);
    this.speed = Math.max(0, this.speed - (amount / 300) * 8);
    this.engineLoad = Math.max(0, this.engineLoad - (amount / 300) * 20);
    this.coolantTemp = Math.max(20, this.coolantTemp - (amount / 300) * 1);
  }

  /**
   * Simulate idle state
   */
  idle(): void {
    if (!this.isRunning) return;

    this.rpm = 800 + Math.random() * 100;
    this.speed = Math.max(0, this.speed - 0.5);
    this.engineLoad = Math.max(5, this.engineLoad - 5);
    this.coolantTemp = Math.max(85, Math.min(95, this.coolantTemp + (Math.random() - 0.5) * 2));
  }

  /**
   * Simulate natural coolant temperature change
   */
  updateCoolantTemp(): void {
    if (!this.isRunning) {
      // Cool down when engine is off
      this.coolantTemp = Math.max(20, this.coolantTemp - 0.5);
    } else {
      // Heat up when running, based on load
      const heatGeneration = (this.engineLoad / 100) * 2;
      this.coolantTemp = Math.min(115, this.coolantTemp + heatGeneration);
    }
  }

  /**
   * Introduce a random DTC for testing
   */
  injectDTC(code: string): void {
    if (!this.activeDTCs.includes(code)) {
      this.activeDTCs.push(code);
    }
  }

  /**
   * Clear a DTC
   */
  clearDTC(code: string): void {
    this.activeDTCs = this.activeDTCs.filter((c) => c !== code);
  }

  /**
   * Clear all DTCs
   */
  clearAllDTCs(): void {
    this.activeDTCs = [];
  }

  /**
   * Get current vehicle data
   */
  getVehicleData(deviceId: string): VehicleData {
    this.updateCoolantTemp();

    return {
      id: `data_${Date.now()}`,
      deviceId,
      rpm: Math.round(this.rpm),
      speed: Math.round(this.speed * 10) / 10,
      engineLoad: Math.round(this.engineLoad * 10) / 10,
      coolantTemp: Math.round(this.coolantTemp * 10) / 10,
      fuelLevel: Math.round(this.fuelLevel * 10) / 10,
      odometerDistance: Math.round(this.odometerDistance),
      timestamp: new Date(),
    };
  }

  /**
   * Get active DTCs
   */
  getActiveDTCs(): string[] {
    return [...this.activeDTCs];
  }

  /**
   * Simulate a driving cycle
   */
  simulateDriving(): void {
    const action = Math.random();

    if (action < 0.3) {
      this.accelerate(300);
    } else if (action < 0.6) {
      this.decelerate(200);
    } else {
      this.idle();
    }
  }

  /**
   * Simulate realistic driving pattern over time
   */
  simulateRealisticCycle(): void {
    if (!this.isRunning) {
      return;
    }

    // Simulate typical acceleration and deceleration patterns
    const pattern = Math.random();

    if (this.speed < 20) {
      // Accelerating from stop
      this.accelerate(Math.random() * 600);
    } else if (this.speed > 100 && pattern > 0.7) {
      // Highway driving with occasional deceleration
      this.decelerate(100);
    } else if (pattern < 0.3) {
      // Continue accelerating
      this.accelerate(200);
    } else if (pattern < 0.5) {
      // Decelerate
      this.decelerate(300);
    } else {
      // Maintain speed (slight variations from engine idle)
      this.idle();
    }

    // Occasionally introduce warnings at high temps
    if (this.coolantTemp > 105 && Math.random() < 0.01) {
      this.injectDTC('P0128');
    }

    // Occasionally introduce fuel warning
    if (this.fuelLevel < 10 && Math.random() < 0.02) {
      this.injectDTC('P0463');
    }
  }

  /**
   * Reset simulator to initial state
   */
  reset(): void {
    this.rpm = 0;
    this.speed = 0;
    this.engineLoad = 0;
    this.coolantTemp = 20;
    this.fuelLevel = 75;
    this.odometerDistance = 45250;
    this.isRunning = false;
    this.activeDTCs = [];
  }

  /**
   * Get simulator state for debugging
   */
  getState() {
    return {
      isRunning: this.isRunning,
      rpm: this.rpm,
      speed: this.speed,
      engineLoad: this.engineLoad,
      coolantTemp: this.coolantTemp,
      fuelLevel: this.fuelLevel,
      odometerDistance: this.odometerDistance,
      activeDTCs: this.activeDTCs,
    };
  }
}

/**
 * Global simulator instance
 */
let simulator: VehicleSimulator | null = null;

export function getSimulator(): VehicleSimulator {
  if (!simulator) {
    simulator = new VehicleSimulator();
  }
  return simulator;
}

export function resetSimulator(): void {
  simulator = null;
}
