/**
 * FrontDashMain
 * Main orchestrator that initializes and manages all services
 */

import { authService } from './services/AuthService';
import { restaurantService } from './services/RestaurantService';
import { adminService } from './services/AdminService';
import { emailService } from './services/EmailService';
import { orderService } from './services/OrderService';
import { driverService } from './services/DriverService';
import { paymentService } from './services/PaymentService';

export class FrontDashMain {
  // Services
  public readonly authService = authService;
  public readonly restaurantService = restaurantService;
  public readonly adminService = adminService;
  public readonly emailService = emailService;
  public readonly orderService = orderService;
  public readonly driverService = driverService;
  public readonly paymentService = paymentService;

  /**
   * Initialize all services
   */
  initialize(): void {
    console.log('🚀 Initializing FrontDash Backend Services...');
    
    // Services are already initialized as singletons
    // This method can be used for additional initialization logic
    
    console.log('✅ AuthService initialized');
    console.log('✅ RestaurantService initialized');
    console.log('✅ AdminService initialized');
    console.log('✅ EmailService initialized');
    console.log('✅ OrderService initialized');
    console.log('✅ DriverService initialized');
    console.log('✅ PaymentService initialized');
    
    console.log('🎉 All services initialized successfully!');
  }

  /**
   * Get service instance (for dependency injection if needed)
   */
  getService(serviceName: string): any {
    const services: { [key: string]: any } = {
      auth: this.authService,
      restaurant: this.restaurantService,
      admin: this.adminService,
      email: this.emailService,
      order: this.orderService,
      driver: this.driverService,
      payment: this.paymentService,
    };

    return services[serviceName];
  }
}

// Singleton instance
export const frontDashMain = new FrontDashMain();

