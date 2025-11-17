// Lightweight IndexedDB wrapper for session storage

export interface StoredSession {
  id: string;
  testType: string;
  taskId?: string;
  taskName?: string;
  category?: string;
  difficulty?: string;
  timeLimit?: number;
  completed?: boolean;
  startedAt?: number;
  completedAt?: number;
  elapsedTime?: number;
  strokes?: Array<{
    points: Array<{ x: number; y: number; pressure: number; timestamp: number; tiltX?: number; tiltY?: number; rotation?: number }>;
    startTime: number;
    endTime: number;
  }>;
  results?: {
    overallRisk: 'low' | 'moderate' | 'high';
    probability: number;
    testScores?: {
      clockDrawing: number;
      wordRecall: number;
      imageAssociation: number;
      selectionMemory: number;
    };
    biomarkers?: {
      pressure: number;
      spatialAccuracy: number;
      temporalConsistency: number;
      cognitiveLoad: number;
    };
    recommendations?: string[];
  };
  aiAnalysis?: {
    modelVersion: string;
    confidence: number;
    features: Record<string, number>;
    analysisTimestamp: number;
  };
  createdAt: number;
  timestamp: number;
  data: unknown;
}

const DB_NAME = 'assessmentSessionsDB';
const STORE_NAME = 'sessions';
const DB_VERSION = 1;

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function saveSession(session: StoredSession): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(session);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getSessions(): Promise<StoredSession[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as StoredSession[]);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteSession(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearSessions(): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function exportSessions(): Promise<Blob> {
  const sessions = await getSessions();
  const data = JSON.stringify(sessions);
  return new Blob([data], { type: 'application/json' });
}

// Task completion and progress tracking
export async function markTaskCompleted(taskId: string, completionData: {
  taskName: string;
  category: string;
  difficulty: string;
  timeLimit: number;
  elapsedTime: number;
  strokes: Array<{
    points: Array<{ x: number; y: number; pressure: number; timestamp: number; tiltX?: number; tiltY?: number; rotation?: number }>;
    startTime: number;
    endTime: number;
  }>;
  results?: {
    overallRisk: 'low' | 'moderate' | 'high';
    probability: number;
    testScores?: {
      clockDrawing: number;
      wordRecall: number;
      imageAssociation: number;
      selectionMemory: number;
    };
    biomarkers?: {
      pressure: number;
      spatialAccuracy: number;
      temporalConsistency: number;
      cognitiveLoad: number;
    };
    recommendations?: string[];
  };
  aiAnalysis?: {
    modelVersion: string;
    confidence: number;
    features: Record<string, number>;
    analysisTimestamp: number;
  };
}): Promise<void> {
  const sessionId = `task_${taskId}_${Date.now()}`;
  const session: StoredSession = {
    id: sessionId,
    testType: 'handwriting_task',
    taskId,
    taskName: completionData.taskName,
    category: completionData.category,
    difficulty: completionData.difficulty,
    timeLimit: completionData.timeLimit,
    completed: true,
    startedAt: Date.now() - completionData.elapsedTime,
    completedAt: Date.now(),
    elapsedTime: completionData.elapsedTime,
    strokes: completionData.strokes,
    results: completionData.results,
    aiAnalysis: completionData.aiAnalysis,
    createdAt: Date.now(),
    timestamp: Date.now(),
    data: {
      taskCompletion: true,
      completionData
    }
  };
  
  await saveSession(session);
}

// Get task completion statistics
export async function getTaskCompletionStats(): Promise<{
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  averageScore: number;
  riskDistribution: Record<string, number>;
  categoryStats: Record<string, { completed: number; total: number; averageScore: number }>;
  recentCompletions: StoredSession[];
}> {
  const sessions = await getSessions();
  const completedSessions = sessions.filter(s => s.completed && s.taskId);
  
  const totalTasks = 21; // Total number of handwriting tasks
  const completedTasks = completedSessions.length;
  const completionRate = (completedTasks / totalTasks) * 100;
  
  // Calculate average score from results
  const scores = completedSessions
    .filter(s => s.results?.probability !== undefined)
    .map(s => s.results!.probability);
  const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  
  // Risk distribution
  const riskDistribution = completedSessions.reduce((acc, session) => {
    if (session.results?.overallRisk) {
      acc[session.results.overallRisk] = (acc[session.results.overallRisk] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  // Category statistics
  const categoryStats = completedSessions.reduce((acc, session) => {
    if (session.category) {
      if (!acc[session.category]) {
        acc[session.category] = { completed: 0, total: 0, averageScore: 0 };
      }
      acc[session.category].completed++;
      if (session.results?.probability !== undefined) {
        acc[session.category].averageScore += session.results.probability;
      }
    }
    return acc;
  }, {} as Record<string, { completed: number; total: number; averageScore: number }>);
  
  // Calculate total tasks per category (approximate)
  const categoryTotals = {
    'graphic': 5,
    'copy': 5,
    'memory': 4,
    'spatial': 2,
    'motor': 3,
    'comprehensive': 2
  };
  
  Object.keys(categoryStats).forEach(category => {
    categoryStats[category].total = categoryTotals[category as keyof typeof categoryTotals] || 0;
    categoryStats[category].averageScore = categoryStats[category].averageScore / categoryStats[category].completed;
  });
  
  // Recent completions (last 10)
  const recentCompletions = completedSessions
    .sort((a, b) => b.completedAt! - a.completedAt!)
    .slice(0, 10);
  
  return {
    totalTasks,
    completedTasks,
    completionRate,
    averageScore,
    riskDistribution,
    categoryStats,
    recentCompletions
  };
}

// Get session by task ID
export async function getSessionByTaskId(taskId: string): Promise<StoredSession | null> {
  const sessions = await getSessions();
  return sessions.find(s => s.taskId === taskId) || null;
}

// Get all completed sessions for a specific category
export async function getCompletedSessionsByCategory(category: string): Promise<StoredSession[]> {
  const sessions = await getSessions();
  return sessions.filter(s => s.completed && s.category === category);
}

// Get session progress for a specific task
export async function getTaskProgress(taskId: string): Promise<{
  isCompleted: boolean;
  session?: StoredSession;
  progress: number;
  score?: number;
  riskLevel?: string;
}> {
  const session = await getSessionByTaskId(taskId);
  
  if (!session) {
    return {
      isCompleted: false,
      progress: 0
    };
  }
  
  return {
    isCompleted: session.completed || false,
    session,
    progress: session.completed ? 100 : 0,
    score: session.results?.probability,
    riskLevel: session.results?.overallRisk
  };
}

// Export sessions in different formats
export async function exportSessionsAsCSV(): Promise<Blob> {
  const sessions = await getSessions();
  const completedSessions = sessions.filter(s => s.completed);
  
  if (completedSessions.length === 0) {
    return new Blob(['No completed sessions'], { type: 'text/csv' });
  }
  
  const headers = [
    'Task ID', 'Task Name', 'Category', 'Difficulty', 'Completed At', 'Elapsed Time (s)',
    'Overall Risk', 'Probability', 'Pressure', 'Spatial Accuracy', 'Temporal Consistency', 'Cognitive Load'
  ];
  
  const rows = completedSessions.map(session => [
    session.taskId || '',
    session.taskName || '',
    session.category || '',
    session.difficulty || '',
    new Date(session.completedAt || session.timestamp).toISOString(),
    session.elapsedTime || 0,
    session.results?.overallRisk || '',
    session.results?.probability || 0,
    session.results?.biomarkers?.pressure || 0,
    session.results?.biomarkers?.spatialAccuracy || 0,
    session.results?.biomarkers?.temporalConsistency || 0,
    session.results?.biomarkers?.cognitiveLoad || 0
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  return new Blob([csvContent], { type: 'text/csv' });
}

// Clear all completed sessions
export async function clearCompletedSessions(): Promise<void> {
  const sessions = await getSessions();
  const incompleteSessions = sessions.filter(s => !s.completed);
  
  // Clear all sessions
  await clearSessions();
  
  // Restore incomplete sessions
  for (const session of incompleteSessions) {
    await saveSession(session);
  }
}

export const sessionStorageService = {
  saveSession,
  getSessions,
  deleteSession,
  clearSessions,
  exportSessions,
  markTaskCompleted,
  getTaskCompletionStats,
  getSessionByTaskId,
  getCompletedSessionsByCategory,
  getTaskProgress,
  exportSessionsAsCSV,
  clearCompletedSessions
};


