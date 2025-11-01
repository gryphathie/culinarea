// Firebase utility functions
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit 
} from 'firebase/firestore';
import { db } from './config';

// Generic CRUD operations
export const firestoreService = {
  // Create a new document
  async create(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  },

  // Read all documents from a collection
  async getAll(collectionName) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting documents:', error);
      throw error;
    }
  },

  // Read a single document by ID
  async getById(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('Document not found');
      }
    } catch (error) {
      console.error('Error getting document:', error);
      throw error;
    }
  },

  // Update a document
  async update(collectionName, id, data) {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      });
      return { id, ...data };
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  // Delete a document
  async delete(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return { id };
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  // Query documents with filters
  async query(collectionName, filters = [], orderByField = null, orderDirection = 'asc', limitCount = null) {
    try {
      let q = collection(db, collectionName);
      
      // Apply filters
      filters.forEach(filter => {
        q = query(q, where(filter.field, filter.operator, filter.value));
      });
      
      // Apply ordering
      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection));
      }
      
      // Apply limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error querying documents:', error);
      throw error;
    }
  }
};

// Recipe-specific functions
export const recipeService = {
  // Get all recipes
  async getAllRecipes() {
    return await firestoreService.getAll('recipes');
  },

  // Get recipes by type
  async getRecipesByType(type) {
    return await firestoreService.query('recipes', [
      { field: 'type', operator: '==', value: type }
    ]);
  },

  // Get recipes by difficulty
  async getRecipesByDifficulty(difficulty) {
    return await firestoreService.query('recipes', [
      { field: 'difficulty', operator: '==', value: difficulty }
    ]);
  },

  // Get recipes by type and difficulty
  async getRecipesByTypeAndDifficulty(type, difficulty) {
    return await firestoreService.query('recipes', [
      { field: 'type', operator: '==', value: type },
      { field: 'difficulty', operator: '==', value: difficulty }
    ]);
  },

  // Create a new recipe
  async createRecipe(recipeData) {
    return await firestoreService.create('recipes', recipeData);
  },

  // Get a recipe by ID
  async getRecipeById(id) {
    return await firestoreService.getById('recipes', id);
  },

  // Update a recipe
  async updateRecipe(id, recipeData) {
    return await firestoreService.update('recipes', id, recipeData);
  },

  // Delete a recipe
  async deleteRecipe(id) {
    return await firestoreService.delete('recipes', id);
  }
};

// User-specific functions
export const userService = {
  // Get user profile
  async getUserProfile(userId) {
    return await firestoreService.getById('users', userId);
  },

  // Create user profile
  async createUserProfile(userId, profileData) {
    try {
      const docRef = doc(db, 'users', userId);
      await setDoc(docRef, {
        userId,
        ...profileData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { id: userId, userId, ...profileData };
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  },

  // Update user profile
  async updateUserProfile(userId, profileData) {
    return await firestoreService.update('users', userId, profileData);
  },

  // Check if user is admin
  async isAdmin(userId) {
    try {
      const profile = await firestoreService.getById('users', userId);
      return profile?.role === 'admin' || profile?.role === 'propietary';
    } catch (error) {
      return false;
    }
  },

  // Check if user is admin specifically (not propietary)
  async isAdminOnly(userId) {
    try {
      const profile = await firestoreService.getById('users', userId);
      return profile?.role === 'admin';
    } catch (error) {
      return false;
    }
  },

  // Check if user is propietary
  async isPropietary(userId) {
    try {
      const profile = await firestoreService.getById('users', userId);
      return profile?.role === 'propietary';
    } catch (error) {
      return false;
    }
  },

  // Get user role
  async getUserRole(userId) {
    try {
      const profile = await firestoreService.getById('users', userId);
      return profile?.role || null;
    } catch (error) {
      return null;
    }
  }
};
