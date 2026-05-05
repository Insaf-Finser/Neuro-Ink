// Task Completion Service
// Handles task completion, data saving, and AI analysis integration

import { enhancedAIAnalysisService, EnhancedAIAnalysisResult } from './enhancedAIAnalysisService';
import { AnalysisServiceFactory } from './analysis/AnalysisServiceFactory';
import { getTasksForDisease } from '../data/handwritingTasks';
import { DiseaseType } from '../context/DiseaseContext';
import { saveTestResult } from './resultsStorageService';
import { getTestNameFromTaskId } from '../utils/testTaskMapping';
import { StylusPoint } from './stylusInputService';
import { parkinsonsBlstmInferenceService } from './parkinsonsBlstmInferenceService';

export type NormalizedStroke = {
  points: StylusPoint[];
  startTime: number;
  endTime: number;
};

export interface TaskCompletionData {
  taskId: string;
  taskName: string;
  category: string;
  difficulty: string;
  timeLimit: number;
  elapsedTime: number;
  disease?: DiseaseType;
  /** Raw paths from DrawingCanvas (`StylusPoint[][]`) or pre-shaped stroke records */
  strokes: StylusPoint[][] | NormalizedStroke[];
  canvasSize: { width: number; height: number };
  userInteractions?: {
    pauseCount: number;
    clearCount: number;
    undoCount: number;
  };
}

/** After `normalizeStrokesInput`, strokes are always `{ points, startTime, endTime }[]`. */
export type TaskCompletionNormalized = Omit<TaskCompletionData, 'strokes'> & {
  strokes: NormalizedStroke[];
};

function normalizeStrokesInput(strokes: TaskCompletionData['strokes']): NormalizedStroke[] {
  if (!strokes.length) return [];
  const first = strokes[0] as StylusPoint[] | NormalizedStroke;
  if (Array.isArray(first)) {
    return (strokes as StylusPoint[][]).map((stroke) => {
      if (!stroke.length) {
        return { points: [], startTime: 0, endTime: 0 };
      }
      return {
        points: stroke,
        startTime: stroke[0].timestamp,
        endTime: stroke[stroke.length - 1].timestamp
      };
    });
  }
  return strokes as NormalizedStroke[];
}

export interface TaskCompletionResult {
  success: boolean;
  sessionId?: string;
  aiAnalysis?: EnhancedAIAnalysisResult | any; // Allow both enhanced and basic analysis results
  error?: string;
}

class TaskCompletionService {
  private readonly AI_ANALYSIS_ENABLED = true;
  private readonly MIN_STROKES_FOR_ANALYSIS = 3;
  private readonly MIN_DRAWING_TIME = 1; // 1 second minimum (elapsedTime is in seconds)

