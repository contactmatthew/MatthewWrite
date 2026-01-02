-- Migration: Add role column to users table
-- Run this if you have an existing database without the role column

USE typing_speed;

-- Add role column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role ENUM('user', 'superadmin') DEFAULT 'user';

-- Update existing users to have 'user' role (if they don't have one)
UPDATE users SET role = 'user' WHERE role IS NULL;

-- Note: To create sample accounts, run the Node.js script:
-- cd database
-- node insert_sample_accounts.js
--
-- Or manually create accounts through the registration form in the app.

