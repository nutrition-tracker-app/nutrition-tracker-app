import axios from 'axios';
import { getCachedFoodData, cacheFoodData } from './firestoreService';
const API_KEY = import.meta.env.VITE_USDA_API_KEY;
// Replace with your API key from https://fdc.nal.usda.gov/api-key-signup.html
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY
  }
});

// Search foods
export const searchFoods = async (query, pageSize = 25) => {
  try {
    const response = await api.post('/foods/search', {
      query,
      pageSize,
      dataType: ['Survey (FNDDS)', 'Foundation', 'SR Legacy']
    });
    
    return response.data.foods || [];
  } catch (error) {
    console.error('Error searching foods:', error);
    throw error;
  }
};

// Get food details (with caching)
export const getFoodDetails = async (fdcId) => {
  try {
    // First, check if we have this food cached in Firestore
    const cachedFood = await getCachedFoodData(fdcId);
    
    if (cachedFood) {
      console.log('Using cached food data for:', fdcId);
      return cachedFood;
    }
    
    // If not cached, fetch from API
    const response = await api.get(`/food/${fdcId}`);
    const foodData = response.data;
    
    // Cache the result in Firestore for future use
    await cacheFoodData(fdcId, foodData);
    
    return foodData;
  } catch (error) {
    console.error(`Error getting food details for ID ${fdcId}:`, error);
    throw error;
  }
};

// Get nutrient info from food data
export const extractNutrients = (foodData) => {
  if (!foodData || !foodData.foodNutrients) {
    return null;
  }

  // Common nutrient IDs
  const NUTRIENT_IDS = {
    CALORIES: 1008, // Energy (kcal)
    PROTEIN: 1003,  // Protein (g)
    FAT: 1004,      // Total lipid (fat) (g)
    CARBS: 1005,    // Carbohydrate, by difference (g)
    FIBER: 1079,    // Fiber, total dietary (g)
    SUGAR: 2000,    // Sugars, total (g)
  };

  // Extract the nutrients we care about
  const nutrients = {
    calories: 0,
    protein: 0,
    fat: 0,
    carbs: 0,
    fiber: 0,
    sugar: 0
  };
  
  // The USDA API can return data in different formats depending on the dataset
  // We need to handle multiple possible structures
  foodData.foodNutrients.forEach(nutrient => {
    // ID-based approach (standard approach)
    const id = nutrient.nutrient?.id || nutrient.nutrientId;
    // Value can be in different fields depending on the API response format
    const value = nutrient.amount || nutrient.value || 0;
    
    // Name-based approach (backup)
    const name = nutrient.nutrient?.name || nutrient.nutrientName || nutrient.name || '';
    
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
      }
    } 
    // Then try by name as fallback
    else if (name) {
      if (name.includes('Energy') || name.includes('Calorie')) {
        nutrients.calories = value;
      } else if (name.includes('Protein')) {
        nutrients.protein = value;
      } else if (name.includes('lipid') || name.includes('Fat')) {
        nutrients.fat = value;
      } else if (name.includes('Carbohydrate')) {
        nutrients.carbs = value;
      } else if (name.includes('Fiber')) {
        nutrients.fiber = value;
      } else if (name.includes('Sugar')) {
        nutrients.sugar = value;
      }
    }
  });
  
  return nutrients;
};