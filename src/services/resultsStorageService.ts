import { DrawingValidationResult } from './drawingValidationService';
import { AIAnalysisResult } from './aiAnalysisService';
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { getTaskIdFromTestName } from '../utils/testTaskMapping';

export interface StoredTestResult {
  testName: string;
  taskId?: string; // Task ID for progress tracking
  userId: string;
  completedAt: string; // ISO string
  durationMs: number;
  validation?: DrawingValidationResult | null;
  aiResult?: AIAnalysisResult | null;
  features?: Record<string, number> | null;
  // Firestore document ID (optional, added when fetched from Firestore)
  id?: string;
}

const STORAGE_KEY_PREFIX = 'neuroink.results.';

function getUserKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

/**
 * Gets the current user ID from Firebase Auth or falls back to guest
 * This should be called from components that have access to auth context
 */
export function getUserId(): string {
  // Try to get from Firebase Auth first
  if (auth.currentUser?.uid) {
    return auth.currentUser.uid;
  }
  // Try to get from localStorage (set by AuthContext)
  const storedUserId = localStorage.getItem('currentUserId');
  if (storedUserId) {
    return storedUserId;
  }
  // Fallback to guest for backward compatibility
  return 'guest';
}

/**
 * Sets the current user ID (called by AuthContext on auth state change)
 */
export function setUserId(userId: string | null) {
  if (userId) {
    localStorage.setItem('currentUserId', userId);
  } else {
    localStorage.removeItem('currentUserId');
  }
}

/**
 * Converts Firestore timestamp to ISO string
 */
function timestampToISO(timestamp: any): string {
  if (timestamp?.toDate) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  return new Date().toISOString();
}

/**
 * Saves a test result to Firestore (for authenticated users) and localStorage (as fallback/cache)
 */
export async function saveTestResult(
  result: Omit<StoredTestResult, 'userId' | 'completedAt'>, 
  userId?: string
): Promise<StoredTestResult> {
  const id = userId || getUserId();
  const completedAt = new Date().toISOString();
  
  // Automatically map testName to taskId if not provided
  const taskId = result.taskId || getTaskIdFromTestName(result.testName) || undefined;
  
  const entry: StoredTestResult = {
    ...result,
    taskId,
    userId: id,
    completedAt
  };

  // Always save to localStorage for offline access and guest users
  const key = getUserKey(id);
  const existing: StoredTestResult[] = JSON.parse(localStorage.getItem(key) || '[]');
  const updated = [...existing, entry];
  localStorage.setItem(key, JSON.stringify(updated));

  // Save to Firestore if user is authenticated
  const user = auth.currentUser;
  if (user && id !== 'guest') {
    try {
      const testResultsRef = collection(db, 'users', user.uid, 'testResults');
      const docRef = await addDoc(testResultsRef, {
        ...result,
        taskId,
        userId: user.uid,
        completedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      // Add Firestore document ID to entry
      entry.id = docRef.id;
      // Update localStorage with the ID
      const updatedWithId = updated.map((r, idx) => 
        idx === updated.length - 1 ? { ...r, id: docRef.id } : r
      );
      localStorage.setItem(key, JSON.stringify(updatedWithId));
    } catch (error) {
      console.error('Error saving test result to Firestore:', error);
      // Continue even if Firestore save fails (localStorage is already saved)
    }
  }

  return entry;
}

/**
 * Fetches test results from Firestore (for authenticated users) or localStorage (fallback)
 */
export async function getTestResults(userId?: string): Promise<StoredTestResult[]> {
  const id = userId || getUserId();
  
  // Try Firestore first for authenticated users
  const user = auth.currentUser;
  if (user && id !== 'guest') {
    try {
      const testResultsRef = collection(db, 'users', user.uid, 'testResults');
      const q = query(testResultsRef, orderBy('completedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const results: StoredTestResult[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        results.push({
          testName: data.testName,
          taskId: data.taskId || getTaskIdFromTestName(data.testName) || undefined,
          userId: data.userId || user.uid,
          completedAt: timestampToISO(data.completedAt),
          durationMs: data.durationMs || 0,
          validation: data.validation || null,
          aiResult: data.aiResult || null,
          features: data.features || null,
          id: docSnap.id
        });
      });

      // Sync to localStorage for offline access
      const key = getUserKey(id);
      localStorage.setItem(key, JSON.stringify(results));
      
      return results;
    } catch (error) {
      console.error('Error fetching test results from Firestore:', error);
      // Fall through to localStorage fallback
    }
  }

  // Fallback to localStorage
  const key = getUserKey(id);
  return JSON.parse(localStorage.getItem(key) || '[]');
}

/**
 * Gets completed task IDs from test results
 */
export async function getCompletedTaskIds(userId?: string): Promise<string[]> {
  const results = await getTestResults(userId);
  const taskIds = new Set<string>();
  
  results.forEach(result => {
    if (result.taskId) {
      taskIds.add(result.taskId);
    }
  });
  
  return Array.from(taskIds);
}

/**
 * Clears test results from both Firestore and localStorage
 */
export async function clearTestResults(userId?: string): Promise<void> {
  const id = userId || getUserId();
  
  // Clear from localStorage
  const key = getUserKey(id);
  localStorage.removeItem(key);

  // Clear from Firestore if user is authenticated
  const user = auth.currentUser;
  if (user && id !== 'guest') {
    try {
      const testResultsRef = collection(db, 'users', user.uid, 'testResults');
      const querySnapshot = await getDocs(testResultsRef);
      
      const deletePromises = querySnapshot.docs.map((docSnap) => 
        deleteDoc(doc(db, 'users', user.uid, 'testResults', docSnap.id))
      );
      
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error clearing test results from Firestore:', error);
      // Continue even if Firestore clear fails
    }
  }
}


