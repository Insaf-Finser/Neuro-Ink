// Task Completion Service
// Handles task completion, data saving, and AI analysis integration

import { sessionStorageService } from './sessionStorageService';
import { aiAnalysisService } from './aiAnalysisService';
import { enhancedAIAnalysisService, EnhancedAIAnalysisResult } from './enhancedAIAnalysisService';
import { HANDWRITING_TASKS } from '../data/handwritingTasks';

export interface TaskCompletionData {
  taskId: string;
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
  canvasSize: { width: number; height: number };
  userInteractions?: {
    pauseCount: number;
    clearCount: number;
    undoCount: number;
  };
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
  private readonly MIN_DRAWING_TIME = 1000; // 1 second minimum

  /**
   * Complete a handwriting task with full data saving and AI analysis
   */
  async completeTask(completionData: TaskCompletionData): Promise<TaskCompletionResult> {
    try {
      console.log(`Completing task: ${completionData.taskId}`);
      
      // Validate completion data
      const validation = this.validateCompletionData(completionData);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Perform enhanced AI analysis if enabled and conditions are met
      let aiAnalysis = null;
      if (this.AI_ANALYSIS_ENABLED && this.shouldPerformAIAnalysis(completionData)) {
        try {
          console.log('Performing enhanced AI analysis...');
          aiAnalysis = await this.performEnhancedAIAnalysis(completionData);
          console.log('Enhanced AI analysis completed:', aiAnalysis);
        } catch (error) {
          console.warn('Enhanced AI analysis failed, falling back to basic analysis:', error);
          try {
            aiAnalysis = await this.performAIAnalysis(completionData);
          } catch (fallbackError) {
            console.warn('Basic AI analysis also failed:', fallbackError);
            // Continue without AI analysis rather than failing the entire completion
          }
        }
      }

      // Prepare session data
      const sessionData = {
        taskName: completionData.taskName,
        category: completionData.category,
        difficulty: completionData.difficulty,
        timeLimit: completionData.timeLimit,
        elapsedTime: completionData.elapsedTime,
        strokes: completionData.strokes,
        results: aiAnalysis ? {
          overallRisk: 'overallRisk' in aiAnalysis ? aiAnalysis.overallRisk : (aiAnalysis.darwinRiskLevel || 'low'),
          probability: 'probability' in aiAnalysis ? aiAnalysis.probability : (aiAnalysis.darwinPrediction || 0.5),
          testScores: 'testScores' in aiAnalysis ? aiAnalysis.testScores : {
            clockDrawing: 0.8,
            wordRecall: 0.8,
            imageAssociation: 0.8,
            selectionMemory: 0.8
          },
          biomarkers: 'biomarkers' in aiAnalysis ? aiAnalysis.biomarkers : {
            pressure: aiAnalysis.pressure,
            spatialAccuracy: aiAnalysis.spatialAccuracy,
            temporalConsistency: aiAnalysis.temporalConsistency,
            cognitiveLoad: aiAnalysis.cognitiveLoad
          },
          recommendations: 'recommendations' in aiAnalysis ? aiAnalysis.recommendations : [
            'Continue regular cognitive assessments',
            'Maintain healthy lifestyle habits',
            'Engage in mentally stimulating activities'
          ]
        } : undefined,
        aiAnalysis: aiAnalysis ? {
          modelVersion: 'overallRisk' in aiAnalysis ? '3.0.0-LightGBM-Enhanced' : '3.0.0-LightGBM',
          confidence: 'probability' in aiAnalysis ? aiAnalysis.probability : (aiAnalysis.darwinPrediction || 0.5),
          features: this.extractFeatureNames(completionData),
          analysisTimestamp: Date.now(),
          enhancedAnalysis: 'overallRisk' in aiAnalysis ? aiAnalysis : undefined
        } : undefined
      };

      // Save to session storage
      await sessionStorageService.markTaskCompleted(completionData.taskId, sessionData);

      // Generate session ID
      const sessionId = `task_${completionData.taskId}_${Date.now()}`;

      console.log(`Task completed successfully: ${completionData.taskId}`);

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
    return await sessionStorageService.getTaskCompletionStats();
  }

  /**
   * Get progress for a specific task
   */
  async getTaskProgress(taskId: string) {
    return await sessionStorageService.getTaskProgress(taskId);
  }

  /**
   * Get all completed sessions for a category
   */
  async getCompletedSessionsByCategory(category: string) {
    return await sessionStorageService.getCompletedSessionsByCategory(category);
  }

  /**
   * Export completed sessions as CSV
   */
  async exportSessionsAsCSV(): Promise<Blob> {
    return await sessionStorageService.exportSessionsAsCSV();
  }

  /**
   * Export completed sessions as JSON
   */
  async exportSessionsAsJSON(): Promise<Blob> {
    return await sessionStorageService.exportSessions();
  }

  /**
   * Clear all completed sessions
   */
  async clearCompletedSessions(): Promise<void> {
    return await sessionStorageService.clearCompletedSessions();
  }

  /**
   * Validate task completion data
   */
  private validateCompletionData(data: TaskCompletionData): { isValid: boolean; error?: string } {
    if (!data.taskId || !data.taskName) {
      return { isValid: false, error: 'Missing required task information' };
    }

    if (!data.strokes || data.strokes.length === 0) {
      return { isValid: false, error: 'No drawing data captured' };
    }

    if (data.elapsedTime < this.MIN_DRAWING_TIME) {
      return { isValid: false, error: 'Drawing time too short for meaningful analysis' };
    }

    // Check if task exists in our task list
    const task = HANDWRITING_TASKS.find(t => t.id === data.taskId);
    if (!task) {
      return { isValid: false, error: 'Invalid task ID' };
    }

    return { isValid: true };
  }

  /**
   * Determine if AI analysis should be performed
   */
  private shouldPerformAIAnalysis(data: TaskCompletionData): boolean {
    // Check minimum requirements for AI analysis
    const hasEnoughStrokes = data.strokes.length >= this.MIN_STROKES_FOR_ANALYSIS;
    const hasEnoughTime = data.elapsedTime >= this.MIN_DRAWING_TIME;
    const hasValidStrokes = data.strokes.every(stroke => 
      stroke.points && stroke.points.length > 0
    );

    return hasEnoughStrokes && hasEnoughTime && hasValidStrokes;
  }

  /**
   * Perform enhanced AI analysis on completed task
   */
  private async performEnhancedAIAnalysis(data: TaskCompletionData): Promise<EnhancedAIAnalysisResult> {
    // Convert completion data to handwriting data format
    const handwritingData = {
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
  private async performAIAnalysis(data: TaskCompletionData) {
    // Convert completion data to handwriting data format
    const handwritingData = {
      strokes: data.strokes,
      totalTime: data.elapsedTime,
      canvasSize: data.canvasSize
    };

    // Perform basic AI analysis
    const analysisResult = await aiAnalysisService.analyzeHandwriting(handwritingData);
    
    return analysisResult;
  }

  /**
   * Extract feature names for AI analysis metadata
   */
  private extractFeatureNames(data: TaskCompletionData): Record<string, number> {
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
  private calculateAveragePressure(strokes: TaskCompletionData['strokes']): number {
    if (strokes.length === 0) return 0;
    
    const allPressures = strokes.flatMap(stroke => 
      stroke.points.map(point => point.pressure)
    );
    
    return allPressures.reduce((sum, pressure) => sum + pressure, 0) / allPressures.length;
  }

  /**
   * Calculate drawing speed (points per second)
   */
  private calculateDrawingSpeed(strokes: TaskCompletionData['strokes'], totalTime: number): number {
    if (totalTime === 0) return 0;
    
    const totalPoints = strokes.reduce((sum, stroke) => sum + stroke.points.length, 0);
    return totalPoints / (totalTime / 1000); // Convert to points per second
  }

  /**
   * Get task recommendations based on completion data
   */
  getTaskRecommendations(completionData: TaskCompletionData): string[] {
    const recommendations: string[] = [];
    
    // Time-based recommendations
    if (completionData.elapsedTime < completionData.timeLimit * 0.5) {
      recommendations.push('Consider taking more time to complete the task carefully');
    }
    
    if (completionData.elapsedTime > completionData.timeLimit) {
      recommendations.push('Task completed but exceeded time limit');
    }
    
    // Stroke-based recommendations
    if (completionData.strokes.length < 3) {
      recommendations.push('Try to draw more continuous strokes');
    }
    
    if (completionData.strokes.length > 50) {
      recommendations.push('Consider drawing with fewer, longer strokes');
    }
    
    // Pressure-based recommendations
    const avgPressure = this.calculateAveragePressure(completionData.strokes);
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
    const maxScore = 100;
    
    // Completion score (40% of total)
    const completionScore = completionData.strokes.length > 0 ? 40 : 0;
    
    // Timing score (30% of total)
    const timeRatio = completionData.elapsedTime / completionData.timeLimit;
    const timingScore = timeRatio <= 1 ? 30 : Math.max(0, 30 - (timeRatio - 1) * 15);
    
    // Quality score (20% of total) - based on stroke continuity
    const avgStrokeLength = completionData.strokes.reduce((sum, stroke) => 
      sum + stroke.points.length, 0) / completionData.strokes.length;
    const qualityScore = Math.min(20, avgStrokeLength * 2);
    
    // Effort score (10% of total) - based on total points drawn
    const totalPoints = completionData.strokes.reduce((sum, stroke) => sum + stroke.points.length, 0);
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
