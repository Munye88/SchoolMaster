-- CRITICAL PRODUCTION FIX: Resolve foreign key constraint violation
-- Error: Key (school_id)=(349) is not present in table "schools"
-- This script ensures all required schools exist before test score seeding

-- First, check what schools currently exist
SELECT 'Current schools in database:' as status;
SELECT id, name, code, location FROM schools ORDER BY id;

-- Create required schools if they don't exist
-- Using INSERT ... ON CONFLICT DO NOTHING to safely handle existing records

INSERT INTO schools (id, name, code, location, created_at, updated_at)
VALUES 
  (349, 'KFNA', 'KFNA', 'King Faisal Naval Academy', NOW(), NOW()),
  (350, 'NFS East', 'NFS_EAST', 'Eastern Province', NOW(), NOW()),
  (351, 'NFS West', 'NFS_WEST', 'Western Province', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Update the sequence to handle any ID conflicts
SELECT setval('schools_id_seq', GREATEST(351, (SELECT COALESCE(MAX(id), 0) FROM schools)), true);

-- Verify all required schools now exist
SELECT 'Verification - Required schools after fix:' as status;
SELECT id, name, code, location FROM schools WHERE id IN (349, 350, 351) ORDER BY id;

-- Check if we have all 3 required schools
SELECT 
  CASE 
    WHEN COUNT(*) = 3 THEN '✅ SUCCESS: All required schools exist'
    ELSE '❌ ERROR: Missing schools - check results above'
  END as fix_status
FROM schools 
WHERE id IN (349, 350, 351);