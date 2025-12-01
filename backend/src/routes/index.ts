/**
 * API Routes
 * Defines all API endpoints
 */

import { Router } from 'express';
import { RestaurantController } from '../controllers/RestaurantController';
import { AdminController } from '../controllers/AdminController';
import { NotificationController } from '../controllers/NotificationController';

const router = Router();

// Controllers
const restaurantController = new RestaurantController();
const adminController = new AdminController();
const notificationController = new NotificationController();

// Restaurant routes
router.post('/restaurants/register', (req, res) => restaurantController.register(req, res));
router.get('/restaurants', (req, res) => restaurantController.getAll(req, res));
router.get('/restaurants/:id', (req, res) => restaurantController.getById(req, res));
router.get('/restaurants/:id/hours', (req, res) => restaurantController.getHours(req, res));
router.get('/restaurants/:id/menu', (req, res) => restaurantController.getMenu(req, res));

// Admin routes
router.post('/admin/restaurants/:id/approve', (req, res) => adminController.approveRestaurant(req, res));
router.post('/admin/restaurants/:id/reject', (req, res) => adminController.rejectRestaurant(req, res));
router.get('/admin/restaurants/pending', (req, res) => adminController.getPendingRestaurants(req, res));
router.get('/admin/restaurants/approved', (req, res) => adminController.getApprovedRestaurants(req, res));

// Notification routes
router.post('/notifications/email', (req, res) => notificationController.sendEmail(req, res));

export default router;

