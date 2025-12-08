/**
 * Login Entity
 * Represents authentication credentials in the system
 */
export interface Login {
  username: string; // Primary key
  passwordHash: string;
  createdAt: Date;
  lastLogin?: Date;
}

export type LoginCreateInput = Omit<Login, 'createdAt' | 'lastLogin'>;

