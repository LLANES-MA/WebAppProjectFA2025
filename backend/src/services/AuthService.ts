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
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Verify a password
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Create a login entry
   */
  async createLogin(username: string, password: string, usertype?: string): Promise<Login> {
    // Check if login already exists
    const existing = await db.getLogin(username);
    if (existing) {
      throw new Error(`Login with username ${username} already exists`);
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create login
    const loginInput: LoginCreateInput = {
      username,
      passwordHash,
    };

    return await db.createLogin(loginInput, usertype);
  }

  /**
   * Authenticate a user
   */
  async authenticate(username: string, password: string): Promise<boolean> {
    const login = await db.getLogin(username);
    if (!login) {
      return false;
    }

    // Check if password_hash is a bcrypt hash (starts with $2a$, $2b$, or $2y$)
    // or if it's plain text (for existing data)
    const isHashed = login.passwordHash.startsWith('$2a$') || 
                     login.passwordHash.startsWith('$2b$') || 
                     login.passwordHash.startsWith('$2y$');
    
    let isValid: boolean;
    if (isHashed) {
      // Verify against bcrypt hash
      isValid = await this.verifyPassword(password, login.passwordHash);
    } else {
      // Plain text comparison (for existing data)
      isValid = login.passwordHash === password;
    }
    
    if (isValid) {
      await db.updateLastLogin(username);
    }
    return isValid;
  }

  /**
   * Get login by username
   */
  async getLogin(username: string): Promise<Login | undefined> {
    return await db.getLogin(username);
  }
}

// Singleton instance
export const authService = new AuthService();

