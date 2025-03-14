import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  setDoc,
  limit,
} from 'firebase/firestore';
import { db } from '../firebase/config';

// User-related functions
export const createUserProfile = async (uid, userData) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    // If user document doesn't exist, create it
    if (error.code === 'not-found') {
      try {
        await setDoc(doc(db, 'users', uid), {
          uid,
          ...userData,
          settings: {
            darkMode: false,
            sex: '',
            height: 0,
            weight: 0,
            weightUnit: 'kg',
            heightUnit: 'cm',
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return true;
      } catch (createError) {
        console.error('Error creating user profile:', createError);
        throw createError;
      }
    }
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (uid) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (uid, userData) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const updateUserSettings = async (uid, settings) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      settings: settings,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
};

// Meal definition functions
export const createMeal = async (mealData) => {
  try {
    console.log('Creating meal definition');
    console.log('Meal data:', mealData);

    const mealsRef = collection(db, 'meals');

    // Process the meal data with consistent precision
    const mealToAdd = {
      name: mealData.name,
      baseAmount: mealData.baseAmount || 100,
      servingUnit: mealData.servingUnit || 'g',

      // Macronutrients (with consistent precision)
      calories: Math.round(Number(mealData.calories) || 0),
      protein: Math.round((Number(mealData.protein) || 0) * 10) / 10,
      carbs: Math.round((Number(mealData.carbs) || 0) * 10) / 10,
      fat: Math.round((Number(mealData.fat) || 0) * 10) / 10,

      // Optional detailed nutrients with defaults if not provided
      fiber: Math.round((Number(mealData.fiber) || 0) * 10) / 10,
      sugar: Math.round((Number(mealData.sugar) || 0) * 10) / 10,
      sodium: Math.round(Number(mealData.sodium) || 0),
      cholesterol: Math.round(Number(mealData.cholesterol) || 0),

      // Store all nutrients data for detailed view
      allNutrients: mealData.allNutrients || [],

      // Source and metadata
      source: mealData.source || 'user-created',
      sourceDetails: mealData.sourceDetails || {},

      createdAt: serverTimestamp(),
      createdBy: mealData.createdBy || null,
      updatedAt: serverTimestamp(),
      updatedBy: mealData.updatedBy || null,
    };

    // Check for duplicates before adding
    let existingMealId = null;

    // First check by fdcId in sourceDetails if available (for API foods)
    if (mealToAdd.sourceDetails && mealToAdd.sourceDetails.fdcId) {
      const fdcIdQuery = query(
        mealsRef,
        where('sourceDetails.fdcId', '==', mealToAdd.sourceDetails.fdcId),
        limit(1)
      );
      const fdcIdSnapshot = await getDocs(fdcIdQuery);

      if (!fdcIdSnapshot.empty) {
        const doc = fdcIdSnapshot.docs[0];
        console.log(
          `Found existing meal with fdcId ${mealToAdd.sourceDetails.fdcId}:`,
          doc.id
        );
        existingMealId = doc.id;
      }
    }

    // If not found by fdcId, check by exact name match
    if (!existingMealId && mealToAdd.name) {
      const nameQuery = query(
        mealsRef,
        where('name', '==', mealToAdd.name),
        limit(1)
      );
      const nameSnapshot = await getDocs(nameQuery);

      if (!nameSnapshot.empty) {
        const doc = nameSnapshot.docs[0];
        console.log(
          `Found existing meal with name "${mealToAdd.name}":`,
          doc.id
        );
        existingMealId = doc.id;
      }
    }

    // If an existing meal was found, return its ID instead of creating a new one
    if (existingMealId) {
      console.log('Using existing meal definition:', existingMealId);
      return existingMealId;
    }

    console.log('Final meal definition to save:', mealToAdd);
    // Check if allNutrients is properly set
    if (mealToAdd.allNutrients && mealToAdd.allNutrients.length > 0) {
      console.log(
        `Saving meal with ${mealToAdd.allNutrients.length} detailed nutrients`
      );
    } else {
      console.warn('No detailed nutrients found in meal data');
    }

    const docRef = await addDoc(mealsRef, mealToAdd);
    console.log('Meal definition added successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating meal definition:', error);
    throw error;
  }
};

export const getMeal = async (mealId) => {
  try {
    const mealRef = doc(db, 'meals', mealId);
    const mealSnap = await getDoc(mealRef);

    if (mealSnap.exists()) {
      return {
        id: mealSnap.id,
        ...mealSnap.data(),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting meal:', error);
    throw error;
  }
};

export const updateMeal = async (mealId, mealData) => {
  try {
    const mealRef = doc(db, 'meals', mealId);
    await updateDoc(mealRef, {
      ...mealData,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating meal:', error);
    throw error;
  }
};

export const deleteMeal = async (mealId) => {
  try {
    const mealRef = doc(db, 'meals', mealId);
    await deleteDoc(mealRef);
    return true;
  } catch (error) {
    console.error('Error deleting meal:', error);
    throw error;
  }
};

// User Meal (diary entry) functions
export const addMealToDiary = async (
  userId,
  mealId,
  amount,
  category = 'uncategorized'
) => {
  try {
    console.log('Adding meal to diary for user:', userId);
    console.log('Meal details:', {
      mealId,
      amount,
      category,
      categoryType: typeof category,
    });

    if (!userId) {
      console.error('Attempted to add meal to diary without userId');
      throw new Error('User ID is required to add a meal to diary');
    }

    if (!mealId) {
      console.error('Attempted to add meal to diary without mealId');
      throw new Error('Meal ID is required to add a meal to diary');
    }

    // Get meal to calculate multiplier
    const meal = await getMeal(mealId);
    if (!meal) {
      throw new Error('Meal not found');
    }

    // Ensure category is valid
    let validCategory = category;
    if (!category || typeof category !== 'string' || category.trim() === '') {
      validCategory = 'uncategorized';
    }
    // Normalize category value
    else {
      validCategory = category.trim().toLowerCase();
    }

    // Validate the category is one of the known types
    const validCategories = [
      'breakfast',
      'lunch',
      'dinner',
      'snack',
      'uncategorized',
    ];
    if (!validCategories.includes(validCategory)) {
      validCategory = 'uncategorized';
    }

    console.log(`Final category for meal: ${validCategory}`);

    const baseAmount = meal.baseAmount || 100;
    const multiplier = amount / baseAmount;

    const userMealsRef = collection(db, 'userMeals');
    const entryToAdd = {
      userId,
      mealId,
      date: Timestamp.fromDate(new Date()),
      category: validCategory,
      amount: Number(amount),
      multiplier,
      createdAt: serverTimestamp(),
    };

    console.log('Final diary entry to save:', entryToAdd);

    const docRef = await addDoc(userMealsRef, entryToAdd);
    console.log('Diary entry added successfully with ID:', docRef.id);

    // Update user streak
    await updateUserStreak(userId);

    return docRef.id;
  } catch (error) {
    console.error('Error adding meal to diary:', error);
    throw error;
  }
};

// For backward compatibility
export const addMeal = async (userId, mealData) => {
  try {
    console.log('Legacy addMeal called with:', userId, mealData);

    // First, create or find the meal definition
    let mealId;

    // If it's an existing meal with ID, use that
    if (mealData.id && mealData.id !== 'new') {
      mealId = mealData.id;
    } else {
      // Create a new meal definition
      const mealToCreate = {
        name: mealData.name,
        baseAmount: mealData.baseAmount || 100,
        servingUnit: mealData.servingUnit || 'g',
        calories: mealData.calories,
        protein: mealData.protein,
        carbs: mealData.carbs,
        fat: mealData.fat,
        fiber: mealData.fiber || 0,
        sugar: mealData.sugar || 0,
        sodium: mealData.sodium || 0,
        cholesterol: mealData.cholesterol || 0,
        // Store all nutrients data for detailed view
        allNutrients: mealData.allNutrients || [],
        source: 'user-created',
        createdBy: userId,
      };

      mealId = await createMeal(mealToCreate);
    }

    // Make sure the category is valid and not empty
    const category =
      mealData.category &&
      typeof mealData.category === 'string' &&
      mealData.category.trim() !== ''
        ? mealData.category.trim().toLowerCase()
        : 'uncategorized';

    console.log(`Adding meal to diary with category: ${category}`);

    // Create a custom date from mealData.date if provided, otherwise use current date
    let entryDate = new Date();
    if (mealData.date) {
      if (mealData.date instanceof Date) {
        entryDate = mealData.date;
      } else if (typeof mealData.date === 'string') {
        // Handle string date (YYYY-MM-DD)
        entryDate = new Date(mealData.date);
      }
    }
    console.log(`Using entry date: ${entryDate.toISOString()}`);

    // Create a custom user meal entry
    const userMealsRef = collection(db, 'userMeals');

    // Get meal to calculate multiplier
    const meal = await getMeal(mealId);
    if (!meal) {
      throw new Error('Meal not found');
    }

    const baseAmount = meal.baseAmount || 100;
    const multiplier = (mealData.amount || 100) / baseAmount;

    const userMealEntry = {
      userId,
      mealId,
      date: Timestamp.fromDate(entryDate),
      category: category,
      amount: Number(mealData.amount || 100),
      multiplier,
      createdAt: serverTimestamp(),
    };

    console.log('Adding entry to diary with custom date:', userMealEntry);
    const docRef = await addDoc(userMealsRef, userMealEntry);

    // Update user streak
    await updateUserStreak(userId);

    return docRef.id;
  } catch (error) {
    console.error('Error in legacy addMeal:', error);
    throw error;
  }
};

export const getUserDiaryEntries = async (userId, date = null) => {
  try {
    if (!userId) {
      console.error('getUserDiaryEntries called with null or undefined userId');
      return [];
    }

    const userMealsRef = collection(db, 'userMeals');
    let q;

    if (date) {
      // Ensure we're working with a valid Date object, not a string
      let dateObj;
      if (date instanceof Date) {
        dateObj = date;
      } else if (typeof date === 'string') {
        // If it's a string like "YYYY-MM-DD", convert to Date
        const parts = date.split('-').map(Number);
        if (parts.length === 3) {
          dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        } else {
          dateObj = new Date(date);
        }
      } else {
        dateObj = new Date(date);
      }

      console.log('Converting date to timestamp range:', dateObj.toString());

      // Convert date to timestamp range (start of day to end of day)
      const startOfDay = new Date(dateObj);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(dateObj);
      endOfDay.setHours(23, 59, 59, 999);

      console.log('Date range for query:', {
        original: dateObj.toString(),
        start: startOfDay.toString(),
        end: endOfDay.toString(),
      });

      q = query(
        userMealsRef,
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay)),
        orderBy('date', 'desc')
      );
    } else {
      q = query(
        userMealsRef,
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    console.log(`Found ${querySnapshot.size} diary entries for user ${userId}`);

    const entries = [];

    for (const doc of querySnapshot.docs) {
      const entryData = doc.data();

      // Get the meal details
      const meal = await getMeal(entryData.mealId);
      if (!meal) {
        console.error('Referenced meal not found:', entryData.mealId);
        continue; // Skip this entry
      }

      // Calculate nutrition based on multiplier
      entries.push({
        id: doc.id,
        name: meal.name,
        category: entryData.category || 'uncategorized',
        amount: entryData.amount,
        date: entryData.date.toDate(),
        calories: Math.round(meal.calories * entryData.multiplier),
        protein: Math.round(meal.protein * entryData.multiplier * 10) / 10,
        carbs: Math.round(meal.carbs * entryData.multiplier * 10) / 10,
        fat: Math.round(meal.fat * entryData.multiplier * 10) / 10,
        fiber: Math.round((meal.fiber || 0) * entryData.multiplier * 10) / 10,
        sugar: Math.round((meal.sugar || 0) * entryData.multiplier * 10) / 10,
        sodium: Math.round((meal.sodium || 0) * entryData.multiplier),
        cholesterol: Math.round((meal.cholesterol || 0) * entryData.multiplier),
        // Add allNutrients array if available
        allNutrients: meal.allNutrients || [],
        mealId: entryData.mealId,
      });
    }

    return entries;
  } catch (error) {
    console.error('Error getting user diary entries:', error);
    return [];
  }
};

export const getDiaryEntriesByCategory = async (userId, date) => {
  try {
    const entries = await getUserDiaryEntries(userId, date);

    // Group entries by category
    return {
      breakfast: entries.filter((entry) => entry.category === 'breakfast'),
      lunch: entries.filter((entry) => entry.category === 'lunch'),
      dinner: entries.filter((entry) => entry.category === 'dinner'),
      snack: entries.filter((entry) => entry.category === 'snack'),
      uncategorized: entries.filter(
        (entry) =>
          entry.category === 'uncategorized' ||
          !['breakfast', 'lunch', 'dinner', 'snack'].includes(entry.category)
      ),
    };
  } catch (error) {
    console.error('Error getting diary entries by category:', error);
    return {
      breakfast: [],
      lunch: [],
      dinner: [],
      snack: [],
      uncategorized: [],
    };
  }
};

export const updateDiaryEntry = async (entryId, entryData) => {
  try {
    const entryRef = doc(db, 'userMeals', entryId);

    // If changing amount, recalculate multiplier
    if (entryData.amount) {
      const entrySnap = await getDoc(entryRef);
      if (!entrySnap.exists()) {
        throw new Error('Diary entry not found');
      }

      const currentEntry = entrySnap.data();
      const meal = await getMeal(currentEntry.mealId);
      if (!meal) {
        throw new Error('Referenced meal not found');
      }

      const baseAmount = meal.baseAmount || 100;
      const multiplier = entryData.amount / baseAmount;

      entryData.multiplier = multiplier;
    }

    await updateDoc(entryRef, {
      ...entryData,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating diary entry:', error);
    throw error;
  }
};

export const getUserMealsByDate = async (userId, date) => {
  try {
    console.log('getUserMealsByDate called with date:', date);
    if (date) {
      // Ensure we're always dealing with a proper Date object
      const dateObj = date instanceof Date ? date : new Date(date);
      console.log('Date converted to:', dateObj.toString());
      return await getUserDiaryEntries(userId, dateObj);
    } else {
      return await getUserDiaryEntries(userId);
    }
  } catch (error) {
    console.error('Error in getUserMealsByDate:', error);
    return [];
  }
};

export const trackWeight = async (userId, weight, unit = 'kg') => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const metricsRef = collection(db, 'userMetrics');

    const metricToAdd = {
      userId,
      type: 'weight',
      value: Number(weight),
      date: Timestamp.fromDate(new Date()),
      details: {
        unit: unit || 'kg',
      },
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(metricsRef, metricToAdd);
    return docRef.id;
  } catch (error) {
    console.error('Error tracking weight:', error);
    throw error;
  }
};

// Get weight history
export const getUserWeightHistory = async (userId) => {
  try {
    const weightCollection = collection(db, 'userMetrics');
    const q = query(
      weightCollection,
      where('userId', '==', userId),
      where('type', '==', 'weight'),
      orderBy('date', 'asc')
    );

    const querySnapshot = await getDocs(q);

    const weightData = querySnapshot.docs
      .map((doc) => ({
        id: doc.id,
        date: doc.data().date, // Keep date
        value: doc.data().value, // Keep weight
        type: doc.data().details?.type || doc.data().type,
      }))
      .filter((entry) => entry.type === 'weight');

    return weightData;
  } catch (error) {
    console.error('Error fetching weight history:', error);
    return [];
  }
};

// Get sleep history
export const getUserSleepHistory = async (userId) => {
  try {
    const sleepCollection = collection(db, 'userMetrics');
    const q = query(
      sleepCollection,
      where('userId', '==', userId),
      where('type', '==', 'sleep'),
      orderBy('date', 'asc')
    );

    const querySnapshot = await getDocs(q);

    const sleepData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      date: doc.data().date,
      bedtime: doc.data().details.bedtime,
      wakeup: doc.data().details.wakeup,
      quality: doc.data().details.quality,
      value: (doc.data().value / 60).toFixed(2),
      type: doc.data().details?.type || doc.data().type, // Ensure type is included
    }));

    return sleepData.filter((entry) => entry.type === 'sleep');
  } catch (error) {
    console.error('Error fetching sleep history:', error);
    return [];
  }
};

// Get calorie history
export const getUserCalorieHistory = async (userId) => {
  try {
    if (!userId) return [];

    console.log('Fetching calorie history for user:', userId);

    // Query user meals collection
    const userMealsCollection = collection(db, 'userMeals');
    const userMealsQuery = query(
      userMealsCollection,
      where('userId', '==', userId)
    );

    const userMealsSnapshot = await getDocs(userMealsQuery);
    const userMeals = userMealsSnapshot.docs.map((doc) => ({
      id: doc.id,
      mealId: doc.data().mealId,
      date: doc.data().date.toDate().toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
      }),
      amount: doc.data().amount, // The amount of food consumed
    }));

    console.log('Fetched user meals:', userMeals);

    // Get meal details from "meals" collection
    const mealIds = [...new Set(userMeals.map((meal) => meal.mealId))];

    const mealsCollection = collection(db, 'meals');
    const mealsQuery = query(mealsCollection, where('__name__', 'in', mealIds));

    const mealsSnapshot = await getDocs(mealsQuery);
    const mealsData = mealsSnapshot.docs.reduce((acc, doc) => {
      acc[doc.id] = doc.data().calories; // Store meal ID -> calorie mapping
      return acc;
    }, {});

    console.log('Fetched meal details:', mealsData);

    // Aggregate calories per day
    const calorieHistory = userMeals.reduce((acc, meal) => {
      const caloriesPer100g = mealsData[meal.mealId] || 0;
      const totalCalories = (caloriesPer100g * meal.amount) / 100; // Adjust based on meal amount

      if (!acc[meal.date]) {
        acc[meal.date] = 0;
      }
      acc[meal.date] += totalCalories;

      return acc;
    }, {});

    console.log('Final Aggregated Calorie Data:', calorieHistory);

    // Convert into an array for charting
    const formattedData = Object.entries(calorieHistory).map(
      ([date, value]) => ({
        date,
        value,
      })
    );

    return formattedData;
  } catch (error) {
    console.error('Error fetching calorie history:', error);
    return [];
  }
};

// Get protein history
export const getUserProteinHistory = async (userId) => {
  try {
    if (!userId) return [];

    console.log('Fetching protein history for user:', userId);

    // Query user meals collection
    const userMealsCollection = collection(db, 'userMeals');
    const userMealsQuery = query(
      userMealsCollection,
      where('userId', '==', userId)
    );
    const userMealsSnapshot = await getDocs(userMealsQuery);

    const userMeals = userMealsSnapshot.docs.map((doc) => ({
      id: doc.id,
      mealId: doc.data().mealId,
      date: doc.data().date.toDate().toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
      }),
      amount: doc.data().amount, // The amount of food consumed
    }));

    console.log('Fetched user meals:', userMeals);

    // Get meal details from "meals" collection (batch query)
    const mealIds = [...new Set(userMeals.map((meal) => meal.mealId))];
    const mealsCollection = collection(db, 'meals');

    // Firestore does not allow querying more than 30 IDs at once, so batch if needed
    const mealsData = {};
    for (let i = 0; i < mealIds.length; i += 10) {
      const batchMealIds = mealIds.slice(i, i + 10);
      const mealsQuery = query(
        mealsCollection,
        where('__name__', 'in', batchMealIds)
      );
      const mealsSnapshot = await getDocs(mealsQuery);

      mealsSnapshot.docs.forEach((doc) => {
        mealsData[doc.id] = doc.data().protein; // Store meal ID -> protein mapping
      });
    }

    console.log('Fetched meal details:', mealsData);

    // Aggregate protein per day
    const proteinHistory = userMeals.reduce((acc, meal) => {
      const proteinPer100g = mealsData[meal.mealId] || 0;
      const totalProtein = (proteinPer100g * meal.amount) / 100; // Adjust based on meal amount

      if (!acc[meal.date]) {
        acc[meal.date] = 0;
      }
      acc[meal.date] += totalProtein;

      return acc;
    }, {});

    console.log('Final Aggregated Protein Data:', proteinHistory);

    // Convert into an array for charting
    const formattedData = Object.entries(proteinHistory).map(
      ([date, value]) => ({
        date,
        value,
      })
    );

    return formattedData;
  } catch (error) {
    console.error('Error fetching protein history:', error);
    return [];
  }
};

