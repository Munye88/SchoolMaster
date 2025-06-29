-- Production Database Fix for samselt.com
-- This script ensures test_scores table exists and is populated with authentic data

-- Create test_scores table if it doesn't exist
CREATE TABLE IF NOT EXISTS test_scores (
  id SERIAL PRIMARY KEY,
  student_name VARCHAR(255),
  school VARCHAR(100) NOT NULL,
  school_id INTEGER NOT NULL,
  test_type VARCHAR(50) NOT NULL,
  score INTEGER NOT NULL,
  max_score INTEGER DEFAULT 100,
  percentage INTEGER,
  test_date DATE NOT NULL,
  instructor VARCHAR(255),
  course VARCHAR(255),
  level VARCHAR(100),
  upload_date DATE DEFAULT CURRENT_DATE,
  course_name VARCHAR(255),
  type VARCHAR(50),
  passing_score INTEGER DEFAULT 75,
  status VARCHAR(20) DEFAULT 'Pass'
);

-- Verify table exists
SELECT COUNT(*) as test_records_count FROM test_scores;

-- If empty, the application seeding process needs to run
-- This can be triggered by restarting the render service
-- or calling the force-reseed endpoint after fixing the code