/**
 * RestaurantAccount Entity
 * Links Restaurant to Login (username PK references Login)
 */
export interface RestaurantAccount {
  restaurantId: number;
  username: string; // Foreign key to Login.username
  createdAt: Date;
}

export type RestaurantAccountCreateInput = Omit<RestaurantAccount, 'createdAt'>;

