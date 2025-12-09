-- Migration: Update Driver table to use first_name and last_name instead of name
-- Safe version that handles partial migrations and existing duplicates

USE FrontDash;

-- Step 1: Add new columns only if they don't exist
SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'FrontDash' 
  AND TABLE_NAME = 'Driver' 
  AND COLUMN_NAME = 'first_name');

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE Driver ADD COLUMN first_name VARCHAR(255) NULL AFTER driver_id',
  'SELECT "Column first_name already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = 'FrontDash' 
  AND TABLE_NAME = 'Driver' 
  AND COLUMN_NAME = 'last_name');

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE Driver ADD COLUMN last_name VARCHAR(255) NULL AFTER first_name',
  'SELECT "Column last_name already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Step 2: Migrate existing data from 'name' to 'first_name' and 'last_name' (only if columns are NULL)
-- Split name on first space: first word = first_name, rest = last_name
UPDATE Driver 
SET 
  first_name = SUBSTRING_INDEX(name, ' ', 1),
  last_name = CASE 
    WHEN LOCATE(' ', name) > 0 THEN SUBSTRING(name, LOCATE(' ', name) + 1)
    ELSE CONCAT('Driver', driver_id)
  END
WHERE (first_name IS NULL OR last_name IS NULL) AND name IS NOT NULL AND name != '';

-- Step 2.5: Delete duplicate drivers (keep the one with the lowest driver_id)
-- This ensures all drivers have unique first_name + last_name combinations
DELETE d1 FROM Driver d1
INNER JOIN Driver d2 
WHERE d1.driver_id > d2.driver_id 
AND LOWER(TRIM(d1.first_name)) = LOWER(TRIM(d2.first_name)) 
AND LOWER(TRIM(d1.last_name)) = LOWER(TRIM(d2.last_name));

-- Step 3: Make columns NOT NULL (after data migration)
ALTER TABLE Driver 
MODIFY COLUMN first_name VARCHAR(255) NOT NULL,
MODIFY COLUMN last_name VARCHAR(255) NOT NULL;

-- Step 4: Drop existing unique constraint if it exists, then add it
SET @index_exists = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
  WHERE TABLE_SCHEMA = 'FrontDash' 
  AND TABLE_NAME = 'Driver' 
  AND INDEX_NAME = 'unique_driver_name');

SET @sql = IF(@index_exists > 0,
  'ALTER TABLE Driver DROP INDEX unique_driver_name',
  'SELECT "Index unique_driver_name does not exist" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Now add the unique constraint
ALTER TABLE Driver 
ADD UNIQUE KEY unique_driver_name (first_name, last_name);

-- Step 5: Drop the old 'name' column (optional - comment out if you want to keep it for reference)
-- ALTER TABLE Driver DROP COLUMN name;

SELECT 'Migration completed successfully!' AS status;