  /**
   * Complete a handwriting task with full data saving and AI analysis
   */
  async completeTask(completionData: TaskCompletionData): Promise<TaskCompletionResult> {
    try {
      console.log(`Completing task: ${completionData.taskId}`);
      const disease: DiseaseType = completionData.disease || 'alzheimers';

      const data: TaskCompletionNormalized = {
        ...completionData,
        strokes: normalizeStrokesInput(completionData.strokes)
      };
      
      // Validate completion data
      const validation = this.validateCompletionData(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Perform AI analysis if enabled and conditions are met
      let aiAnalysis = null;
      if (this.AI_ANALYSIS_ENABLED && this.shouldPerformAIAnalysis(data)) {
        try {
          if (disease === 'parkinsons') {
            console.log('Performing Parkinson disease-specific AI analysis...');
            aiAnalysis = await this.performAIAnalysis(data);
            console.log('Parkinson analysis completed:', aiAnalysis);
          } else {
            console.log('Performing enhanced AI analysis...');
            aiAnalysis = await this.performEnhancedAIAnalysis(data);
            console.log('Enhanced AI analysis completed:', aiAnalysis);
          }
        } catch (error) {
          console.warn('Enhanced AI analysis failed, falling back to basic analysis:', error);
          try {
            aiAnalysis = await this.performAIAnalysis(data);
          } catch (fallbackError) {
            console.warn('Basic AI analysis also failed:', fallbackError);
            // Continue without AI analysis rather than failing the entire completion
          }
        }
      }
      if (!aiAnalysis) {
        try {
          aiAnalysis = await this.performAIAnalysis(data);
        } catch (finalFallbackError) {
          console.warn('Final fallback AI analysis failed:', finalFallbackError);
        }
      }

      // Save to Firestore via resultsStorageService (cloud-only requirement).
      // If this fails, task completion must fail so UI does not show false progress.
      const testName = getTestNameFromTaskId(data.taskId) || data.taskId;
      await saveTestResult(
        {
          testName,
          taskId: data.taskId,
          durationMs: data.elapsedTime * 1000, // elapsedTime is in seconds, convert to milliseconds
          validation: undefined,
          aiResult: aiAnalysis ? {
            overallRisk: 'overallRisk' in aiAnalysis ? aiAnalysis.overallRisk : (aiAnalysis.darwinRiskLevel || 'low'),
            probability: 'probability' in aiAnalysis ? aiAnalysis.probability : (aiAnalysis.darwinPrediction || 0.5),
            testScores: 'testScores' in aiAnalysis ? aiAnalysis.testScores : {
              clockDrawing: 0.8,
              wordRecall: 0.8,
              imageAssociation: 0.8,
              selectionMemory: 0.8
            },
            biomarkers: 'biomarkers' in aiAnalysis ? aiAnalysis.biomarkers : {
              pressure: aiAnalysis.pressure || 0.5,
              spatialAccuracy: aiAnalysis.spatialAccuracy || 0.5,
              temporalConsistency: aiAnalysis.temporalConsistency || 0.5,
              cognitiveLoad: aiAnalysis.cognitiveLoad || 0.5
            },
            recommendations: 'recommendations' in aiAnalysis ? aiAnalysis.recommendations : []
          } : undefined,
          features: this.extractFeatureNames(data)
        },
        undefined, // userId will be determined by saveTestResult
        disease
      );
      console.log(`Test result saved to Firestore for task: ${data.taskId}`);

      // Generate session ID
      const sessionId = `task_${data.taskId}_${Date.now()}`;

      console.log(`Task completed successfully: ${data.taskId}`);

      return {
        success: true,
        sessionId,
        aiAnalysis: aiAnalysis || undefined
      };

    } catch (error) {
      console.error('Task completion failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get task completion statistics
   */
  async getCompletionStats() {
    // Firestore is the source of truth; session stats are computed in UI from Firestore results.
    // This method remains for backward compatibility but no longer returns IndexedDB stats.
    return {
      totalTasks: 0,
      completedTasks: 0,
      completionRate: 0,
      averageScore: 0,
      riskDistribution: {},
      categoryStats: {},
      recentCompletions: []
    };
  }

  /**
   * Get progress for a specific task
   */
  async getTaskProgress(taskId: string) {
    return {
      isCompleted: false,
      progress: 0
    };
  }

  /**
   * Get all completed sessions for a category
   */
  async getCompletedSessionsByCategory(category: string) {
    return [];
  }

  /**
   * Export completed sessions as CSV
   */
  async exportSessionsAsCSV(): Promise<Blob> {
    return new Blob(['Firestore is the source of truth; export via Firestore results.'], { type: 'text/plain' });
  }

  /**
   * Export completed sessions as JSON
   */
  async exportSessionsAsJSON(): Promise<Blob> {
    return new Blob(['Firestore is the source of truth; export via Firestore results.'], { type: 'text/plain' });
  }

  /**
   * Clear all completed sessions
   */
  async clearCompletedSessions(): Promise<void> {
    // Intentionally a no-op here; use resultsStorageService.clearTestResults() for Firestore.
    return;
  }

  /**
   * Validate task completion data
   */
  private validateCompletionData(data: TaskCompletionNormalized): { isValid: boolean; error?: string } {
    if (!data.taskId || !data.taskName) {
      return { isValid: false, error: 'Missing required task information' };
    }

    if (!data.strokes || data.strokes.length === 0) {
      return { isValid: false, error: 'No drawing data captured' };
    }

    if (data.elapsedTime < this.MIN_DRAWING_TIME) {
      return { isValid: false, error: 'Drawing time too short for meaningful analysis' };
    }

    // Check if task exists in our task list (use disease-aware lookup)
    const disease: DiseaseType = data.disease || 'alzheimers';
    const tasks = getTasksForDisease(disease);
    const task = tasks.find(t => t.id === data.taskId);
    if (!task) {
      return { isValid: false, error: 'Invalid task ID' };
    }

    return { isValid: true };
  }

  /**
   * Determine if AI analysis should be performed
   */
  private shouldPerformAIAnalysis(data: TaskCompletionNormalized): boolean {
    // Check minimum requirements for AI analysis
    const disease: DiseaseType = data.disease || 'alzheimers';
    const totalPoints = data.strokes.reduce((sum, stroke) => sum + (stroke.points?.length || 0), 0);
    const hasEnoughStrokes = disease === 'parkinsons'
      ? data.strokes.length >= 1 && totalPoints >= 10
      : data.strokes.length >= this.MIN_STROKES_FOR_ANALYSIS;
    const hasEnoughTime = data.elapsedTime >= this.MIN_DRAWING_TIME;
    const hasValidStrokes = data.strokes.every(stroke => 
      stroke.points && stroke.points.length > 0
    );

    return hasEnoughStrokes && hasEnoughTime && hasValidStrokes;
  }

  /**
   * Perform enhanced AI analysis on completed task
   */
  private async performEnhancedAIAnalysis(data: TaskCompletionNormalized): Promise<EnhancedAIAnalysisResult> {
    // Convert completion data to handwriting data format
    const handwritingData = {
      taskId: data.taskId,
      strokes: data.strokes,
      totalTime: data.elapsedTime,
      canvasSize: data.canvasSize
    };

    // Prepare analysis context
    const context = {
      taskId: data.taskId,
      taskName: data.taskName,
      category: data.category,
      difficulty: data.difficulty,
      userAge: 45 // Default age, would come from user profile
    };

    // Perform enhanced AI analysis
    const analysisResult = await enhancedAIAnalysisService.performEnhancedAnalysis(handwritingData, context);
    
    return analysisResult;
  }

  /**
   * Perform basic AI analysis on completed task (fallback)
   */
  private async performAIAnalysis(data: TaskCompletionNormalized) {
    // Convert completion data to handwriting data format
    const handwritingData = {
      taskId: data.taskId,
      strokes: data.strokes,
      totalTime: data.elapsedTime,
      canvasSize: data.canvasSize
    };

    // Perform basic AI analysis using disease-aware service
    const disease: DiseaseType = data.disease || 'alzheimers';
    const analysisService = AnalysisServiceFactory.getService(disease);
    const analysisResult = analysisService.analyzeHandwriting(handwritingData);

    if (disease !== 'parkinsons') {
      return analysisResult;
    }

    const blstmProbability = await parkinsonsBlstmInferenceService.predictProbability(handwritingData);
    if (blstmProbability === null) {
      return analysisResult;
    }

    const riskLevel: 'low' | 'moderate' | 'high' =
      blstmProbability < 0.3 ? 'low' : blstmProbability < 0.6 ? 'moderate' : 'high';

    return {
      ...analysisResult,
      darwinPrediction: blstmProbability,
      darwinRiskLevel: riskLevel,
      modelVersion: 'BLSTM-PaHaW-direct',
      clinicalValidation: 'Direct BLSTM inference from parkmodel/Parkinsons-Detection'
    };
  }

  /**
   * Extract feature names for AI analysis metadata
   */
  private extractFeatureNames(data: TaskCompletionNormalized): Record<string, number> {
    // This would extract the actual feature values used in AI analysis
    // For now, return a simplified version
    return {
      strokeCount: data.strokes.length,
      totalTime: data.elapsedTime,
      averagePressure: this.calculateAveragePressure(data.strokes),
      drawingSpeed: this.calculateDrawingSpeed(data.strokes, data.elapsedTime)
    };
  }

  /**
   * Calculate average pressure from strokes
   */
  private calculateAveragePressure(strokes: NormalizedStroke[]): number {
    if (strokes.length === 0) return 0;

    const allPressures = strokes.flatMap(stroke =>
      stroke.points.map(point => point.pressure)
    );
    
    return allPressures.reduce((sum, pressure) => sum + pressure, 0) / allPressures.length;
  }

  /**
   * Calculate drawing speed (points per second)
   */
  private calculateDrawingSpeed(strokes: NormalizedStroke[], totalTimeSeconds: number): number {
    if (totalTimeSeconds === 0) return 0;

    const totalPoints = strokes.reduce((sum, stroke) => sum + stroke.points.length, 0);
    return totalPoints / totalTimeSeconds;
  }

  /**
   * Get task recommendations based on completion data
   */
  getTaskRecommendations(completionData: TaskCompletionData): string[] {
    const data: TaskCompletionNormalized = {
      ...completionData,
      strokes: normalizeStrokesInput(completionData.strokes)
    };
    const recommendations: string[] = [];
    
    // Time-based recommendations
    if (data.elapsedTime < data.timeLimit * 0.5) {
      recommendations.push('Consider taking more time to complete the task carefully');
    }
    
    if (data.elapsedTime > data.timeLimit) {
      recommendations.push('Task completed but exceeded time limit');
    }
    
    // Stroke-based recommendations
    if (data.strokes.length < 3) {
      recommendations.push('Try to draw more continuous strokes');
    }
    
    if (data.strokes.length > 50) {
      recommendations.push('Consider drawing with fewer, longer strokes');
    }
    
    // Pressure-based recommendations
    const avgPressure = this.calculateAveragePressure(data.strokes);
    if (avgPressure < 0.3) {
      recommendations.push('Try applying more pressure while drawing');
    }
    
    if (avgPressure > 0.8) {
      recommendations.push('Consider using lighter pressure while drawing');
    }
    
    return recommendations;
  }

  /**
   * Calculate task score based on completion data
   */
  calculateTaskScore(completionData: TaskCompletionData): {
    score: number;
    maxScore: number;
    percentage: number;
    breakdown: {
      completion: number;
      timing: number;
      quality: number;
      effort: number;
    };
  } {
    const data: TaskCompletionNormalized = {
      ...completionData,
      strokes: normalizeStrokesInput(completionData.strokes)
    };
    const maxScore = 100;
    
    // Completion score (40% of total)
    const completionScore = data.strokes.length > 0 ? 40 : 0;
    
    // Timing score (30% of total)
    const timeRatio = data.elapsedTime / data.timeLimit;
    const timingScore = timeRatio <= 1 ? 30 : Math.max(0, 30 - (timeRatio - 1) * 15);
    
    // Quality score (20% of total) - based on stroke continuity
    const avgStrokeLength = data.strokes.length > 0
      ? data.strokes.reduce((sum, stroke) =>
          sum + stroke.points.length, 0) / data.strokes.length
      : 0;
    const qualityScore = Math.min(20, avgStrokeLength * 2);
    
    // Effort score (10% of total) - based on total points drawn
    const totalPoints = data.strokes.reduce((sum, stroke) => sum + stroke.points.length, 0);
    const effortScore = Math.min(10, totalPoints / 10);
    
    const totalScore = completionScore + timingScore + qualityScore + effortScore;
    const percentage = (totalScore / maxScore) * 100;
    
    return {
      score: Math.round(totalScore),
      maxScore,
      percentage: Math.round(percentage),
      breakdown: {
        completion: Math.round(completionScore),
        timing: Math.round(timingScore),
        quality: Math.round(qualityScore),
        effort: Math.round(effortScore)
      }
    };
  }
}

export const taskCompletionService = new TaskCompletionService();
export default taskCompletionService;
