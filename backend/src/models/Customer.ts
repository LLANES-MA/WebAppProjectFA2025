/**
 * Customer Entity
 * Represents customer information
 */
export interface Customer {
  uniqueCustomerCode: number;
  fullName?: string;
  creditNum?: number;
  creditExp?: number;
  creditCcv?: number;
  addressId?: number;
}

export type CustomerCreateInput = Omit<Customer, 'uniqueCustomerCode'>;

