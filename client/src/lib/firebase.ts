import { initializeApp, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';
import { error as logError } from '@/lib/logger';

// Firebase configuration with environment variables (falls back to direct values if not set)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAHqRau_B38lHhVqHkJJo18AI2KMQEUGj8",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "padel-boyz-league.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://padel-boyz-league-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "padel-boyz-league",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "padel-boyz-league.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "985827253631",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:985827253631:web:889d624b8d1814b8de4e4a"
};

/**
 * Initialize Firebase with proper typing
 */
let app: FirebaseApp;
let database: Database;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
} catch (error) {
  logError('Firebase initialization failed:', error);
  throw new Error('Failed to initialize Firebase. Please check your configuration.');
}

/**
 * Helper function to handle Firebase errors with detailed user-friendly messages
 */
export const handleFirebaseError = (error: any): string => {
  logError('Firebase operation error:', {
    code: error.code,
    message: error.message,
    stack: error.stack
  });
  
  // Comprehensive list of Firebase Realtime Database error codes and user-friendly messages
  const errorMessages: Record<string, string> = {
    // Permission errors
    'PERMISSION_DENIED': 'You don\'t have permission to access this data.',
    
    // Network/connectivity errors
    'NETWORK_ERROR': 'Network connection issue. Please check your internet connection and try again.',
    'UNAVAILABLE': 'The Firebase service is currently unavailable. Please try again later.',
    'DISCONNECTED': 'Your connection to the database was lost. Please check your internet connection.',
    
    // Data errors
    'DATA_STALE': 'The data might be outdated. Please refresh the page.',
    'DATA_OVERWRITE': 'Cannot overwrite existing data.',
    'TRANSACTION_ABORTED': 'The data operation was aborted.',
    
    // Operation errors
    'OPERATION_FAILED': 'The operation failed to complete.',
    'MAX_RETRIES': 'The operation failed after multiple attempts.',
    'OVERRIDDEN_BY_SET': 'This operation was overridden by a conflicting update.',
    
    // Authentication errors
    'EXPIRED_TOKEN': 'Your authentication has expired. Please sign in again.',
    'INVALID_TOKEN': 'Invalid authentication. Please sign in again.',
    'USER_CODE_EXCEPTION': 'An error occurred in the app code. Please contact support.',
    
    // Other errors
    'UNKNOWN': 'An unknown error occurred. Please try again later.',
    'SERVER_ERROR': 'A server error occurred. Please try again later.',
    'QUOTA_EXCEEDED': 'The app has reached its database quota. Please try again later.',
    'APP_DELETED': 'The Firebase app was deleted.',
    'WEB_STORAGE_UNSUPPORTED': 'Your browser does not support local storage, which is required for this app.',
    'INVALID_APP_CREDENTIAL': 'The app\'s credential is no longer valid. Please reload the page.'
  };

  // Extract Firebase error code (format is typically "service/ERROR_CODE")
  let errorCode = 'UNKNOWN';
  
  if (error.code) {
    // Handle both formats: "service/ERROR_CODE" or just "ERROR_CODE"
    errorCode = error.code.includes('/') ? error.code.split('/')[1] : error.code;
    errorCode = errorCode.toUpperCase(); // Normalize to uppercase
  }
  
  // Get the appropriate user-friendly message or use the error message
  const userMessage = errorMessages[errorCode] || `Error: ${error.message || 'Something went wrong'}`;
  
  // For development, append the error code for debugging
  if (import.meta.env.MODE === 'development') {
    return `${userMessage} (Code: ${error.code || 'unknown'})`;
  }
  
  return userMessage;
};

/**
 * Utility to check if Firebase is initialized properly
 */
export const isFirebaseInitialized = (): boolean => {
  return !!app && !!database;
};

export { app, database };
