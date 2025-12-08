/**
 * Restaurant Service
 * Manages Restaurant entities and registration
 */

import { db } from '../data/Database';
import { Restaurant, RestaurantCreateInput } from '../models/Restaurant';
import { RestaurantHours, RestaurantHoursCreateInput } from '../models/RestaurantHours';
import { MenuItem, MenuItemCreateInput } from '../models/MenuItem';
import { emailService } from './EmailService';

export interface RestaurantRegistrationData {
  restaurantName: string;
  description: string;
  cuisineType: string;
  establishedYear?: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  averagePrice: string;
  deliveryFee: string;
  minimumOrder: string;
  preparationTime: string;
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      closed: boolean;
    };
  };
  menuItems?: Array<{
    name: string;
    description: string;
    price: string;
    category: string;
  }>;
}

export class RestaurantService {
  /**
   * Register a new restaurant
   * Creates restaurant with status='pending' and sends pending approval email
   */
  async registerRestaurant(data: RestaurantRegistrationData): Promise<Restaurant> {
    // Create restaurant input
    const restaurantInput: RestaurantCreateInput = {
      restaurantName: data.restaurantName,
      description: data.description,
      cuisineType: data.cuisineType,
      establishedYear: data.establishedYear ? parseInt(data.establishedYear) : undefined,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      phone: data.phone,
      email: data.email,
      website: data.website,
      averagePrice: data.averagePrice,
      deliveryFee: parseFloat(data.deliveryFee) || 0,
      minimumOrder: parseFloat(data.minimumOrder) || 0,
      preparationTime: parseInt(data.preparationTime) || 0,
      status: 'pending',
    };

    // Create restaurant
    const restaurant = db.createRestaurant(restaurantInput);

    // Create restaurant hours
    const daysOfWeek: Array<keyof typeof data.operatingHours> = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];

    for (const day of daysOfWeek) {
      const hours = data.operatingHours[day];
      if (hours) {
        const hoursInput: RestaurantHoursCreateInput = {
          restaurantId: restaurant.id,
          dayOfWeek: day as RestaurantHours['dayOfWeek'],
          openTime: hours.open || '09:00',
          closeTime: hours.close || '17:00',
          isClosed: hours.closed || false,
        };
        db.createRestaurantHours(hoursInput);
      }
    }

    // Create menu items if provided
    if (data.menuItems && data.menuItems.length > 0) {
      for (const item of data.menuItems) {
        if (item.name && item.price) {
          const menuItemInput: MenuItemCreateInput = {
            restaurantId: restaurant.id,
            name: item.name,
            description: item.description || '',
            price: parseFloat(item.price) || 0,
            category: item.category || 'Other',
            isAvailable: true,
          };
          db.createMenuItem(menuItemInput);
        }
      }
    }

    // Send pending approval email
    try {
      await emailService.sendPendingApprovalEmail(restaurant.email, restaurant.restaurantName);
      console.log(`✅ Pending approval email sent to ${restaurant.email}`);
    } catch (error) {
      console.error(`❌ Failed to send pending approval email:`, error);
      // Don't fail registration if email fails
    }

    return restaurant;
  }

  /**
   * Get restaurant by ID
   */
  getRestaurant(id: number): Restaurant | undefined {
    return db.getRestaurant(id);
  }

  /**
   * Get all restaurants
   */
  getAllRestaurants(): Restaurant[] {
    return db.getAllRestaurants();
  }

  /**
   * Get restaurants by status
   */
  getRestaurantsByStatus(status: Restaurant['status']): Restaurant[] {
    return db.getRestaurantsByStatus(status);
  }

  /**
   * Update restaurant
   */
  updateRestaurant(id: number, updates: Partial<Restaurant>): Restaurant | null {
    return db.updateRestaurant(id, updates);
  }

  /**
   * Get restaurant hours
   */
  getRestaurantHours(restaurantId: number): RestaurantHours[] {
    return db.getRestaurantHours(restaurantId);
  }

  /**
   * Get menu items for a restaurant
   */
  getMenuItems(restaurantId: number): MenuItem[] {
    return db.getMenuItems(restaurantId);
  }
}

// Singleton instance
export const restaurantService = new RestaurantService();

