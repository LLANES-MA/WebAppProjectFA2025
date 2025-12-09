/**
 * Staff Entity
 * Represents staff members in the system
 */
export interface Staff {
  username: string; // Primary key, foreign key to Login.username
  firstName?: string;
  lastName?: string;
  firstLogin: boolean;
}

export type StaffCreateInput = Omit<Staff, 'firstLogin'>;

