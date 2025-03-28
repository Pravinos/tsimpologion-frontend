// Placeholder data for the app
export const foodSpots = [
  {
    id: 1,
    name: 'Ελληνικό Ταβερνάκι',
    category: 'Traditional Taverna',
    city: 'Athens',
    address: 'Plaka 123, Athens 10558',
    rating: 4.8,
    description: 'Authentic Greek taverna serving traditional mezedes and dishes from all over Greece. Family-owned since 1975.',
    googleMapsLink: 'https://maps.google.com/location',
    image: 'taverna.jpg',
  },
  {
    id: 2,
    name: 'Θαλασσινά & Ούζο',
    category: 'Seafood',
    city: 'Thessaloniki',
    address: 'Ladadika 45, Thessaloniki 54625',
    rating: 4.5,
    description: 'Fresh seafood restaurant with daily catches from the Aegean Sea. Famous for its grilled octopus and ouzo collection.',
    googleMapsLink: 'https://maps.google.com/location',
    image: 'seafood.jpg',
  },
  {
    id: 3,
    name: 'Σύγχρονη Ελληνική Κουζίνα',
    category: 'Modern Greek',
    city: 'Athens',
    address: 'Kolonaki 78, Athens 10673',
    rating: 4.7,
    description: 'A modern take on traditional Greek recipes. Fusion of old and new in an elegant setting.',
    googleMapsLink: 'https://maps.google.com/location',
    image: 'modern.jpg',
  },
  {
    id: 4,
    name: 'Το Σουβλατζίδικο',
    category: 'Street Food',
    city: 'Heraklion',
    address: 'Plateia Eleftherias 10, Heraklion 71201',
    rating: 4.9,
    description: 'The best souvlaki in Crete! Hand-picked ingredients and family recipes passed down through generations.',
    googleMapsLink: 'https://maps.google.com/location',
    image: 'souvlaki.jpg',
  },
  {
    id: 5,
    name: 'Μαμά\'ς Μαγειρευτά',
    category: 'Home Cooking',
    city: 'Corfu',
    address: 'Old Town 22, Corfu 49100',
    rating: 4.6,
    description: 'Traditional home-cooked meals just like your Greek grandmother would make. Daily specials based on seasonal ingredients.',
    googleMapsLink: 'https://maps.google.com/location',
    image: 'homecooking.jpg',
  }
];

export const reviews = {
  1: [
    {
      id: 101,
      user: 'Maria K.',
      rating: 5,
      comment: 'Absolutely fantastic! The moussaka was the best I\'ve had in Athens.'
    },
    {
      id: 102,
      user: 'John D.',
      rating: 4,
      comment: 'Great atmosphere and excellent service. The wine selection is impressive.'
    },
    {
      id: 103,
      user: 'Dimitris P.',
      rating: 5,
      comment: 'This place reminds me of my yiayia\'s cooking. Authentic and delicious!'
    }
  ],
  2: [
    {
      id: 201,
      user: 'Alex B.',
      rating: 5,
      comment: 'The grilled octopus was perfectly tender. Will definitely return!'
    },
    {
      id: 202,
      user: 'Christina M.',
      rating: 4,
      comment: 'Excellent seafood and a great selection of ouzo. A bit pricey but worth it.'
    }
  ],
  3: [
    {
      id: 301,
      user: 'George T.',
      rating: 5,
      comment: 'Innovative dishes that stay true to Greek flavors. The lamb with feta foam was exceptional.'
    },
    {
      id: 302,
      user: 'Sophia L.',
      rating: 4,
      comment: 'Beautiful presentation and great taste. The service could be a bit faster.'
    }
  ],
  4: [
    {
      id: 401,
      user: 'Nikos K.',
      rating: 5,
      comment: 'Best souvlaki in Greece, no contest! The tzatziki is homemade and amazing.'
    },
    {
      id: 402,
      user: 'Emma S.',
      rating: 5,
      comment: 'I\'ve been coming here for years and the quality never drops. Always delicious!'
    },
    {
      id: 403,
      user: 'Kostas F.',
      rating: 4,
      comment: 'Great quick food, friendly staff, and very affordable.'
    }
  ],
  5: [
    {
      id: 501,
      user: 'Anna P.',
      rating: 5,
      comment: 'Just like my mother used to make! The pastitsio is amazing.'
    },
    {
      id: 502,
      user: 'Michael C.',
      rating: 4,
      comment: 'Cozy place with authentic food. Don\'t miss the daily specials!'
    }
  ]
};

// User profile placeholder
export const userProfile = {
  name: 'Eleni Papadopoulos',
  email: 'eleni@example.com',
  role: 'Food Explorer',
  joinDate: '15 June 2023',
  reviewsCount: 27,
  favoriteCuisine: 'Traditional Greek'
};
