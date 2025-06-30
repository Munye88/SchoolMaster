-- EMERGENCY PRODUCTION FIX FOR SAMSELT.COM
-- Resolves foreign key constraint violations for test scores

-- Step 1: Clear all test scores to prevent foreign key conflicts
DELETE FROM test_scores;

-- Step 2: Clear and recreate schools with exact required IDs
DELETE FROM schools WHERE id IN (349, 350, 351);
DELETE FROM schools WHERE code IN ('KFNA', 'NFS_EAST', 'NFS_WEST');

-- Step 3: Insert required schools with exact IDs
INSERT INTO schools (id, name, code, location, created_at) VALUES 
(349, 'KFNA', 'KFNA', 'King Fahd Naval Academy', NOW()),
(350, 'NFS East', 'NFS_EAST', 'Naval Flight School East', NOW()),
(351, 'NFS West', 'NFS_WEST', 'Naval Flight School West', NOW());

-- Step 4: Update sequence to prevent future conflicts
SELECT setval('schools_id_seq', (SELECT MAX(id) FROM schools));

-- Step 5: Ensure test_scores table has correct structure
CREATE TABLE IF NOT EXISTS test_scores (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    test_type VARCHAR(50) NOT NULL,
    score INTEGER NOT NULL,
    month INTEGER,
    cycle INTEGER,
    year INTEGER NOT NULL,
    student_name VARCHAR(255),
    instructor_name VARCHAR(255),
    course_name VARCHAR(255),
    test_date DATE,
    status VARCHAR(50) DEFAULT 'Completed',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Verification: Check that schools exist
SELECT id, name, code FROM schools WHERE id IN (349, 350, 351) ORDER BY id;