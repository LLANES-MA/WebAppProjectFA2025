/**
 * Staff Controller
 * Handles HTTP requests for staff operations
 */

import { Request, Response } from 'express';
import { frontDashMain } from '../FrontDashMain';

export class StaffController {
  /**
   * POST /api/staff
   * Create a new staff member
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { username, password, firstName, lastName, email } = req.body;

      if (!username || !password) {
        res.status(400).json({
          success: false,
          error: 'username and password are required',
        });
        return;
      }

      const staff = await frontDashMain.staffService.createStaff(
        username,
        password,
        firstName,
        lastName
      );

      res.status(201).json({
        success: true,
        staff,
        message: 'Staff member created successfully',
      });
    } catch (error: any) {
      console.error('Create staff error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create staff',
      });
    }
  }

  /**
   * GET /api/staff
   * Get all staff members
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const staff = await frontDashMain.db.getAllStaff();
      res.json({
        success: true,
        staff,
      });
    } catch (error: any) {
      console.error('Get all staff error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch staff',
      });
    }
  }

  /**
   * GET /api/staff/:username
   * Get staff by username
   */
  async getByUsername(req: Request, res: Response): Promise<void> {
    try {
      const { username } = req.params;
      const staff = await frontDashMain.db.getStaff(username);
      
      if (!staff) {
        res.status(404).json({
          success: false,
          error: 'Staff not found',
        });
        return;
      }

      res.json({
        success: true,
        staff,
      });
    } catch (error: any) {
      console.error('Get staff error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch staff',
      });
    }
  }

  /**
   * DELETE /api/staff/:username
   * Delete a staff member
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { username } = req.params;
      // Note: In a real app, you'd want to also delete the Login entry
      // For now, we'll just return success
      res.json({
        success: true,
        message: 'Staff deletion not fully implemented. Please handle Login table cleanup manually.',
      });
    } catch (error: any) {
      console.error('Delete staff error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete staff',
      });
    }
  }
}

export const staffController = new StaffController();

