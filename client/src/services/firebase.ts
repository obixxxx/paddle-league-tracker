import { 
  ref, 
  get, 
  set, 
  push, 
  update, 
  remove, 
  query, 
  orderByChild, 
  equalTo,
  onValue,
  DatabaseReference,
  DataSnapshot 
} from 'firebase/database';
import { database } from '@/lib/firebase';
import { error as logError } from '@/lib/logger';

/**
 * Firebase service with utility functions for database operations
 * Uses Firebase SDK v9 syntax
 */

// Create a reference to a database path
export const createRef = (path: string): DatabaseReference => {
  return ref(database, path);
};

// Generic read operation
export const getData = async <T>(path: string): Promise<T | null> => {
  try {
    const dataRef = createRef(path);
    const snapshot = await get(dataRef);
    return snapshot.exists() ? (snapshot.val() as T) : null;
  } catch (error) {
    logError(`Error fetching data from ${path}:`, error);
    throw error;
  }
};

// Generic create operation
export const createData = async <T>(path: string, data: T): Promise<string> => {
  try {
    const dataRef = createRef(path);
    const newRef = push(dataRef);
    await set(newRef, data);
    return newRef.key || '';
  } catch (error) {
    logError(`Error creating data at ${path}:`, error);
    throw error;
  }
};

// Generic update operation
export const updateData = async <T>(path: string, data: Partial<T>): Promise<void> => {
  try {
    const dataRef = createRef(path);
    await update(dataRef, data as object);
  } catch (error) {
    logError(`Error updating data at ${path}:`, error);
    throw error;
  }
};

// Generic delete operation
export const deleteData = async (path: string): Promise<void> => {
  try {
    const dataRef = createRef(path);
    await remove(dataRef);
  } catch (error) {
    logError(`Error deleting data at ${path}:`, error);
    throw error;
  }
};

// Query by a specific child value
export const queryByChild = async <T>(
  path: string, 
  childKey: string, 
  childValue: string | number | boolean
): Promise<T[]> => {
  try {
    const dataRef = createRef(path);
    const queryRef = query(dataRef, orderByChild(childKey), equalTo(childValue));
    const snapshot = await get(queryRef);
    
    const results: T[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        results.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        } as T);
      });
    }
    
    return results;
  } catch (error) {
    logError(`Error querying data at ${path} by ${childKey}=${childValue}:`, error);
    throw error;
  }
};

// Subscribe to real-time updates
export const subscribeToData = <T>(
  path: string,
  callback: (data: T | null) => void
): (() => void) => {
  const dataRef = createRef(path);
  
  const unsubscribe = onValue(dataRef, (snapshot) => {
    const data = snapshot.exists() ? (snapshot.val() as T) : null;
    callback(data);
  }, (error) => {
    logError(`Error in subscription to ${path}:`, error);
  });
  
  // Return unsubscribe function
  return unsubscribe;
};

// Handle DataSnapshot conversion to array
export const snapshotToArray = <T>(snapshot: DataSnapshot): T[] => {
  const result: T[] = [];
  
  snapshot.forEach((childSnapshot) => {
    result.push({
      id: childSnapshot.key,
      ...childSnapshot.val()
    } as T);
  });
  
  return result;
};