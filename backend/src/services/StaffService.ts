/**
 * Staff Service
 * Manages Staff entities and operations
 */

import { db } from '../data/Database';
import { Staff, StaffCreateInput } from '../models/Staff';
import { authService } from './AuthService';

export class StaffService {
  /**
   * Generate a unique username based on last name
   * Format: lastname + two digits (e.g., smith01, smith02)
   */
  private async generateUsername(lastName: string): Promise<string> {
    const baseUsername = lastName.toLowerCase().replace(/[^a-z0-9]/g, ''); // Remove special chars, lowercase
    
    // Find existing staff with same last name prefix
    const existingStaff = await db.getStaffByLastNamePrefix(baseUsername);
    
    // Extract numbers from existing usernames
    const usedNumbers = new Set<number>();
    for (const staff of existingStaff) {
      const match = staff.username.match(new RegExp(`^${baseUsername}(\\d{2})$`));
      if (match) {
        usedNumbers.add(parseInt(match[1], 10));
      }
    }
    
    // Find the next available number (01-99)
    let number = 1;
    while (usedNumbers.has(number) && number < 100) {
      number++;
    }
    
    if (number >= 100) {
      throw new Error('Too many staff members with the same last name. Maximum 99 allowed.');
    }
    
    return `${baseUsername}${number.toString().padStart(2, '0')}`;
  }

  /**
   * Generate a random password
   */
  private generatePassword(): string {
    // Generate an 8-character password with letters and numbers
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'; // Exclude confusing chars
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Create a new staff member
   * Username and password are auto-generated
   */
  async createStaff(firstName: string, lastName: string): Promise<{ staff: Staff; username: string; password: string }> {
    if (!firstName || !firstName.trim()) {
      throw new Error('First name is required');
    }
    if (!lastName || !lastName.trim()) {
      throw new Error('Last name is required');
    }

    // Generate username and password
    const username = await this.generateUsername(lastName.trim());
    const password = this.generatePassword();
    
    // Create login first
    await authService.createLogin(username, password);
    
    // Create staff record
    const staffInput: StaffCreateInput = {
      username,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
    };
    
    const staff = await db.createStaff(staffInput);
    
    return { staff, username, password };
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