// Get fat history
export const getUserFatHistory = async (userId) => {
  try {
    if (!userId) return [];

    console.log('Fetching fat history for user:', userId);

    // Query user meals collection
    const userMealsCollection = collection(db, 'userMeals');
    const userMealsQuery = query(
      userMealsCollection,
      where('userId', '==', userId)
    );
    const userMealsSnapshot = await getDocs(userMealsQuery);

    const userMeals = userMealsSnapshot.docs.map((doc) => ({
      id: doc.id,
      mealId: doc.data().mealId,
      date: doc.data().date.toDate().toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
      }),
      amount: doc.data().amount, // The amount of food consumed
    }));

    console.log('Fetched user meals:', userMeals);

    // Get meal details from "meals" collection (batch query)
    const mealIds = [...new Set(userMeals.map((meal) => meal.mealId))];
    const mealsCollection = collection(db, 'meals');

    // Firestore does not allow querying more than 30 IDs at once, so batch if needed
    const mealsData = {};
    for (let i = 0; i < mealIds.length; i += 10) {
      const batchMealIds = mealIds.slice(i, i + 10);
      const mealsQuery = query(
        mealsCollection,
        where('__name__', 'in', batchMealIds)
      );
      const mealsSnapshot = await getDocs(mealsQuery);

      mealsSnapshot.docs.forEach((doc) => {
        mealsData[doc.id] = doc.data().fat; // Store meal ID -> fat mapping
      });
    }

    console.log('Fetched meal details:', mealsData);

    // Aggregate fat intake per day
    const fatHistory = userMeals.reduce((acc, meal) => {
      const fatPer100g = mealsData[meal.mealId] || 0;
      const totalFat = (fatPer100g * meal.amount) / 100; // Adjust based on meal amount

      if (!acc[meal.date]) {
        acc[meal.date] = 0;
      }
      acc[meal.date] += totalFat;

      return acc;
    }, {});

    console.log('Final Aggregated Fat Data:', fatHistory);

    // Convert into an array for charting
    const formattedData = Object.entries(fatHistory).map(([date, value]) => ({
      date,
      value,
    }));

    return formattedData;
  } catch (error) {
    console.error('Error fetching fat history:', error);
    return [];
  }
};

