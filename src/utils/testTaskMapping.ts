import React from 'react';
import ClockDrawingTest from '../pages/tests/ClockDrawingTest';
import WordRecallTest from '../pages/tests/WordRecallTest';
import ImageAssociationTest from '../pages/tests/ImageAssociationTest';
import SelectionMemoryTest from '../pages/tests/SelectionMemoryTest';
import CircleDrawingTest from '../pages/tests/CircleDrawingTest';
import SquareDrawingTest from '../pages/tests/SquareDrawingTest';
import TriangleDrawingTest from '../pages/tests/TriangleDrawingTest';
import PentagonDrawingTest from '../pages/tests/PentagonDrawingTest';
import SpiralDrawingTest from '../pages/tests/SpiralDrawingTest';
import WordMemoryTest from '../pages/tests/WordMemoryTest';
import RepetitiveWritingTest from '../pages/tests/RepetitiveWritingTest';
import DotConnectionTest from '../pages/tests/DotConnectionTest';
import SentenceMemoryTest from '../pages/tests/SentenceMemoryTest';
import SignaturePracticeTest from '../pages/tests/SignaturePracticeTest';
import MazeNavigationTest from '../pages/tests/MazeNavigationTest';
import PatternCompletionTest from '../pages/tests/PatternCompletionTest';
import NameMemoryTest from '../pages/tests/NameMemoryTest';
import NumberMemoryTest from '../pages/tests/NumberMemoryTest';
import RapidWritingTest from '../pages/tests/RapidWritingTest';
import ComprehensiveAssessmentTest from '../pages/tests/ComprehensiveAssessmentTest';
import HandwritingTaskTest from '../pages/tests/HandwritingTaskTest';
import { getTasksForDisease, DiseaseType } from '../data/handwritingTasks';

// Mapping between test names and task IDs for progress tracking
export const TEST_TO_TASK_MAP: Record<string, string> = {
  'circleDrawing': 'circle_drawing',
  'squareDrawing': 'square_drawing',
  'triangleDrawing': 'triangle_drawing',
  'pentagonDrawing': 'pentagon_drawing',
  'spiralDrawing': 'spiral_drawing',
  'clockDrawing': 'clock-drawing',
  'wordMemory': 'word_memory',
  'nameMemory': 'name_memory',
  'numberMemory': 'number_memory',
  'sentenceMemory': 'sentence_memory',
  'repetitiveWriting': 'repetitive_writing',
  'signaturePractice': 'signature_practice',
  'rapidWriting': 'rapid_writing',
  'comprehensiveAssessment': 'comprehensive_assessment',
  'dotConnection': 'dot_connection',
  'mazeNavigation': 'maze_navigation',
  'patternCompletion': 'pattern_completion',
};

// Mapping between task IDs and test components
const TASK_TO_COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  'clock-drawing': ClockDrawingTest,
  'word-recall': WordRecallTest,
  'image-association': ImageAssociationTest,
  'selection-memory': SelectionMemoryTest,
  'circle_drawing': CircleDrawingTest,
  'square_drawing': SquareDrawingTest,
  'triangle_drawing': TriangleDrawingTest,
  'pentagon_drawing': PentagonDrawingTest,
  'spiral_drawing': SpiralDrawingTest,
  'word_memory': WordMemoryTest,
  'repetitive_writing': RepetitiveWritingTest,
  'dot_connection': DotConnectionTest,
  'maze_navigation': MazeNavigationTest,
  'pattern_completion': PatternCompletionTest,
  'sentence_memory': SentenceMemoryTest,
  'signature_practice': SignaturePracticeTest,
  'name_memory': NameMemoryTest,
  'number_memory': NumberMemoryTest,
  'rapid_writing': RapidWritingTest,
  'comprehensive_assessment': ComprehensiveAssessmentTest,
};

/**
 * Get task ID from test name
 */
export function getTaskIdFromTestName(testName: string): string | null {
  return TEST_TO_TASK_MAP[testName] || null;
}

/**
 * Get test name from task ID
 */
export function getTestNameFromTaskId(taskId: string): string | null {
  const entry = Object.entries(TEST_TO_TASK_MAP).find(([_, id]) => id === taskId);
  return entry ? entry[0] : null;
}

/**
 * Get test component from task ID
 */
export function getTestComponent(taskId: string): React.ComponentType<any> | null {
  return TASK_TO_COMPONENT_MAP[taskId] || HandwritingTaskTest;
}

/**
 * Get the next task ID in order
 * @param currentTaskId - The current task ID
 * @param disease - The disease type ('alzheimers' | 'parkinsons')
 * @returns The next task ID or null if it's the last task
 */
export function getNextTaskId(currentTaskId: string, disease: DiseaseType = 'alzheimers'): string | null {
  const tasks = getTasksForDisease(disease);
  const currentIndex = tasks.findIndex(task => task.id === currentTaskId);
  
  if (currentIndex === -1 || currentIndex === tasks.length - 1) {
    return null; // Task not found or it's the last task
  }
  
  return tasks[currentIndex + 1].id;
}
