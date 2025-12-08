/**
 * Admin Controller
 * Handles HTTP requests for admin operations
 */

import { Request, Response } from 'express';
import { adminService } from '../services/AdminService';

export class AdminController {
  /**
   * POST /api/admin/restaurants/:id/approve
   * Approve a restaurant registration
   */
  async approveRestaurant(req: Request, res: Response): Promise<void> {
    try {
      const restaurantId = parseInt(req.params.id);

      // TODO: Add admin authentication middleware
      // const adminToken = req.headers.authorization;
      // if (!isAdmin(adminToken)) {
      //   res.status(403).json({ success: false, error: 'Unauthorized' });
      //   return;
      // }

      const result = await adminService.approveRestaurant(restaurantId);

      if (!result.success) {
        res.status(400).json(result);
        return;
      }

      res.json({
        success: true,
        restaurantId: result.restaurantId,
        username: result.username,
        temporaryPassword: result.temporaryPassword,
        message: 'Restaurant approved successfully',
      });
    } catch (error: any) {
      console.error('Approval error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to approve restaurant',
      });
    }
  }

  /**
   * POST /api/admin/restaurants/:id/reject
   * Reject a restaurant registration
   */
  async rejectRestaurant(req: Request, res: Response): Promise<void> {
    try {
      const restaurantId = parseInt(req.params.id);

      // TODO: Add admin authentication middleware

      const success = adminService.rejectRestaurant(restaurantId);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Restaurant not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Restaurant rejected successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to reject restaurant',
      });
    }
  }

  /**
   * GET /api/admin/restaurants/pending
   * Get all pending restaurant registrations
   */
  async getPendingRestaurants(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Add admin authentication middleware

      const restaurants = adminService.getPendingRestaurants();

      res.json({
        success: true,
        restaurants,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch pending restaurants',
      });
    }
  }

  /**
   * GET /api/admin/restaurants/approved
   * Get all approved restaurants
   */
  async getApprovedRestaurants(req: Request, res: Response): Promise<void> {
    try {
      // TODO: Add admin authentication middleware

      const restaurants = adminService.getApprovedRestaurants();

      res.json({
        success: true,
        restaurants,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch approved restaurants',
      });
    }
  }
}

