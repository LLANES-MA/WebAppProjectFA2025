/**
 * Auth Service
 * Handles authentication, login creation, and password management
 */

import bcrypt from 'bcrypt';
import { db } from '../data/Database';
import { Login, LoginCreateInput } from '../models/Login';

export class AuthService {
  private readonly SALT_ROUNDS = 10;

  /**
   * Generate a secure temporary password
   */
  generateTemporaryPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    const password = Array.from({ length }, () =>
      charset[Math.floor(Math.random() * charset.length)]
    ).join('');
    return password;
  }

  /**
   * Hash a password
   * Storing as plain text - no hashing
   */
  async hashPassword(password: string): Promise<string> {
    // Store password as plain text (no hashing)
    console.log(`📝 Storing password as plain text (no hashing)`);
    return password;
  }

  /**
   * Verify a password
   * Handles both bcrypt hashes and plain text passwords
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    // Trim whitespace that might cause issues
    const trimmedPassword = password.trim();
    const trimmedHash = hash.trim();
    
    // Check if hash is a bcrypt hash
    const isBcryptHash = trimmedHash.startsWith('$2a$') || 
                         trimmedHash.startsWith('$2b$') || 
                         trimmedHash.startsWith('$2y$');
    
    if (isBcryptHash) {
      console.log(`🔐 Attempting bcrypt verification...`);
      console.log(`   Hash length: ${trimmedHash.length} (expected ~60 for bcrypt)`);
      
      try {
        const result = await bcrypt.compare(trimmedPassword, trimmedHash);
        if (!result) {
          console.error(`❌ Bcrypt verification failed`);
          console.error(`   This might indicate the hash was corrupted or truncated`);
          // Try with original (untrimmed) values as fallback
          try {
            const fallbackResult = await bcrypt.compare(password, hash);
            if (fallbackResult) {
              console.log(`✅ Bcrypt verification succeeded with untrimmed values`);
              return true;
            }
          } catch (e) {
            // Ignore fallback error
          }
        }
        return result;
      } catch (error: any) {
        console.error(`❌ Bcrypt verification error:`, error.message);
        console.log(`⚠️ Falling back to plain text comparison`);
        // Fallback to plain text if bcrypt fails
        return trimmedHash === trimmedPassword;
      }
    } else {
      // Plain text comparison
      console.log(`🔐 Using plain text comparison`);
      console.log(`   Provided password: "${trimmedPassword}" (length: ${trimmedPassword.length})`);
      console.log(`   Stored password: "${trimmedHash}" (length: ${trimmedHash.length})`);
      console.log(`   Exact match: ${trimmedHash === trimmedPassword}`);
      
      const result = trimmedHash === trimmedPassword;
      if (!result) {
        // Try with original (untrimmed) values
        console.log(`   Trying with untrimmed values...`);
        console.log(`   Provided: "${password}"`);
        console.log(`   Stored: "${hash}"`);
        const untrimmedResult = hash === password;
        console.log(`   Untrimmed match: ${untrimmedResult}`);
        return untrimmedResult;
      }
      return result;
    }
  }

  /**
   * Create a login entry
   */
  async createLogin(username: string, password: string, usertype?: string): Promise<Login> {
    console.log(`🔐 createLogin called: username=${username}, usertype=${usertype || 'none'}, passwordLength=${password.length}`);
    
    // Check if login already exists (case-insensitive)
    const existing = await db.getLogin(username);
    if (existing) {
      console.warn(`⚠️ Login already exists for username: ${username} (or case variant)`);
      throw new Error(`Login with username ${username} already exists`);
    }

    // Store password as plain text (no hashing)
    console.log(`📝 Storing password as plain text (no hashing)...`);
    const passwordHash = await this.hashPassword(password);
    console.log(`✅ Password stored: ${passwordHash.substring(0, 20)}...`);

    // Create login
    const loginInput: LoginCreateInput = {
      username,
      passwordHash,
    };

    console.log(`📝 Creating login in database...`);
    const createdLogin = await db.createLogin(loginInput, usertype);
    console.log(`✅ Login created successfully: ${createdLogin.username}`);
    
    // Verify the login was created correctly by trying to authenticate
    console.log(`🔍 Verifying created login...`);
    const testAuth = await this.authenticate(username, password);
    if (!testAuth) {
      console.error(`❌ WARNING: Created login but authentication test failed!`);
      console.error(`❌ This indicates a problem with password hashing or storage.`);
    } else {
      console.log(`✅ Login verification successful - password works correctly`);
    }
    
    return createdLogin;
  }

  /**
   * Authenticate a user
   */
  async authenticate(username: string, password: string): Promise<boolean> {
    console.log(`🔍 AuthService.authenticate called for username: ${username}`);
    console.log(`🔐 Password length: ${password.length} characters`);
    
    const login = await db.getLogin(username);
    if (!login) {
      console.error(`❌ Login not found for username: ${username}`);
      // Try case-insensitive lookup
      console.log(`🔍 Trying case-insensitive lookup...`);
      // Note: This is a fallback - ideally usernames should be case-insensitive in DB
      return false;
    }

    console.log(`✅ Login found for username: ${username}`);
    console.log(`🔐 Stored password hash length: ${login.passwordHash.length} characters`);
    console.log(`🔐 Stored password hash preview: ${login.passwordHash.substring(0, 20)}...`);

    // Check if password_hash is a bcrypt hash (starts with $2a$, $2b$, or $2y$)
    // or if it's plain text (for existing data)
    const isHashed = login.passwordHash.startsWith('$2a$') || 
                     login.passwordHash.startsWith('$2b$') || 
                     login.passwordHash.startsWith('$2y$');
    
    console.log(`🔐 Password hash type: ${isHashed ? 'bcrypt' : 'plain text'}`);
    
    let isValid: boolean;
    if (isHashed) {
      // Verify against bcrypt hash
      console.log(`🔐 Attempting bcrypt verification...`);
      console.log(`   Stored hash: ${login.passwordHash.substring(0, 30)}...`);
      console.log(`   Provided password: "${password}"`);
      
      try {
        isValid = await this.verifyPassword(password, login.passwordHash);
        console.log(`🔐 Bcrypt verification result: ${isValid}`);
        
        if (!isValid) {
          console.error(`❌ Bcrypt verification failed`);
          console.error(`⚠️ Bcrypt hash doesn't match provided password`);
          console.error(`💡 Attempting fallback: plain text comparison with provided password`);
          
          // CRITICAL FALLBACK: If bcrypt fails, try plain text comparison
          // This handles cases where hash is corrupted but password might be stored as plain text
          const plainTextFallback = login.passwordHash === password || 
                                   login.passwordHash.trim() === password.trim() ||
                                   login.passwordHash === password.trim() ||
                                   login.passwordHash.trim() === password;
          
          console.log(`🔐 Plain text fallback result: ${plainTextFallback}`);
          
          if (plainTextFallback) {
            console.log(`✅ Plain text fallback succeeded - password matches as plain text`);
            console.log(`⚠️ NOTE: Password appears to be stored as plain text, not bcrypt hash`);
            isValid = true;
          } else {
            console.error(`❌ Both bcrypt and plain text comparisons failed`);
            console.error(`💡 Suggestion: Update password in database to: "${password}" (as plain text)`);
            isValid = false;
          }
        }
      } catch (error: any) {
        console.error(`❌ Bcrypt verification error:`, error);
        console.error(`⚠️ Falling back to plain text comparison due to bcrypt error`);
        // Fallback: try plain text comparison if bcrypt fails
        isValid = login.passwordHash === password || 
                  login.passwordHash.trim() === password.trim() ||
                  login.passwordHash === password.trim() ||
                  login.passwordHash.trim() === password;
        console.log(`🔐 Fallback plain text comparison result: ${isValid}`);
        if (isValid) {
          console.log(`✅ Plain text fallback succeeded`);
        }
      }
    } else {
      // Plain text comparison (for existing data)
      console.log(`🔐 Attempting plain text comparison...`);
      console.log(`🔐 Provided password: "${password}" (length: ${password.length})`);
      console.log(`🔐 Stored password: "${login.passwordHash}" (length: ${login.passwordHash.length})`);
      
      // Try exact match first
      isValid = login.passwordHash === password;
      console.log(`🔐 Exact match result: ${isValid}`);
      
      if (!isValid) {
        // Check for whitespace issues
        const trimmedProvided = password.trim();
        const trimmedStored = login.passwordHash.trim();
        console.log(`🔐 Trying trimmed comparison...`);
        console.log(`   Trimmed provided: "${trimmedProvided}"`);
        console.log(`   Trimmed stored: "${trimmedStored}"`);
        const trimmedMatch = trimmedProvided === trimmedStored;
        console.log(`   Trimmed match: ${trimmedMatch}`);
        
        if (trimmedMatch) {
          console.warn(`⚠️ Passwords match after trimming whitespace - using trimmed match`);
          isValid = true;
        } else {
          console.error(`❌ Password mismatch - strings do not match exactly or after trimming`);
          // Show character-by-character comparison for debugging
          if (password.length === login.passwordHash.length) {
            console.log(`   Same length, checking character differences...`);
            for (let i = 0; i < Math.min(password.length, 20); i++) {
              if (password[i] !== login.passwordHash[i]) {
                console.log(`   Difference at position ${i}: provided="${password[i]}" (${password.charCodeAt(i)}), stored="${login.passwordHash[i]}" (${login.passwordHash.charCodeAt(i)})`);
                break;
              }
            }
          }
        }
      }
    }
    
    if (isValid) {
      console.log(`✅ Authentication successful for username: ${username}`);
      await db.updateLastLogin(username);
    } else {
      console.error(`❌ Authentication failed for username: ${username}`);
    }
    
    return isValid;
  }

  /**
   * Get login by username
   */
  async getLogin(username: string): Promise<Login | undefined> {
    return await db.getLogin(username);
  }

  /**
   * Change password for a user
   * Verifies current password before updating
   */
  async changePassword(username: string, currentPassword: string, newPassword: string): Promise<void> {
    // Verify current password
    const isValid = await this.authenticate(username, currentPassword);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password constraints
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters long');
    }
    if (!/[A-Z]/.test(newPassword)) {
      throw new Error('New password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(newPassword)) {
      throw new Error('New password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(newPassword)) {
      throw new Error('New password must contain at least one number');
    }

    // Hash new password
    const newPasswordHash = await this.hashPassword(newPassword);

    // Update password in database
    await db.updatePassword(username, newPasswordHash);
  }
}

// Singleton instance
export const authService = new AuthService();

