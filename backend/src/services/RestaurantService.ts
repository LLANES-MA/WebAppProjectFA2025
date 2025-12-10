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
      console.log('📝 Creating restaurant:', data.restaurantName);
      
      // Create restaurant input
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
      

      // Create restaurant
      console.log('📝 Creating restaurant entry...');
      // Pass contactPerson separately since it's not in RestaurantCreateInput
      const contactPerson = data.contactPerson || data.email;
      const restaurant = await db.createRestaurant(restaurantInput, contactPerson);
      console.log('✅ Restaurant created:', restaurant.id);

      // Create restaurant hours
      console.log('📝 Creating restaurant hours...');
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
          // Skip if closed or if no times provided
          if (hours.closed || (!hours.open && !hours.close)) {
            console.log(`⏭️  Skipping ${day} (closed or no times)`);
            continue;
          }
          
          try {
            const hoursInput: RestaurantHoursCreateInput = {
              restaurantId: restaurant.id,
              dayOfWeek: day as RestaurantHours['dayOfWeek'],
              openTime: hours.open || '09:00',
              closeTime: hours.close || '17:00',
              isClosed: false, // Only create entries for open days
            };
            await db.createRestaurantHours(hoursInput);
            console.log(`✅ Created hours for ${day}`);
          } catch (error: any) {
            console.error(`❌ Failed to create hours for ${day}:`, error.message);
            // Continue with other days even if one fails
          }
        }
      }

      // Create menu items if provided
      if (data.menuItems && data.menuItems.length > 0) {
        console.log('📝 Creating menu items...');
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
              console.error(`❌ Failed to create menu item ${item.name}:`, error.message);
              // Continue with other items even if one fails
            }
          }
        }
      }

      // Send pending approval email (non-blocking - don't fail registration if email fails)
      try {
        await emailService.sendPendingApprovalEmail(restaurant.email, restaurant.restaurantName);
        console.log(`✅ Pending approval email sent to ${restaurant.email}`);
      } catch (error: any) {
        console.error(`❌ Failed to send pending approval email:`, error?.message || error);
        // Don't fail registration if email fails - email is optional
      }

      console.log('✅ Restaurant registration complete:', restaurant.id);
      return restaurant;
    } catch (error: any) {
      console.error('❌ Error in registerRestaurant:', error);
      console.error('Error stack:', error.stack);
      throw error; // Re-throw to be caught by controller
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

