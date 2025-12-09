/**
 * Driver Service
 * Coordinates Driver entities and operations
 */

import { db } from '../data/Database';
import { Driver, DriverCreateInput } from '../models/Driver';

export class DriverService {
  /**
   * Create a new driver
   */
  async createDriver(name: string, isActive: boolean = true): Promise<Driver> {
    const driverInput: DriverCreateInput = {
      name,
      isActive,
    };
    return await db.createDriver(driverInput);
  }

  /**
   * Get driver by ID
   */
  async getDriver(driverId: number): Promise<Driver | undefined> {
    return await db.getDriver(driverId);
  }

  /**
   * Get all drivers
   */
  async getAllDrivers(): Promise<Driver[]> {
    return await db.getAllDrivers();
  }

  /**
   * Get active drivers only
   */
  async getActiveDrivers(): Promise<Driver[]> {
    return await db.getActiveDrivers();
  }
}

export const driverService = new DriverService();

