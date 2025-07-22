import { FoodSpot } from '../types/appTypes';

/**
 * Calculate a trending score for a food spot based on multiple factors
 * @param spot - The food spot to calculate score for
 * @returns A numerical score (higher = more trending)
 */
export const calculateTrendingScore = (spot: FoodSpot): number => {
  const rating = spot.rating || (spot.average_rating ? parseFloat(spot.average_rating) : 0);
  const reviewCount = spot.reviews_count || 0;
  
  // Base score from rating (0-5) and review count
  const ratingScore = rating * 2; // 0-10 scale
  const reviewScore = Math.min(reviewCount * 0.3, 4); // Cap at 4, gives bonus for reviews
  
  // Calculate recency boost based on created_at or updated_at
  let recencyBoost = 1.0;
  if (spot.created_at || spot.updated_at) {
    const dateString = spot.updated_at || spot.created_at;
    if (dateString) {
      const spotDate = new Date(dateString);
      const now = new Date();
      const daysSinceCreated = Math.max(1, (now.getTime() - spotDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Boost for spots created/updated in the last 30 days, decay over time
      if (daysSinceCreated <= 30) {
        recencyBoost = 1.5 - (daysSinceCreated / 30) * 0.3; // 1.5 to 1.2
      } else if (daysSinceCreated <= 90) {
        recencyBoost = 1.2 - ((daysSinceCreated - 30) / 60) * 0.2; // 1.2 to 1.0
      }
    }
  }
  
  // Quality threshold - spots need either:
  // 1. At least 2 reviews with 3.5+ rating, OR
  // 2. At least 4.0+ rating (even with few reviews), OR  
  // 3. At least 5 reviews (regardless of rating)
  const meetsQualityThreshold = 
    (reviewCount >= 2 && rating >= 3.5) ||
    (rating >= 4.0) ||
    (reviewCount >= 5);
  
  if (!meetsQualityThreshold) return 0;
  
  // Engagement boost - spots with more activity get higher scores
  const engagementBoost = reviewCount > 0 ? Math.min(1 + (reviewCount * 0.1), 2.0) : 1.0;
  
  const finalScore = (ratingScore + reviewScore) * recencyBoost * engagementBoost;
  
  return Math.round(finalScore * 100) / 100; // Round to 2 decimal places
};

/**
 * Sort food spots for trending display
 * @param spots - Array of food spots to sort
 * @returns Sorted array of trending spots (limited to top 50)
 */
export const sortForTrending = (spots: FoodSpot[]): FoodSpot[] => {
  return spots
    .map(spot => ({ ...spot, trendingScore: calculateTrendingScore(spot) }))
    .filter(spot => spot.trendingScore > 0)
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, 20);
};

export default {
  calculateTrendingScore,
  sortForTrending,  
};