/**
 * FrontDash Backend API Server
 * Main entry point
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { frontDashMain } from './FrontDashMain';
import routes from './routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Initialize FrontDash services
frontDashMain.initialize();

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images statically
import path from 'path';
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'FrontDash Backend API',
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\nFrontDash Backend API Server running!`);
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`API Base: http://localhost:${PORT}/api`);
  console.log(`CORS Origin: ${CORS_ORIGIN}`);
  console.log(`Email Service: ${process.env.EMAIL_USER ? 'Configured' : 'Not configured (dev mode)'}\n`);
});

