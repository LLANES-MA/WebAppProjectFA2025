/**
 * Staff Entity
 * Represents staff members in the system
 */
export interface Staff {
  id: number;
  username: string; // Foreign key to Login.username
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
  isActive: boolean;
  createdAt: Date;
}

export type StaffCreateInput = Omit<Staff, 'id' | 'createdAt'>;

