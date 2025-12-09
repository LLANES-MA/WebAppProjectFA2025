/**
 * Restaurant Controller
 * Handles HTTP requests for restaurant operations
 */

import { Request, Response } from 'express';
import { restaurantService } from '../services/RestaurantService';

export class RestaurantController {
  /**
   * POST /api/restaurants/register
   * Register a new restaurant
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const registrationData = req.body;
      console.log('📝 Registration request received:', {
        restaurantName: registrationData.restaurantName,
        email: registrationData.email,
        hasOperatingHours: !!registrationData.operatingHours,
      });
      
      // Validate required fields
      if (!registrationData.restaurantName || !registrationData.email) {
        res.status(400).json({
          success: false,
          error: 'restaurantName and email are required',
        });
        return;
      }

      const restaurant = await restaurantService.registerRestaurant(registrationData);
      console.log('✅ Restaurant created successfully:', restaurant.id);

      res.status(201).json({
        success: true,
        restaurantId: restaurant.id,
        message: 'Registration successful',
      });
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to register restaurant',
      });
    }
  }

  /**
   * GET /api/restaurants
   * Get all restaurants
   */
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const restaurants = await restaurantService.getAllRestaurants();
      res.json({
        success: true,
        restaurants,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch restaurants',
      });
    }
  }

  /**
   * GET /api/restaurants/:id
   * Get restaurant by ID
   */
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const restaurant = await restaurantService.getRestaurant(id);

      if (!restaurant) {
        res.status(404).json({
          success: false,
          error: 'Restaurant not found',
        });
        return;
      }

      res.json({
        success: true,
        restaurant,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch restaurant',
      });
    }
  }

  /**
   * GET /api/restaurants/:id/hours
   * Get restaurant operating hours
   */
  async getHours(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const hours = await restaurantService.getRestaurantHours(id);

      res.json({
        success: true,
        hours,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch restaurant hours',
      });
    }
  }

  /**
   * GET /api/restaurants/:id/menu
   * Get restaurant menu items
   */
  async getMenu(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const menuItems = await restaurantService.getMenuItems(id);

      res.json({
        success: true,
        menuItems,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch menu items',
      });
    }
  }

  /**
   * PUT /api/restaurants/:id
   * Update restaurant information
   */
  async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;

      const restaurant = await restaurantService.updateRestaurant(id, updates);

      if (!restaurant) {
        res.status(404).json({
          success: false,
          error: 'Restaurant not found',
        });
        return;
      }

      res.json({
        success: true,
        restaurant,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update restaurant',
      });
    }
  }

  /**
   * PUT /api/restaurants/:id/hours
   * Update restaurant operating hours
   */
  async updateHours(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const { hours } = req.body;

      if (!hours || !Array.isArray(hours)) {
        res.status(400).json({
          success: false,
          error: 'Hours array is required',
        });
        return;
      }

      await restaurantService.updateRestaurantHours(id, hours);

      res.json({
        success: true,
        message: 'Operating hours updated successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update operating hours',
      });
    }
  }

  /**
   * POST /api/restaurants/:id/withdraw
   * Request withdrawal from FrontDash
   */
  async requestWithdrawal(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      
      const restaurant = await restaurantService.requestWithdrawal(id);

      res.json({
        success: true,
        restaurant,
        message: 'Withdrawal request submitted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to submit withdrawal request',
      });
    }
  }
}

