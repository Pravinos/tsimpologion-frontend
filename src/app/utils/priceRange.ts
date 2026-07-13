// Single source of truth for price-range tiers so sorting/validation stay in
// sync across screens (Home previously only knew about 3 tiers while
// Add/Categorized knew about 4, causing €€€€ spots to sort incorrectly).
export const PRICE_RANGE_ORDER = ['€', '€€', '€€€', '€€€€'] as const;

export type PriceRange = typeof PRICE_RANGE_ORDER[number];

export const isValidPriceRange = (value: string): value is PriceRange =>
  (PRICE_RANGE_ORDER as readonly string[]).includes(value);

// Add a React component as the default export to satisfy expo-router, which
// treats every file under src/app/ as a route.
import React from 'react';
const PriceRangeUtils = () => null;
export default PriceRangeUtils;
