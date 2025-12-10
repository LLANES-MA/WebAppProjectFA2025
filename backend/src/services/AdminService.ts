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
    console.log(`🔍 AdminService.approveRestaurant(${restaurantId}) called`);
    
    // Get restaurant
    console.log(`📡 Fetching restaurant ${restaurantId}...`);
    const restaurant = await restaurantService.getRestaurant(restaurantId);
    if (!restaurant) {
      console.error(`❌ Restaurant with ID ${restaurantId} not found`);
      return {
        success: false,
        restaurantId,
        username: '',
        temporaryPassword: '',
        error: `Restaurant with ID ${restaurantId} not found`,
      };
    }

    console.log(`✅ Restaurant found:`, {
      id: restaurant.id,
      name: restaurant.restaurantName,
      email: restaurant.email,
      status: restaurant.status
    });

    // Check if already approved
    if (restaurant.status === 'approved') {
      console.warn(`⚠️ Restaurant ${restaurantId} is already approved`);
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

      console.log(`🔑 Generated temporary password: ${temporaryPassword}`);
      console.log(`📧 Username (email): ${username}`);

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

      // Create login via AuthService with usertype='restaurant'
      console.log(`🔐 Creating login for username: ${username}`);
      console.log(`🔐 Password to hash: ${temporaryPassword}`);
      try {
        const createdLogin = await authService.createLogin(username, temporaryPassword, 'restaurant');
        console.log(`✅ Login created successfully`);
        console.log(`📝 Created login details:`, {
          username: createdLogin.username,
          passwordHashLength: createdLogin.passwordHash.length,
          passwordHashPreview: createdLogin.passwordHash.substring(0, 20) + '...'
        });
      } catch (error: any) {
        console.error(`❌ Failed to create login:`, error);
        // If login already exists, that's okay - continue with account creation
        if (error.message && error.message.includes('already exists')) {
          console.log(`⚠️ Login already exists, continuing...`);
          // Try to verify the existing password works
          console.log(`🔍 Verifying existing login with provided password...`);
          const existingLogin = await db.getLogin(username);
          if (existingLogin) {
            console.log(`📝 Existing login found, hash: ${existingLogin.passwordHash.substring(0, 20)}...`);
            const testAuth = await authService.authenticate(username, temporaryPassword);
            console.log(`🔍 Test authentication with temporary password: ${testAuth}`);
            if (!testAuth) {
              console.warn(`⚠️ WARNING: Existing login password does not match temporary password!`);
              console.warn(`⚠️ The restaurant may need to use their original password, not the temporary one.`);
            }
          }
        } else {
          throw new Error(`Failed to create login: ${error.message || error}`);
        }
      }

      // Create RestaurantAccount linking Restaurant to Login
      console.log(`🔗 Creating RestaurantAccount with restaurantId: ${restaurant.id}, username: ${username}`);
      try {
        const accountInput: RestaurantAccountCreateInput = {
          restaurantId: restaurant.id,
          username: username,
        };
        await db.createRestaurantAccount(accountInput);
        console.log(`✅ RestaurantAccount created successfully`);
      } catch (error: any) {
        console.error(`❌ Failed to create RestaurantAccount:`, error);
        // If account already exists, that's okay - continue with status update
        if (error.message && (error.message.includes('already exists') || error.message.includes('Duplicate'))) {
          console.log(`⚠️ RestaurantAccount already exists, continuing...`);
        } else {
          throw new Error(`Failed to create restaurant account: ${error.message || error}`);
        }
      }

      // Update restaurant status to approved
      // Database uses 'APPROVED' and sets is_active = 1
      console.log(`📝 Updating restaurant status to APPROVED for restaurantId: ${restaurantId}`);
      try {
        await db.updateRestaurantStatus(restaurantId, 'APPROVED', true);
        console.log(`✅ Restaurant status updated to APPROVED`);
      } catch (error: any) {
        console.error(`❌ Failed to update restaurant status:`, error);
        throw new Error(`Failed to update restaurant status: ${error.message || error}`);
      }

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
  async rejectRestaurant(restaurantId: number): Promise<boolean> {
    const restaurant = await restaurantService.getRestaurant(restaurantId);
    if (!restaurant) {
      return false;
    }

    await restaurantService.updateRestaurant(restaurantId, {
      status: 'rejected',
    });

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

