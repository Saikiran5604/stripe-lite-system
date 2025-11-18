-- Add role column to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'role'
  ) THEN
    ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user';
    
    -- Update existing users to have 'user' role
    UPDATE users SET role = 'user' WHERE role IS NULL;
    
    -- Add constraint to ensure role is valid
    ALTER TABLE users ADD CONSTRAINT users_role_check 
      CHECK (role IN ('user', 'admin'));
  END IF;
END $$;

-- Make the first user an admin if there are any users
UPDATE users 
SET role = 'admin' 
WHERE id = (SELECT id FROM users ORDER BY created_at LIMIT 1)
AND role = 'user';
