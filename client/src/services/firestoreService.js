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
    setDoc
  } from 'firebase/firestore';
  import { db } from '../firebase/config';
  
  // User-related functions
  export const createUserProfile = async (uid, userData) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp()
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
              heightUnit: 'cm'
            },
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
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
        updatedAt: serverTimestamp()
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
        updatedAt: serverTimestamp()
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
        
        // Source and metadata
        source: mealData.source || 'user-created',
        sourceDetails: mealData.sourceDetails || {},
        
        createdAt: serverTimestamp(),
        createdBy: mealData.createdBy || null,
        updatedAt: serverTimestamp(),
        updatedBy: mealData.updatedBy || null
      };
      
      console.log('Final meal definition to save:', mealToAdd);
      
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
          ...mealSnap.data()
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
        updatedAt: serverTimestamp()
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
  export const addMealToDiary = async (userId, mealId, amount, category = 'uncategorized') => {
    try {
      console.log('Adding meal to diary for user:', userId);
      console.log('Meal details:', { mealId, amount, category, categoryType: typeof category });
      
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
      const validCategories = ['breakfast', 'lunch', 'dinner', 'snack', 'uncategorized'];
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
        createdAt: serverTimestamp()
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
          source: 'user-created',
          createdBy: userId
        };
        
        mealId = await createMeal(mealToCreate);
      }
      
      // Make sure the category is valid and not empty
      const category = mealData.category && typeof mealData.category === 'string' && mealData.category.trim() !== '' 
        ? mealData.category.trim().toLowerCase() 
        : 'uncategorized';
      
      console.log(`Adding meal to diary with category: ${category}`);
      
      // Then add it to the user's diary
      return await addMealToDiary(
        userId, 
        mealId, 
        mealData.amount || 100, 
        category
      );
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
        // Convert date to timestamp range (start of day to end of day)
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
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
          protein: Math.round((meal.protein * entryData.multiplier) * 10) / 10,
          carbs: Math.round((meal.carbs * entryData.multiplier) * 10) / 10,
          fat: Math.round((meal.fat * entryData.multiplier) * 10) / 10,
          fiber: Math.round((meal.fiber || 0) * entryData.multiplier * 10) / 10,
          sugar: Math.round((meal.sugar || 0) * entryData.multiplier * 10) / 10,
          sodium: Math.round((meal.sodium || 0) * entryData.multiplier),
          mealId: entryData.mealId
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
        breakfast: entries.filter(entry => entry.category === 'breakfast'),
        lunch: entries.filter(entry => entry.category === 'lunch'),
        dinner: entries.filter(entry => entry.category === 'dinner'),
        snack: entries.filter(entry => entry.category === 'snack'),
        uncategorized: entries.filter(entry => 
          entry.category === 'uncategorized' || 
          !['breakfast', 'lunch', 'dinner', 'snack'].includes(entry.category)
        )
      };
    } catch (error) {
      console.error('Error getting diary entries by category:', error);
      return {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: [],
        uncategorized: []
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
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating diary entry:', error);
      throw error;
    }
  };
  
  export const deleteDiaryEntry = async (entryId) => {
    try {
      const entryRef = doc(db, 'userMeals', entryId);
      await deleteDoc(entryRef);
      return true;
    } catch (error) {
      console.error('Error deleting diary entry:', error);
      throw error;
    }
  };
  
  // For backward compatibility
  export const getUserMeals = async (userId) => {
    console.warn('getUserMeals is deprecated. Use getUserDiaryEntries instead.');
    return getUserDiaryEntries(userId);
  };
  
  // For backward compatibility
  export const getUserMealsByDate = async (userId, date) => {
    console.warn('getUserMealsByDate is deprecated. Use getUserDiaryEntries with date instead.');
    return getUserDiaryEntries(userId, date);
  };
  
  // User Metrics functions (weight, sleep, exercise)
  export const addUserMetric = async (userId, metricData) => {
    try {
      if (!userId) {
        throw new Error('User ID is required to add a metric');
      }
      
      const metricsRef = collection(db, 'userMetrics');
      const metricToAdd = {
        userId,
        ...metricData,
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(metricsRef, metricToAdd);
      
      // Update user streak when a new metric is added
      await updateUserStreak(userId);
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding user metric:', error);
      throw error;
    }
  };
  
  export const getUserMetrics = async (userId, type = null) => {
    try {
      if (!userId) {
        return [];
      }
      
      const metricsRef = collection(db, 'userMetrics');
      
      let q;
      if (type) {
        // Query for specific metric type
        q = query(
          metricsRef,
          where('userId', '==', userId),
          where('type', '==', type),
          orderBy('date', 'desc')
        );
      } else {
        // Query for all metrics
        q = query(
          metricsRef,
          where('userId', '==', userId),
          orderBy('date', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(q);
      
      const metrics = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Safely handle date conversion
        let processedDate = null;
        if (data.date) {
          try {
            if (typeof data.date.toDate === 'function') {
              processedDate = data.date.toDate();
            } else if (data.date instanceof Date) {
              processedDate = data.date;
            } else {
              processedDate = new Date(data.date);
            }
          } catch (error) {
            console.error("Error processing date in getUserMetrics:", error);
          }
        }
        
        metrics.push({
          id: doc.id,
          ...data,
          date: processedDate
        });
      });
      
      return metrics;
    } catch (error) {
      console.error('Error getting user metrics:', error);
      return [];
    }
  };
  
  export const getUserMetricsByDate = async (userId, date) => {
    try {
      if (!userId) {
        return [];
      }
      
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      const metricsRef = collection(db, 'userMetrics');
      const q = query(
        metricsRef,
        where('userId', '==', userId),
        where('date', '>=', Timestamp.fromDate(startOfDay)),
        where('date', '<=', Timestamp.fromDate(endOfDay))
      );
      
      const querySnapshot = await getDocs(q);
      
      const metrics = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Safely handle date conversion
        let processedDate = null;
        if (data.date) {
          try {
            if (typeof data.date.toDate === 'function') {
              processedDate = data.date.toDate();
            } else if (data.date instanceof Date) {
              processedDate = data.date;
            } else {
              processedDate = new Date(data.date);
            }
          } catch (error) {
            console.error("Error processing date in getUserMetricsByDate:", error);
          }
        }
        
        metrics.push({
          id: doc.id,
          ...data,
          date: processedDate
        });
      });
      
      return metrics;
    } catch (error) {
      console.error('Error getting user metrics by date:', error);
      return [];
    }
  };
  
  export const getLatestUserMetric = async (userId, type) => {
    try {
      if (!userId) {
        return null;
      }
      
      const metrics = await getUserMetrics(userId, type);
      return metrics.length > 0 ? metrics[0] : null;
    } catch (error) {
      console.error('Error getting latest user metric:', error);
      return null;
    }
  };
  
  export const getMetricsByTypeAndDate = async (userId, date) => {
    try {
      const metrics = await getUserMetricsByDate(userId, date);
      
      // Group metrics by type
      return {
        weight: metrics.filter(metric => metric.type === 'weight'),
        sleep: metrics.filter(metric => metric.type === 'sleep'),
        exercise: metrics.filter(metric => metric.type === 'exercise')
      };
    } catch (error) {
      console.error('Error getting metrics by type and date:', error);
      return {
        weight: [],
        sleep: [],
        exercise: []
      };
    }
  };
  
  export const updateUserMetric = async (metricId, metricData) => {
    try {
      const metricRef = doc(db, 'userMetrics', metricId);
      await updateDoc(metricRef, {
        ...metricData,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating user metric:', error);
      throw error;
    }
  };
  
  export const deleteUserMetric = async (metricId) => {
    try {
      const metricRef = doc(db, 'userMetrics', metricId);
      await deleteDoc(metricRef);
      return true;
    } catch (error) {
      console.error('Error deleting user metric:', error);
      throw error;
    }
  };
  
  // Weight tracking
  export const trackWeight = async (userId, weight, unit = 'kg') => {
    return addUserMetric(userId, {
      type: 'weight',
      date: Timestamp.fromDate(new Date()),
      value: Number(weight),
      details: {
        unit
      }
    });
  };
  
  // Sleep tracking
  export const trackSleep = async (userId, bedtime, wakeup, quality) => {
    // Calculate sleep duration in minutes
    const sleepStart = new Date(bedtime);
    const sleepEnd = new Date(wakeup);
    
    // Handle overnight sleep (when end time is earlier than start time)
    let durationMs = sleepEnd - sleepStart;
    if (durationMs < 0) {
      // If negative, assume sleep is overnight and add a day worth of milliseconds
      durationMs += 24 * 60 * 60 * 1000;
    }
    
    // Ensure we have a positive duration
    const durationMinutes = Math.max(0, Math.floor(durationMs / (1000 * 60)));
    
    console.log(`Sleep tracking: Start=${sleepStart}, End=${sleepEnd}, Duration=${durationMinutes} minutes`);
    
    return addUserMetric(userId, {
      type: 'sleep',
      date: Timestamp.fromDate(new Date()),
      value: durationMinutes,
      details: {
        bedtime: Timestamp.fromDate(sleepStart),
        wakeup: Timestamp.fromDate(sleepEnd),
        quality: Number(quality)
      }
    });
  };
  
  // Exercise tracking
  export const trackExercise = async (userId, category, duration, intensity, caloriesBurned = 0) => {
    try {
      console.log('Tracking exercise for user:', userId);
      console.log('Exercise data:', { category, duration, intensity, caloriesBurned });
      
      if (!userId) {
        console.error('Attempted to track exercise without userId');
        throw new Error('User ID is required to track exercise');
      }
      
      const metricId = await addUserMetric(userId, {
        type: 'exercise',
        date: Timestamp.fromDate(new Date()),
        value: Number(duration), // duration in minutes
        details: {
          category,
          intensity, // "low", "moderate", "high", "very high"
          calories: Number(caloriesBurned),
          duration: Number(duration)
        }
      });
      
      console.log('Exercise tracked successfully with ID:', metricId);
      return metricId;
    } catch (error) {
      console.error('Error tracking exercise:', error);
      throw error;
    }
  };
  
  // User streak management
  export const getUserStreak = async (userId) => {
    try {
      if (!userId) {
        return null;
      }
      
      const streakRef = doc(db, 'userStreaks', userId);
      const streakDoc = await getDoc(streakRef);
      
      if (streakDoc.exists()) {
        const data = streakDoc.data();
        
        // Safely handle lastActive date conversion
        let lastActive = null;
        if (data.lastActive) {
          try {
            if (typeof data.lastActive.toDate === 'function') {
              lastActive = data.lastActive.toDate();
            } else if (data.lastActive instanceof Date) {
              lastActive = data.lastActive;
            } else {
              lastActive = new Date(data.lastActive);
            }
          } catch (error) {
            console.error("Error processing lastActive date:", error);
          }
        }
        
        return {
          ...data,
          lastActive: lastActive
        };
      } else {
        return {
          userId,
          currentStreak: 0,
          longestStreak: 0,
          lastActive: null
        };
      }
    } catch (error) {
      console.error('Error getting user streak:', error);
      return null;
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
          updatedAt: serverTimestamp()
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
          updatedAt: serverTimestamp()
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
        console.error("Error processing lastActive date in updateUserStreak:", error);
        // Create a new streak starting today
        await setDoc(streakRef, {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActive: Timestamp.fromDate(today),
          updatedAt: serverTimestamp()
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
        updatedAt: serverTimestamp()
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
        cachedAt: serverTimestamp()
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
          ...doc.data()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting cached food data:', error);
      throw error;
    }
  };