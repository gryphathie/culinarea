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
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './config';

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
    // Get recipe to check if it has an image
    const recipe = await this.getRecipeById(id);
    
    // Delete image from storage if it exists
    if (recipe.imageUrl) {
      try {
        // Extract path from URL or use imagePath if available
        const imagePath = recipe.imagePath || this.extractPathFromUrl(recipe.imageUrl);
        if (imagePath) {
          const imageRef = ref(storage, imagePath);
          await deleteObject(imageRef);
        }
      } catch (error) {
        console.error('Error deleting recipe image:', error);
        // Continue with recipe deletion even if image deletion fails
      }
    }
    
    return await firestoreService.delete('recipes', id);
  },

  // Helper to extract storage path from URL
  extractPathFromUrl(url) {
    try {
      // Firebase Storage URLs typically contain the path after /o/
      const match = url.match(/\/o\/(.+?)\?/);
      if (match) {
        return decodeURIComponent(match[1]);
      }
      return null;
    } catch (error) {
      return null;
    }
  }
};

// Image upload service
export const imageService = {
  // Upload an image file to Firebase Storage
  async uploadRecipeImage(file, recipeId) {
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const fileName = `recipes/${recipeId}_${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      return {
        url: downloadURL,
        path: fileName
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  // Delete an image from Firebase Storage
  async deleteImage(imagePath) {
    try {
      if (!imagePath) return;
      
      const imageRef = ref(storage, imagePath);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
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

// Chat-specific functions
export const chatService = {
  // Chat room categories
  CHAT_CATEGORIES: [
    { id: 'general', name: 'Chat General', icon: '💬', color: '#50B8B8' },
    { id: 'recipes', name: 'Recetas', icon: '🍳', color: '#3A9B9B' },
    { id: 'tips', name: 'Consejos y Trucos', icon: '💡', color: '#2A7A7A' },
    { id: 'questions', name: 'Preguntas', icon: '❓', color: '#50B8B8' },
    { id: 'events', name: 'Eventos', icon: '📅', color: '#3A9B9B' }
  ],

  // Send a message to a chat room
  async sendMessage(roomId, userId, userName, messageText, imageUrl = null) {
    try {
      const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
      const messageData = {
        userId,
        userName,
        text: messageText,
        timestamp: serverTimestamp(),
        createdAt: new Date()
      };
      
      // Add image URL if provided
      if (imageUrl) {
        messageData.imageUrl = imageUrl;
      }
      
      const docRef = await addDoc(messagesRef, messageData);
      return { id: docRef.id, ...messageData };
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  // Upload an image for chat
  async uploadChatImage(file, roomId, userId) {
    try {
      // Create a unique filename
      const timestamp = Date.now();
      const fileName = `chat/${roomId}/${userId}_${timestamp}_${file.name}`;
      const storageRef = ref(storage, fileName);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      return {
        url: downloadURL,
        path: fileName
      };
    } catch (error) {
      console.error('Error uploading chat image:', error);
      throw error;
    }
  },

  // Subscribe to messages in a chat room (real-time updates)
  subscribeToMessages(roomId, callback) {
    const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(messages);
    }, (error) => {
      console.error('Error subscribing to messages:', error);
      callback([]);
    });
  },

  // Get all messages from a chat room (one-time fetch)
  async getMessages(roomId) {
    try {
      const messagesRef = collection(db, 'chatRooms', roomId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'asc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  },

  // Initialize a chat room if it doesn't exist
  async initializeChatRoom(roomId, roomName) {
    try {
      const roomRef = doc(db, 'chatRooms', roomId);
      const roomSnap = await getDoc(roomRef);
      
      if (!roomSnap.exists()) {
        await setDoc(roomRef, {
          id: roomId,
          name: roomName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      return true;
    } catch (error) {
      console.error('Error initializing chat room:', error);
      throw error;
    }
  },

  // Get chat room info
  async getChatRoom(roomId) {
    try {
      return await firestoreService.getById('chatRooms', roomId);
    } catch (error) {
      console.error('Error getting chat room:', error);
      return null;
    }
  }
};
