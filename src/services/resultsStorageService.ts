import { DrawingValidationResult } from './drawingValidationService';
import { AIAnalysisResult } from './aiAnalysisService';
import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { getTaskIdFromTestName } from '../utils/testTaskMapping';
import { DiseaseType } from '../context/DiseaseContext';

const ALZHEIMERS_RESULTS_COLLECTION = 'testResults';
const PARKINSONS_RESULTS_COLLECTION = 'testResultsParkinsons';

export interface StoredTestResult {
  testName: string;
  taskId?: string; // Task ID for progress tracking
  userId: string;
  completedAt: string; // ISO string
  durationMs: number;
  validation?: DrawingValidationResult | null;
  aiResult?: AIAnalysisResult | null;
  features?: Record<string, number> | null;
  disease?: 'alzheimers' | 'parkinsons'; // Disease type (defaults to 'alzheimers' for backward compatibility)
  // Firestore document ID (optional, added when fetched from Firestore)
  id?: string;
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

function collectionForDisease(disease: DiseaseType): string {
  return disease === 'parkinsons' ? PARKINSONS_RESULTS_COLLECTION : ALZHEIMERS_RESULTS_COLLECTION;
}

/**
 * Saves a test result to Firestore only (authenticated user required)
 */
export async function saveTestResult(
  result: Omit<StoredTestResult, 'userId' | 'completedAt'>, 
  userId?: string,
  disease?: DiseaseType
): Promise<StoredTestResult> {
  const requestedUserId = userId || getUserId();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Authenticated user required to save test results.');
  }
  if (requestedUserId !== 'guest' && requestedUserId !== user.uid) {
    throw new Error('User mismatch while saving test results.');
  }

  const completedAt = new Date().toISOString();
  
  // Automatically map testName to taskId if not provided
  const taskId = result.taskId || getTaskIdFromTestName(result.testName) || undefined;
  
  // Default to 'alzheimers' for backward compatibility if disease not provided
  const diseaseType: DiseaseType = disease || result.disease || 'alzheimers';
  
  const entry: StoredTestResult = {
    ...result,
    taskId,
    userId: user.uid,
    completedAt,
    disease: diseaseType
  };

  const targetCollection = collectionForDisease(diseaseType);
  const diseaseResultsRef = collection(db, 'users', user.uid, targetCollection);
  const firestorePayload = {
    ...result,
    taskId,
    userId: user.uid,
    disease: diseaseType,
    completedAt: serverTimestamp(),
    createdAt: serverTimestamp()
  };
  const sanitizedPayload = Object.fromEntries(
    Object.entries(firestorePayload).filter(([, value]) => value !== undefined)
  );
  const docRef = await addDoc(diseaseResultsRef, sanitizedPayload);
  entry.id = docRef.id;
  console.log(`Results saved to Firestore for user ${user.uid}`);

  return entry;
}

/**
 * Fetches test results from Firestore only (authenticated user required)
 */
export async function getTestResults(userId?: string): Promise<StoredTestResult[]> {
  const requestedUserId = userId || getUserId();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Authenticated user required to fetch test results.');
  }
  if (requestedUserId !== 'guest' && requestedUserId !== user.uid) {
    throw new Error('User mismatch while fetching test results.');
  }

  const fetchCollectionResults = async (
    collectionName: string,
    fallbackDisease: DiseaseType
  ): Promise<StoredTestResult[]> => {
    const resultsRef = collection(db, 'users', user.uid, collectionName);
    const q = query(resultsRef, orderBy('completedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const results: StoredTestResult[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const diseaseType: DiseaseType = data.disease || fallbackDisease;
      results.push({
        testName: data.testName,
        taskId: data.taskId || getTaskIdFromTestName(data.testName) || undefined,
        userId: data.userId || user.uid,
        completedAt: timestampToISO(data.completedAt),
        durationMs: data.durationMs || 0,
        validation: data.validation || null,
        aiResult: data.aiResult || null,
        features: data.features || null,
        disease: diseaseType,
        id: docSnap.id
      });
    });
    return results;
  };

  const [alzheimersResults, parkinsonsResults] = await Promise.all([
    fetchCollectionResults(ALZHEIMERS_RESULTS_COLLECTION, 'alzheimers'),
    fetchCollectionResults(PARKINSONS_RESULTS_COLLECTION, 'parkinsons')
  ]);

  const merged = [...alzheimersResults, ...parkinsonsResults].sort(
    (a, b) => (Date.parse(b.completedAt) || 0) - (Date.parse(a.completedAt) || 0)
  );

  console.log(`Fetched ${merged.length} results from Firestore for user ${user.uid}`);
  return merged;
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
 * Clears test results from Firestore only (authenticated user required)
 */
export async function clearTestResults(userId?: string): Promise<void> {
  const requestedUserId = userId || getUserId();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Authenticated user required to clear test results.');
  }
  if (requestedUserId !== 'guest' && requestedUserId !== user.uid) {
    throw new Error('User mismatch while clearing test results.');
  }

  const clearCollection = async (collectionName: string) => {
    const testResultsRef = collection(db, 'users', user.uid, collectionName);
    const querySnapshot = await getDocs(testResultsRef);
    const deletePromises = querySnapshot.docs.map((docSnap) =>
      deleteDoc(doc(db, 'users', user.uid, collectionName, docSnap.id))
    );
    await Promise.all(deletePromises);
  };

  await Promise.all([
    clearCollection(ALZHEIMERS_RESULTS_COLLECTION),
    clearCollection(PARKINSONS_RESULTS_COLLECTION)
  ]);
}


