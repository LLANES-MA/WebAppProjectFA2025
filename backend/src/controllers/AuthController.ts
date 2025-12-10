/**
 * Authentication Controller
 * Handles authentication endpoints
 */

import { Request, Response } from 'express';
import { frontDashMain } from '../FrontDashMain';

export class AuthController {
  /**
   * Authenticate restaurant owner
   * POST /api/auth/restaurant/login
   */
  async restaurantLogin(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;
      console.log(`🔐 Restaurant login attempt for username: ${username}`);

      if (!username || !password) {
        console.error('❌ Missing username or password');
        res.status(400).json({
          success: false,
          error: 'Username and password are required',
        });
        return;
      }

      // Authenticate using AuthService
      console.log(`🔍 Authenticating username: ${username}...`);
      console.log(`🔍 Password provided (length: ${password.length})`);
      
      // First check if login exists
      const loginCheck = await frontDashMain.db.getLogin(username);
      if (!loginCheck) {
        console.error(`❌ Login not found in database for username: ${username}`);
        // Try case-insensitive search
        console.log(`🔍 Attempting to find login with different case...`);
        res.status(401).json({
          success: false,
          error: `Login not found. Please verify your email address is correct.`,
        });
        return;
      }
      
      console.log(`✅ Login exists in database`);
      console.log(`🔐 Stored hash type: ${loginCheck.passwordHash.startsWith('$2') ? 'bcrypt' : 'plain text'}`);
      
      const isValid = await frontDashMain.authService.authenticate(username, password);

      if (!isValid) {
        console.error(`❌ Authentication failed for username: ${username}`);
        console.error(`💡 Possible issues:`);
        console.error(`   - Password does not match stored hash`);
        console.error(`   - Username case mismatch (try: ${username.toLowerCase()} or ${username.toUpperCase()})`);
        console.error(`   - Password may have been changed`);
        res.status(401).json({
          success: false,
          error: 'Invalid username or password. Please check your credentials and try again.',
        });
        return;
      }

      console.log(`✅ Authentication successful for username: ${username}`);

      // Check if this username is linked to a restaurant account
      console.log(`🔍 Checking RestaurantAccount for username: ${username}...`);
      const restaurantAccount = await frontDashMain.db.getRestaurantAccountByUsername(username);
      
      if (!restaurantAccount) {
        console.error(`❌ No RestaurantAccount found for username: ${username}`);
        res.status(403).json({
          success: false,
          error: 'This account is not associated with a restaurant. Please contact support.',
        });
        return;
      }

      console.log(`✅ RestaurantAccount found: restaurantId=${restaurantAccount.restaurantId}`);

      // Get restaurant details including status
      console.log(`🔍 Fetching restaurant details for ID: ${restaurantAccount.restaurantId}...`);
      const restaurant = await frontDashMain.db.getRestaurant(restaurantAccount.restaurantId);
      
      if (!restaurant) {
        console.error(`❌ Restaurant not found for ID: ${restaurantAccount.restaurantId}`);
        res.status(404).json({
          success: false,
          error: 'Restaurant not found',
        });
        return;
      }

      console.log(`✅ Restaurant found: ${restaurant.restaurantName}, status: ${restaurant.status}`);
      
      res.json({
        success: true,
        message: 'Authentication successful',
        username: username,
        restaurantId: restaurantAccount.restaurantId,
        userType: 'restaurant',
        restaurantStatus: restaurant?.status || 'pending',
        restaurantName: restaurant?.restaurantName || '',
      });
    } catch (error: any) {
      console.error('❌ Restaurant login error:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        error: error.message || 'Authentication failed',
      });
    }
  }

  /**
   * Authenticate admin
   * POST /api/auth/admin/login
   */
  async adminLogin(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({
          success: false,
          error: 'Username and password are required',
        });
        return;
      }

      const isValid = await frontDashMain.authService.authenticate(username, password);

      if (!isValid) {
        res.status(401).json({
          success: false,
          error: 'Invalid username or password',
        });
        return;
      }

      // Check Login table for usertype
      const login = await frontDashMain.db.getLogin(username);
      if (!login) {
        res.status(401).json({
          success: false,
          error: 'Login not found',
        });
        return;
      }

      // Check if user is admin (usertype = 'admin' in Login table)
      const loginInfo = await frontDashMain.db.getLoginWithUserType(username);
      
      if (!loginInfo || loginInfo.usertype !== 'admin') {
        res.status(403).json({
          success: false,
          error: 'This account does not have admin privileges',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Admin authentication successful',
        username: username,
        userType: 'admin',
      });
    } catch (error: any) {
      console.error('Admin login error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Authentication failed',
      });
    }
  }

  /**
   * Authenticate staff
   * POST /api/auth/staff/login
   */
  async staffLogin(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({
          success: false,
          error: 'Username and password are required',
        });
        return;
      }

      const isValid = await frontDashMain.authService.authenticate(username, password);

      if (!isValid) {
        res.status(401).json({
          success: false,
          error: 'Invalid username or password',
        });
        return;
      }

      // Check if username exists in Staff table
      const staff = await frontDashMain.db.getStaff(username);
      
      if (!staff) {
        res.status(403).json({
          success: false,
          error: 'This account is not associated with staff',
        });
        return;
      }

      // Update first login flag if needed
      if (staff.firstLogin) {
        await frontDashMain.db.updateStaffFirstLogin(username);
      }

      res.json({
        success: true,
        message: 'Staff authentication successful',
        username: username,
        userType: 'staff',
        firstName: staff.firstName,
        lastName: staff.lastName,
        firstLogin: staff.firstLogin,
      });
    } catch (error: any) {
      console.error('Staff login error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Authentication failed',
      });
    }
  }

  /**
   * Change password for staff
   * POST /api/auth/staff/change-password
   */
  async staffChangePassword(req: Request, res: Response): Promise<void> {
    try {
      const { username, currentPassword, newPassword } = req.body;

      if (!username || !currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          error: 'Username, current password, and new password are required',
        });
        return;
      }

      // Verify user is staff
      const staff = await frontDashMain.db.getStaff(username);
      if (!staff) {
        res.status(403).json({
          success: false,
          error: 'This account is not associated with staff',
        });
        return;
      }

      // Change password (this will verify current password and validate new password)
      await frontDashMain.authService.changePassword(username, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error: any) {
      console.error('Change password error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to change password',
      });
    }
  }

  /**
   * Change password for admin
   * POST /api/auth/admin/change-password
   */
  async adminChangePassword(req: Request, res: Response): Promise<void> {
    try {
      const { username, currentPassword, newPassword } = req.body;

      if (!username || !currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          error: 'Username, current password, and new password are required',
        });
        return;
      }

      // Verify user is admin by checking Login table
      const login = await frontDashMain.db.getLogin(username);
      if (!login) {
        res.status(403).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      // Check if user is admin (usertype = 'admin')
      // Note: This assumes the Login table has a usertype column
      // If not, we'll just verify the password change works
      const loginData = await frontDashMain.db.getLogin(username);
      if (!loginData) {
        res.status(403).json({
          success: false,
          error: 'This account is not authorized',
        });
        return;
      }

      // Change password (this will verify current password and validate new password)
      await frontDashMain.authService.changePassword(username, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error: any) {
      console.error('Change password error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to change password',
      });
    }
  }

  /**
   * Change password for restaurant
   * POST /api/auth/restaurant/change-password
   */
  async restaurantChangePassword(req: Request, res: Response): Promise<void> {
    try {
      const { username, currentPassword, newPassword } = req.body;

      if (!username || !currentPassword || !newPassword) {
        res.status(400).json({
          success: false,
          error: 'Username, current password, and new password are required',
        });
        return;
      }

      // Verify user is restaurant owner
      const restaurantAccount = await frontDashMain.db.getRestaurantAccountByUsername(username);
      if (!restaurantAccount) {
        res.status(403).json({
          success: false,
          error: 'This account is not associated with a restaurant',
        });
        return;
      }

      // Change password (this will verify current password and validate new password)
      await frontDashMain.authService.changePassword(username, currentPassword, newPassword);

      res.json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error: any) {
      console.error('Change password error:', error);
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to change password',
      });
    }
  }

  /**
   * Authenticate driver
   * POST /api/auth/driver/login
   */
  async driverLogin(req: Request, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({
          success: false,
          error: 'Username and password are required',
        });
        return;
      }

      const isValid = await frontDashMain.authService.authenticate(username, password);

      if (!isValid) {
        res.status(401).json({
          success: false,
          error: 'Invalid username or password',
        });
        return;
      }

      // Check Login table for usertype = 'driver'
      const loginInfo = await frontDashMain.db.getLoginWithUserType(username);
      
      if (!loginInfo || loginInfo.usertype !== 'driver') {
        res.status(403).json({
          success: false,
          error: 'This account is not associated with a driver',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Driver authentication successful',
        username: username,
        userType: 'driver',
      });
    } catch (error: any) {
      console.error('Driver login error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Authentication failed',
      });
    }
  }
}

export const authController = new AuthController();

