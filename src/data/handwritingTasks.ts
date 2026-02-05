// Comprehensive handwriting tasks for cognitive assessment
// Based on DARWIN dataset and clinical cognitive assessment protocols

import { DiseaseType } from '../context/DiseaseContext';

export interface HandwritingTask {
  id: string;
  name: string;
  category: 'graphic' | 'memory' | 'spatial' | 'motor';
  description: string;
  instructions: string[];
  expectedElements?: string[];
  timeLimit?: number; // in seconds
  difficulty: 'easy' | 'medium' | 'hard';
}

export const HANDWRITING_TASKS: HandwritingTask[] = [
  // GRAPHIC TASKS (Motor Control & Spatial Processing)
  {
    id: 'circle_drawing',
    name: 'Circle Drawing',
    category: 'graphic',
    description: 'Draw a perfect circle',
    instructions: [
      'Draw a circle as round and smooth as possible',
      'Try to make it as close to a perfect circle as you can',
      'Take your time and focus on smooth movements'
    ],
    difficulty: 'easy',
    timeLimit: 30
  },
  {
    id: 'square_drawing',
    name: 'Square Drawing',
    category: 'graphic',
    description: 'Draw a perfect square',
    instructions: [
      'Draw a square with equal sides',
      'Make sure all angles are 90 degrees',
      'Keep the lines straight and connected'
    ],
    difficulty: 'easy',
    timeLimit: 30
  },
  {
    id: 'triangle_drawing',
    name: 'Triangle Drawing',
    category: 'graphic',
    description: 'Draw an equilateral triangle',
    instructions: [
      'Draw a triangle with three equal sides',
      'Make sure all angles are equal',
      'Connect the lines properly'
    ],
    difficulty: 'medium',
    timeLimit: 30
  },
  {
    id: 'pentagon_drawing',
    name: 'Pentagon Drawing',
    category: 'graphic',
    description: 'Draw a regular pentagon',
    instructions: [
      'Draw a five-sided shape (pentagon)',
      'Make all sides equal length',
      'Try to make it as regular as possible'
    ],
    difficulty: 'hard',
    timeLimit: 45
  },
  {
    id: 'spiral_drawing',
    name: 'Spiral Drawing',
    category: 'graphic',
    description: 'Draw a spiral from center outward',
    instructions: [
      'Start from the center and draw outward',
      'Keep the spiral smooth and even',
      'Make about 3-4 complete turns'
    ],
    difficulty: 'medium',
    timeLimit: 45
  },

  // MEMORY TASKS (Working Memory & Recall)
  {
    id: 'word_memory',
    name: 'Word Memory',
    category: 'memory',
    description: 'Write 5 words from memory',
    instructions: [
      'Remember these 5 words: APPLE, CAR, BOOK, TREE, HOUSE',
      'After 30 seconds, write them down from memory',
      'Write them in any order'
    ],
    expectedElements: ['APPLE', 'CAR', 'BOOK', 'TREE', 'HOUSE'],
    difficulty: 'medium',
    timeLimit: 90
  },
  {
    id: 'sentence_memory',
    name: 'Sentence Memory',
    category: 'memory',
    description: 'Write sentence from memory',
    instructions: [
      'Remember this sentence: "The quick brown fox jumps over the lazy dog"',
      'After 30 seconds, write it from memory',
      'Try to get every word correct'
    ],
    expectedElements: ['The', 'quick', 'brown', 'fox', 'jumps', 'over', 'the', 'lazy', 'dog'],
    difficulty: 'hard',
    timeLimit: 120
  },
  {
    id: 'number_memory',
    name: 'Number Memory',
    category: 'memory',
    description: 'Write numbers from memory',
    instructions: [
      'Remember this sequence: 7-4-2-9-1-6',
      'After 30 seconds, write it from memory',
      'Keep the numbers in the same order'
    ],
    expectedElements: ['7', '4', '2', '9', '1', '6'],
    difficulty: 'medium',
    timeLimit: 90
  },
  {
    id: 'name_memory',
    name: 'Name Memory',
    category: 'memory',
    description: 'Write names from memory',
    instructions: [
      'Remember these names: JOHN, MARY, DAVID, SARAH, MICHAEL',
      'After 30 seconds, write them from memory',
      'Write them in any order'
    ],
    expectedElements: ['JOHN', 'MARY', 'DAVID', 'SARAH', 'MICHAEL'],
    difficulty: 'medium',
    timeLimit: 90
  },

  // SPATIAL TASKS (Spatial Processing & Executive Function)
  {
    id: 'clock_drawing',
    name: 'Clock Drawing',
    category: 'spatial',
    description: 'Draw a clock showing 10:10',
    instructions: [
      'Draw a clock face with all 12 numbers',
      'Draw the hour and minute hands showing 10:10',
      'Make sure the numbers are in the right positions'
    ],
    expectedElements: ['clock face', 'numbers 1-12', 'hour hand', 'minute hand'],
    difficulty: 'hard',
    timeLimit: 180
  },
  {
    id: 'dot_connection',
    name: 'Dot Connection',
    category: 'spatial',
    description: 'Connect dots in numerical order',
    instructions: [
      'Connect the dots in order from 1 to 10',
      'Draw straight lines between consecutive numbers',
      'Don\'t lift your pen until finished'
    ],
    difficulty: 'medium',
    timeLimit: 60
  },
  {
    id: 'maze_navigation',
    name: 'Maze Navigation',
    category: 'spatial',
    description: 'Navigate through the maze',
    instructions: [
      'Start at the entrance (marked S)',
      'Find your way to the exit (marked E)',
      'Don\'t cross any lines'
    ],
    difficulty: 'hard',
    timeLimit: 120
  },
  {
    id: 'pattern_completion',
    name: 'Pattern Completion',
    category: 'spatial',
    description: 'Complete the pattern',
    instructions: [
      'Look at the pattern shown',
      'Continue the pattern in the same way',
      'Complete at least 3 more elements'
    ],
    difficulty: 'medium',
    timeLimit: 90
  },

  // MOTOR TASKS (Fine Motor Control & Coordination)
  {
    id: 'repetitive_writing',
    name: 'Repetitive Writing',
    category: 'motor',
    description: 'Write "llll" repeatedly',
    instructions: [
      'Write the letter "l" repeatedly',
      'Make each "l" the same size',
      'Keep them evenly spaced',
      'Write at least 10 "l"s'
    ],
    difficulty: 'easy',
    timeLimit: 60
  },
  {
    id: 'signature_practice',
    name: 'Signature Practice',
    category: 'motor',
    description: 'Write your signature',
    instructions: [
      'Write your signature as you normally would',
      'Make it clear and legible',
      'Use your natural handwriting style'
    ],
    difficulty: 'easy',
    timeLimit: 30
  },
  {
    id: 'rapid_writing',
    name: 'Rapid Writing',
    category: 'motor',
    description: 'Write "the" as fast as possible',
    instructions: [
      'Write the word "the" as quickly as you can',
      'Repeat it 10 times',
      'Don\'t worry about perfect handwriting'
    ],
    difficulty: 'medium',
    timeLimit: 30
  },
  {
    id: 'comprehensive_assessment',
    name: 'Comprehensive Assessment',
    category: 'spatial',
    description: 'Complete multi-domain cognitive task',
    instructions: [
      'Draw a house with a tree next to it',
      'Add a sun in the sky',
      'Write your name below the drawing',
      'Include the date at the bottom'
    ],
    expectedElements: ['house', 'tree', 'sun', 'name', 'date'],
    difficulty: 'hard',
    timeLimit: 180
  }
];

export const TASK_CATEGORIES = {
  graphic: 'Graphic Tasks',
  memory: 'Memory Tasks',
  spatial: 'Spatial Tasks',
  motor: 'Motor Tasks'
};

export const TASK_DIFFICULTY_LEVELS = {
  easy: 'Easy',
  medium: 'Medium', 
  hard: 'Hard'
};

// Re-export DiseaseType for convenience
export type { DiseaseType };

// Function to get tasks for a specific disease
export function getTasksForDisease(disease: DiseaseType): HandwritingTask[] {
  return HANDWRITING_TASKS;
}
