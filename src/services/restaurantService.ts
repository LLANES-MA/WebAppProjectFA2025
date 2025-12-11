/**
 * Restaurant API Service
 * Handles all restaurant-related API calls to the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === 'true';

// Debug logging
console.log('RestaurantService Config:', {
  API_BASE_URL,
  USE_BACKEND,
  env: import.meta.env.VITE_USE_BACKEND,
});

export interface Restaurant {
  id: number;
  restaurantName: string;
  description: string;
  cuisineType: string;
  establishedYear?: number;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website?: string;
  averagePrice: string;
  deliveryFee: number | string;
  minimumOrder: number | string;
  preparationTime: number;
  status: 'pending' | 'approved' | 'rejected' | 'inactive';
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
}

export interface MenuItem {
  id: number;
  restaurantId: number;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl?: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface RestaurantHours {
  id: number;
  restaurantId: number;
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

/**
 * Get all restaurants from the backend
 */
export async function getAllRestaurants(): Promise<Restaurant[]> {
  if (!USE_BACKEND) {
    console.warn('Backend not enabled, returning empty array');
    return [];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/restaurants`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`Failed to fetch restaurants: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.restaurants || [];
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }
}

/**
 * Get approved restaurants only
 */
export async function getApprovedRestaurants(): Promise<Restaurant[]> {
  if (!USE_BACKEND) {
    console.warn('Backend not enabled, returning empty array');
    return [];
  }

  try {
    const restaurants = await getAllRestaurants();
    const approved = restaurants.filter(r => r.status === 'approved');
    return approved;
  } catch (error) {
    console.error('Error fetching approved restaurants:', error);
    return [];
  }
}

/**
 * Get restaurant by ID
 */
export async function getRestaurantById(id: number): Promise<Restaurant | null> {
  if (!USE_BACKEND) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/restaurants/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch restaurant: ${response.status}`);
    }

    const data = await response.json();
    return data.restaurant || null;
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return null;
  }
}

/**
 * Get menu items for a restaurant
 */
export async function getRestaurantMenu(restaurantId: number): Promise<MenuItem[]> {
  if (!USE_BACKEND) {
    return [];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}/menu`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch menu: ${response.status}`);
    }

    const data = await response.json();
    return data.menuItems || [];
  } catch (error) {
    console.error('Error fetching menu:', error);
    return [];
  }
}

/**
 * Get restaurant hours
 */
export async function getRestaurantHours(restaurantId: number): Promise<RestaurantHours[]> {
  if (!USE_BACKEND) {
    return [];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}/hours`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch hours: ${response.status}`);
    }

    const data = await response.json();
    return data.hours || [];
  } catch (error) {
    console.error('Error fetching hours:', error);
    return [];
  }
}

/**
 * Get pending restaurants (admin only)
 */
export async function getPendingRestaurants(): Promise<Restaurant[]> {
  if (!USE_BACKEND) {
    return [];
  }

  try {
    const response = await fetch(`${API_BASE_URL}/admin/restaurants/pending`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch pending restaurants: ${response.status}`);
    }

    const data = await response.json();
    return data.restaurants || [];
  } catch (error) {
    console.error('Error fetching pending restaurants:', error);
    return [];
  }
}

/**
 * Transform database restaurant to frontend format
 */
export function transformRestaurantForDisplay(restaurant: Restaurant): any {
  return {
    id: restaurant.id,
    name: restaurant.restaurantName,
    cuisine: restaurant.cuisineType,
    rating: 4.5, // Default rating (can be added to database later)
    deliveryTime: `${restaurant.preparationTime}-${restaurant.preparationTime + 10} min`,
    deliveryFee: typeof restaurant.deliveryFee === 'number' 
      ? restaurant.deliveryFee === 0 ? 'Free' : `$${restaurant.deliveryFee.toFixed(2)}`
      : restaurant.deliveryFee,
    image: restaurant.website || `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop`,
    description: restaurant.description,
    address: `${restaurant.address}, ${restaurant.city}, ${restaurant.state} ${restaurant.zipCode}`,
    phone: restaurant.phone,
    email: restaurant.email,
    averagePrice: restaurant.averagePrice,
    minimumOrder: typeof restaurant.minimumOrder === 'number'
      ? `$${restaurant.minimumOrder.toFixed(2)}`
      : restaurant.minimumOrder,
    status: restaurant.status,
  };
}
