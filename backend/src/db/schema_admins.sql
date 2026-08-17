-- Create PostgreSQL ENUM for strictly restricting admin roles
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'admin_role_type') THEN 
    CREATE TYPE admin_role_type AS ENUM ('admin', 'super_admin'); 
  END IF; 
END $$;

-- Create admins table with ENUM role
CREATE TABLE IF NOT EXISTS admins (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role admin_role_type DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Safely convert existing varchar role column to PostgreSQL ENUM if necessary
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admins' AND column_name = 'role' AND data_type LIKE '%char%'
  ) THEN
    UPDATE admins SET role = 'super_admin' WHERE role IN ('Super Admin', 'super_admin');
    UPDATE admins SET role = 'admin' WHERE role NOT IN ('super_admin') OR role IS NULL;

    ALTER TABLE admins ALTER COLUMN role DROP DEFAULT;
    ALTER TABLE admins ALTER COLUMN role TYPE admin_role_type USING role::admin_role_type;
    ALTER TABLE admins ALTER COLUMN role SET DEFAULT 'admin'::admin_role_type;
  END IF;
END $$;

-- Index for fast authentication email lookups
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- Insert default Super Admin (Password: Admin@123)
INSERT INTO admins (name, email, password_hash, role, is_active)
VALUES (
  'Super Admin',
  'admin@example.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'super_admin'::admin_role_type,
  TRUE
)
ON CONFLICT (email) DO NOTHING;
