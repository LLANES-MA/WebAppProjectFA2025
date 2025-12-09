/**
 * Driver Entity
 * Represents delivery drivers in the system
 */
export interface Driver {
  driverId: number;
  name: string;
  isActive: boolean;
}

export type DriverCreateInput = Omit<Driver, 'driverId'>;

