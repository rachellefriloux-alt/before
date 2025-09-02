/*
 * Sallie 1.0 Module
 * Firebase Services Integration
 * Handles all Firebase services: Auth, Firestore, Storage, Analytics
 */

import { getFirebaseApp } from './firebaseConfigManager';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  getDocs,
  onSnapshot
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

class FirebaseService {
  constructor() {
    this.app = getFirebaseApp();
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);
    this.storage = getStorage(this.app);
    this.currentUser = null;

    // Initialize auth state listener
    this.initAuthStateListener();
  }

  initAuthStateListener() {
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
      // Auth state changed - user signed in/out
    });
  }

  // Authentication Methods
  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signUp(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async signOutUser() {
    try {
      await signOut(this.auth);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  getCurrentUser() {
    return this.currentUser;
  }

  // Firestore Methods
  async saveUserData(userId, data) {
    try {
      await setDoc(doc(this.db, 'users', userId), {
        ...data,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUserData(userId) {
    try {
      const docRef = doc(this.db, 'users', userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return { success: true, data: docSnap.data() };
      } else {
        return { success: false, error: 'User data not found' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async saveConversation(userId, conversation) {
    try {
      const conversationRef = doc(collection(this.db, 'conversations'));
      await setDoc(conversationRef, {
        userId,
        ...conversation,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      return { success: true, id: conversationRef.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUserConversations(userId) {
    try {
      const q = query(collection(this.db, 'conversations'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const conversations = [];

      querySnapshot.forEach((doc) => {
        conversations.push({ id: doc.id, ...doc.data() });
      });

      return { success: true, conversations };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Storage Methods
  async uploadFile(userId, fileUri, fileName) {
    try {
      const storageRef = ref(this.storage, `users/${userId}/${fileName}`);
      const response = await fetch(fileUri);
      const blob = await response.blob();

      const snapshot = await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return { success: true, url: downloadURL, path: snapshot.ref.fullPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async deleteFile(filePath) {
    try {
      const fileRef = ref(this.storage, filePath);
      await deleteObject(fileRef);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Real-time listeners
  listenToUserData(userId, callback) {
    const userDocRef = doc(this.db, 'users', userId);
    return onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        callback({ success: true, data: doc.data() });
      } else {
        callback({ success: false, error: 'User data not found' });
      }
    });
  }

  listenToConversations(userId, callback) {
    const q = query(collection(this.db, 'conversations'), where('userId', '==', userId));
    return onSnapshot(q, (querySnapshot) => {
      const conversations = [];
      querySnapshot.forEach((doc) => {
        conversations.push({ id: doc.id, ...doc.data() });
      });
      callback({ success: true, conversations });
    });
  }
}

// Export singleton instance
const firebaseService = new FirebaseService();
export default firebaseService;
