/**
 * Restaurant Controller
 * Handles HTTP requests for restaurant operations
 */

import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { restaurantService } from '../services/RestaurantService';

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/menu-items');
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `menu-item-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      const error: any = new Error('Only image files are allowed');
      error.code = 'LIMIT_FILE_TYPE';
      cb(error);
    }
  }
});

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
      console.log(`📡 Fetching menu items for restaurant ID: ${id}`);
      const menuItems = await restaurantService.getMenuItems(id);
      console.log(`✅ Found ${menuItems.length} menu items for restaurant ${id}`);

      res.json({
        success: true,
        menuItems,
      });
    } catch (error: any) {
      console.error('❌ Error fetching menu items:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch menu items',
      });
    }
  }

  /**
   * POST /api/restaurants/:id/menu
   * Create a new menu item for a restaurant
   */
  async createMenuItem(req: Request, res: Response): Promise<void> {
    try {
      const restaurantId = parseInt(req.params.id);
      const { name, description, price, isAvailable, pictureUrl } = req.body;

      // Validate required fields
      if (!name || price === undefined) {
        res.status(400).json({
          success: false,
          error: 'Name and price are required',
        });
        return;
      }

      console.log(`📝 Creating menu item for restaurant ${restaurantId}:`, { name, price });

      const menuItem = await restaurantService.createMenuItem({
        restaurantId,
        name,
        description: description || '',
        price: parseFloat(price),
        category: 'Other', // Default category
        imageUrl: pictureUrl || undefined,
        isAvailable: isAvailable !== false,
      });

      console.log(`✅ Menu item created successfully: ${menuItem.id}`);

      res.status(201).json({
        success: true,
        menuItem,
      });
    } catch (error: any) {
      console.error('❌ Error creating menu item:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create menu item',
      });
    }
  }

  /**
   * PUT /api/restaurants/:id/menu/:itemId
   * Update a menu item
   */
  async updateMenuItem(req: Request, res: Response): Promise<void> {
    try {
      const restaurantId = parseInt(req.params.id);
      const itemId = parseInt(req.params.itemId);
      const { name, description, price, isAvailable, pictureUrl } = req.body;

      console.log(`📝 Updating menu item ${itemId} for restaurant ${restaurantId}`);

      const menuItem = await restaurantService.updateMenuItem(restaurantId, itemId, {
        name,
        description,
        price: price !== undefined ? parseFloat(price) : undefined,
        imageUrl: pictureUrl,
        isAvailable,
      });

      if (!menuItem) {
        res.status(404).json({
          success: false,
          error: 'Menu item not found',
        });
        return;
      }

      console.log(`✅ Menu item updated successfully: ${menuItem.id}`);

      res.json({
        success: true,
        menuItem,
      });
    } catch (error: any) {
      console.error('❌ Error updating menu item:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update menu item',
      });
    }
  }

  /**
   * PATCH /api/restaurants/:id/menu/:itemId/availability
   * Toggle menu item availability
   */
  async toggleMenuItemAvailability(req: Request, res: Response): Promise<void> {
    try {
      const restaurantId = parseInt(req.params.id);
      const itemId = parseInt(req.params.itemId);
      const { isAvailable } = req.body;

      console.log(`🔄 Toggling availability for menu item ${itemId}: ${isAvailable}`);

      const menuItem = await restaurantService.toggleMenuItemAvailability(
        restaurantId,
        itemId,
        isAvailable === true
      );

      if (!menuItem) {
        res.status(404).json({
          success: false,
          error: 'Menu item not found',
        });
        return;
      }

      console.log(`✅ Menu item availability updated: ${menuItem.id}`);

      res.json({
        success: true,
        menuItem,
      });
    } catch (error: any) {
      console.error('❌ Error toggling menu item availability:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to toggle menu item availability',
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

  /**
   * POST /api/restaurants/upload-image
   * Upload a menu item image and return the URL
   * Note: This method expects multer middleware to be applied in the route
   */
  async uploadImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No image file provided',
        });
        return;
      }

      // Generate URL for the uploaded file
      // In production, this would be the full URL to your CDN or static file server
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 8080}`;
      const imageUrl = `${baseUrl}/uploads/menu-items/${req.file.filename}`;

      console.log('✅ Image uploaded successfully:', imageUrl);

      res.json({
        success: true,
        imageUrl: imageUrl,
        filename: req.file.filename,
      });
    } catch (error: any) {
      console.error('❌ Image upload error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to upload image',
      });
    }
  }
}

// Export multer upload middleware for use in routes
export { upload };

