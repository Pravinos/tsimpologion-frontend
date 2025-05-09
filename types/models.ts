/**
 * User entity based on users table
 */
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'spot_owner' | 'foodie';
  images?: string[]; // JSON column in database
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Food Spot entity based on food_spots table
 */
export interface FoodSpot {
  id: number;
  name: string;
  category: 'Restaurant' | 'Taverna' | 'Mezedopoleion' | 'Brunch' | 'Pizza' | 'Sushi' | 'Burgeradiko' | 'Tsipouradiko';
  city: string;
  address: string;
  description: string;
  info_link: string;
  rating?: number; // Nullable in database
  owner_id?: number; // Nullable in database
  images?: string[]; // JSON column in database
  deleted_at?: string; // For soft deletes
  created_at: string;
  updated_at: string;
}

/**
 * Review entity based on reviews table
 */
export interface Review {
  id: number;
  user_id: number;
  food_spot_id: number;
  comment: string;
  rating: 1 | 2 | 3 | 4 | 5; // Integer between 1-5
  images?: string[]; // JSON column in database
  is_approved: boolean;
  deleted_at?: string; // For soft deletes
  created_at: string;
  updated_at: string;
  user?: User;
}

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Paginated API response wrapper
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    next: string | null;
    prev: string | null;
  };
}

/**
 * Authentication related types
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: 'foodie' | 'spot_owner'; // Likely default to 'foodie'
}

export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Filter options for food spot search
 */
export interface FoodSpotFilter {
  category?: FoodSpot['category'];
  city?: string;
  rating?: number;
  sort_by?: 'rating' | 'created_at';
  sort_direction?: 'asc' | 'desc';
}

export default {};