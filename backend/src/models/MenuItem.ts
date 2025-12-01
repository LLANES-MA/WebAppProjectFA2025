/**
 * MenuItem Entity
 * Represents a menu item offered by a restaurant
 */
export interface MenuItem {
  id: number;
  restaurantId: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: Date;
}

export type MenuItemCreateInput = Omit<MenuItem, 'id' | 'createdAt'>;