// Get carb history
export const getUserCarbHistory = async (userId) => {
  try {
    if (!userId) return [];

    console.log('Fetching carbohydrate history for user:', userId);

    // Query user meals collection
    const userMealsCollection = collection(db, 'userMeals');
    const userMealsQuery = query(
      userMealsCollection,
      where('userId', '==', userId)
    );
    const userMealsSnapshot = await getDocs(userMealsQuery);

    const userMeals = userMealsSnapshot.docs.map((doc) => ({
      id: doc.id,
      mealId: doc.data().mealId,
      date: doc.data().date.toDate().toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
      }),
      amount: doc.data().amount, // The amount of food consumed
    }));

    console.log('Fetched user meals:', userMeals);

    // Get meal details from "meals" collection (batch query)
    const mealIds = [...new Set(userMeals.map((meal) => meal.mealId))];
    const mealsCollection = collection(db, 'meals');

    // Firestore does not allow querying more than 30 IDs at once, so batch if needed
    const mealsData = {};
    for (let i = 0; i < mealIds.length; i += 10) {
      const batchMealIds = mealIds.slice(i, i + 10);
      const mealsQuery = query(
        mealsCollection,
        where('__name__', 'in', batchMealIds)
      );
      const mealsSnapshot = await getDocs(mealsQuery);

      mealsSnapshot.docs.forEach((doc) => {
        mealsData[doc.id] = doc.data().carbs; // Store meal ID -> carb mapping
      });
    }

    console.log('Fetched meal details:', mealsData);

    // Aggregate carbohydrate intake per day
    const carbHistory = userMeals.reduce((acc, meal) => {
      const carbsPer100g = mealsData[meal.mealId] || 0;
      const totalCarbs = (carbsPer100g * meal.amount) / 100; // Adjust based on meal amount

      if (!acc[meal.date]) {
        acc[meal.date] = 0;
      }
      acc[meal.date] += totalCarbs;

      return acc;
    }, {});

    console.log('Final Aggregated Carbohydrate Data:', carbHistory);

    // Convert into an array for charting
    const formattedData = Object.entries(carbHistory).map(([date, value]) => ({
      date,
      value,
    }));

    return formattedData;
  } catch (error) {
    console.error('Error fetching carbohydrate history:', error);
    return [];
  }
};

