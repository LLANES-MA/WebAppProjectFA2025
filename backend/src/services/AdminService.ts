/**
 * Admin Service
 * Oversees Staff and admin operations, including restaurant approval
 */

import { db } from '../data/Database';
import { Restaurant } from '../models/Restaurant';
import { RestaurantAccount, RestaurantAccountCreateInput } from '../models/RestaurantAccount';
import { authService } from './AuthService';
import { emailService } from './EmailService';
import { restaurantService } from './RestaurantService';

export interface ApprovalResult {
  success: boolean;
  restaurantId: number;
  username: string;
  temporaryPassword: string;
  error?: string;
}

export class AdminService {
  /**
   * Approve a restaurant registration
   * - Updates Restaurant status to 'approved'
   * - Creates Login entry via AuthService
   * - Creates RestaurantAccount linking Restaurant to Login
   * - Sends approval email with credentials
   */
  async approveRestaurant(restaurantId: number): Promise<ApprovalResult> {
    const restaurant = await restaurantService.getRestaurant(restaurantId);
    if (!restaurant) {
      console.error(`Restaurant with ID ${restaurantId} not found`);
      return {
        success: false,
        restaurantId,
        username: '',
        temporaryPassword: '',
        error: `Restaurant with ID ${restaurantId} not found`,
      };
    }

    if (restaurant.status === 'approved') {
      console.warn(`Restaurant ${restaurantId} is already approved`);
      return {
        success: false,
        restaurantId,
        username: '',
        temporaryPassword: '',
        error: 'Restaurant is already approved',
      };
    }

    try {
      const temporaryPassword = authService.generateTemporaryPassword();
      const username = restaurant.email;

      if (!username || !restaurant.email) {
        return {
          success: false,
          restaurantId,
          username: '',
          temporaryPassword: '',
          error: 'Restaurant email is required for login',
        };
      }

      // Ensure Restaurant table has email field set (in case it's missing)
      // This ensures the restaurant can login using their email
      if (restaurant.email) {
        await db.updateRestaurant(restaurantId, {
          email: restaurant.email,
        });
      }

      try {
        await authService.createLogin(username, temporaryPassword, 'restaurant');
      } catch (error: any) {
        if (error.message && error.message.includes('already exists')) {
          const existingLogin = await db.getLogin(username);
          if (existingLogin) {
            const testAuth = await authService.authenticate(username, temporaryPassword);
            if (!testAuth) {
              console.warn(`Existing login password does not match temporary password`);
            }
          }
        } else {
          throw new Error(`Failed to create login: ${error.message || error}`);
        }
      }

      try {
        const accountInput: RestaurantAccountCreateInput = {
          restaurantId: restaurant.id,
          username: username,
        };
        await db.createRestaurantAccount(accountInput);
      } catch (error: any) {
        if (error.message && (error.message.includes('already exists') || error.message.includes('Duplicate'))) {
          // Account already exists, continue
        } else {
          throw new Error(`Failed to create restaurant account: ${error.message || error}`);
        }
      }

      try {
        await db.updateRestaurantStatus(restaurantId, 'APPROVED', true);
      } catch (error: any) {
        console.error(`Failed to update restaurant status:`, error);
        throw new Error(`Failed to update restaurant status: ${error.message || error}`);
      }

      const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3000/restaurant-signin';
      try {
        await emailService.sendApprovalEmail(
          restaurant.email,
          restaurant.restaurantName,
          username,
          temporaryPassword,
          loginUrl
        );
      } catch (error) {
        console.error(`Failed to send approval email:`, error);
      }

      return {
        success: true,
        restaurantId: restaurant.id,
        username,
        temporaryPassword,
      };
    } catch (error: any) {
      console.error(`Failed to approve restaurant ${restaurantId}:`, error);
      return {
        success: false,
        restaurantId,
        username: '',
        temporaryPassword: '',
        error: error.message || 'Failed to approve restaurant',
      };
    }
  }

  async rejectRestaurant(restaurantId: number): Promise<boolean> {
    const restaurant = await restaurantService.getRestaurant(restaurantId);
    if (!restaurant) {
      return false;
    }

    await restaurantService.updateRestaurant(restaurantId, {
      status: 'rejected',
    });

    try {
      await emailService.sendRejectionEmail(restaurant.email, restaurant.restaurantName);
    } catch (error: any) {
      console.error(`Failed to send rejection email:`, error?.message || error);
    }

    return true;
  }

  /**
   * Get all pending restaurant registrations
   */
  async getPendingRestaurants(): Promise<Restaurant[]> {
    return await restaurantService.getRestaurantsByStatus('pending');
  }

  /**
   * Get all approved restaurants
   */
  async getApprovedRestaurants(): Promise<Restaurant[]> {
    return await restaurantService.getRestaurantsByStatus('approved');
  }

  /**
   * Get all pending withdrawal requests
   * These are restaurants with request_status='WITHDRAWAL' and is_active=1
   */
  async getPendingWithdrawals(): Promise<Restaurant[]> {
    return await db.getPendingWithdrawals();
  }

  /**
   * Approve a withdrawal request
   * Sets restaurant status to 'WITHDRAWAL' and is_active = 0
   */
  async approveWithdrawal(restaurantId: number): Promise<boolean> {
    const restaurant = await restaurantService.getRestaurant(restaurantId);
    if (!restaurant) {
      return false;
    }

    // Set status to WITHDRAWAL and deactivate
    await db.updateRestaurantStatus(restaurantId, 'WITHDRAWAL', false);
    return true;
  }

  /**
   * Reject a withdrawal request
   * Reverts restaurant back to approved status
   */
  async rejectWithdrawal(restaurantId: number): Promise<boolean> {
    const restaurant = await restaurantService.getRestaurant(restaurantId);
    if (!restaurant) {
      return false;
    }

    // Revert back to approved status
    await db.updateRestaurantStatus(restaurantId, 'APPROVED', true);
    return true;
  }
}

// Singleton instance
export const adminService = new AdminService();

