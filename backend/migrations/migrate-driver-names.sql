-- Migration: Update Driver table to use first_name and last_name instead of name
-- This migration splits the existing 'name' column into 'first_name' and 'last_name'
-- and prevents duplicate driver names

USE FrontDash;

-- Step 1: Add new columns (nullable initially)
ALTER TABLE Driver 
ADD COLUMN first_name VARCHAR(255) NULL AFTER driver_id,
ADD COLUMN last_name VARCHAR(255) NULL AFTER first_name;

-- Step 2: Migrate existing data from 'name' to 'first_name' and 'last_name'
-- Split name on first space: first word = first_name, rest = last_name
UPDATE Driver 
SET 
  first_name = SUBSTRING_INDEX(name, ' ', 1),
  last_name = CASE 
    WHEN LOCATE(' ', name) > 0 THEN SUBSTRING(name, LOCATE(' ', name) + 1)
    ELSE ''
  END
WHERE name IS NOT NULL AND name != '';

-- Step 2.5: Handle duplicates by appending driver_id to last_name for duplicates
-- This ensures all drivers have unique first_name + last_name combinations
UPDATE Driver d1
SET d1.last_name = CONCAT(d1.last_name, '-', d1.driver_id)
WHERE EXISTS (
  SELECT 1 FROM Driver d2 
  WHERE d2.driver_id < d1.driver_id 
  AND LOWER(d2.first_name) = LOWER(d1.first_name) 
  AND LOWER(d2.last_name) = LOWER(d1.last_name)
);

-- Step 3: Make columns NOT NULL (after data migration)
ALTER TABLE Driver 
MODIFY COLUMN first_name VARCHAR(255) NOT NULL,
MODIFY COLUMN last_name VARCHAR(255) NOT NULL;

-- Step 4: Add unique constraint to prevent duplicate first+last name combinations
-- Drop the constraint if it already exists (in case migration was partially run)
ALTER TABLE Driver DROP INDEX IF EXISTS unique_driver_name;
ALTER TABLE Driver 
ADD UNIQUE KEY unique_driver_name (first_name, last_name);

-- Step 5: Drop the old 'name' column (optional - comment out if you want to keep it for reference)
-- ALTER TABLE Driver DROP COLUMN name;

-- Note: If you want to keep the 'name' column for backward compatibility, 
-- you can create a computed column or view instead of dropping it.

