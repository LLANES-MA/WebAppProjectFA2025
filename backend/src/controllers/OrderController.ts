/**
 * Order Controller
 * Handles HTTP requests for order operations
 */

import { Request, Response } from 'express';
import { frontDashMain } from '../FrontDashMain';

export class OrderController {
  /**
   * POST /api/orders
   * Create a new order
   */
  async create(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId, subtotal, tip, grandTotal, orderStatus, address, customer, items } = req.body;

      if (!restaurantId || !items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({
          success: false,
          error: 'restaurantId and items are required',
        });
        return;
      }

      const order = await frontDashMain.orderService.createOrderWithCustomer({
        restaurantId,
        subtotal: subtotal || 0,
        tip: tip || 0,
        grandTotal: grandTotal || 0,
        orderStatus: orderStatus || 'pending',
        address,
        customer,
        items,
      });

      res.status(201).json({
        success: true,
        order,
        message: 'Order created successfully',
      });
    } catch (error: any) {
      console.error('Create order error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create order',
      });
    }
  }

  /**
   * GET /api/orders
   * Get all orders
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const orders = await frontDashMain.orderService.getAllOrders();
      res.json({
        success: true,
        orders,
      });
    } catch (error: any) {
      console.error('Get all orders error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch orders',
      });
    }
  }

  /**
   * GET /api/orders/:id
   * Get order by ID or order number with items
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Try to parse as number first (order ID), otherwise treat as order number
      const orderId = parseInt(id);
      let orderWithItems;
      
      if (!isNaN(orderId)) {
        // It's a numeric ID
        orderWithItems = await frontDashMain.orderService.getOrderWithItems(orderId);
      } else {
        // It's an order number (string)
        orderWithItems = await frontDashMain.orderService.getOrderWithItemsByNumber(id);
      }
      
      if (!orderWithItems) {
        res.status(404).json({
          success: false,
          error: 'Order not found',
        });
        return;
      }

      res.json({
        success: true,
        order: orderWithItems.order,
        items: orderWithItems.items,
      });
    } catch (error: any) {
      console.error('Get order error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch order',
      });
    }
  }

  /**
   * GET /api/orders/restaurant/:restaurantId
   * Get orders by restaurant
   */
  async getByRestaurant(req: Request, res: Response): Promise<void> {
    try {
      const { restaurantId } = req.params;
      const orders = await frontDashMain.orderService.getOrdersByRestaurant(parseInt(restaurantId));
      res.json({
        success: true,
        orders,
      });
    } catch (error: any) {
      console.error('Get orders by restaurant error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch orders',
      });
    }
  }

  /**
   * GET /api/orders/status/:status
   * Get orders by status
   */
  async getByStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.params;
      const orders = await frontDashMain.orderService.getOrdersByStatus(status as any);
      res.json({
        success: true,
        orders,
      });
    } catch (error: any) {
      console.error('Get orders by status error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch orders',
      });
    }
  }

  /**
   * GET /api/orders/queue
   * Get queued orders
   */
  async getQueue(req: Request, res: Response): Promise<void> {
    try {
      const queue = await frontDashMain.orderService.getQueuedOrders();
      res.json({
        success: true,
        queue,
      });
    } catch (error: any) {
      console.error('Get queue error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch queue',
      });
    }
  }

  /**
   * PATCH /api/orders/:id/status
   * Update order status
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

      await frontDashMain.orderService.updateOrderStatus(parseInt(id), status);
      res.json({
        success: true,
        message: 'Order status updated',
      });
    } catch (error: any) {
      console.error('Update order status error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update order status',
      });
    }
  }
}

export const orderController = new OrderController();