export const trackSleep = async (userId, bedtime, wakeup, quality = 5) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!bedtime || !wakeup) {
      throw new Error('Bedtime and wakeup times are required');
    }

    // Convert string times to Date objects if needed
    const bedtimeDate =
      typeof bedtime === 'string' ? new Date(bedtime) : bedtime;
    const wakeupDate = typeof wakeup === 'string' ? new Date(wakeup) : wakeup;

    // Calculate sleep duration in minutes
    let durationMs = wakeupDate.getTime() - bedtimeDate.getTime();

    // Handle overnight sleep (when end time is earlier than start time)
    if (durationMs < 0) {
      // If negative, assume sleep is overnight and add a day worth of milliseconds
      durationMs += 24 * 60 * 60 * 1000;
    }

    // Ensure we have a positive duration
    const durationMinutes = Math.max(0, Math.floor(durationMs / (1000 * 60)));

    const metricsRef = collection(db, 'userMetrics');

    console.log(
      `Sleep calculation: Start=${bedtimeDate}, End=${wakeupDate}, Duration=${durationMinutes} minutes`
    );

    const metricToAdd = {
      userId,
      type: 'sleep',
      value: durationMinutes, // Duration in minutes
      date: Timestamp.fromDate(new Date()),
      details: {
        bedtime: Timestamp.fromDate(bedtimeDate),
        wakeup: Timestamp.fromDate(wakeupDate),
        quality: Number(quality) || 5,
      },
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(metricsRef, metricToAdd);
    return docRef.id;
  } catch (error) {
    console.error('Error tracking sleep:', error);
    throw error;
  }
};

