import { useMemo, useState } from 'react';
import { FoodSpot } from '@/app/types/appTypes';
import { PRICE_RANGE_ORDER } from '@/app/utils/priceRange';

interface UseFoodSpotListFiltersOptions {
  initialCategory?: string;
}

/**
 * Shared search/category/price-range filtering and rating/price sorting for
 * list screens. Extracted from HomeScreen and CategorizedFoodSpotsScreen,
 * which previously duplicated ~80 lines of this logic with slightly
 * diverging (and in Home's case, subtly buggy) price-sort behavior.
 */
export function useFoodSpotListFilters(data: FoodSpot[], options: UseFoodSpotListFiltersOptions = {}) {
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(options.initialCategory ?? '');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [priceSortDirection, setPriceSortDirection] = useState<'asc' | 'desc' | ''>('');

  const categories = useMemo(() => {
    const set = new Set<string>();
    data.forEach((spot: FoodSpot) => {
      if (spot.category) set.add(spot.category);
    });
    return Array.from(set).sort();
  }, [data]);

  const filteredFoodSpots = useMemo(() => {
    const filtered = data.filter((spot: FoodSpot) => {
      const matchesSearch = spot.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory = !selectedCategory ||
        (spot.category && spot.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase());
      const matchesPriceRange = !selectedPriceRange || spot.price_range === selectedPriceRange;
      return matchesSearch && matchesCategory && matchesPriceRange;
    });

    if (priceSortDirection) {
      return filtered.sort((a: FoodSpot, b: FoodSpot) => {
        const aIndex = PRICE_RANGE_ORDER.indexOf((a.price_range ?? '') as any);
        const bIndex = PRICE_RANGE_ORDER.indexOf((b.price_range ?? '') as any);
        return priceSortDirection === 'asc' ? aIndex - bIndex : bIndex - aIndex;
      });
    }

    return filtered.sort((a: FoodSpot, b: FoodSpot) =>
      sortDirection === 'asc' ? (a.rating || 0) - (b.rating || 0) : (b.rating || 0) - (a.rating || 0)
    );
  }, [data, searchText, selectedCategory, selectedPriceRange, sortDirection, priceSortDirection]);

  const spotSuggestions = useMemo(() => {
    if (!searchText || !data) return [];
    return data
      .filter((spot: FoodSpot) => spot.name.toLowerCase().startsWith(searchText.toLowerCase()))
      .map((spot: FoodSpot) => spot.name)
      .slice(0, 5);
  }, [searchText, data]);

  return {
    searchText,
    setSearchText,
    selectedCategory,
    setSelectedCategory,
    selectedPriceRange,
    setSelectedPriceRange,
    sortDirection,
    setSortDirection,
    priceSortDirection,
    setPriceSortDirection,
    categories,
    filteredFoodSpots,
    spotSuggestions,
  };
}

export default useFoodSpotListFilters;
