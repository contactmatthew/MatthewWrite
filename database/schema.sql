-- Typing Speed Test Database Schema
-- Run this SQL in phpMyAdmin or MySQL command line

-- Create database (if it doesn't exist)
CREATE DATABASE IF NOT EXISTS typing_speed;
USE typing_speed;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'superadmin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create typing_results table
CREATE TABLE IF NOT EXISTS typing_results (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  wpm INT NOT NULL,
  accuracy DECIMAL(5,2) NOT NULL,
  raw_wpm INT NOT NULL,
  characters INT NOT NULL,
  errors INT NOT NULL,
  test_type VARCHAR(50) NOT NULL,
  test_duration INT NOT NULL,
  consistency DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Show tables to verify
SHOW TABLES;

