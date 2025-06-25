-- Production Database Fix for Render Deployment
-- Run this on the production PostgreSQL database if columns are missing

-- Ensure instructors table has all required columns
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS passport_number text;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS emergency_contact text;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS emergency_phone text;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS contract_end_date date;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS salary integer;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active';
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS created_at timestamp DEFAULT NOW();
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS updated_at timestamp DEFAULT NOW();
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS emergency_contact_name text;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS emergency_contact_phone text;
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS employment_status text DEFAULT 'active';
ALTER TABLE instructors ADD COLUMN IF NOT EXISTS hire_date date;

-- Update any NULL values with defaults
UPDATE instructors SET status = 'Active' WHERE status IS NULL;
UPDATE instructors SET employment_status = 'active' WHERE employment_status IS NULL;
UPDATE instructors SET created_at = NOW() WHERE created_at IS NULL;
UPDATE instructors SET updated_at = NOW() WHERE updated_at IS NULL;