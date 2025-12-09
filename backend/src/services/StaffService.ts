/**
 * Staff Service
 * Manages Staff entities and operations
 */

import { db } from '../data/Database';
import { Staff, StaffCreateInput } from '../models/Staff';
import { authService } from './AuthService';

export class StaffService {
  /**
   * Create a new staff member
   */
  async createStaff(username: string, password: string, firstName?: string, lastName?: string): Promise<Staff> {
    // Create login first
    await authService.createLogin(username, password);
    
    // Create staff record
    const staffInput: StaffCreateInput = {
      username,
      firstName,
      lastName,
    };
    
    return await db.createStaff(staffInput);
  }

  /**
   * Get staff by username
   */
  async getStaff(username: string): Promise<Staff | undefined> {
    return await db.getStaff(username);
  }

  /**
   * Get all staff members
   */
  async getAllStaff(): Promise<Staff[]> {
    return await db.getAllStaff();
  }

  /**
   * Update staff first login flag
   */
  async updateFirstLogin(username: string): Promise<void> {
    await db.updateStaffFirstLogin(username);
  }
}

export const staffService = new StaffService();

