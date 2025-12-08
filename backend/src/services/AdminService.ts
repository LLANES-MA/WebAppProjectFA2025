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
    // Get restaurant
    const restaurant = restaurantService.getRestaurant(restaurantId);
    if (!restaurant) {
      return {
        success: false,
        restaurantId,
        username: '',
        temporaryPassword: '',
        error: `Restaurant with ID ${restaurantId} not found`,
      };
    }

    // Check if already approved
    if (restaurant.status === 'approved') {
      return {
        success: false,
        restaurantId,
        username: '',
        temporaryPassword: '',
        error: 'Restaurant is already approved',
      };
    }

    try {
      // Generate temporary password
      const temporaryPassword = authService.generateTemporaryPassword();
      const username = restaurant.email; // Use email as username

      // Create login via AuthService
      await authService.createLogin(username, temporaryPassword);

      // Create RestaurantAccount linking Restaurant to Login
      const accountInput: RestaurantAccountCreateInput = {
        restaurantId: restaurant.id,
        username: username,
      };
      db.createRestaurantAccount(accountInput);

      // Update restaurant status to approved
      restaurantService.updateRestaurant(restaurantId, {
        status: 'approved',
        approvedAt: new Date(),
      });

      // Send approval email with credentials
      const loginUrl = process.env.FRONTEND_URL || 'http://localhost:3000/restaurant-signin';
      try {
        await emailService.sendApprovalEmail(
          restaurant.email,
          restaurant.restaurantName,
          username,
          temporaryPassword,
          loginUrl
        );
        console.log(`✅ Approval email sent to ${restaurant.email}`);
      } catch (error) {
        console.error(`❌ Failed to send approval email:`, error);
        // Don't fail approval if email fails
      }

      return {
        success: true,
        restaurantId: restaurant.id,
        username,
        temporaryPassword,
      };
    } catch (error: any) {
      console.error(`❌ Failed to approve restaurant ${restaurantId}:`, error);
      return {
        success: false,
        restaurantId,
        username: '',
        temporaryPassword: '',
        error: error.message || 'Failed to approve restaurant',
      };
    }
  }

  /**
   * Reject a restaurant registration
   */
  rejectRestaurant(restaurantId: number): boolean {
    const restaurant = restaurantService.getRestaurant(restaurantId);
    if (!restaurant) {
      return false;
    }

    restaurantService.updateRestaurant(restaurantId, {
      status: 'rejected',
    });

    return true;
  }

  /**
   * Get all pending restaurant registrations
   */
  getPendingRestaurants(): Restaurant[] {
    return restaurantService.getRestaurantsByStatus('pending');
  }

  /**
   * Get all approved restaurants
   */
  getApprovedRestaurants(): Restaurant[] {
    return restaurantService.getRestaurantsByStatus('approved');
  }
}

// Singleton instance
export const adminService = new AdminService();

