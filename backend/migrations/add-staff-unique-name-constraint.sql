-- Migration: Add unique constraint on Staff first_name + last_name
-- This prevents duplicate staff member names within FrontDash

USE FrontDash;

-- Step 1: Delete duplicate staff members (keep the one with the lowest username alphabetically)
DELETE s1 FROM Staff s1
INNER JOIN Staff s2 
WHERE s1.username > s2.username 
AND LOWER(TRIM(s1.first_name)) = LOWER(TRIM(s2.first_name)) 
AND LOWER(TRIM(s1.last_name)) = LOWER(TRIM(s2.last_name))
AND s1.first_name IS NOT NULL 
AND s1.last_name IS NOT NULL
AND s2.first_name IS NOT NULL 
AND s2.last_name IS NOT NULL;

-- Step 2: Drop existing unique constraint if it exists
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = 'FrontDash' 
  AND TABLE_NAME = 'Staff' 
  AND INDEX_NAME = 'unique_staff_name');

SET @sql = IF(@index_exists > 0,
  'ALTER TABLE Staff DROP INDEX unique_staff_name',
  'SELECT "Index unique_staff_name does not exist" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 3: Add unique constraint on first_name + last_name
ALTER TABLE Staff 
ADD UNIQUE KEY unique_staff_name (first_name, last_name);

SELECT 'Migration completed successfully!' AS status;

