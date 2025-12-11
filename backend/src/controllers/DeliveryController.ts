/**
 * Delivery Controller
 * Handles HTTP requests for delivery assignment operations
 */

import { Request, Response } from 'express';
import { frontDashMain } from '../FrontDashMain';

export class DeliveryController {
  /**
   * GET /api/deliveries
   * Get all delivery assignments
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const assignments = await frontDashMain.db.getAllDeliveryAssignments();
      res.json({
        success: true,
        assignments,
      });
    } catch (error: any) {
      console.error('Get all deliveries error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch deliveries',
      });
    }
  }

  /**
   * GET /api/deliveries/driver/:driverId
   * Get deliveries by driver
   */
  async getByDriver(req: Request, res: Response): Promise<void> {
    try {
      const { driverId } = req.params;
      const assignments = await frontDashMain.db.getDeliveryAssignmentsByDriver(parseInt(driverId));
      res.json({
        success: true,
        assignments,
      });
    } catch (error: any) {
      console.error('Get deliveries by driver error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch deliveries',
      });
    }
  }

  /**
   * GET /api/deliveries/order/:orderId
   * Get deliveries by order
   */
  async getByOrder(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const assignments = await frontDashMain.db.getDeliveryAssignmentsByOrder(parseInt(orderId));
      res.json({
        success: true,
        assignments,
      });
    } catch (error: any) {
      console.error('Get deliveries by order error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch deliveries',
      });
    }
  }

  /**
   * POST /api/deliveries
   * Create delivery assignment
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { orderId, driverId, assignedByStaff, deliveryStatus } = req.body;

      if (!orderId || !driverId) {
        res.status(400).json({
          success: false,
          error: 'orderId and driverId are required',
        });
        return;
      }

      const assignment = await frontDashMain.db.createDeliveryAssignment({
        orderId,
        driverId,
        assignedByStaff,
        deliveryStatus: deliveryStatus || 'assigned',
      });

      res.status(201).json({
        success: true,
        assignment,
      });
    } catch (error: any) {
      console.error('Create delivery error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create delivery assignment',
      });
    }
  }

  /**
   * PATCH /api/deliveries/:id/status
   * Update delivery status
   */
  async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({
          success: false,
          error: 'Status is required',
        });
        return;
      }

      await frontDashMain.db.updateDeliveryStatus(parseInt(id), status);
      res.json({
        success: true,
        message: 'Delivery status updated',
      });
    } catch (error: any) {
      console.error('Update delivery status error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update delivery status',
      });
    }
  }
}

export const deliveryController = new DeliveryController();

