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
      console.log(`📝 Approval request received for restaurant ID: ${restaurantId}`);

      if (isNaN(restaurantId)) {
        console.error('❌ Invalid restaurant ID:', req.params.id);
        res.status(400).json({
          success: false,
          error: 'Invalid restaurant ID',
        });
        return;
      }

      // TODO: Add admin authentication middleware
      // const adminToken = req.headers.authorization;
      // if (!isAdmin(adminToken)) {
      //   res.status(403).json({ success: false, error: 'Unauthorized' });
      //   return;
      // }

      console.log(`🔍 Calling adminService.approveRestaurant(${restaurantId})...`);
      const result = await adminService.approveRestaurant(restaurantId);
      console.log(`📋 Approval result:`, { success: result.success, error: result.error });

      if (!result.success) {
        console.error(`❌ Approval failed: ${result.error}`);
        res.status(400).json({
          success: false,
          error: result.error || 'Failed to approve restaurant',
          restaurantId: result.restaurantId,
        });
        return;
      }

      console.log(`✅ Restaurant ${restaurantId} approved successfully`);
      res.json({
        success: true,
        restaurantId: result.restaurantId,
        username: result.username,
        temporaryPassword: result.temporaryPassword,
        message: 'Restaurant approved successfully',
      });
    } catch (error: any) {
      console.error('❌ Approval error:', error);
      console.error('Error stack:', error.stack);
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

      const success = await adminService.rejectRestaurant(restaurantId);

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

      const restaurants = await adminService.getPendingRestaurants();

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

      const restaurants = await adminService.getApprovedRestaurants();

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

  /**
   * GET /api/admin/restaurants/withdrawals
   * Get all pending withdrawal requests
   */
  async getPendingWithdrawals(req: Request, res: Response): Promise<void> {
    try {
      const withdrawals = await adminService.getPendingWithdrawals();

      res.json({
        success: true,
        withdrawals,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch pending withdrawals',
      });
    }
  }

  /**
   * POST /api/admin/restaurants/:id/approve-withdrawal
   * Approve a withdrawal request
   */
  async approveWithdrawal(req: Request, res: Response): Promise<void> {
    try {
      const restaurantId = parseInt(req.params.id);

      const success = await adminService.approveWithdrawal(restaurantId);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Restaurant not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Withdrawal approved successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to approve withdrawal',
      });
    }
  }

  /**
   * POST /api/admin/restaurants/:id/reject-withdrawal
   * Reject a withdrawal request
   */
  async rejectWithdrawal(req: Request, res: Response): Promise<void> {
    try {
      const restaurantId = parseInt(req.params.id);

      const success = await adminService.rejectWithdrawal(restaurantId);

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Restaurant not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Withdrawal rejected successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to reject withdrawal',
      });
    }
  }
}

