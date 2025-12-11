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
  contactPerson?: string;
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
    imageUrl?: string;
  }>;
}

export class RestaurantService {
  /**
   * Register a new restaurant
   * Creates restaurant with status='pending' and sends pending approval email
   */
  async registerRestaurant(data: RestaurantRegistrationData): Promise<Restaurant> {
    try {
      const restaurantInput: RestaurantCreateInput = {
        restaurantName: data.restaurantName,
        description: data.description || '',
        cuisineType: data.cuisineType || 'General',
        establishedYear: data.establishedYear ? parseInt(data.establishedYear) : undefined,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        phone: data.phone,
        email: data.email,
        website: data.website,
        averagePrice: data.averagePrice || '$$',
        deliveryFee: parseFloat(data.deliveryFee) || 0,
        minimumOrder: parseFloat(data.minimumOrder) || 0,
        preparationTime: parseInt(data.preparationTime) || 30,
        status: 'pending',
      };

      const contactPerson = data.contactPerson || data.email;
      const restaurant = await db.createRestaurant(restaurantInput, contactPerson);

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
        const hours = data.operatingHours?.[day];
        if (hours) {
          if (hours.closed || (!hours.open && !hours.close)) {
            continue;
          }
          
          try {
            const hoursInput: RestaurantHoursCreateInput = {
              restaurantId: restaurant.id,
              dayOfWeek: day as RestaurantHours['dayOfWeek'],
              openTime: hours.open || '09:00',
              closeTime: hours.close || '17:00',
              isClosed: false,
            };
            await db.createRestaurantHours(hoursInput);
          } catch (error: any) {
            console.error(`Failed to create hours for ${day}:`, error.message);
          }
        }
      }

      if (data.menuItems && data.menuItems.length > 0) {
        for (const item of data.menuItems) {
          if (item.name && item.price) {
            try {
              const menuItemInput: MenuItemCreateInput = {
                restaurantId: restaurant.id,
                name: item.name,
                description: item.description || '',
                price: parseFloat(item.price) || 0,
                category: item.category || 'Other',
                imageUrl: item.imageUrl || undefined,
                isAvailable: true,
              };
              await db.createMenuItem(menuItemInput);
            } catch (error: any) {
              console.error(`Failed to create menu item ${item.name}:`, error.message);
            }
          }
        }
      }

      try {
        await emailService.sendPendingApprovalEmail(restaurant.email, restaurant.restaurantName);
      } catch (error: any) {
        console.error(`Failed to send pending approval email:`, error?.message || error);
      }

      return restaurant;
    } catch (error: any) {
      console.error('Error in registerRestaurant:', error);
      throw error;
    }
  }

  /**
   * Get restaurant by ID
   */
  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    return await db.getRestaurant(id);
  }

  /**
   * Get all restaurants
   */
  async getAllRestaurants(): Promise<Restaurant[]> {
    return await db.getAllRestaurants();
  }

  /**
   * Request withdrawal from FrontDash
   * Sets restaurant status to 'WITHDRAWAL' (pending withdrawal)
   */
  async requestWithdrawal(restaurantId: number): Promise<Restaurant> {
    const restaurant = await this.getRestaurant(restaurantId);
    if (!restaurant) {
      throw new Error(`Restaurant with ID ${restaurantId} not found`);
    }

    // Update status to WITHDRAWAL (pending withdrawal approval)
    await db.updateRestaurantStatus(restaurantId, 'WITHDRAWAL', restaurant.status === 'approved');
    
    const updatedRestaurant = await this.getRestaurant(restaurantId);
    if (!updatedRestaurant) {
      throw new Error('Failed to update restaurant withdrawal status');
    }
    
    return updatedRestaurant;
  }

  /**
   * Get restaurants by status
   */
  async getRestaurantsByStatus(status: Restaurant['status']): Promise<Restaurant[]> {
    return await db.getRestaurantsByStatus(status);
  }

  /**
   * Update restaurant
   */
  async updateRestaurant(id: number, updates: Partial<Restaurant>): Promise<Restaurant | null> {
    return await db.updateRestaurant(id, updates);
  }

  /**
   * Get restaurant hours
   */
  async getRestaurantHours(restaurantId: number): Promise<RestaurantHours[]> {
    return await db.getRestaurantHours(restaurantId);
  }

  /**
   * Get menu items for a restaurant
   */
  async getMenuItems(restaurantId: number): Promise<MenuItem[]> {
    return await db.getMenuItems(restaurantId);
  }

  /**
   * Create a menu item for a restaurant
   */
  async createMenuItem(input: MenuItemCreateInput): Promise<MenuItem> {
    return await db.createMenuItem(input);
  }

  /**
   * Update a menu item
   */
  async updateMenuItem(restaurantId: number, itemId: number, updates: Partial<MenuItem>): Promise<MenuItem | null> {
    return await db.updateMenuItem(itemId, updates);
  }

  /**
   * Toggle menu item availability
   */
  async toggleMenuItemAvailability(restaurantId: number, itemId: number, isAvailable: boolean): Promise<MenuItem | null> {
    return await db.updateMenuItem(itemId, { isAvailable });
  }

  /**
   * Update restaurant hours
   */
  async updateRestaurantHours(restaurantId: number, hours: RestaurantHoursCreateInput[]): Promise<void> {
    return await db.updateRestaurantHours(restaurantId, hours);
  }
}

// Singleton instance
export const restaurantService = new RestaurantService();

