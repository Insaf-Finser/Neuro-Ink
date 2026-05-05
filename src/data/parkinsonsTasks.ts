// Parkinson's disease handwriting tasks — used with the same AI + Firestore pipeline as other NeuroInk tasks.

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
    id: 'alternating_loops',
    name: 'Alternating Loops',
    category: 'coordination',
    description: 'Draw repeating connected loops in one stroke',
    instructions: [
      'Draw connected loops like cursive "l" shapes',
      'Keep loop height and spacing consistent',
      'Continue in one smooth stroke',
      'Avoid long pauses during the sequence'
    ],
    difficulty: 'medium',
    timeLimit: 60
  },
  {
    id: 'dot_target_tapping',
    name: 'Dot-to-Dot Target Path',
    category: 'coordination',
    description: 'Connect numbered dots in strict order',
    instructions: [
      'Connect points from 1 to 12 in order',
      'Use controlled directional changes',
      'Do not skip any point',
      'Prioritize accuracy over speed'
    ],
    difficulty: 'medium',
    timeLimit: 75
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
  },
  {
    id: 'micrographia_sentence',
    name: 'Repeated Sentence Writing',
    category: 'motor',
    description: 'Write the same short sentence multiple times',
    instructions: [
      'Write: "Today is a bright day" three times',
      'Keep letter size and spacing stable across lines',
      'Maintain your natural writing style',
      'Do not intentionally enlarge letters'
    ],
    difficulty: 'medium',
    timeLimit: 90
  },
  {
    id: 'rapid_stroke_repetition',
    name: 'Rapid Stroke Repetition',
    category: 'motor',
    description: 'Repeat short vertical strokes quickly and evenly',
    instructions: [
      'Draw repeated short vertical strokes for 20 seconds',
      'Keep stroke height similar',
      'Maintain steady rhythm',
      'Avoid lifting for long pauses'
    ],
    difficulty: 'hard',
    timeLimit: 40
  },
  {
    id: 'signature_repetition',
    name: 'Signature Repetition',
    category: 'motor',
    description: 'Write your signature three times',
    instructions: [
      'Write your normal signature three times',
      'Keep size consistent across all attempts',
      'Use your usual pace and pressure',
      'Keep each signature legible'
    ],
    difficulty: 'easy',
    timeLimit: 60
  },
  {
    id: 'clock_layout_copy',
    name: 'Clock Layout Copy',
    category: 'spatial',
    description: 'Draw a clock face and place numbers correctly',
    instructions: [
      'Draw a round clock outline',
      'Place numbers 1-12 in correct positions',
      'Set hands to 10:10',
      'Keep spacing as even as possible'
    ],
    difficulty: 'hard',
    timeLimit: 120
  },
  {
    id: 'cube_copy',
    name: 'Cube Copy',
    category: 'spatial',
    description: 'Draw a wireframe 3D cube',
    instructions: [
      'Draw a cube with visible front and back faces',
      'Connect corners with straight edges',
      'Keep edges proportional',
      'Avoid retracing lines repeatedly'
    ],
    difficulty: 'hard',
    timeLimit: 90
  },
  {
    id: 'trail_making',
    name: 'Trail Making Path',
    category: 'spatial',
    description: 'Trace an alternating sequencing path',
    instructions: [
      'Connect sequence in alternating pattern (1-A-2-B...)',
      'Follow order carefully',
      'Use smooth transitions between targets',
      'Correct mistakes by continuing from the correct item'
    ],
    difficulty: 'hard',
    timeLimit: 120
  },
  {
    id: 'symmetry_copy',
    name: 'Symmetry Pattern Copy',
    category: 'spatial',
    description: 'Copy a symmetric geometric pattern',
    instructions: [
      'Replicate the shown pattern as accurately as possible',
      'Preserve symmetry and spacing',
      'Keep line lengths consistent',
      'Focus on overall structure first'
    ],
    difficulty: 'medium',
    timeLimit: 90
  },
  {
    id: 'maze_path_trace',
    name: 'Maze Path Trace',
    category: 'spatial',
    description: 'Trace a path through a simple maze',
    instructions: [
      'Start at S and reach E',
      'Avoid crossing maze boundaries',
      'Use controlled turns',
      'If you make an error, continue to complete the route'
    ],
    difficulty: 'medium',
    timeLimit: 90
  }
];

export const PARKINSONS_TASK_CATEGORIES = {
  motor: 'Motor and Handwriting Tasks',
  spatial: 'Visuospatial and Executive Tasks',
  coordination: 'Fine Coordination Tasks'
};



