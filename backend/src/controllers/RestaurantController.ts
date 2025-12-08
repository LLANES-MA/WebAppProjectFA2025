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
      
      // Validate required fields
      if (!registrationData.restaurantName || !registrationData.email) {
        res.status(400).json({
          success: false,
          error: 'restaurantName and email are required',
        });
        return;
      }

      const restaurant = await restaurantService.registerRestaurant(registrationData);

      res.status(201).json({
        success: true,
        restaurantId: restaurant.id,
        message: 'Registration successful',
      });
    } catch (error: any) {
      console.error('Registration error:', error);
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
      const restaurants = restaurantService.getAllRestaurants();
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
      const restaurant = restaurantService.getRestaurant(id);

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
      const hours = restaurantService.getRestaurantHours(id);

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
      const menuItems = restaurantService.getMenuItems(id);

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
}

