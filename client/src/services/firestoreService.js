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
    serverTimestamp
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
          await addDoc(collection(db, 'users'), {
            uid,
            ...userData,
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
  
  // Meal-related functions
  export const addMeal = async (userId, mealData) => {
    try {
      console.log('Adding meal for user:', userId);
      console.log('Meal data:', mealData);
      
      if (!userId) {
        console.error('Attempted to add meal without userId');
        throw new Error('User ID is required to add a meal');
      }
      
      const mealsRef = collection(db, 'meals');
      // Process the meal data with consistent precision
      const mealToAdd = {
        userId,
        ...mealData,
        // Ensure numeric values are stored as numbers with consistent precision
        calories: Math.round(Number(mealData.calories) || 0),
        protein: Math.round((Number(mealData.protein) || 0) * 10) / 10,
        carbs: Math.round((Number(mealData.carbs) || 0) * 10) / 10,
        fat: Math.round((Number(mealData.fat) || 0) * 10) / 10,
        createdAt: serverTimestamp()
      };
      
      console.log('Final meal data to save:', mealToAdd);
      
      const docRef = await addDoc(mealsRef, mealToAdd);
      console.log('Meal added successfully with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error adding meal:', error);
      throw error;
    }
  };
  
  export const getUserMeals = async (userId) => {
    try {
      if (!userId) {
        console.error('getUserMeals called with null or undefined userId');
        return [];
      }
      
      console.log('Fetching meals for user:', userId);
      
      const mealsRef = collection(db, 'meals');
      
      // Create query using the composite index defined in firestore.indexes.json
      const q = query(
        mealsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      console.log('Executing query with index...');
      const querySnapshot = await getDocs(q);
      console.log(`Found ${querySnapshot.size} meals for user ${userId}`);
      
      const meals = [];
      
      // Process each document
      querySnapshot.forEach((doc) => {
        try {
          const mealData = doc.data();
          
          // Add ID to the data
          const processedMeal = { 
            id: doc.id,
            ...mealData 
          };
          
          // Push the processed meal to our array
          meals.push(processedMeal);
        } catch (error) {
          console.error('Error processing meal document:', error);
        }
      });
      
      return meals;
    } catch (error) {
      console.error('Error getting user meals:', error);
      
      // If we hit a missing index error, provide clear instructions
      if (error.code === 'failed-precondition' && error.message.includes('index')) {
        console.error('Missing Firestore index. Please deploy the index defined in firestore.indexes.json');
        console.error('Run: firebase deploy --only firestore:indexes');
      }
      
      // Fallback to a simpler query as a last resort
      try {
        // Define mealsRef again in this scope for the fallback
        const mealsRef = collection(db, 'meals');
        
        console.log('Trying fallback query without ordering...');
        const fallbackQuery = query(
          mealsRef,
          where('userId', '==', userId)
        );
        
        const fallbackSnapshot = await getDocs(fallbackQuery);
        console.log(`Fallback query found ${fallbackSnapshot.size} meals`);
        
        const fallbackMeals = [];
        fallbackSnapshot.forEach((doc) => {
          fallbackMeals.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        // Sort client-side instead
        fallbackMeals.sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || a.date || new Date(0);
          const dateB = b.createdAt?.toDate?.() || b.date || new Date(0);
          return dateB - dateA;
        });
        
        return fallbackMeals;
      } catch (fallbackError) {
        console.error('Fallback query also failed:', fallbackError);
        return [];
      }
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