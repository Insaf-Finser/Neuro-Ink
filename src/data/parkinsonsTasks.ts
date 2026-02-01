// Parkinson's disease handwriting tasks (UI only - no analysis)
// These tasks are for prototype/research UI purposes only

export interface ParkinsonsTask {
  id: string;
  name: string;
  category: 'motor' | 'spatial' | 'coordination';
  description: string;
  instructions: string[];
  timeLimit?: number; // in seconds
  difficulty: 'easy' | 'medium' | 'hard';
}

export const PARKINSONS_TASKS: ParkinsonsTask[] = [
  {
    id: 'spiral_drawing',
    name: 'Spiral Drawing',
    category: 'motor',
    description: 'Draw a spiral from center outward',
    instructions: [
      'Start from the center and draw outward',
      'Keep the spiral smooth and even',
      'Make about 3-4 complete turns',
      'Focus on maintaining consistent spacing'
    ],
    difficulty: 'medium',
    timeLimit: 60
  },
  {
    id: 'line_tracing',
    name: 'Line Tracing',
    category: 'coordination',
    description: 'Trace the wavy line as accurately as possible',
    instructions: [
      'Follow the wavy line exactly',
      'Stay on the line as closely as possible',
      'Keep your movement smooth and controlled',
      'Take your time to maintain accuracy'
    ],
    difficulty: 'medium',
    timeLimit: 45
  },
  {
    id: 'free_writing',
    name: 'Free Writing',
    category: 'motor',
    description: 'Write a sentence of your choice',
    instructions: [
      'Write any sentence you like',
      'Focus on clear, legible handwriting',
      'Write at your natural pace',
      'Complete at least one full sentence'
    ],
    difficulty: 'easy',
    timeLimit: 90
  }
];

export const PARKINSONS_TASK_CATEGORIES = {
  motor: 'Motor Tasks',
  spatial: 'Spatial Tasks',
  coordination: 'Coordination Tasks'
};


