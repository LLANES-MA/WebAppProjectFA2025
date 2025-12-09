/**
 * Driver Controller
 * Handles HTTP requests for driver operations
 */

import { Request, Response } from 'express';
import { frontDashMain } from '../FrontDashMain';
import { pool } from '../data/dbConnection';

export class DriverController {
  /**
   * POST /api/drivers
   * Create a new driver
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { firstName, lastName, name, isActive } = req.body;

      // Support both new format (firstName, lastName) and legacy format (name)
      let finalFirstName: string;
      let finalLastName: string;

      if (firstName && lastName) {
        // New format
        finalFirstName = firstName.trim();
        finalLastName = lastName.trim();
      } else if (name) {
        // Legacy format: split name into first and last
        const nameParts = name.trim().split(/\s+/);
        finalFirstName = nameParts[0] || '';
        finalLastName = nameParts.slice(1).join(' ') || '';
        
        if (!finalLastName) {
          res.status(400).json({
            success: false,
            error: 'Both first name and last name are required. Please provide firstName and lastName, or a full name with at least two words.',
          });
          return;
        }
      } else {
        res.status(400).json({
          success: false,
          error: 'firstName and lastName are required (or name for legacy support)',
        });
        return;
      }

      if (!finalFirstName || !finalLastName) {
        res.status(400).json({
          success: false,
          error: 'Both first name and last name are required',
        });
        return;
      }

      const driver = await frontDashMain.driverService.createDriver(
        finalFirstName,
        finalLastName,
        isActive !== undefined ? isActive : true
      );

      res.status(201).json({
        success: true,
        driver,
        message: 'Driver created successfully',
      });
    } catch (error: any) {
      console.error('Create driver error:', error);
      
      // Check if it's a duplicate error
      if (error.message && error.message.includes('already exists')) {
        res.status(409).json({
          success: false,
          error: error.message,
        });
        return;
      }
      
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create driver',
      });
    }
  }

  /**
   * GET /api/drivers
   * Get all drivers
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const drivers = await frontDashMain.db.getAllDrivers();
      res.json({
        success: true,
        drivers,
      });
    } catch (error: any) {
      console.error('Get all drivers error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch drivers',
      });
    }
  }

  /**
   * GET /api/drivers/active
   * Get active drivers only
   */
  async getActive(req: Request, res: Response): Promise<void> {
    try {
      const drivers = await frontDashMain.db.getActiveDrivers();
      res.json({
        success: true,
        drivers,
      });
    } catch (error: any) {
      console.error('Get active drivers error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch active drivers',
      });
    }
  }

  /**
   * GET /api/drivers/:id
   * Get driver by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const driver = await frontDashMain.db.getDriver(parseInt(id));
      
      if (!driver) {
        res.status(404).json({
          success: false,
          error: 'Driver not found',
        });
        return;
      }

      res.json({
        success: true,
        driver,
      });
    } catch (error: any) {
      console.error('Get driver error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch driver',
      });
    }
  }

  /**
   * PATCH /api/drivers/:id
   * Update driver status
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (isActive === undefined) {
        res.status(400).json({
          success: false,
          error: 'isActive is required',
        });
        return;
      }

      // Update driver status
      const query = 'UPDATE Driver SET is_active = ? WHERE driver_id = ?';
      await pool.execute(query, [isActive ? 1 : 0, parseInt(id)]);

      res.json({
        success: true,
        message: 'Driver status updated',
      });
    } catch (error: any) {
      console.error('Update driver error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update driver',
      });
    }
  }

  /**
   * DELETE /api/drivers/:id
   * Delete a driver (deactivate)
   */
  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      // Deactivate instead of deleting
      const query = 'UPDATE Driver SET is_active = 0 WHERE driver_id = ?';
      await pool.execute(query, [parseInt(id)]);

      res.json({
        success: true,
        message: 'Driver deactivated',
      });
    } catch (error: any) {
      console.error('Delete driver error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete driver',
      });
    }
  }
}

export const driverController = new DriverController();

