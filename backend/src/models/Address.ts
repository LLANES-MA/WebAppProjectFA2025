/**
 * Address Entity
 * Represents physical address information
 */
export interface Address {
  id: number;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  createdAt: Date;
}

export type AddressCreateInput = Omit<Address, 'id' | 'createdAt'>;

