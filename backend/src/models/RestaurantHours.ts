/**
 * RestaurantHours Entity
 * Represents operating hours for a restaurant
 */
export interface RestaurantHours {
  id: number;
  restaurantId: number;
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  openTime: string; // Format: "HH:MM"
  closeTime: string; // Format: "HH:MM"
  isClosed: boolean;
}

export type RestaurantHoursCreateInput = Omit<RestaurantHours, 'id'>;

