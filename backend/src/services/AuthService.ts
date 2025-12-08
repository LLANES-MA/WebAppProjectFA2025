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
  async createLogin(username: string, password: string): Promise<Login> {
    // Check if login already exists
    const existing = db.getLogin(username);
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

    return db.createLogin(loginInput);
  }

  /**
   * Authenticate a user
   */
  async authenticate(username: string, password: string): Promise<boolean> {
    const login = db.getLogin(username);
    if (!login) {
      return false;
    }

    const isValid = await this.verifyPassword(password, login.passwordHash);
    if (isValid) {
      db.updateLastLogin(username);
    }
    return isValid;
  }

  /**
   * Get login by username
   */
  getLogin(username: string): Login | undefined {
    return db.getLogin(username);
  }
}

// Singleton instance
export const authService = new AuthService();

