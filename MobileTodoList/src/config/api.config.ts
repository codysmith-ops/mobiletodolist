/**
 * API Configuration
 * Centralizes all API keys and endpoints
 * Loads from environment variables
 */

// Note: For React Native, use react-native-dotenv or similar to load .env
// For now, we'll use fallback values that trigger demo mode

export const API_CONFIG = {
  // Google APIs
  google: {
    places: {
      apiKey: process.env.GOOGLE_PLACES_API_KEY || '',
      baseUrl: process.env.GOOGLE_PLACES_BASE_URL || 'https://maps.googleapis.com/maps/api/place',
    },
  },

  // Food & Recipe APIs
  spoonacular: {
    apiKey: process.env.SPOONACULAR_API_KEY || '',
    baseUrl: 'https://api.spoonacular.com',
  },

  // Weather API
  weather: {
    apiKey: process.env.OPENWEATHER_API_KEY || '',
    baseUrl: 'https://api.openweathermap.org/data/2.5',
  },

  // Firebase Configuration
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.FIREBASE_APP_ID || '',
    databaseURL: process.env.FIREBASE_DATABASE_URL || '',
  },

  // Payment APIs
  stripe: {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || '',
    secretKey: process.env.STRIPE_SECRET_KEY || '',
  },

  venmo: {
    accessToken: process.env.VENMO_ACCESS_TOKEN || '',
  },

  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    secret: process.env.PAYPAL_SECRET || '',
  },

  // Cashback & Rewards
  cashback: {
    apiKey: process.env.CASHBACK_API_KEY || '',
  },

  // AI Services
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },

  // App Configuration
  app: {
    environment: process.env.NODE_ENV || 'development',
    apiBaseUrl: process.env.API_BASE_URL || 'https://api.yourapp.com',
  },

  // Feature Flags
  features: {
    enableFirebaseSync: process.env.ENABLE_FIREBASE_SYNC === 'true',
    enablePaymentFeatures: process.env.ENABLE_PAYMENT_FEATURES === 'true',
    enableCashback: process.env.ENABLE_CASHBACK === 'true',
    enableAIPredictions: process.env.ENABLE_AI_PREDICTIONS === 'true',
    enableWeatherSuggestions: process.env.ENABLE_WEATHER_SUGGESTIONS === 'true',
  },
};

// Validation helper
export const validateAPIConfig = () => {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Critical APIs
  if (!API_CONFIG.google.places.apiKey) {
    warnings.push('⚠️  Google Places API key not configured - using demo store data');
  }

  if (!API_CONFIG.spoonacular.apiKey) {
    warnings.push('⚠️  Spoonacular API key not configured - meal planning limited');
  }

  // Optional APIs
  if (!API_CONFIG.weather.apiKey) {
    warnings.push('ℹ️  Weather API not configured - weather suggestions disabled');
  }

  if (!API_CONFIG.firebase.apiKey) {
    warnings.push('ℹ️  Firebase not configured - cloud sync disabled');
  }

  if (!API_CONFIG.stripe.publishableKey) {
    warnings.push('ℹ️  Stripe not configured - payment features limited');
  }

  return {
    isValid: errors.length === 0,
    warnings,
    errors,
    functionality: calculateFunctionality(),
  };
};

// Calculate app functionality level based on configured APIs
export const calculateFunctionality = (): {
  level: number;
  description: string;
  missingFeatures: string[];
} => {
  let score = 50; // Base functionality without any APIs
  const missingFeatures: string[] = [];

  // Google Places adds 25%
  if (API_CONFIG.google.places.apiKey) {
    score += 25;
  } else {
    missingFeatures.push('Real store locations and hours');
  }

  // Spoonacular adds 15%
  if (API_CONFIG.spoonacular.apiKey) {
    score += 15;
  } else {
    missingFeatures.push('Advanced meal planning and recipes');
  }

  // Firebase adds 5%
  if (API_CONFIG.firebase.apiKey) {
    score += 5;
  } else {
    missingFeatures.push('Cloud sync and backup');
  }

  // Weather adds 3%
  if (API_CONFIG.weather.apiKey) {
    score += 3;
  } else {
    missingFeatures.push('Weather-based suggestions');
  }

  // Payment APIs add 2%
  if (API_CONFIG.stripe.publishableKey) {
    score += 2;
  } else {
    missingFeatures.push('Advanced payment processing');
  }

  let description = '';
  if (score >= 95) {
    description = '🎉 Full functionality - all features enabled!';
  } else if (score >= 85) {
    description = '✨ Excellent - most features enabled';
  } else if (score >= 70) {
    description = '👍 Good - core features enabled with smart fallbacks';
  } else if (score >= 50) {
    description = '⚡ Basic - using demo data and fallbacks';
  } else {
    description = '⚠️  Limited - configuration needed';
  }

  return {level: score, description, missingFeatures};
};
