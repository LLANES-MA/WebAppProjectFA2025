/**
 * Restaurant Entity
 * Represents a restaurant in the system
 */
export interface Restaurant {
  id: number;
  restaurantName: string;
  description: string;
  cuisineType: string;
  establishedYear?: number;
  
  // Location
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Contact
  phone: string;
  email: string;
  website?: string;
  
  // Operations
  averagePrice: string;
  deliveryFee: number;
  minimumOrder: number;
  preparationTime: number;
  
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
}

export type RestaurantCreateInput = Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt' | 'approvedAt'>;
export type RestaurantUpdateInput = Partial<Omit<Restaurant, 'id' | 'createdAt'>>;