export const trackExercise = async (
  userId,
  category,
  duration,
  intensity = 'moderate',
  calories = 0
) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    if (!duration) {
      throw new Error('Exercise duration is required');
    }

    const metricsRef = collection(db, 'userMetrics');

    const metricToAdd = {
      userId,
      type: 'exercise',
      value: Number(duration), // Duration in minutes
      date: Timestamp.fromDate(new Date()),
      details: {
        category: category || 'other',
        intensity: intensity || 'moderate',
        calories: Number(calories) || 0,
        duration: Number(duration),
      },
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(metricsRef, metricToAdd);
    return docRef.id;
  } catch (error) {
    console.error('Error tracking exercise:', error);
    throw error;
  }
};

export const getLatestUserMetric = async (
  userId,
  metricType,
  forToday = false
) => {
  try {
    if (!userId || !metricType) {
      return null;
    }

    const metricsRef = collection(db, 'userMetrics');

    let q;

    if (forToday) {
      // Get only metrics from today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      q = query(
        metricsRef,
        where('userId', '==', userId),
        where('type', '==', metricType),
        where('date', '>=', Timestamp.fromDate(today)),
        where('date', '<', Timestamp.fromDate(tomorrow)),
        orderBy('date', 'desc')
      );

      console.log(
        `Getting latest ${metricType} metric for today (${today.toLocaleDateString()})`
      );
    } else {
      // Get latest metric of all time
      q = query(
        metricsRef,
        where('userId', '==', userId),
        where('type', '==', metricType),
        orderBy('date', 'desc')
      );

      console.log(`Getting latest ${metricType} metric (all time)`);
    }

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log(
        `No ${metricType} metrics found ${forToday ? 'for today' : ''}`
      );
      return null;
    }

    // Since we can't use limit(1), get the first doc
    const doc = querySnapshot.docs[0];
    const data = doc.data();

    console.log(`Found ${metricType} metric: `, {
      id: doc.id,
      date: data.date?.toDate()?.toLocaleDateString() || 'unknown date',
      value: data.value,
    });

    return {
      id: doc.id,
      ...data,
    };
  } catch (error) {
    console.error(`Error getting latest ${metricType} metric:`, error);
    return null;
  }
};

