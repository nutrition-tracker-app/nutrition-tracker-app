import { 
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * This script migrates data from the old database schema to the new schema.
 * 
 * Old schema:
 * - meals (combined meal definitions and user consumption)
 * 
 * New schema:
 * - meals (meal definitions only)
 * - userMeals (user consumption/diary entries)
 * - userMetrics (weight, sleep, exercise)
 * - userStreaks (track user activity)
 */

export const migrateDatabase = async (userId) => {
  console.log('Starting database migration for user:', userId);
  const results = {
    mealsToMigrate: 0,
    mealsMigrated: 0,
    metricsToMigrate: 0,
    metricsMigrated: 0,
    errors: []
  };

  try {
    // Get all user's meals from the old schema
    const mealsRef = collection(db, 'meals');
    const mealsQuery = query(mealsRef, where('userId', '==', userId));
    const mealsSnapshot = await getDocs(mealsQuery);
    
    results.mealsToMigrate = mealsSnapshot.size;
    console.log(`Found ${mealsSnapshot.size} meals to migrate`);
    
    // For each meal in the old schema
    for (const mealDoc of mealsSnapshot.docs) {
      try {
        const oldMealData = mealDoc.data();
        
        // Step 1: Create a meal definition in the new 'meals' collection
        const mealDefinition = {
          name: oldMealData.name,
          baseAmount: oldMealData.amount || 100,
          servingUnit: oldMealData.servingUnit || 'g',
          
          // Macronutrients
          calories: Math.round(Number(oldMealData.calories) || 0),
          protein: Math.round((Number(oldMealData.protein) || 0) * 10) / 10,
          carbs: Math.round((Number(oldMealData.carbs) || 0) * 10) / 10,
          fat: Math.round((Number(oldMealData.fat) || 0) * 10) / 10,
          fiber: Math.round((Number(oldMealData.fiber) || 0) * 10) / 10,
          sugar: Math.round((Number(oldMealData.sugar) || 0) * 10) / 10,
          
          // Source and metadata
          source: 'migrated',
          sourceDetails: { 
            originalId: mealDoc.id
          },
          
          createdAt: oldMealData.createdAt || serverTimestamp(),
          createdBy: userId,
          updatedAt: serverTimestamp()
        };
        
        // Add the meal definition
        const mealDefRef = await addDoc(collection(db, 'meals'), mealDefinition);
        console.log(`Created meal definition with ID: ${mealDefRef.id}`);
        
        // Step 2: Create a user meal entry in the new 'userMeals' collection
        const userMealEntry = {
          userId: userId,
          mealId: mealDefRef.id,
          date: oldMealData.createdAt || serverTimestamp(),
          category: oldMealData.category || 'uncategorized',
          amount: oldMealData.amount || 100,
          multiplier: 1, // Since we're using the same amount for definition and entry
          createdAt: oldMealData.createdAt || serverTimestamp()
        };
        
        // Add the user meal entry
        const userMealRef = await addDoc(collection(db, 'userMeals'), userMealEntry);
        console.log(`Created user meal entry with ID: ${userMealRef.id}`);
        
        results.mealsMigrated++;
      } catch (mealError) {
        console.error('Error migrating meal:', mealError);
        results.errors.push({
          type: 'meal',
          id: mealDoc.id,
          error: mealError.message
        });
      }
    }
    
    // Create initial user streak if it doesn't exist
    try {
      const streakRef = doc(db, 'userStreaks', userId);
      const streakDoc = await getDoc(streakRef);
      
      if (!streakDoc.exists()) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        await set(streakRef, {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActive: Timestamp.fromDate(today),
          updatedAt: serverTimestamp()
        });
        
        console.log('Created initial user streak');
      }
    } catch (streakError) {
      console.error('Error creating user streak:', streakError);
      results.errors.push({
        type: 'streak',
        error: streakError.message
      });
    }
    
    console.log('Migration completed successfully');
    console.log(`Migrated ${results.mealsMigrated} of ${results.mealsToMigrate} meals`);
    
    return {
      success: true,
      results
    };
  } catch (error) {
    console.error('Error during migration:', error);
    return {
      success: false,
      error: error.message,
      results
    };
  }
};

export default migrateDatabase;