-- FrontDash Database Schema
-- MySQL Database: FrontDash

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS FrontDash;
USE FrontDash;

-- Logins table (authentication credentials)
CREATE TABLE IF NOT EXISTS logins (
  username VARCHAR(255) PRIMARY KEY,
  passwordHash VARCHAR(255) NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lastLogin DATETIME NULL,
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurantName VARCHAR(255) NOT NULL,
  description TEXT,
  cuisineType VARCHAR(100),
  establishedYear INT NULL,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zipCode VARCHAR(20) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  website VARCHAR(255) NULL,
  averagePrice VARCHAR(50),
  deliveryFee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  minimumOrder DECIMAL(10, 2) NOT NULL DEFAULT 0,
  preparationTime INT NOT NULL DEFAULT 0,
  status ENUM('pending', 'approved', 'rejected', 'inactive') NOT NULL DEFAULT 'pending',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  approvedAt DATETIME NULL,
  INDEX idx_status (status),
  INDEX idx_email (email),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Restaurant Hours table
CREATE TABLE IF NOT EXISTS restaurant_hours (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurantId INT NOT NULL,
  dayOfWeek ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday') NOT NULL,
  openTime VARCHAR(10) NOT NULL,
  closeTime VARCHAR(10) NOT NULL,
  isClosed TINYINT(1) NOT NULL DEFAULT 0,
  FOREIGN KEY (restaurantId) REFERENCES restaurants(id) ON DELETE CASCADE,
  UNIQUE KEY unique_restaurant_day (restaurantId, dayOfWeek),
  INDEX idx_restaurantId (restaurantId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Menu Items table
CREATE TABLE IF NOT EXISTS menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  restaurantId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'Other',
  imageUrl VARCHAR(500) NULL,
  isAvailable TINYINT(1) NOT NULL DEFAULT 1,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (restaurantId) REFERENCES restaurants(id) ON DELETE CASCADE,
  INDEX idx_restaurantId (restaurantId),
  INDEX idx_category (category),
  INDEX idx_isAvailable (isAvailable)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Restaurant Accounts table (links restaurants to logins)
CREATE TABLE IF NOT EXISTS restaurant_accounts (
  restaurantId INT NOT NULL,
  username VARCHAR(255) NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (restaurantId, username),
  FOREIGN KEY (restaurantId) REFERENCES restaurants(id) ON DELETE CASCADE,
  FOREIGN KEY (username) REFERENCES logins(username) ON DELETE CASCADE,
  INDEX idx_restaurantId (restaurantId),
  INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

