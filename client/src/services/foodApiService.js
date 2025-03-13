import axios from 'axios';
import { getCachedFoodData, cacheFoodData } from './firestoreService';
const API_KEY = import.meta.env.VITE_USDA_API_KEY;
// Replace with your API key from https://fdc.nal.usda.gov/api-key-signup.html
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY || 'DEMO_KEY' // Fallback to DEMO_KEY if API key is not defined
  }
});

// Search foods
export const searchFoods = async (query, pageSize = 25) => {
  try {
    // Check if API_KEY is available
    if (!API_KEY) {
      console.warn('USDA API key is not set. Returning mock data for food search.');
      // Return some mock data if no API key
      return [
        { fdcId: '173944', description: 'Mock Chicken, roasted', foodCategory: 'Poultry' },
        { fdcId: '174001', description: 'Mock Broccoli, cooked', foodCategory: 'Vegetables' },
        { fdcId: '174288', description: 'Mock Rice, white, cooked', foodCategory: 'Grains' }
      ];
    }
    
    const response = await api.post('/foods/search', {
      query,
      pageSize,
      dataType: ['Survey (FNDDS)', 'Foundation', 'SR Legacy']
    });
    
    return response.data.foods || [];
  } catch (error) {
    console.error('Error searching foods:', error);
    // Return mock data if there's an error
    return [
      { fdcId: '173944', description: 'Mock Chicken, roasted', foodCategory: 'Poultry' },
      { fdcId: '174001', description: 'Mock Broccoli, cooked', foodCategory: 'Vegetables' },
      { fdcId: '174288', description: 'Mock Rice, white, cooked', foodCategory: 'Grains' }
    ];
  }
};

// Get food details (with caching)
export const getFoodDetails = async (fdcId) => {
  try {
    // Check if API_KEY is available
    if (!API_KEY) {
      console.warn('USDA API key is not set. Returning mock data for food details.');
      // Return mock food data
      return {
        fdcId,
        description: 'Mock Food Item',
        foodNutrients: [
          { nutrient: { id: 1008, name: 'Energy' }, amount: 150 },
          { nutrient: { id: 1003, name: 'Protein' }, amount: 10 },
          { nutrient: { id: 1004, name: 'Total lipid (fat)' }, amount: 5 },
          { nutrient: { id: 1005, name: 'Carbohydrate, by difference' }, amount: 20 },
          { nutrient: { id: 1079, name: 'Fiber, total dietary' }, amount: 2 },
          { nutrient: { id: 2000, name: 'Sugars, total' }, amount: 5 },
        ]
      };
    }
    
    // First, check if we have this food cached in Firestore
    try {
      const cachedFood = await getCachedFoodData(fdcId);
      if (cachedFood) {
        console.log('Using cached food data for:', fdcId);
        return cachedFood;
      } else {
        console.log('No cached food data for:', fdcId, 'fetching from API.');
      }
    } catch (cacheError) {
      console.error('Error checking cached food data:', cacheError);
      // Continue without cached data
    }
    
    // If not cached, fetch from API
    const response = await api.get(`/food/${fdcId}`);

	// For testing purposes, log the response to the console.
	console.log("API Response: ", response);
    const foodData = response.data;
    
    // Cache the result in Firestore for future use
    try {
      await cacheFoodData(fdcId, foodData);
      console.log(`Successfully cached food data for ID: ${fdcId}`);
    } catch (cacheError) {
      console.error('Error caching food data:', cacheError);
      console.log('Continuing without caching - this will not affect functionality');
      // Continue without caching - the app will still work fine
    }
    
    return foodData;
  } catch (error) {
    console.error(`Error getting food details for ID ${fdcId}:`, error);
    // Return mock data on error
    return {
      fdcId,
      description: 'Mock Food Item (Error Fallback)',
      foodNutrients: [
        { nutrient: { id: 1008, name: 'Energy' }, amount: 150 },
        { nutrient: { id: 1003, name: 'Protein' }, amount: 10 },
        { nutrient: { id: 1004, name: 'Total lipid (fat)' }, amount: 5 },
        { nutrient: { id: 1005, name: 'Carbohydrate, by difference' }, amount: 20 },
        { nutrient: { id: 1079, name: 'Fiber, total dietary' }, amount: 2 },
        { nutrient: { id: 2000, name: 'Sugars, total' }, amount: 5 },
      ]
    };
  }
};

