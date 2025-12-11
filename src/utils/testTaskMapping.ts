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
import LetterCopyTest from '../pages/tests/LetterCopyTest';
import WordMemoryTest from '../pages/tests/WordMemoryTest';
import RepetitiveWritingTest from '../pages/tests/RepetitiveWritingTest';
import DotConnectionTest from '../pages/tests/DotConnectionTest';
import WordCopyTest from '../pages/tests/WordCopyTest';
import NumberCopyTest from '../pages/tests/NumberCopyTest';
import SentenceMemoryTest from '../pages/tests/SentenceMemoryTest';
import SignaturePracticeTest from '../pages/tests/SignaturePracticeTest';
import ComplexFigureCopyTest from '../pages/tests/ComplexFigureCopyTest';
import LineTracingTest from '../pages/tests/LineTracingTest';
import NameMemoryTest from '../pages/tests/NameMemoryTest';
import NumberMemoryTest from '../pages/tests/NumberMemoryTest';
import RapidWritingTest from '../pages/tests/RapidWritingTest';
import ComprehensiveAssessmentTest from '../pages/tests/ComprehensiveAssessmentTest';
import HandwritingTaskTest from '../pages/tests/HandwritingTaskTest';

// Mapping between test names and task IDs for progress tracking
export const TEST_TO_TASK_MAP: Record<string, string> = {
  'circleDrawing': 'circle_drawing',
  'squareDrawing': 'square_drawing',
  'triangleDrawing': 'triangle_drawing',
  'pentagonDrawing': 'pentagon_drawing',
  'spiralDrawing': 'spiral_drawing',
  'lineTracing': 'line_tracing',
  'clockDrawing': 'clock-drawing',
  'wordMemory': 'word_memory',
  'nameMemory': 'name_memory',
  'numberMemory': 'number_memory',
  'sentenceMemory': 'sentence_memory',
  'letterCopy': 'letter_copy',
  'wordCopy': 'word_copy',
  'numberCopy': 'number_copy',
  'complexFigureCopy': 'complex_figure_copy',
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
  'letter_copy': LetterCopyTest,
  'word_memory': WordMemoryTest,
  'repetitive_writing': RepetitiveWritingTest,
  'dot_connection': DotConnectionTest,
  'word_copy': WordCopyTest,
  'number_copy': NumberCopyTest,
  'sentence_memory': SentenceMemoryTest,
  'signature_practice': SignaturePracticeTest,
  'complex_figure_copy': ComplexFigureCopyTest,
  'line_tracing': LineTracingTest,
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
