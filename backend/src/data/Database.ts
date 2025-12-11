/**
 * Database Interface Implementation
 * MySQL implementation of the database abstraction layer
 */

import { pool } from './dbConnection';
import { Restaurant, RestaurantCreateInput } from '../models/Restaurant';
import { Login, LoginCreateInput } from '../models/Login';
import { MenuItem, MenuItemCreateInput } from '../models/MenuItem';
import { RestaurantHours, RestaurantHoursCreateInput } from '../models/RestaurantHours';
import { RestaurantAccount, RestaurantAccountCreateInput } from '../models/RestaurantAccount';
import { Staff, StaffCreateInput } from '../models/Staff';
import { Driver, DriverCreateInput } from '../models/Driver';
import { Order, OrderCreateInput, OrderItem, OrderItemCreateInput } from '../models/Order';
import { DeliveryAssignment, DeliveryAssignmentCreateInput } from '../models/DeliveryAssignment';
import { OrderQueue, OrderQueueCreateInput } from '../models/OrderQueue';
import { Customer, CustomerCreateInput } from '../models/Customer';

class Database {
  // ==================== Restaurant Methods ====================
  
  async createRestaurant(input: RestaurantCreateInput, contactPerson?: string): Promise<Restaurant> {
    // Validate required fields
    if (!input.address) {
      throw new Error('Address is required');
    }
    if (!input.city) {
      throw new Error('City is required');
    }
    if (!input.state) {
      throw new Error('State is required');
    }
    if (!input.zipCode) {
      throw new Error('Zip code is required');
    }
    
    // First, create Address entry
    // Parse address string to extract building number and street name
    const addressParts = input.address.trim().split(/\s+/);
    const buildingNumber = addressParts[0] || '';
    const streetName = addressParts.slice(1).join(' ') || input.address;
    
    const addressQuery = `
      INSERT INTO Address (building_number, street_name, city, state, zip)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [addressResult] = await pool.execute(addressQuery, [
      buildingNumber,
      streetName,
      input.city,
      input.state,
      input.zipCode,
    ]) as any;
    const addressId = addressResult.insertId;

    // Now create Restaurant entry using the actual table structure
    // Note: request_status constraint allows: 'REGISTRATION', 'WITHDRAWAL', 'APPROVED', 'REJECTED'
    // Use 'REGISTRATION' for new registrations (not 'PENDING')
    const query = `
      INSERT INTO Restaurant (
        name, contact_person, email, phone_number, address_id, request_status, is_active
      ) VALUES (?, ?, ?, ?, ?, 'REGISTRATION', 0)
    `;
    
    // Use contactPerson if provided, otherwise fall back to email
    // is_active = 0 for pending restaurants (will be set to 1 when approved)
    const values = [
      input.restaurantName,
      contactPerson || input.email,
      input.email,
      input.phone,
      addressId,
    ];

    const [result] = await pool.execute(query, values) as any;
    const restaurant = await this.getRestaurant(result.insertId);
    if (!restaurant) {
      throw new Error('Failed to create restaurant');
    }
    return restaurant;
  }

  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    const query = `
      SELECT 
        r.restaurant_id,
        r.name,
        r.picture_url,
        r.address_id,
        r.contact_person,
        r.email,
        r.is_active,
        r.phone_number,
        r.request_status,
        a.building_number,
        a.street_name,
        a.unit,
        a.city,
        a.state,
        a.zip
      FROM Restaurant r
      LEFT JOIN Address a ON r.address_id = a.address_id
      WHERE r.restaurant_id = ?
    `;
    const [rows] = await pool.execute(query, [id]) as any[];
    
    if (rows.length === 0) return undefined;
    return this.mapRestaurant(rows[0]);
  }

  async getAllRestaurants(): Promise<Restaurant[]> {
    const query = `
      SELECT 
        r.restaurant_id,
        r.name,
        r.picture_url,
        r.address_id,
        r.contact_person,
        r.email,
        r.is_active,
        r.phone_number,
        r.request_status,
        r.delivery_fee,
        r.minimum_order,
        r.preparation_time,
        a.building_number,
        a.street_name,
        a.unit,
        a.city,
        a.state,
        a.zip
      FROM Restaurant r
      LEFT JOIN Address a ON r.address_id = a.address_id
      ORDER BY r.restaurant_id DESC
    `;
    const [rows] = await pool.execute(query) as any[];
    return rows.map((row: any) => this.mapRestaurant(row));
  }

  /**
   * Get restaurants with pending withdrawal requests
   * These are restaurants with request_status='WITHDRAWAL' and is_active=1
   */
  async getPendingWithdrawals(): Promise<Restaurant[]> {
    const query = `
      SELECT 
        r.restaurant_id,
        r.name,
        r.picture_url,
        r.address_id,
        r.contact_person,
        r.email,
        r.is_active,
        r.phone_number,
        r.request_status,
        a.building_number,
        a.street_name,
        a.unit,
        a.city,
        a.state,
        a.zip
      FROM Restaurant r
      LEFT JOIN Address a ON r.address_id = a.address_id
      WHERE r.request_status = 'WITHDRAWAL' AND r.is_active = 1
      ORDER BY r.restaurant_id DESC
    `;
    const [rows] = await pool.execute(query) as any[];
    return rows.map((row: any) => this.mapRestaurant(row));
  }

  async getRestaurantsByStatus(status: Restaurant['status']): Promise<Restaurant[]> {
    // Map frontend status to database request_status
    // Frontend: 'pending' -> Database: 'REGISTRATION'
    // Frontend: 'approved' -> Database: 'APPROVED'
    // Frontend: 'rejected' -> Database: 'REJECTED'
    // Frontend: 'inactive' -> Database: 'WITHDRAWAL'
    const statusMap: { [key: string]: string } = {
      'pending': 'REGISTRATION',
      'approved': 'APPROVED',
      'rejected': 'REJECTED',
      'inactive': 'WITHDRAWAL',
    };
    const dbStatus = statusMap[status.toLowerCase()] || status.toUpperCase();
    
    const query = `
      SELECT 
        r.restaurant_id,
        r.name,
        r.picture_url,
        r.address_id,
        r.contact_person,
        r.email,
        r.is_active,
        r.phone_number,
        r.request_status,
        a.building_number,
        a.street_name,
        a.unit,
        a.city,
        a.state,
        a.zip
      FROM Restaurant r
      LEFT JOIN Address a ON r.address_id = a.address_id
      WHERE r.request_status = ?
      ORDER BY r.restaurant_id DESC
    `;
    const [rows] = await pool.execute(query, [dbStatus]) as any[];
    return rows.map((row: any) => this.mapRestaurant(row));
  }

  async updateRestaurant(id: number, updates: Partial<Restaurant>): Promise<Restaurant | null> {
    // Map frontend updates to database columns
    const fields: string[] = [];
    const values: any[] = [];

    // Map status to request_status
    if (updates.status) {
      const statusMap: { [key: string]: string } = {
        'pending': 'REGISTRATION',
        'approved': 'APPROVED',
        'rejected': 'REJECTED',
        'inactive': 'WITHDRAWAL',
      };
      fields.push('request_status = ?');
      values.push(statusMap[updates.status] || 'REGISTRATION');
    }

    // Map other fields
    if (updates.restaurantName !== undefined) {
      fields.push('name = ?');
      values.push(updates.restaurantName);
    }
    if (updates.email !== undefined) {
      fields.push('email = ?');
      values.push(updates.email);
    }
    if (updates.phone !== undefined) {
      fields.push('phone_number = ?');
      values.push(updates.phone);
    }
    if (updates.description !== undefined) {
      // Store description in contact_person field (or create a description column if needed)
      // For now, we'll try to update contact_person with description
      fields.push('contact_person = ?');
      values.push(updates.description);
    }
    if (updates.pictureUrl !== undefined) {
      fields.push('picture_url = ?');
      values.push(updates.pictureUrl);
    }
    if (updates.deliveryFee !== undefined) {
      // Try to add column if it doesn't exist, then update
      try {
        await pool.execute(`
          ALTER TABLE Restaurant 
          ADD COLUMN delivery_fee DECIMAL(10, 2) DEFAULT 0
        `).catch(() => {
          // Column already exists, that's fine
        });
      } catch (e: any) {
        // Column might already exist (error code 1060)
        if (e.code !== 'ER_DUP_FIELDNAME') {
          console.warn('Could not add delivery_fee column:', e);
        }
      }
      fields.push('delivery_fee = ?');
      values.push(updates.deliveryFee);
    }
    if (updates.minimumOrder !== undefined) {
      try {
        await pool.execute(`
          ALTER TABLE Restaurant 
          ADD COLUMN minimum_order DECIMAL(10, 2) DEFAULT 0
        `).catch(() => {});
      } catch (e: any) {
        if (e.code !== 'ER_DUP_FIELDNAME') {
          console.warn('Could not add minimum_order column:', e);
        }
      }
      fields.push('minimum_order = ?');
      values.push(updates.minimumOrder);
    }
    if (updates.preparationTime !== undefined) {
      try {
        await pool.execute(`
          ALTER TABLE Restaurant 
          ADD COLUMN preparation_time INT DEFAULT 30
        `).catch(() => {});
      } catch (e: any) {
        if (e.code !== 'ER_DUP_FIELDNAME') {
          console.warn('Could not add preparation_time column:', e);
        }
      }
      fields.push('preparation_time = ?');
      values.push(updates.preparationTime);
    }

    if (fields.length === 0) {
      const restaurant = await this.getRestaurant(id);
      return restaurant || null;
    }

    values.push(id);
    const query = `UPDATE Restaurant SET ${fields.join(', ')} WHERE restaurant_id = ?`;
    await pool.execute(query, values);
    
    const restaurant = await this.getRestaurant(id);
    return restaurant || null;
  }

  async updateRestaurantStatus(id: number, requestStatus: string, isActive: boolean): Promise<void> {
    // Helper method to update status and is_active together
    const query = `UPDATE Restaurant SET request_status = ?, is_active = ? WHERE restaurant_id = ?`;
    await pool.execute(query, [requestStatus, isActive ? 1 : 0, id]);
  }

  private mapRestaurant(row: any): Restaurant {
    // Map database schema to frontend model
    const addressParts = [];
    if (row.building_number) addressParts.push(row.building_number);
    if (row.street_name) addressParts.push(row.street_name);
    if (row.unit) addressParts.push(row.unit);
    const fullAddress = addressParts.join(' ') || 'Address not available';
    
    // Map request_status to status
    // Database: 'REGISTRATION', 'APPROVED', 'REJECTED', 'WITHDRAWAL'
    // Frontend: 'pending', 'approved', 'rejected', 'inactive'
    const statusMap: { [key: string]: Restaurant['status'] } = {
      'APPROVED': 'approved',
      'REGISTRATION': 'pending',
      'REJECTED': 'rejected',
      'WITHDRAWAL': 'inactive',
    };
    const status = statusMap[row.request_status?.toUpperCase()] || 'pending';
    
    return {
      id: row.restaurant_id,
      restaurantName: row.name || 'Unnamed Restaurant',
      description: row.contact_person || '', // Use contact_person as description
      cuisineType: 'General', // Not in database schema, using default
      establishedYear: undefined,
      address: fullAddress,
      city: row.city || '',
      state: row.state || '',
      zipCode: row.zip || '',
      phone: row.phone_number || '',
      email: row.email && row.email !== '?' ? row.email : '',
      website: undefined,
      averagePrice: '$$', // Default value
      deliveryFee: row.delivery_fee !== undefined && row.delivery_fee !== null ? parseFloat(row.delivery_fee) : 0,
      minimumOrder: row.minimum_order !== undefined && row.minimum_order !== null ? parseFloat(row.minimum_order) : 0,
      preparationTime: row.preparation_time !== undefined && row.preparation_time !== null ? parseInt(row.preparation_time) : 30,
      status: statusMap[row.request_status?.toUpperCase()] || 'pending',
      createdAt: new Date(), // Not in schema, using current date
      updatedAt: new Date(), // Not in schema, using current date
      approvedAt: status === 'approved' ? new Date() : undefined,
      pictureUrl: row.picture_url || undefined, // Add pictureUrl to Restaurant model
    };
  }

  // ==================== Login Methods ====================

  async createLogin(input: LoginCreateInput, usertype?: string): Promise<Login> {
    // Use Login table (capital L) which has usertype column
    console.log(`📝 Creating login in database: username=${input.username}, hashLength=${input.passwordHash.length}`);
    console.log(`🔐 Password hash preview: ${input.passwordHash.substring(0, 30)}...`);
    
    // Check if password_hash column can store full bcrypt hash (should be at least 255 chars)
    if (input.passwordHash.length > 255) {
      console.error(`❌ ERROR: Password hash is ${input.passwordHash.length} characters, but column may only support 255!`);
      throw new Error(`Password hash too long for database column`);
    }
    
    // Try different column names for password field
    const queries = [
      // Try password_hash (snake_case)
      {
        query: `INSERT INTO Login (username, password_hash, usertype) VALUES (?, ?, ?)`,
        column: 'password_hash'
      },
      // Try passwordHash (camelCase)
      {
        query: `INSERT INTO Login (username, passwordHash, usertype) VALUES (?, ?, ?)`,
        column: 'passwordHash'
      },
      // Try password (plain)
      {
        query: `INSERT INTO Login (username, password, usertype) VALUES (?, ?, ?)`,
        column: 'password'
      }
    ];

    let lastError: any = null;
    for (const { query, column } of queries) {
      try {
        console.log(`📝 Trying to insert with column: ${column}`);
        await pool.execute(query, [input.username, input.passwordHash, usertype || null]);
        console.log(`✅ Successfully inserted using column: ${column}`);
        break; // Success, exit loop
      } catch (error: any) {
        lastError = error;
        if (error.code === 'ER_BAD_FIELD_ERROR' || error.message?.includes('Unknown column')) {
          console.log(`⚠️ Column ${column} doesn't exist, trying next...`);
          continue; // Try next column name
        }
        // For other errors, throw immediately
        throw error;
      }
    }

    if (lastError && lastError.code === 'ER_BAD_FIELD_ERROR') {
      throw new Error(`Failed to create login: None of the expected password columns (password_hash, passwordHash, password) exist in Login table`);
    }
    
    // Verify the hash was stored correctly
    const login = await this.getLogin(input.username);
    if (!login) {
      throw new Error('Failed to create login');
    }
    
    // Verify the stored hash matches what we tried to store
    if (login.passwordHash !== input.passwordHash) {
      console.error(`❌ ERROR: Stored password hash does not match input hash!`);
      console.error(`   Input length: ${input.passwordHash.length}, Stored length: ${login.passwordHash.length}`);
      console.error(`   Input preview: ${input.passwordHash.substring(0, 30)}...`);
      console.error(`   Stored preview: ${login.passwordHash.substring(0, 30)}...`);
      throw new Error('Password hash was corrupted during storage');
    }
    
    console.log(`✅ Login created and verified successfully`);
    return login;
  }

  async getLogin(username: string): Promise<Login | undefined> {
    // Try different table and column combinations
    const queries = [
      // Try Login table with password_hash
      'SELECT username, password_hash as passwordHash, usertype FROM Login WHERE LOWER(username) = LOWER(?)',
      // Try Login table with passwordHash
      'SELECT username, passwordHash, usertype FROM Login WHERE LOWER(username) = LOWER(?)',
      // Try Login table with password
      'SELECT username, password as passwordHash, usertype FROM Login WHERE LOWER(username) = LOWER(?)',
      // Try logins table with passwordHash
      'SELECT username, passwordHash, createdAt, lastLogin FROM logins WHERE LOWER(username) = LOWER(?)',
      // Try logins table with password_hash
      'SELECT username, password_hash as passwordHash, createdAt, lastLogin FROM logins WHERE LOWER(username) = LOWER(?)',
      // Try logins table with password
      'SELECT username, password as passwordHash, createdAt, lastLogin FROM logins WHERE LOWER(username) = LOWER(?)',
    ];

    let rows: any[] = [];
    for (const query of queries) {
      try {
        [rows] = await pool.execute(query, [username]) as any[];
        if (rows.length > 0) {
          console.log(`✅ Found login using query: ${query.substring(0, 50)}...`);
          break;
        }
      } catch (error: any) {
        if (error.code === 'ER_BAD_FIELD_ERROR' || error.message?.includes('Unknown column')) {
          continue; // Try next query
        }
        // For other errors, log and continue
        console.log(`⚠️ Query failed: ${error.message}`);
        continue;
      }
    }
    
    if (rows.length === 0) {
      console.log(`⚠️ No login found for username: ${username} (case-insensitive search)`);
      return undefined;
    }
    
    console.log(`✅ Found login with username: ${rows[0].username} (matched ${username})`);
    const mapped = this.mapLogin(rows[0]);
    
    // Debug: Check if password hash is valid
    if (mapped.passwordHash) {
      console.log(`🔐 Retrieved password hash length: ${mapped.passwordHash.length}`);
      console.log(`🔐 Password hash value: "${mapped.passwordHash}"`);
      console.log(`🔐 Password hash starts with: ${mapped.passwordHash.substring(0, 10)}`);
      // Bcrypt hashes should be 60 characters
      if (mapped.passwordHash.length < 60 && mapped.passwordHash.startsWith('$2')) {
        console.error(`⚠️ WARNING: Bcrypt hash appears truncated! Expected 60 chars, got ${mapped.passwordHash.length}`);
      }
    } else {
      console.error(`❌ ERROR: passwordHash is null or undefined!`);
      console.error(`   Row keys:`, Object.keys(rows[0]));
      console.error(`   Row data:`, rows[0]);
    }
    
    return mapped;
  }

  async getLoginWithUserType(username: string): Promise<{ username: string; usertype: string | null } | undefined> {
    const query = 'SELECT username, usertype FROM Login WHERE username = ?';
    const [rows] = await pool.execute(query, [username]) as any[];
    
    if (rows.length === 0) return undefined;
    return {
      username: rows[0].username,
      usertype: rows[0].usertype,
    };
  }

  async updateLastLogin(username: string): Promise<void> {
    // Login table (capital L) doesn't have lastLogin column
    // Try logins table (lowercase) which has lastLogin
    try {
      const query = 'UPDATE logins SET lastLogin = NOW() WHERE username = ?';
      await pool.execute(query, [username]);
    } catch (error) {
      // If logins table doesn't exist or column doesn't exist, just skip
      // Login table doesn't have lastLogin column
      console.log('Note: lastLogin update skipped (column may not exist)');
    }
  }

  async updatePassword(username: string, newPasswordHash: string): Promise<void> {
    // Try Login table first (capital L)
    try {
      const query = 'UPDATE Login SET password_hash = ? WHERE username = ?';
      const [result] = await pool.execute(query, [newPasswordHash, username]) as any;
      if (result.affectedRows === 0) {
        // Try logins table (lowercase)
        const query2 = 'UPDATE logins SET passwordHash = ? WHERE username = ?';
        await pool.execute(query2, [newPasswordHash, username]);
      }
    } catch (error) {
      // If Login table update fails, try logins table
      const query = 'UPDATE logins SET passwordHash = ? WHERE username = ?';
      await pool.execute(query, [newPasswordHash, username]);
    }
  }

  private mapLogin(row: any): Login {
    // Handle both passwordHash (camelCase) and password_hash (snake_case)
    const passwordHash = row.passwordHash || row.password_hash;
    
    if (!passwordHash) {
      console.error(`❌ ERROR: No password hash found in row:`, Object.keys(row));
    }
    
    return {
      username: row.username,
      passwordHash: passwordHash,
      createdAt: row.createdAt,
      lastLogin: row.lastLogin,
    };
  }

  // ==================== RestaurantHours Methods ====================

  async createRestaurantHours(input: RestaurantHoursCreateInput): Promise<RestaurantHours> {
    // Skip if closed
    if (input.isClosed) {
      // Return a placeholder hours object for closed days
      return {
        id: 0,
        restaurantId: input.restaurantId,
        dayOfWeek: input.dayOfWeek,
        openTime: '00:00',
        closeTime: '00:00',
        isClosed: true,
      };
    }
    
    // Map day names to weekday numbers (monday=1, tuesday=2, etc.)
    // Note: Database constraint only allows weekday 1-6 (Monday-Saturday), not 0 (Sunday)
    const weekdayMap: { [key: string]: number } = {
      'sunday': 0,  // Will be skipped due to constraint
      'monday': 1,
      'tuesday': 2,
      'wednesday': 3,
      'thursday': 4,
      'friday': 5,
      'saturday': 6,
    };
    const weekday = weekdayMap[input.dayOfWeek] ?? 1;
    
    // Skip Sunday (weekday 0) as database constraint only allows 1-6
    if (weekday === 0) {
      console.log(`⏭️  Skipping Sunday (weekday 0) - database constraint only allows weekday 1-6`);
      // Return a placeholder hours object for Sunday
      return {
        id: 0,
        restaurantId: input.restaurantId,
        dayOfWeek: input.dayOfWeek,
        openTime: '00:00',
        closeTime: '00:00',
        isClosed: true,
      };
    }
    
    // Validate and format times
    if (!input.openTime || !input.closeTime) {
      throw new Error(`Missing open_time or close_time for ${input.dayOfWeek}`);
    }
    
    // Convert time format (HH:MM) to TIME format
    const openTime = input.openTime.includes(':') ? input.openTime : `${input.openTime}:00`;
    const closeTime = input.closeTime.includes(':') ? input.closeTime : `${input.closeTime}:00`;
    
    const query = `
      INSERT INTO RestaurantHours (restaurant_id, weekday, open_time, close_time, is_closed)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const values = [
      input.restaurantId,
      weekday,
      openTime,
      closeTime,
      0, // is_closed = 0 for open days
    ];

    const [result] = await pool.execute(query, values) as any;
    const hours = await this.getRestaurantHoursById(result.insertId);
    if (!hours) {
      throw new Error('Failed to create restaurant hours');
    }
    return hours;
  }

  async getRestaurantHours(restaurantId: number): Promise<RestaurantHours[]> {
    // Map weekday numbers (0=Sunday, 1=Monday, etc.) to day names
    const weekdayMap: { [key: number]: RestaurantHours['dayOfWeek'] } = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday',
    };
    
    // Select without is_closed column (it may not exist in the database)
    const query = `
      SELECT 
        hours_id,
        restaurant_id,
        weekday,
        open_time,
        close_time
      FROM RestaurantHours
      WHERE restaurant_id = ?
      ORDER BY weekday
    `;
    
    const [rows] = await pool.execute(query, [restaurantId]) as any[];
    return rows.map((row: any) => this.mapRestaurantHours(row, weekdayMap));
  }

  private async getRestaurantHoursById(id: number): Promise<RestaurantHours | undefined> {
    const weekdayMap: { [key: number]: RestaurantHours['dayOfWeek'] } = {
      0: 'sunday', 1: 'monday', 2: 'tuesday', 3: 'wednesday',
      4: 'thursday', 5: 'friday', 6: 'saturday',
    };
    const query = 'SELECT * FROM RestaurantHours WHERE hours_id = ?';
    const [rows] = await pool.execute(query, [id]) as any[];
    
    if (rows.length === 0) return undefined;
    return this.mapRestaurantHours(rows[0], weekdayMap);
  }

  private mapRestaurantHours(row: any, weekdayMap: { [key: number]: RestaurantHours['dayOfWeek'] }): RestaurantHours {
    const weekday = weekdayMap[row.weekday] || 'monday';
    const openTime = row.open_time ? String(row.open_time).substring(0, 5) : '09:00';
    const closeTime = row.close_time ? String(row.close_time).substring(0, 5) : '17:00';
    
    // Check if closed: either is_closed column is 1, or times are 00:00-00:00
    const isClosed = row.is_closed === 1 || row.is_closed === true || 
                     (openTime === '00:00' && closeTime === '00:00');
    
    return {
      id: row.hours_id,
      restaurantId: row.restaurant_id,
      dayOfWeek: weekday,
      openTime: openTime,
      closeTime: closeTime,
      isClosed: isClosed,
    };
  }

  async updateRestaurantHours(restaurantId: number, hours: RestaurantHoursCreateInput[]): Promise<void> {
    try {
      // Step 1: Check for existing records with the same restaurant_id and delete them
      const [existingRecords] = await pool.execute(
        'SELECT hours_id FROM RestaurantHours WHERE restaurant_id = ?',
        [restaurantId]
      ) as any[];
      
      if (existingRecords.length > 0) {
        console.log(`🗑️  Found ${existingRecords.length} existing hour records for restaurant ${restaurantId}, deleting...`);
        await pool.execute('DELETE FROM RestaurantHours WHERE restaurant_id = ?', [restaurantId]);
        console.log(`✅ Deleted ${existingRecords.length} existing hour records`);
      } else {
        console.log(`ℹ️  No existing hour records found for restaurant ${restaurantId}`);
      }
      
      // Step 2: Insert the newly inputted values from the restaurant dashboard
      // Note: Database constraint only allows weekday 1-6 (Monday-Saturday), not 0 (Sunday)
      const dayToWeekday: { [key: string]: number } = {
        'sunday': 0,  // Will be skipped due to constraint
        'monday': 1,
        'tuesday': 2,
        'wednesday': 3,
        'thursday': 4,
        'friday': 5,
        'saturday': 6,
      };
      
      let insertedCount = 0;
      
      for (const hour of hours) {
        const weekday = dayToWeekday[hour.dayOfWeek];
        
        if (weekday === undefined) {
          console.error(`Invalid day of week: ${hour.dayOfWeek}`);
          continue;
        }
        
        // Skip Sunday (weekday 0) as database constraint only allows 1-6
        if (weekday === 0) {
          console.log(`⏭️  Skipping Sunday (weekday 0) - database constraint only allows weekday 1-6`);
          continue;
        }
        
        // Handle closed days
        if (hour.isClosed) {
          try {
            // Try with is_closed column first
            await pool.execute(
              'INSERT INTO RestaurantHours (restaurant_id, weekday, open_time, close_time, is_closed) VALUES (?, ?, ?, ?, ?)',
              [restaurantId, weekday, '00:00', '00:00', 1]
            );
            console.log(`✅ Inserted closed hours for ${hour.dayOfWeek} (hours_id will be auto-generated)`);
            insertedCount++;
          } catch (error: any) {
            // If that fails, try without is_closed column
            console.log(`⚠️  Insert with is_closed failed for closed ${hour.dayOfWeek}, trying without:`, error.message);
            try {
              await pool.execute(
                'INSERT INTO RestaurantHours (restaurant_id, weekday, open_time, close_time) VALUES (?, ?, ?, ?)',
                [restaurantId, weekday, '00:00', '00:00']
              );
              console.log(`✅ Inserted closed hours (without is_closed) for ${hour.dayOfWeek}`);
              insertedCount++;
            } catch (fallbackError: any) {
              console.error(`❌ Both insert attempts failed for closed ${hour.dayOfWeek}:`, fallbackError.message);
              throw new Error(`Failed to insert closed hours for ${hour.dayOfWeek}: ${fallbackError.message}`);
            }
          }
        } else if (hour.openTime && hour.closeTime) {
          // Handle open days
          // Format times to HH:MM
          const openTime = hour.openTime.includes(':') ? hour.openTime.substring(0, 5) : `${hour.openTime}:00`;
          const closeTime = hour.closeTime.includes(':') ? hour.closeTime.substring(0, 5) : `${hour.closeTime}:00`;
          
          try {
            // Try with is_closed column first
            await pool.execute(
              'INSERT INTO RestaurantHours (restaurant_id, weekday, open_time, close_time, is_closed) VALUES (?, ?, ?, ?, ?)',
              [restaurantId, weekday, openTime, closeTime, 0]
            );
            console.log(`✅ Inserted open hours for ${hour.dayOfWeek}: ${openTime} - ${closeTime} (hours_id will be auto-generated)`);
            insertedCount++;
          } catch (error: any) {
            // If that fails, try without is_closed column
            console.log(`⚠️  Insert with is_closed failed for ${hour.dayOfWeek}, trying without:`, error.message);
            try {
              await pool.execute(
                'INSERT INTO RestaurantHours (restaurant_id, weekday, open_time, close_time) VALUES (?, ?, ?, ?)',
                [restaurantId, weekday, openTime, closeTime]
              );
              console.log(`✅ Inserted open hours (without is_closed) for ${hour.dayOfWeek}`);
              insertedCount++;
            } catch (fallbackError: any) {
              console.error(`❌ Both insert attempts failed for ${hour.dayOfWeek}:`, fallbackError.message);
              throw new Error(`Failed to insert hours for ${hour.dayOfWeek}: ${fallbackError.message}`);
            }
          }
        } else {
          console.log(`⏭️  Skipping ${hour.dayOfWeek} - missing open or close time and not marked as closed`);
        }
      }
      
      console.log(`✅ Successfully inserted ${insertedCount} hour records for restaurant ${restaurantId}`);
    } catch (error: any) {
      console.error('❌ Error in updateRestaurantHours:', error);
      throw new Error(`Failed to update restaurant hours: ${error.message}`);
    }
  }

  // ==================== MenuItem Methods ====================

  async createMenuItem(input: MenuItemCreateInput): Promise<MenuItem> {
    // MenuItem table with exact fields: item_id (auto-increment), restaurant_id, name, description, price, is_available, picture_url
    // Try MenuItem table first (snake_case)
    const queries = [
      {
        query: `
          INSERT INTO MenuItem (
            restaurant_id, name, item_description, price, picture_url, is_available
          ) VALUES (?, ?, ?, ?, ?, ?)
        `,
        values: [
          input.restaurantId,
          input.name,
          input.description || '',
          input.price,
          input.imageUrl || null,
          1, // Always set is_available to 1 as per user requirement
        ]
      },
      // Try with description column if table was updated
      {
        query: `
          INSERT INTO MenuItem (
            restaurant_id, name, description, price, picture_url, is_available
          ) VALUES (?, ?, ?, ?, ?, ?)
        `,
        values: [
          input.restaurantId,
          input.name,
          input.description || '',
          input.price,
          input.imageUrl || null,
          1, // Always set is_available to 1 as per user requirement
        ]
      },
      // Fallback to menu_items table (camelCase)
      {
        query: `
          INSERT INTO menu_items (
            restaurantId, name, description, price, category, imageUrl, isAvailable, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `,
        values: [
          input.restaurantId,
          input.name,
          input.description || '',
          input.price,
          input.category || 'Other',
          input.imageUrl || null,
          input.isAvailable !== false ? 1 : 0,
        ]
      }
    ];

    for (const { query, values } of queries) {
      try {
        console.log(`📝 Creating menu item for restaurant ${input.restaurantId}: ${input.name}`);
        const [result] = await pool.execute(query, values) as any;
        const menuItem = await this.getMenuItemById(result.insertId);
        if (menuItem) {
          console.log(`✅ Menu item created successfully with ID: ${result.insertId}`);
          return menuItem;
        }
      } catch (error: any) {
        if (error.code === 'ER_NO_SUCH_TABLE') {
          console.log(`⚠️ Table not found, trying next schema: ${error.message}`);
          continue; // Try next query
        }
        // For other errors, log and rethrow
        console.error('❌ Error creating menu item:', error);
        throw error;
      }
    }

    throw new Error('Failed to create menu item: No compatible table found');
  }

  async getMenuItems(restaurantId: number): Promise<MenuItem[]> {
    // Try both table names and column formats to handle different database structures
    const queries = [
      // MenuItem table with item_description column
      {
        query: `
          SELECT 
            item_id,
            restaurant_id,
            name,
            item_description,
            price,
            picture_url,
            is_available
          FROM MenuItem
          WHERE restaurant_id = ?
          ORDER BY name
        `,
        mapper: (row: any) => ({
          id: row.item_id,
          restaurantId: row.restaurant_id,
          name: row.name,
          description: row.item_description || '',
          price: parseFloat(row.price) || 0,
          category: 'Other', // Default category if not in table
          imageUrl: row.picture_url || undefined,
          isAvailable: Boolean(row.is_available !== undefined ? row.is_available : true),
          createdAt: new Date(), // Default if not in table
        })
      },
      // MenuItem table with description column (if table was updated)
      {
        query: `
          SELECT 
            item_id,
            restaurant_id,
            name,
            description,
            price,
            picture_url,
            is_available
          FROM MenuItem
          WHERE restaurant_id = ?
          ORDER BY name
        `,
        mapper: (row: any) => ({
          id: row.item_id,
          restaurantId: row.restaurant_id,
          name: row.name,
          description: row.description || '',
          price: parseFloat(row.price) || 0,
          category: 'Other', // Default category if not in table
          imageUrl: row.picture_url || undefined,
          isAvailable: Boolean(row.is_available !== undefined ? row.is_available : true),
          createdAt: new Date(), // Default if not in table
        })
      },
      // Alternative: menu_items table with camelCase (from schema.sql)
      {
        query: `
          SELECT 
            id,
            restaurantId,
            name,
            description,
            price,
            category,
            imageUrl,
            isAvailable,
            createdAt
          FROM menu_items
          WHERE restaurantId = ?
          ORDER BY name
        `,
        mapper: (row: any) => ({
          id: row.id,
          restaurantId: row.restaurantId,
          name: row.name,
          description: row.description || '',
          price: parseFloat(row.price) || 0,
          category: row.category || 'Other',
          imageUrl: row.imageUrl || undefined,
          isAvailable: Boolean(row.isAvailable),
          createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
        })
      }
    ];

    // Try each query until one works
    for (const { query, mapper } of queries) {
      try {
        console.log(`🔍 Trying menu items query for restaurant ${restaurantId}...`);
        const [rows] = await pool.execute(query, [restaurantId]) as any[];
        console.log(`✅ Query succeeded, found ${rows?.length || 0} menu items`);
        if (rows && rows.length >= 0) {
          const mapped = rows.map(mapper);
          console.log(`📋 Mapped ${mapped.length} menu items for restaurant ${restaurantId}`);
          return mapped;
        }
      } catch (error: any) {
        // If table doesn't exist, try next query
        if (error.code === 'ER_NO_SUCH_TABLE' || error.message?.includes('doesn\'t exist')) {
          console.log(`⚠️ Table not found, trying next schema: ${error.message}`);
          continue;
        }
        // If column doesn't exist, try next query
        if (error.code === 'ER_BAD_FIELD_ERROR' || error.message?.includes('Unknown column')) {
          console.log(`⚠️ Column not found, trying next schema: ${error.message}`);
          continue;
        }
        // For other errors, log and try next
        console.warn(`⚠️ Query failed, trying next: ${error.message}`);
        console.warn(`   Error code: ${error.code}`);
        continue;
      }
    }

    // If all queries failed, return empty array
    console.warn(`❌ No menu items table found matching expected schemas for restaurant ${restaurantId}`);
    return [];
  }

  private async getMenuItemById(id: number): Promise<MenuItem | undefined> {
    // Try both table structures
    const queries = [
      { query: 'SELECT * FROM menu_items WHERE id = ?', useMapper: true },
      { query: 'SELECT * FROM MenuItem WHERE item_id = ?', useMapper: false }
    ];

    for (const { query, useMapper } of queries) {
      try {
        const [rows] = await pool.execute(query, [id]) as any[];
        if (rows.length > 0) {
          if (useMapper) {
            return this.mapMenuItem(rows[0]);
          } else {
            // Map from MenuItem table format - try both item_description and description
            return {
              id: rows[0].item_id,
              restaurantId: rows[0].restaurant_id,
              name: rows[0].name,
              description: rows[0].item_description || rows[0].description || '',
              price: parseFloat(rows[0].price) || 0,
              category: 'Other', // Default category if not in table
              imageUrl: rows[0].picture_url || undefined,
              isAvailable: Boolean(rows[0].is_available !== undefined ? rows[0].is_available : true),
              createdAt: new Date(), // Default if not in table
            };
          }
        }
      } catch (error: any) {
        if (error.code === 'ER_NO_SUCH_TABLE') continue;
      }
    }
    
    return undefined;
  }

  async updateMenuItem(itemId: number, updates: Partial<MenuItem>): Promise<MenuItem | null> {
    // Build update fields dynamically
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      // Will try both column names
      fields.push('description = ?');
      values.push(updates.description);
    }
    if (updates.price !== undefined) {
      fields.push('price = ?');
      values.push(updates.price);
    }
    if (updates.imageUrl !== undefined) {
      // Will try both column names
      fields.push('picture_url = ?');
      values.push(updates.imageUrl);
    }
    if (updates.isAvailable !== undefined) {
      // Will try both column names
      fields.push('is_available = ?');
      values.push(updates.isAvailable ? 1 : 0);
    }

    if (fields.length === 0) {
      // No updates provided, just return the item
      return await this.getMenuItemById(itemId) || null;
    }

    // Try different table structures
    const queries = [
      // MenuItem table with item_description
      {
        updateQuery: `UPDATE MenuItem SET ${fields.map(f => {
          if (f.includes('description') && !f.includes('item_description')) {
            return f.replace('description', 'item_description');
          }
          return f;
        }).join(', ')} WHERE item_id = ?`,
        selectQuery: 'SELECT * FROM MenuItem WHERE item_id = ?',
        useMapper: false
      },
      // MenuItem table with description
      {
        updateQuery: `UPDATE MenuItem SET ${fields.join(', ')} WHERE item_id = ?`,
        selectQuery: 'SELECT * FROM MenuItem WHERE item_id = ?',
        useMapper: false
      },
      // menu_items table
      {
        updateQuery: `UPDATE menu_items SET ${fields.map(f => {
          if (f.includes('picture_url')) return f.replace('picture_url', 'imageUrl');
          if (f.includes('is_available')) return f.replace('is_available', 'isAvailable');
          return f;
        }).join(', ')} WHERE id = ?`,
        selectQuery: 'SELECT * FROM menu_items WHERE id = ?',
        useMapper: true
      }
    ];

    for (const { updateQuery, selectQuery, useMapper } of queries) {
      try {
        const updateValues = [...values, itemId];
        await pool.execute(updateQuery, updateValues);
        
        // Fetch updated item
        const [rows] = await pool.execute(selectQuery, [itemId]) as any[];
        if (rows.length > 0) {
          if (useMapper) {
            return this.mapMenuItem(rows[0]);
          } else {
            return {
              id: rows[0].item_id,
              restaurantId: rows[0].restaurant_id,
              name: rows[0].name,
              description: rows[0].item_description || rows[0].description || '',
              price: parseFloat(rows[0].price) || 0,
              category: 'Other',
              imageUrl: rows[0].picture_url || undefined,
              isAvailable: Boolean(rows[0].is_available !== undefined ? rows[0].is_available : true),
              createdAt: new Date(),
            };
          }
        }
      } catch (error: any) {
        if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_BAD_FIELD_ERROR') {
          continue; // Try next query
        }
        console.error('Error updating menu item:', error);
        throw error;
      }
    }

    return null;
  }

  private mapMenuItem(row: any): MenuItem {
    return {
      id: row.id,
      restaurantId: row.restaurantId,
      name: row.name,
      description: row.description || '',
      price: parseFloat(row.price) || 0,
      category: row.category || 'Other',
      imageUrl: row.imageUrl || undefined,
      isAvailable: Boolean(row.isAvailable),
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
    };
  }

  // ==================== RestaurantAccount Methods ====================

  async createRestaurantAccount(input: RestaurantAccountCreateInput): Promise<RestaurantAccount> {
    // Use RestaurantAccount table with restaurant_id column
    const query = `
      INSERT INTO RestaurantAccount (restaurant_id, username)
      VALUES (?, ?)
    `;
    
    await pool.execute(query, [input.restaurantId, input.username]);
    const account = await this.getRestaurantAccount(input.restaurantId, input.username);
    if (!account) {
      throw new Error('Failed to create restaurant account');
    }
    return account;
  }

  async getRestaurantAccount(restaurantId: number, username: string): Promise<RestaurantAccount | undefined> {
    // Use RestaurantAccount table with restaurant_id column
    const query = 'SELECT * FROM RestaurantAccount WHERE restaurant_id = ? AND username = ?';
    const [rows] = await pool.execute(query, [restaurantId, username]) as any[];
    
    if (rows.length === 0) return undefined;
    return {
      restaurantId: rows[0].restaurant_id,
      username: rows[0].username,
      createdAt: rows[0].createdAt || new Date(),
    };
  }

  async getRestaurantAccountByUsername(username: string): Promise<RestaurantAccount | undefined> {
    // Use RestaurantAccount table (capital R, capital A)
    const query = 'SELECT * FROM RestaurantAccount WHERE username = ?';
    const [rows] = await pool.execute(query, [username]) as any[];
    
    if (rows.length === 0) return undefined;
    // Map restaurant_id to restaurantId
    return {
      restaurantId: rows[0].restaurant_id,
      username: rows[0].username,
      createdAt: rows[0].createdAt || new Date(),
    };
  }

  private mapRestaurantAccount(row: any): RestaurantAccount {
    return {
      restaurantId: row.restaurantId,
      username: row.username,
      createdAt: row.createdAt,
    };
  }

  // ==================== Staff Methods ====================

  async createStaff(input: StaffCreateInput): Promise<Staff> {
    // Check for duplicate full name (first + last name combination)
    if (input.firstName && input.lastName) {
      const existingStaff = await this.getStaffByName(input.firstName, input.lastName);
      if (existingStaff) {
        throw new Error(`Staff member with name "${input.firstName} ${input.lastName}" already exists`);
      }
    }

    const query = `
      INSERT INTO Staff (username, first_name, last_name, first_login)
      VALUES (?, ?, ?, 1)
    `;
    await pool.execute(query, [
      input.username, 
      input.firstName?.trim() || null, 
      input.lastName?.trim() || null
    ]);
    const staff = await this.getStaff(input.username);
    if (!staff) {
      throw new Error('Failed to create staff');
    }
    return staff;
  }

  async getStaffByName(firstName: string, lastName: string): Promise<Staff | undefined> {
    const query = 'SELECT * FROM Staff WHERE LOWER(first_name) = LOWER(?) AND LOWER(last_name) = LOWER(?)';
    const [rows] = await pool.execute(query, [firstName.trim(), lastName.trim()]) as any[];
    if (rows.length === 0) return undefined;
    return {
      username: rows[0].username,
      firstName: rows[0].first_name,
      lastName: rows[0].last_name,
      firstLogin: Boolean(rows[0].first_login),
    };
  }

  async getStaffByLastNamePrefix(lastNamePrefix: string): Promise<Staff[]> {
    // Get all staff with last names starting with the prefix (case-insensitive)
    const query = 'SELECT * FROM Staff WHERE LOWER(last_name) LIKE LOWER(?) ORDER BY username';
    const [rows] = await pool.execute(query, [`${lastNamePrefix}%`]) as any[];
    return rows.map((row: any) => ({
      username: row.username,
      firstName: row.first_name,
      lastName: row.last_name,
      firstLogin: Boolean(row.first_login),
    }));
  }

  async getStaff(username: string): Promise<Staff | undefined> {
    const query = 'SELECT * FROM Staff WHERE username = ?';
    const [rows] = await pool.execute(query, [username]) as any[];
    if (rows.length === 0) return undefined;
    return {
      username: rows[0].username,
      firstName: rows[0].first_name,
      lastName: rows[0].last_name,
      firstLogin: Boolean(rows[0].first_login),
    };
  }

  async getAllStaff(): Promise<Staff[]> {
    const query = 'SELECT * FROM Staff ORDER BY username';
    const [rows] = await pool.execute(query) as any[];
    return rows.map((row: any) => ({
      username: row.username,
      firstName: row.first_name,
      lastName: row.last_name,
      firstLogin: Boolean(row.first_login),
    }));
  }

  async updateStaffFirstLogin(username: string): Promise<void> {
    const query = 'UPDATE Staff SET first_login = 0 WHERE username = ?';
    await pool.execute(query, [username]);
  }

  // ==================== Driver Methods ====================

  async createDriver(input: DriverCreateInput): Promise<Driver> {
    // Check for duplicate first and last name combination
    const existingDriver = await this.getDriverByName(input.firstName, input.lastName);
    if (existingDriver) {
      throw new Error(`Driver with name "${input.firstName} ${input.lastName}" already exists`);
    }

    const query = 'INSERT INTO Driver (first_name, last_name, is_active) VALUES (?, ?, ?)';
    const [result] = await pool.execute(query, [
      input.firstName.trim(),
      input.lastName.trim(),
      input.isActive ? 1 : 0
    ]) as any;
    return {
      driverId: result.insertId,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      isActive: input.isActive,
    };
  }

  async getDriver(driverId: number): Promise<Driver | undefined> {
    const query = 'SELECT * FROM Driver WHERE driver_id = ?';
    const [rows] = await pool.execute(query, [driverId]) as any[];
    if (rows.length === 0) return undefined;
    return this.mapDriver(rows[0]);
  }

  async getDriverByName(firstName: string, lastName: string): Promise<Driver | undefined> {
    const query = 'SELECT * FROM Driver WHERE LOWER(first_name) = LOWER(?) AND LOWER(last_name) = LOWER(?)';
    const [rows] = await pool.execute(query, [firstName.trim(), lastName.trim()]) as any[];
    if (rows.length === 0) return undefined;
    return this.mapDriver(rows[0]);
  }

  async getAllDrivers(): Promise<Driver[]> {
    const query = 'SELECT * FROM Driver ORDER BY last_name, first_name';
    const [rows] = await pool.execute(query) as any[];
    return rows.map((row: any) => this.mapDriver(row));
  }

  async getActiveDrivers(): Promise<Driver[]> {
    const query = 'SELECT * FROM Driver WHERE is_active = 1 ORDER BY last_name, first_name';
    const [rows] = await pool.execute(query) as any[];
    return rows.map((row: any) => this.mapDriver(row));
  }

  private mapDriver(row: any): Driver {
    // Handle both old schema (name) and new schema (first_name, last_name)
    if (row.first_name && row.last_name) {
      return {
        driverId: row.driver_id,
        firstName: row.first_name,
        lastName: row.last_name,
        isActive: Boolean(row.is_active),
      };
    } else if (row.name) {
      // Legacy support: split name into first and last
      const nameParts = row.name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      return {
        driverId: row.driver_id,
        firstName,
        lastName,
        isActive: Boolean(row.is_active),
      };
    } else {
      // Fallback
      return {
        driverId: row.driver_id,
        firstName: '',
        lastName: '',
        isActive: Boolean(row.is_active),
      };
    }
  }

  // ==================== Order Methods ====================

  async createOrder(input: OrderCreateInput): Promise<Order> {
    const query = `
      INSERT INTO OrderEntity (
        restaurant_id, unique_customer_code, address_id,
        subtotal, tip, grand_total, order_status, order_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      input.restaurantId,
      input.uniqueCustomerCode || null,
      input.addressId || null,
      input.subtotal,
      input.tip,
      input.grandTotal,
      input.orderStatus,
      input.orderNumber || null,
    ];
    const [result] = await pool.execute(query, values) as any;
    const order = await this.getOrder(result.insertId);
    if (!order) {
      throw new Error('Failed to create order');
    }
    return order;
  }

  async getOrder(orderId: number): Promise<Order | undefined> {
    const query = 'SELECT * FROM OrderEntity WHERE order_id = ?';
    const [rows] = await pool.execute(query, [orderId]) as any[];
    if (rows.length === 0) return undefined;
    return this.mapOrder(rows[0]);
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const query = 'SELECT * FROM OrderEntity WHERE order_number = ?';
    const [rows] = await pool.execute(query, [orderNumber]) as any[];
    if (rows.length === 0) return undefined;
    return this.mapOrder(rows[0]);
  }

  async getOrdersByRestaurant(restaurantId: number): Promise<Order[]> {
    const query = 'SELECT * FROM OrderEntity WHERE restaurant_id = ? ORDER BY order_time DESC';
    const [rows] = await pool.execute(query, [restaurantId]) as any[];
    return rows.map((row: any) => this.mapOrder(row));
  }

  async getOrdersByStatus(status: Order['orderStatus']): Promise<Order[]> {
    const query = 'SELECT * FROM OrderEntity WHERE order_status = ? ORDER BY order_time DESC';
    const [rows] = await pool.execute(query, [status]) as any[];
    return rows.map((row: any) => this.mapOrder(row));
  }

  async getAllOrders(): Promise<Order[]> {
    const query = 'SELECT * FROM OrderEntity ORDER BY order_time DESC';
    const [rows] = await pool.execute(query) as any[];
    return rows.map((row: any) => this.mapOrder(row));
  }

  async updateOrderStatus(orderId: number, status: Order['orderStatus']): Promise<void> {
    const query = 'UPDATE OrderEntity SET order_status = ? WHERE order_id = ?';
    await pool.execute(query, [status, orderId]);
  }

  private mapOrder(row: any): Order {
    return {
      orderId: row.order_id,
      restaurantId: row.restaurant_id,
      uniqueCustomerCode: row.unique_customer_code,
      addressId: row.address_id,
      orderTime: row.order_time,
      subtotal: parseFloat(row.subtotal) || 0,
      tip: parseFloat(row.tip) || 0,
      grandTotal: parseFloat(row.grand_total) || 0,
      orderStatus: row.order_status || 'pending',
      orderNumber: row.order_number,
    };
  }

  // ==================== OrderItem Methods ====================

  async createOrderItem(input: OrderItemCreateInput): Promise<OrderItem> {
    const query = `
      INSERT INTO OrderItem (order_id, item_id, item_name, item_price, quantity, subtotal)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [
      input.orderId,
      input.itemId || null,
      input.itemName,
      input.itemPrice,
      input.quantity,
      input.subtotal,
    ]) as any;
    return {
      orderItemId: result.insertId,
      ...input,
    };
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    const query = 'SELECT * FROM OrderItem WHERE order_id = ? ORDER BY order_item_id';
    const [rows] = await pool.execute(query, [orderId]) as any[];
    return rows.map((row: any) => ({
      orderItemId: row.order_item_id,
      orderId: row.order_id,
      itemId: row.item_id,
      itemName: row.item_name,
      itemPrice: parseFloat(row.item_price) || 0,
      quantity: row.quantity,
      subtotal: parseFloat(row.subtotal) || 0,
    }));
  }

  // ==================== DeliveryAssignment Methods ====================

  async createDeliveryAssignment(input: DeliveryAssignmentCreateInput): Promise<DeliveryAssignment> {
    const query = `
      INSERT INTO DeliveryAssignment (
        order_id, driver_id, assigned_by_staff, delivery_status
      ) VALUES (?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [
      input.orderId,
      input.driverId,
      input.assignedByStaff || null,
      input.deliveryStatus,
    ]) as any;
    const assignment = await this.getDeliveryAssignment(result.insertId);
    if (!assignment) {
      throw new Error('Failed to create delivery assignment');
    }
    return assignment;
  }

  async getDeliveryAssignment(assignmentId: number): Promise<DeliveryAssignment | undefined> {
    const query = 'SELECT * FROM DeliveryAssignment WHERE assignment_id = ?';
    const [rows] = await pool.execute(query, [assignmentId]) as any[];
    if (rows.length === 0) return undefined;
    return this.mapDeliveryAssignment(rows[0]);
  }

  async getDeliveryAssignmentsByDriver(driverId: number): Promise<DeliveryAssignment[]> {
    const query = 'SELECT * FROM DeliveryAssignment WHERE driver_id = ? ORDER BY assigned_at DESC';
    const [rows] = await pool.execute(query, [driverId]) as any[];
    return rows.map((row: any) => this.mapDeliveryAssignment(row));
  }

  async getDeliveryAssignmentsByOrder(orderId: number): Promise<DeliveryAssignment[]> {
    const query = 'SELECT * FROM DeliveryAssignment WHERE order_id = ? ORDER BY assigned_at DESC';
    const [rows] = await pool.execute(query, [orderId]) as any[];
    return rows.map((row: any) => this.mapDeliveryAssignment(row));
  }

  async getAllDeliveryAssignments(): Promise<DeliveryAssignment[]> {
    const query = 'SELECT * FROM DeliveryAssignment ORDER BY assigned_at DESC';
    const [rows] = await pool.execute(query) as any[];
    return rows.map((row: any) => this.mapDeliveryAssignment(row));
  }

  async updateDeliveryStatus(assignmentId: number, status: DeliveryAssignment['deliveryStatus']): Promise<void> {
    const updateDeliveredAt = status === 'delivered' ? ', delivered_at = NOW()' : '';
    const query = `UPDATE DeliveryAssignment SET delivery_status = ?${updateDeliveredAt} WHERE assignment_id = ?`;
    await pool.execute(query, [status, assignmentId]);
  }

  private mapDeliveryAssignment(row: any): DeliveryAssignment {
    return {
      assignmentId: row.assignment_id,
      orderId: row.order_id,
      driverId: row.driver_id,
      assignedByStaff: row.assigned_by_staff,
      assignedAt: row.assigned_at,
      deliveryStatus: row.delivery_status || 'assigned',
      deliveredAt: row.delivered_at,
    };
  }

  // ==================== OrderQueue Methods ====================

  async createOrderQueue(input: OrderQueueCreateInput): Promise<OrderQueue> {
    const query = `
      INSERT INTO OrderQueue (order_id, processed_by_staff, status)
      VALUES (?, ?, ?)
    `;
    const [result] = await pool.execute(query, [
      input.orderId,
      input.processedByStaff || null,
      input.status,
    ]) as any;
    return {
      queueId: result.insertId,
      ...input,
      queuedAt: new Date(),
    };
  }

  async getOrderQueue(queueId: number): Promise<OrderQueue | undefined> {
    const query = 'SELECT * FROM OrderQueue WHERE queue_id = ?';
    const [rows] = await pool.execute(query, [queueId]) as any[];
    if (rows.length === 0) return undefined;
    return this.mapOrderQueue(rows[0]);
  }

  async getQueuedOrders(): Promise<OrderQueue[]> {
    const query = "SELECT * FROM OrderQueue WHERE status = 'queued' ORDER BY queued_at ASC";
    const [rows] = await pool.execute(query) as any[];
    return rows.map((row: any) => this.mapOrderQueue(row));
  }

  async updateOrderQueueStatus(queueId: number, status: OrderQueue['status'], processedBy?: string): Promise<void> {
    const updateDequeuedAt = status === 'completed' ? ', dequeued_at = NOW()' : '';
    const query = `UPDATE OrderQueue SET status = ?, processed_by_staff = ?${updateDequeuedAt} WHERE queue_id = ?`;
    await pool.execute(query, [status, processedBy || null, queueId]);
  }

  private mapOrderQueue(row: any): OrderQueue {
    return {
      queueId: row.queue_id,
      orderId: row.order_id,
      queuedAt: row.queued_at,
      processedByStaff: row.processed_by_staff,
      dequeuedAt: row.dequeued_at,
      status: row.status || 'queued',
    };
  }

  // ==================== Customer Methods ====================

  async createCustomer(input: CustomerCreateInput): Promise<Customer> {
    const query = `
      INSERT INTO Customer (full_name, credit_num, credit_exp, credit_ccv, address_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await pool.execute(query, [
      input.fullName || null,
      input.creditNum || null,
      input.creditExp || null,
      input.creditCcv || null,
      input.addressId || null,
    ]) as any;
    return {
      uniqueCustomerCode: result.insertId,
      ...input,
    };
  }

  async getCustomer(customerCode: number): Promise<Customer | undefined> {
    const query = 'SELECT * FROM Customer WHERE unique_customer_code = ?';
    const [rows] = await pool.execute(query, [customerCode]) as any[];
    if (rows.length === 0) return undefined;
    return {
      uniqueCustomerCode: rows[0].unique_customer_code,
      fullName: rows[0].full_name,
      creditNum: rows[0].credit_num,
      creditExp: rows[0].credit_exp,
      creditCcv: rows[0].credit_ccv,
      addressId: rows[0].address_id,
    };
  }
}

// Singleton instance
export const db = new Database();

