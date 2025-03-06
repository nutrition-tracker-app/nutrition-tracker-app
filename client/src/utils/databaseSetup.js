import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  serverTimestamp, 
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

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

export default setupDatabase;