export const getUserMetrics = async (userId, metricType) => {
  try {
    if (!userId || !metricType) {
      return [];
    }

    const metricsRef = collection(db, 'userMetrics');
    const q = query(
      metricsRef,
      where('userId', '==', userId),
      where('type', '==', metricType),
      orderBy('date', 'desc')
    );

    const querySnapshot = await getDocs(q);

    const metrics = [];
    querySnapshot.forEach((doc) => {
      metrics.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return metrics;
  } catch (error) {
    console.error(`Error getting ${metricType} metrics:`, error);
    return [];
  }
};

export const getUserStreak = async (userId) => {
  try {
    if (!userId) {
      console.error('getUserStreak called without userId');
      return { currentStreak: 0, longestStreak: 0 };
    }

    const streakRef = doc(db, 'userStreaks', userId);
    const streakDoc = await getDoc(streakRef);

    if (!streakDoc.exists()) {
      // No streak data yet
      return { currentStreak: 0, longestStreak: 0 };
    }

    const streakData = streakDoc.data();
    return {
      currentStreak: streakData.currentStreak || 0,
      longestStreak: streakData.longestStreak || 0,
    };
  } catch (error) {
    console.error('Error getting user streak:', error);
    return { currentStreak: 0, longestStreak: 0 };
  }
};

export const updateUserStreak = async (userId) => {
  try {
    if (!userId) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get user streak document
    const streakRef = doc(db, 'userStreaks', userId);
    const streakDoc = await getDoc(streakRef);

    if (!streakDoc.exists()) {
      // First time user, create streak
      await setDoc(streakRef, {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActive: Timestamp.fromDate(today),
        updatedAt: serverTimestamp(),
      });
      return true;
    }

    const streakData = streakDoc.data();

    if (!streakData.lastActive) {
      console.error('lastActive is missing in streak data');
      // Create a new streak starting today
      await setDoc(streakRef, {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActive: Timestamp.fromDate(today),
        updatedAt: serverTimestamp(),
      });
      return true;
    }

    // Safely handle lastActive date conversion
    let lastActive;
    try {
      if (typeof streakData.lastActive.toDate === 'function') {
        lastActive = streakData.lastActive.toDate();
      } else if (streakData.lastActive instanceof Date) {
        lastActive = streakData.lastActive;
      } else {
        lastActive = new Date(streakData.lastActive);
      }
      lastActive.setHours(0, 0, 0, 0);
    } catch (error) {
      console.error(
        'Error processing lastActive date in updateUserStreak:',
        error
      );
      // Create a new streak starting today
      await setDoc(streakRef, {
        userId,
        currentStreak: 1,
        longestStreak: 1,
        lastActive: Timestamp.fromDate(today),
        updatedAt: serverTimestamp(),
      });
      return true;
    }

    // Calculate the difference in days
    const diffTime = Math.abs(today - lastActive);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let currentStreak = streakData.currentStreak;
    let longestStreak = streakData.longestStreak;

    // If user was active yesterday, increment streak
    if (diffDays === 1) {
      currentStreak += 1;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    }
    // If user is active today again, no change
    else if (diffDays === 0) {
      // No change to streak
    }
    // If user missed a day or more, reset streak
    else {
      currentStreak = 1;
    }

    await updateDoc(streakRef, {
      currentStreak,
      longestStreak,
      lastActive: Timestamp.fromDate(today),
      updatedAt: serverTimestamp(),
    });

    return true;
  } catch (error) {
    console.error('Error updating user streak:', error);
    return false;
  }
};

// Food API data caching
export const cacheFoodData = async (foodId, foodData) => {
  try {
    const foodsRef = collection(db, 'cachedFoods');
    const docRef = await addDoc(foodsRef, {
      foodId,
      ...foodData,
      cachedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error caching food data:', error);
    throw error;
  }
};

export const getCachedFoodData = async (foodId) => {
  try {
    const foodsRef = collection(db, 'cachedFoods');
    const q = query(foodsRef, where('foodId', '==', foodId));

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting cached food data:', error);
    throw error;
  }
};

// Function to delete a diary entry (userMeal)
export const deleteDiaryEntry = async (entryId) => {
  try {
    console.log('Deleting diary entry with ID:', entryId);
    const entryRef = doc(db, 'userMeals', entryId);
    await deleteDoc(entryRef);
    console.log('Diary entry deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting diary entry:', error);
    throw error;
  }
};

// Function to delete a user metric (weight, sleep, exercise)
export const deleteUserMetric = async (metricId) => {
  try {
    console.log('Deleting user metric with ID:', metricId);
    const metricRef = doc(db, 'userMetrics', metricId);
    await deleteDoc(metricRef);
    console.log('User metric deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting user metric:', error);
    throw error;
  }
};

// Food Database Search function
export const searchFoodsInDatabase = async (searchTerm, maxResults = 25) => {
  try {
    if (!searchTerm.trim()) {
      return [];
    }

    console.log(`Searching database for foods matching: "${searchTerm}"`);
    const mealsRef = collection(db, 'meals');

    // Convert search term to lowercase for case-insensitive search
    const queryLower = searchTerm.toLowerCase();

    // Get all meals (we'll filter in JS since Firestore doesn't support full text search)
    // In a production app, we'd use Algolia, Firebase Extensions, or similar for better text search
    const mealsQuery = query(mealsRef, limit(1000)); // Fetch more meals for better search coverage
    const querySnapshot = await getDocs(mealsQuery);

    console.log(`Found ${querySnapshot.size} total meals in database`);

    let results = [];
    let debugMatches = [];

    querySnapshot.forEach((doc) => {
      const meal = { id: doc.id, ...doc.data() };

      // Special debugging for "Chicken" search
      if (queryLower === 'chicken' && meal.name) {
        debugMatches.push({
          id: doc.id,
          name: meal.name,
          nameLower: meal.name.toLowerCase(),
          match: meal.name.toLowerCase().includes(queryLower),
        });
      }

      // Check for matches (full word match, partial word match)
      let isMatch = false;
      let matchQuality = 0; // Higher is better

      if (meal.name && typeof meal.name === 'string') {
        const mealNameLower = meal.name.toLowerCase();

        // Direct substring match (strongest match)
        if (mealNameLower.includes(queryLower)) {
          isMatch = true;
          matchQuality = 3;
        }
        // Word boundary match (check if any word starts with our query)
        else {
          const words = mealNameLower.split(/\s+/);
          for (const word of words) {
            if (word.startsWith(queryLower)) {
              isMatch = true;
              matchQuality = 2;
              break;
            }
          }

          // Partial word match (weakest match but still valid)
          if (!isMatch) {
            for (const word of words) {
              if (word.includes(queryLower)) {
                isMatch = true;
                matchQuality = 1;
                break;
              }
            }
          }
        }

        if (isMatch) {
          results.push({
            id: meal.id,
            description: meal.name,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fat: meal.fat,
            fiber: meal.fiber,
            sugar: meal.sugar,
            sodium: meal.sodium,
            cholesterol: meal.cholesterol,
            foodCategory: meal.source || 'Database',
            source: 'database',
            matchQuality: matchQuality, // Store the match quality for sorting
          });
        }
      }
    });

    // Log debug info for "Chicken" search
    if (queryLower === 'chicken') {
      console.log('Debug info for chicken search:', {
        totalDocuments: querySnapshot.size,
        potentialMatches: debugMatches.length,
        matches: results.length,
        sampleMatches: debugMatches.slice(0, 5),
      });
    }

    // Sort by relevance using our match quality scores
    results.sort((a, b) => {
      // First sort by match quality (higher is better)
      if (a.matchQuality !== b.matchQuality) {
        return b.matchQuality - a.matchQuality;
      }

      const aName = a.description.toLowerCase();
      const bName = b.description.toLowerCase();

      // If same match quality, use the position of the match (earlier is better)
      if (a.matchQuality >= 2) {
        // For high quality matches, position matters
        const aIndex = aName.indexOf(queryLower);
        const bIndex = bName.indexOf(queryLower);
        if (aIndex !== bIndex) {
          return aIndex - bIndex;
        }
      }

      // If everything else is the same, shorter names first
      if (aName.length !== bName.length) {
        return aName.length - bName.length;
      }

      // Last resort: alphabetical
      return aName.localeCompare(bName);
    });

    // Limit results to requested max
    results = results.slice(0, maxResults);

    console.log(`Found ${results.length} matches in database`);

    // Final debug logging
    if (results.length > 0) {
      console.log(
        'Top 3 results:',
        results.slice(0, 3).map((r) => ({
          name: r.description,
          matchQuality: r.matchQuality,
        }))
      );
    } else {
      console.log(
        `No results found for query "${searchTerm}" - consider checking the database population`
      );
    }

    return results;
  } catch (error) {
    console.error('Error searching foods in database:', error);
    return [];
  }
};

// Get user metrics by date (for exercise, sleep, etc.)
export const getUserMetricsByDate = async (
  userId,
  metricType,
  startDate,
  endDate
) => {
  try {
    if (!userId || !metricType) {
      console.error('Missing required parameters');
      return [];
    }

    // Convert dates to Firestore timestamps if they're Date objects
    const startTimestamp =
      startDate instanceof Date ? Timestamp.fromDate(startDate) : startDate;
    const endTimestamp =
      endDate instanceof Date ? Timestamp.fromDate(endDate) : endDate;

    const metricsRef = collection(db, 'userMetrics');
    let q;

    if (startDate && endDate) {
      // Query with date range
      q = query(
        metricsRef,
        where('userId', '==', userId),
        where('type', '==', metricType),
        where('date', '>=', startTimestamp),
        where('date', '<=', endTimestamp),
        orderBy('date', 'desc')
      );
    } else {
      // Query without date range
      q = query(
        metricsRef,
        where('userId', '==', userId),
        where('type', '==', metricType),
        orderBy('date', 'desc')
      );
    }

    const querySnapshot = await getDocs(q);
    const metrics = [];

    querySnapshot.forEach((doc) => {
      metrics.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return metrics;
  } catch (error) {
    console.error(`Error getting ${metricType} metrics by date:`, error);
    return [];
  }
};
