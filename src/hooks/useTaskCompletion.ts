// Custom hook for task completion functionality
// Provides standardized task completion logic for all handwriting tasks

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskCompletionService, type NormalizedStroke } from '../services/taskCompletionService';
import { getTasksForDisease } from '../data/handwritingTasks';
import { useDisease } from '../context/DiseaseContext';
import type { DiseaseType } from '../context/DiseaseContext';
import { StylusPoint } from '../services/stylusInputService';

export interface TaskCompletionState {
  isCompleting: boolean;
  completionError: string | null;
}

export interface TaskCompletionData {
  taskId: string;
  elapsedTime: number;
  strokes: StylusPoint[][] | NormalizedStroke[];
  canvasSize: { width: number; height: number };
  disease?: DiseaseType;
  userInteractions?: {
    pauseCount: number;
    clearCount: number;
    undoCount: number;
  };
}

export const useTaskCompletion = () => {
  const navigate = useNavigate();
  const { currentDisease } = useDisease();
  const [isCompleting, setIsCompleting] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);

  const completeTask = useCallback(async (completionData: TaskCompletionData) => {
    if (isCompleting) return;
    
    setIsCompleting(true);
    setCompletionError(null);
    
    try {
      const effectiveDisease = completionData.disease || currentDisease;
      const tasks = getTasksForDisease(effectiveDisease);
      const task = tasks.find(t => t.id === completionData.taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      const fullCompletionData = {
        taskId: completionData.taskId,
        taskName: task.name,
        category: task.category,
        difficulty: task.difficulty,
        timeLimit: task.timeLimit || 0,
        disease: effectiveDisease,
        elapsedTime: completionData.elapsedTime,
        strokes: completionData.strokes,
        canvasSize: completionData.canvasSize,
        userInteractions: completionData.userInteractions || {
          pauseCount: 0,
          clearCount: 0,
          undoCount: 0
        }
      };

      const result = await taskCompletionService.completeTask(fullCompletionData);
      
      if (result.success) {
        console.log('Task completed successfully:', result);
        return result;
      } else {
        throw new Error(result.error || 'Task completion failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Error completing task:', errorMessage);
      setCompletionError(errorMessage);
      throw error;
    } finally {
      setIsCompleting(false);
    }
  }, [isCompleting, currentDisease]);

  const completeTaskAndNavigate = useCallback(async (
    completionData: TaskCompletionData,
    nextTaskId?: string,
    showAnalysis: boolean = false,
    showComprehensive: boolean = false
  ) => {
    try {
      const result = await completeTask(completionData);
      
      if (result && result.success) {
        // Navigate to comprehensive results if requested
        if (showComprehensive && result.aiAnalysis) {
          navigate('/comprehensive-results', { 
            state: { 
              analysis: result.aiAnalysis,
              completionData: completionData
            }
          });
        } else if (showAnalysis && result.aiAnalysis) {
          navigate('/ai-analysis', { 
            state: { 
              analysis: result.aiAnalysis,
              completionData: completionData
            }
          });
        } else if (nextTaskId) {
          navigate(`/test/${nextTaskId}`);
        } else {
          navigate('/tasks');
        }
      }
    } catch (error) {
      // Error is already handled in completeTask
      console.error('Task completion and navigation failed:', error);
    }
  }, [completeTask, navigate]);

  const getTaskProgress = useCallback(async (taskId: string) => {
    return await taskCompletionService.getTaskProgress(taskId);
  }, []);

  const getCompletionStats = useCallback(async () => {
    return await taskCompletionService.getCompletionStats();
  }, []);

  const exportSessions = useCallback(async (format: 'json' | 'csv' = 'json') => {
    if (format === 'csv') {
      return await taskCompletionService.exportSessionsAsCSV();
    } else {
      return await taskCompletionService.exportSessionsAsJSON();
    }
  }, []);

  const clearCompletedSessions = useCallback(async () => {
    return await taskCompletionService.clearCompletedSessions();
  }, []);

  return {
    isCompleting,
    completionError,
    completeTask,
    completeTaskAndNavigate,
    getTaskProgress,
    getCompletionStats,
    exportSessions,
    clearCompletedSessions
  };
};

export default useTaskCompletion;
