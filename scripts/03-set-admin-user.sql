-- Set user 123456@gmail.com as admin and update password to 123456
-- Note: The password hash below is for '123456' hashed with bcrypt

-- First, update the role to admin
UPDATE users 
SET role = 'admin'
WHERE email = '123456@gmail.com';

-- Update column name from 'password' to 'password_hash'
-- Update the password to '123456' (hashed)
-- Hash: $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy
UPDATE users 
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE email = '123456@gmail.com';

-- Verify the update
SELECT id, email, role, created_at 
FROM users 
WHERE email = '123456@gmail.com';