// Get nutrient info from food data
export const extractNutrients = (foodData) => {
  console.log('===== EXTRACT NUTRIENTS DEBUG =====');
  console.log('Input foodData:', foodData);
  
  if (!foodData) {
    console.error('No food data provided to extractNutrients');
    return null;
  }
  
  if (!foodData.foodNutrients) {
    console.warn('Food data missing foodNutrients property:', foodData);
    // Check for possible alternate structures based on API response format
    if (foodData.nutrients) {
      console.log('Found alternate nutrients property');
      foodData.foodNutrients = foodData.nutrients;
    } else {
      // Create a mock response if no nutrients found
      console.warn('Creating dummy nutrients since none found in data');
      return {
        calories: 0,
        protein: 0,
        fat: 0,
        carbs: 0,
        fiber: 0,
        sugar: 0,
        allNutrients: []
      };
    }
  }

  // Common nutrient IDs
  const NUTRIENT_IDS = {
    CALORIES: 1008, // Energy (kcal)
    PROTEIN: 1003,  // Protein (g)
    FAT: 1004,      // Total lipid (fat) (g)
    CARBS: 1005,    // Carbohydrate, by difference (g)
    FIBER: 1079,    // Fiber, total dietary (g)
    SUGAR: 2000,    // Sugars, total (g),
    SODIUM: 1093,   // Sodium, Na (mg)
    CHOLESTEROL: 1253, // Cholesterol (mg)
  };

  // Extract the nutrients we care about
  const nutrients = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    cholesterol: 0,
    allNutrients: [] // Store all nutrients for detailed view
  };
  
  console.log(`Processing ${foodData.foodNutrients.length} nutrients`);
  
  // Store all nutrients in a standardized format
  foodData.foodNutrients.forEach((nutrient) => {
    // Normalize the nutrient data structure
    const normalizedNutrient = {
      id: nutrient.nutrient?.id || nutrient.nutrientId,
      name: nutrient.nutrient?.name || nutrient.nutrientName || nutrient.name || '',
      value: nutrient.amount || nutrient.value || 0,
      unit: nutrient.nutrient?.unitName || nutrient.unitName || ''
    };
    
    // Add to the allNutrients array if it has valid data
    if (normalizedNutrient.id && normalizedNutrient.name) {
      nutrients.allNutrients.push(normalizedNutrient);
    }
  });
  
  // The USDA API can return data in different formats depending on the dataset
  // We need to handle multiple possible structures
  foodData.foodNutrients.forEach((nutrient, index) => {
    // Log the structure of each nutrient for debugging
    if (index < 3) { // Only log first few to avoid console spam
      console.log(`Nutrient ${index} structure:`, nutrient);
    }
    
    // ID-based approach (standard approach)
    const id = nutrient.nutrient?.id || nutrient.nutrientId;
    // Value can be in different fields depending on the API response format
    const value = nutrient.amount || nutrient.value || 0;
    
    // Name-based approach (backup)
    const name = nutrient.nutrient?.name || nutrient.nutrientName || nutrient.name || '';
    
    // Log matches for important nutrients
    if (id && Object.values(NUTRIENT_IDS).includes(id)) {
      console.log(`Found nutrient by ID ${id}: ${name} = ${value}`);
    }
    
    // Try to match by ID first (most reliable)
    if (id) {
      switch (id) {
        case NUTRIENT_IDS.CALORIES:
          nutrients.calories = value;
          break;
        case NUTRIENT_IDS.PROTEIN:
          nutrients.protein = value;
          break;
        case NUTRIENT_IDS.FAT:
          nutrients.fat = value;
          break;
        case NUTRIENT_IDS.CARBS:
          nutrients.carbs = value;
          break;
        case NUTRIENT_IDS.FIBER:
          nutrients.fiber = value;
          break;
        case NUTRIENT_IDS.SUGAR:
          nutrients.sugar = value;
          break;
        case NUTRIENT_IDS.SODIUM:
          nutrients.sodium = value;
          break;
        case NUTRIENT_IDS.CHOLESTEROL:
          nutrients.cholesterol = value;
          break;
      }
    } 
    // Then try by name as fallback
    else if (name) {
      if (name.includes('Energy') || name.includes('Calorie')) {
        console.log(`Found calories by name: ${name} = ${value}`);
        nutrients.calories = value;
      } else if (name.includes('Protein')) {
        console.log(`Found protein by name: ${name} = ${value}`);
        nutrients.protein = value;
      } else if (name.includes('lipid') || name.includes('Fat')) {
        console.log(`Found fat by name: ${name} = ${value}`);
        nutrients.fat = value;
      } else if (name.includes('Carbohydrate')) {
        console.log(`Found carbs by name: ${name} = ${value}`);
        nutrients.carbs = value;
      } else if (name.includes('Fiber')) {
        console.log(`Found fiber by name: ${name} = ${value}`);
        nutrients.fiber = value;
      } else if (name.includes('Sugar')) {
        console.log(`Found sugar by name: ${name} = ${value}`);
        nutrients.sugar = value;
      } else if (name.includes('Sodium')) {
        console.log(`Found sodium by name: ${name} = ${value}`);
        nutrients.sodium = value;
      } else if (name.includes('Cholesterol')) {
        console.log(`Found cholesterol by name: ${name} = ${value}`);
        nutrients.cholesterol = value;
      }
    }
  });
  
  console.log('Final extracted nutrients:', nutrients);
  console.log('===== END EXTRACT NUTRIENTS DEBUG =====');
  
  return nutrients;
};