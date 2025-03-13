import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { searchFoods, extractNutrients, getFoodDetails } from '../services/foodApiService';

/**
 * Set up the database with initial data structures:
 * - Example meals
 * - Initial user settings
 * - Initial user streak
 */
export const setupDatabase = async (userId) => {
  console.log('Setting up database for user:', userId);
  const results = {
    success: true,
    meals: 0,
    streakCreated: false,
    settingsCreated: false,
    errors: []
  };

  try {
    // 1. Set up user settings
    try {
      const userRef = doc(db, 'users', userId);
      await setDoc(userRef, {
        uid: userId,
        displayName: '',
        settings: {
          darkMode: false,
          sex: '',
          height: 0,
          weight: 0,
          weightUnit: 'kg',
          heightUnit: 'cm'
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
      results.settingsCreated = true;
      console.log('User settings created successfully');
    } catch (settingsError) {
      console.error('Error creating user settings:', settingsError);
      results.errors.push({
        type: 'settings',
        error: settingsError.message
      });
    }

    // 2. Set up user streak
    try {
      const streakRef = doc(db, 'userStreaks', userId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      await setDoc(streakRef, {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActive: Timestamp.fromDate(today),
        updatedAt: serverTimestamp()
      });
      
      results.streakCreated = true;
      console.log('User streak created successfully');
    } catch (streakError) {
      console.error('Error creating user streak:', streakError);
      results.errors.push({
        type: 'streak',
        error: streakError.message
      });
    }

    // 3. Add some example meal definitions
    const exampleMeals = [
      {
        name: 'Banana',
        baseAmount: 100,
        servingUnit: 'g',
        calories: 89,
        protein: 1.1,
        carbs: 22.8,
        fat: 0.3,
        fiber: 2.6,
        sugar: 12.2,
        source: 'system',
        createdAt: serverTimestamp(),
        createdBy: null,
        updatedAt: serverTimestamp()
      },
      {
        name: 'Chicken Breast',
        baseAmount: 100,
        servingUnit: 'g',
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        fiber: 0,
        sugar: 0,
        source: 'system',
        createdAt: serverTimestamp(),
        createdBy: null,
        updatedAt: serverTimestamp()
      },
      {
        name: 'White Rice (cooked)',
        baseAmount: 100,
        servingUnit: 'g',
        calories: 130,
        protein: 2.7,
        carbs: 28.2,
        fat: 0.3,
        fiber: 0.4,
        sugar: 0.1,
        source: 'system',
        createdAt: serverTimestamp(),
        createdBy: null,
        updatedAt: serverTimestamp()
      }
    ];
    
    for (const meal of exampleMeals) {
      try {
        await addDoc(collection(db, 'meals'), meal);
        results.meals++;
      } catch (mealError) {
        console.error('Error creating example meal:', mealError);
        results.errors.push({
          type: 'meal',
          error: mealError.message
        });
      }
    }
    
    console.log(`Created ${results.meals} example meals`);

    // 4. Update results based on errors
    if (results.errors.length > 0) {
      results.success = false;
    }
    
    return results;
  } catch (error) {
    console.error('Error during database setup:', error);
    return {
      success: false,
      error: error.message,
      ...results
    };
  }
};

// Common food names for searching
const commonFoods = [
  // Fruits
  'apple', 'banana', 'orange', 'strawberry', 'blueberry', 'grape', 'watermelon', 'pineapple',
  'mango', 'peach', 'pear', 'kiwi', 'cherry', 'raspberry', 'blackberry', 'avocado',
  
  // Vegetables
  'carrot', 'broccoli', 'spinach', 'lettuce', 'tomato', 'potato', 'onion', 'cucumber',
  'bell pepper', 'corn', 'green beans', 'mushroom', 'cauliflower', 'zucchini', 'asparagus',
  'sweet potato', 'kale', 'cabbage', 'celery', 'eggplant',
  
  // Grains
  'rice', 'bread', 'pasta', 'oatmeal', 'cereal', 'quinoa', 'wheat', 'barley', 'couscous',
  'bagel', 'tortilla', 'croissant', 'pancake', 'waffle', 'muffin', 'granola',
  
  // Proteins
  'chicken', 'beef', 'pork', 'turkey', 'lamb', 'salmon', 'tuna', 'shrimp', 'tilapia',
  'eggs', 'tofu', 'tempeh', 'lentils', 'black beans', 'chickpeas', 'peanut butter',
  'almonds', 'walnuts', 'cashews', 'greek yogurt',
  
  // Dairy
  'milk', 'cheese', 'yogurt', 'butter', 'cream', 'ice cream', 'cottage cheese', 'sour cream',
  
  // Prepared Foods
  'pizza', 'burger', 'fries', 'sandwich', 'salad', 'soup', 'sushi', 'taco', 'burrito',
  'pasta', 'lasagna', 'stir fry', 'curry', 'steak', 'fried chicken', 'meatloaf',
  'mashed potatoes', 'mac and cheese', 'grilled cheese', 'omelette',
  
  // Snacks
  'chips', 'popcorn', 'pretzels', 'crackers', 'nuts', 'trail mix', 'granola bar',
  'energy bar', 'protein bar', 'chocolate', 'candy', 'cookie', 'cake', 'donut',
  
  // Breakfast Foods
  'cereal', 'oatmeal', 'pancakes', 'waffles', 'bacon', 'sausage', 'hash browns',
  'french toast', 'breakfast sandwich', 'breakfast burrito',
  
  // Beverages
  'water', 'coffee', 'tea', 'orange juice', 'apple juice', 'soda', 'energy drink',
  'sports drink', 'smoothie', 'lemonade', 'milk', 'almond milk', 'soy milk',
  'wine', 'beer', 'cocktail'
];

/**
 * Populate the database with foods from the API
 * @param {string} userId - The user ID to associate with created foods
 * @param {number} limit - Maximum number of foods to add (default 1000)
 * @returns {Object} Results of the operation
 */
export const populateDatabase = async (userId, limit = 1000) => {
  try {
    console.log(`Starting database population with up to ${limit} foods...`);
    
    let totalAdded = 0;
    let results = [];
    
    // Process each food query until we reach the limit
    for (const foodQuery of commonFoods) {
      if (totalAdded >= limit) break;
      
      console.log(`Searching API for "${foodQuery}" foods...`);
      
      // Get foods matching the query
      const searchResults = await searchFoods(foodQuery, 10);
      
      if (!searchResults || searchResults.length === 0) {
        console.log(`No results found for "${foodQuery}"`);
        continue;
      }
      
      console.log(`Found ${searchResults.length} results for "${foodQuery}"`);
      
      // Process each search result
      for (const food of searchResults) {
        if (totalAdded >= limit) break;
        
        try {
          // Get detailed food data if needed
          let foodDetails = food;
          let nutrients;
          
          try {
            if (food.fdcId) {
              foodDetails = await getFoodDetails(food.fdcId);
            }
            
            // Extract nutrients
            nutrients = extractNutrients(foodDetails);
            
            // Skip if nutrients couldn't be extracted
            if (!nutrients || nutrients.calories === 0) {
              console.log(`Skipping food "${food.description}" due to missing nutrients`);
              continue;
            }
          } catch (detailsError) {
            console.error(`Error getting details for food "${food.description}":`, detailsError);
            console.log(`Skipping food "${food.description}" due to API error`);
            continue;
          }
          
          // Create meal data
          // Make sure we have nutrients
          if (!nutrients) {
            console.log(`Skipping food "${food.description}" due to missing nutrients after API call`);
            continue;
          }
            
          const mealData = {
            name: food.description || 'Unknown Food',
            baseAmount: 100,
            servingUnit: 'g',
            calories: nutrients.calories || 0,
            protein: nutrients.protein || 0,
            carbs: nutrients.carbs || 0,
            fat: nutrients.fat || 0,
            fiber: nutrients.fiber || 0,
            sugar: nutrients.sugar || 0,
            sodium: nutrients.sodium || 0,
            cholesterol: nutrients.cholesterol || 0,
            allNutrients: nutrients.allNutrients || [],
            source: 'USDA FDC API',
            sourceDetails: {
              fdcId: food.fdcId,
              foodCategory: food.foodCategory || ''
            },
            createdBy: userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          
          try {
            // Check if this food already exists in the database
            const mealsRef = collection(db, 'meals');
            
            // First check by sourceDetails.fdcId if available
            let isDuplicate = false;
            if (mealData.sourceDetails?.fdcId) {
              const fdcIdQuery = query(
                mealsRef, 
                where('sourceDetails.fdcId', '==', mealData.sourceDetails.fdcId),
                limit(1)
              );
              const fdcIdSnapshot = await getDocs(fdcIdQuery);
              if (!fdcIdSnapshot.empty) {
                console.log(`Skipping "${mealData.name}" - already exists with fdcId: ${mealData.sourceDetails.fdcId}`);
                isDuplicate = true;
              }
            }
            
            // Then check by exact name match if not found by fdcId
            if (!isDuplicate) {
              const nameQuery = query(
                mealsRef,
                where('name', '==', mealData.name),
                limit(1)
              );
              const nameSnapshot = await getDocs(nameQuery);
              if (!nameSnapshot.empty) {
                console.log(`Skipping "${mealData.name}" - already exists with same name`);
                isDuplicate = true;
              }
            }
            
            // Only add if not a duplicate
            if (!isDuplicate) {
              // Add to the database
              console.log(`Adding "${mealData.name}" to database...`);
              const mealRef = await addDoc(mealsRef, mealData);
              
              results.push({
                id: mealRef.id,
                name: mealData.name,
                calories: mealData.calories
              });
              
              totalAdded++;
              console.log(`Added food ${totalAdded}/${limit}: "${mealData.name}"`);
            }
          } catch (dbError) {
            console.error(`Error adding "${mealData.name}" to database:`, dbError);
            console.log(`Skipping food "${mealData.name}" due to database error`);
          }
          
          // Add a delay to avoid rate limits
          await new Promise(resolve => setTimeout(resolve, 500));
          
        } catch (foodError) {
          console.error(`Error processing food "${food.description}":`, foodError);
          continue;
        }
      }
    }
    
    console.log(`Database population complete. Added ${totalAdded} foods.`);
    return {
      success: true,
      totalAdded,
      results
    };
  } catch (error) {
    console.error('Error populating database:', error);
    return {
      success: false,
      error: error.message,
      totalAdded: 0
    };
  }
};

// Export the list of common foods
export const getFoodKeywords = () => commonFoods;

export default setupDatabase;