/**
 * API Routes
 * Defines all API endpoints
 */

import { Router } from 'express';
import { RestaurantController } from '../controllers/RestaurantController';
import { AdminController } from '../controllers/AdminController';
import { NotificationController } from '../controllers/NotificationController';
import { authController } from '../controllers/AuthController';
import { staffController } from '../controllers/StaffController';
import { driverController } from '../controllers/DriverController';
import { orderController } from '../controllers/OrderController';
import { deliveryController } from '../controllers/DeliveryController';

const router = Router();

// Controllers
const restaurantController = new RestaurantController();
const adminController = new AdminController();
const notificationController = new NotificationController();

// Restaurant routes
router.post('/restaurants/register', (req, res) => restaurantController.register(req, res));
router.get('/restaurants', (req, res) => restaurantController.getAll(req, res));
router.get('/restaurants/:id', (req, res) => restaurantController.getById(req, res));
router.put('/restaurants/:id', (req, res) => restaurantController.update(req, res));
router.get('/restaurants/:id/hours', (req, res) => restaurantController.getHours(req, res));
router.put('/restaurants/:id/hours', (req, res) => restaurantController.updateHours(req, res));
router.get('/restaurants/:id/menu', (req, res) => restaurantController.getMenu(req, res));
router.post('/restaurants/:id/withdraw', (req, res) => restaurantController.requestWithdrawal(req, res));

// Admin routes
router.post('/admin/restaurants/:id/approve', (req, res) => adminController.approveRestaurant(req, res));
router.post('/admin/restaurants/:id/reject', (req, res) => adminController.rejectRestaurant(req, res));
router.get('/admin/restaurants/pending', (req, res) => adminController.getPendingRestaurants(req, res));
router.get('/admin/restaurants/approved', (req, res) => adminController.getApprovedRestaurants(req, res));
router.get('/admin/restaurants/withdrawals', (req, res) => adminController.getPendingWithdrawals(req, res));
router.post('/admin/restaurants/:id/approve-withdrawal', (req, res) => adminController.approveWithdrawal(req, res));
router.post('/admin/restaurants/:id/reject-withdrawal', (req, res) => adminController.rejectWithdrawal(req, res));

// Notification routes
router.post('/notifications/email', (req, res) => notificationController.sendEmail(req, res));

// Authentication routes
router.post('/auth/restaurant/login', (req, res) => authController.restaurantLogin(req, res));
router.post('/auth/admin/login', (req, res) => authController.adminLogin(req, res));
router.post('/auth/staff/login', (req, res) => authController.staffLogin(req, res));
router.post('/auth/driver/login', (req, res) => authController.driverLogin(req, res));

// Staff routes
router.post('/staff', (req, res) => staffController.create(req, res));
router.get('/staff', (req, res) => staffController.getAll(req, res));
router.get('/staff/:username', (req, res) => staffController.getByUsername(req, res));
router.delete('/staff/:username', (req, res) => staffController.delete(req, res));

// Driver routes
router.post('/drivers', (req, res) => driverController.create(req, res));
router.get('/drivers', (req, res) => driverController.getAll(req, res));
router.get('/drivers/active', (req, res) => driverController.getActive(req, res));
router.get('/drivers/:id', (req, res) => driverController.getById(req, res));
router.patch('/drivers/:id', (req, res) => driverController.update(req, res));
router.delete('/drivers/:id', (req, res) => driverController.delete(req, res));

// Order routes
router.post('/orders', (req, res) => orderController.create(req, res));
router.get('/orders', (req, res) => orderController.getAll(req, res));
router.get('/orders/:id', (req, res) => orderController.getById(req, res));
router.get('/orders/restaurant/:restaurantId', (req, res) => orderController.getByRestaurant(req, res));
router.get('/orders/status/:status', (req, res) => orderController.getByStatus(req, res));
router.get('/orders/queue', (req, res) => orderController.getQueue(req, res));
router.patch('/orders/:id/status', (req, res) => orderController.updateStatus(req, res));

// Delivery routes
router.get('/deliveries', (req, res) => deliveryController.getAll(req, res));
router.get('/deliveries/driver/:driverId', (req, res) => deliveryController.getByDriver(req, res));
router.get('/deliveries/order/:orderId', (req, res) => deliveryController.getByOrder(req, res));
router.post('/deliveries', (req, res) => deliveryController.create(req, res));
router.patch('/deliveries/:id/status', (req, res) => deliveryController.updateStatus(req, res));

export default router;

