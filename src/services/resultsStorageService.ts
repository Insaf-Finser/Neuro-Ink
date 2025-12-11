import { DrawingValidationResult } from './drawingValidationService';
import { AIAnalysisResult } from './aiAnalysisService';

export interface StoredTestResult {
  testName: string;
  userId: string;
  completedAt: string; // ISO string
  durationMs: number;
  validation?: DrawingValidationResult | null;
  aiResult?: AIAnalysisResult | null;
  features?: Record<string, number> | null;
}

const STORAGE_KEY_PREFIX = 'neuroink.results.';

function getUserKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}${userId}`;
}

function getUserId() {
  // Basic placeholder; replace with real user identity when available
  return localStorage.getItem('currentUserId') || 'guest';
}

export function saveTestResult(result: Omit<StoredTestResult, 'userId' | 'completedAt'>) {
  const userId = getUserId();
  const key = getUserKey(userId);
  const existing: StoredTestResult[] = JSON.parse(localStorage.getItem(key) || '[]');
  const entry: StoredTestResult = {
    ...result,
    userId,
    completedAt: new Date().toISOString()
  };
  const updated = [...existing, entry];
  localStorage.setItem(key, JSON.stringify(updated));
  return entry;
}

export function getTestResults(userId?: string): StoredTestResult[] {
  const id = userId || getUserId();
  const key = getUserKey(id);
  return JSON.parse(localStorage.getItem(key) || '[]');
}

export function clearTestResults(userId?: string) {
  const id = userId || getUserId();
  const key = getUserKey(id);
  localStorage.removeItem(key);
}


