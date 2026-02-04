import { StylusPoint } from './stylusInputService';
import { ReferenceShapeConfig, ReferenceShapeType } from '../utils/referenceShapes';

export interface DrawingValidationResult {
  completion: number; // 0..100 coverage
  accuracy: number; // 0..100 closeness to reference
  notes: string[];
}

interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

function computeBounds(points: StylusPoint[]): Bounds | null {
  if (!points.length) return null;
  let minX = points[0].x;
  let maxX = points[0].x;
  let minY = points[0].y;
  let maxY = points[0].y;
  points.forEach(p => {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  });
  return { minX, maxX, minY, maxY };
}

function flatten(strokes: StylusPoint[][]): StylusPoint[] {
  return strokes.flatMap(s => s);
}

function averageDistanceFromCenter(points: StylusPoint[], cx: number, cy: number): number {
  if (!points.length) return 0;
  const total = points.reduce((sum, p) => sum + Math.hypot(p.x - cx, p.y - cy), 0);
  return total / points.length;
}

function angularCoverage(points: StylusPoint[], cx: number, cy: number): number {
  if (!points.length) return 0;
  const bucketCount = 36; // 10-degree buckets
  const buckets = new Array(bucketCount).fill(false);
  points.forEach(p => {
    const angle = Math.atan2(p.y - cy, p.x - cx); // -PI..PI
    const normalized = (angle + Math.PI) / (2 * Math.PI); // 0..1
    const bucket = Math.floor(normalized * bucketCount);
    buckets[Math.min(bucketCount - 1, Math.max(0, bucket))] = true;
  });
  const covered = buckets.filter(Boolean).length;
  return (covered / bucketCount) * 100;
}

function validateCircle(strokes: StylusPoint[][], canvasSize: { width: number; height: number }): DrawingValidationResult {
  const points = flatten(strokes);
  if (points.length < 8) {
    return { completion: 0, accuracy: 0, notes: ['Not enough points to evaluate circle'] };
  }

  const bounds = computeBounds(points);
  if (!bounds) return { completion: 0, accuracy: 0, notes: ['No points detected'] };

  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;

  const idealRadius = Math.min(canvasSize.width, canvasSize.height) * 0.35;
  const meanDist = averageDistanceFromCenter(points, cx, cy);
  const radiusError = Math.abs(meanDist - idealRadius);
  const radiusAccuracy = Math.max(0, 100 - (radiusError / idealRadius) * 100);

  const coverage = angularCoverage(points, cx, cy);

  // Check roundness more strictly - aspect ratio should be very close to 1:1
  const aspectRatio = width > 0 ? height / width : 1;
  const roundness = Math.max(0, 100 - Math.abs(1 - aspectRatio) * 200); // More strict penalty

  // Check consistency of distance from center (variance should be low for a circle)
  const distances = points.map(p => Math.hypot(p.x - cx, p.y - cy));
  const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
  const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgDistance, 2), 0) / distances.length;
  const stdDev = Math.sqrt(variance);
  const consistency = Math.max(0, 100 - (stdDev / avgDistance) * 200); // Lower variance = more circular

  // Check for polygon-like corners (circles shouldn't have sharp corners)
  const cornerCount = findCorners(points, 4);
  const cornerPenalty = Math.max(0, 100 - (cornerCount * 15)); // Penalize if it looks like a polygon

  // Weighted accuracy - consistency is most important for circles
  const accuracy = Math.max(0, Math.min(100, 
    (consistency * 0.4 + roundness * 0.3 + radiusAccuracy * 0.2 + cornerPenalty * 0.1)
  ));

  const completion = Math.min(100, Math.max(0, coverage));

  const notes: string[] = [];
  if (coverage < 60) notes.push('Circle not fully closed');
  if (consistency < 60) notes.push('Shape is not consistently round');
  if (roundness < 70) notes.push('Shape appears oval or uneven');
  if (radiusAccuracy < 60) notes.push('Radius deviates from guideline');
  if (cornerCount > 2) notes.push('Shape has corners (not circular)');

  return { completion, accuracy, notes };
}

// Helper to find corners/vertices in a polygon
function findCorners(points: StylusPoint[], expectedSides: number): number {
  if (points.length < expectedSides * 2) return 0;
  
  // Find points that are local maxima/minima (potential corners)
  const corners: StylusPoint[] = [];
  const windowSize = Math.max(3, Math.floor(points.length / (expectedSides * 4)));
  
  for (let i = windowSize; i < points.length - windowSize; i++) {
    const prev = points[i - windowSize];
    const curr = points[i];
    const next = points[i + windowSize];
    
    const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
    const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
    let angleDiff = Math.abs(angle2 - angle1);
    if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
    
    // Significant angle change indicates a corner
    if (angleDiff > Math.PI / 4) {
      corners.push(curr);
    }
  }
  
  return corners.length;
}

// Calculate how close the aspect ratio is to 1:1 (for squares)
function squarenessScore(width: number, height: number): number {
  if (width === 0 || height === 0) return 0;
  const aspectRatio = Math.min(width, height) / Math.max(width, height);
  return aspectRatio * 100;
}

// Calculate how close angles are to expected polygon angles
function polygonAngleScore(points: StylusPoint[], expectedSides: number): number {
  if (points.length < expectedSides * 2) return 0;
  
  const angles: number[] = [];
  const step = Math.floor(points.length / expectedSides);
  
  for (let i = 0; i < points.length - step * 2; i += step) {
    const p1 = points[i];
    const p2 = points[i + step];
    const p3 = points[i + step * 2];
    
    const angle = Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
    let normalizedAngle = angle;
    if (normalizedAngle < 0) normalizedAngle += 2 * Math.PI;
    angles.push(normalizedAngle);
  }
  
  if (angles.length < 2) return 50;
  
  const expectedAngle = (2 * Math.PI) / expectedSides;
  const avgAngle = angles.reduce((sum, a) => sum + a, 0) / angles.length;
  const angleError = Math.abs(avgAngle - expectedAngle);
  return Math.max(0, 100 - (angleError / expectedAngle) * 100);
}

function validateSquare(strokes: StylusPoint[][], canvasSize: { width: number; height: number }): DrawingValidationResult {
  const points = flatten(strokes);
  if (points.length < 8) {
    return { completion: 0, accuracy: 0, notes: ['Not enough points to evaluate square'] };
  }

  const bounds = computeBounds(points);
  if (!bounds) return { completion: 0, accuracy: 0, notes: ['No points detected'] };

  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const area = width * height;
  const canvasArea = canvasSize.width * canvasSize.height;
  const coverage = Math.min(100, Math.max(0, (area / canvasArea) * 300));

  // Check squareness (aspect ratio should be close to 1:1)
  const squareness = squarenessScore(width, height);
  
  // Check for 4 corners
  const cornerCount = findCorners(points, 4);
  const cornerScore = Math.min(100, (cornerCount / 4) * 100);
  
  // Check polygon angles (should be close to 90 degrees for square)
  const angleScore = polygonAngleScore(points, 4);
  
  // Weighted accuracy calculation
  const accuracy = Math.max(0, Math.min(100, 
    (squareness * 0.5 + cornerScore * 0.3 + angleScore * 0.2)
  ));

  const notes: string[] = [];
  if (squareness < 70) notes.push('Shape is not square (aspect ratio off)');
  if (cornerCount < 3) notes.push('Missing corners');
  if (angleScore < 60) notes.push('Angles deviate from 90 degrees');

  return { completion: coverage, accuracy, notes };
}

function validateTriangle(strokes: StylusPoint[][], canvasSize: { width: number; height: number }): DrawingValidationResult {
  const points = flatten(strokes);
  if (points.length < 6) {
    return { completion: 0, accuracy: 0, notes: ['Not enough points to evaluate triangle'] };
  }

  const bounds = computeBounds(points);
  if (!bounds) return { completion: 0, accuracy: 0, notes: ['No points detected'] };

  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const area = width * height;
  const canvasArea = canvasSize.width * canvasSize.height;
  const coverage = Math.min(100, Math.max(0, (area / canvasArea) * 300));

  // Check for 3 corners
  const cornerCount = findCorners(points, 3);
  const cornerScore = Math.min(100, (cornerCount / 3) * 100);
  
  // Check polygon angles (should be close to 60 degrees for equilateral triangle)
  const angleScore = polygonAngleScore(points, 3);
  
  // For equilateral triangle, check if sides are roughly equal
  const sideLengths: number[] = [];
  const step = Math.floor(points.length / 3);
  for (let i = 0; i < points.length - step; i += step) {
    const p1 = points[i];
    const p2 = points[Math.min(i + step, points.length - 1)];
    sideLengths.push(Math.hypot(p2.x - p1.x, p2.y - p1.y));
  }
  const avgSide = sideLengths.reduce((sum, len) => sum + len, 0) / sideLengths.length;
  const sideVariance = sideLengths.reduce((sum, len) => sum + Math.abs(len - avgSide), 0) / sideLengths.length;
  const sideUniformity = Math.max(0, 100 - (sideVariance / avgSide) * 100);

  const accuracy = Math.max(0, Math.min(100, 
    (cornerScore * 0.4 + angleScore * 0.3 + sideUniformity * 0.3)
  ));

  const notes: string[] = [];
  if (cornerCount < 2) notes.push('Missing corners');
  if (angleScore < 60) notes.push('Angles deviate from expected');
  if (sideUniformity < 60) notes.push('Sides are not equal length');

  return { completion: coverage, accuracy, notes };
}

function validatePentagon(strokes: StylusPoint[][], canvasSize: { width: number; height: number }): DrawingValidationResult {
  const points = flatten(strokes);
  if (points.length < 10) {
    return { completion: 0, accuracy: 0, notes: ['Not enough points to evaluate pentagon'] };
  }

  const bounds = computeBounds(points);
  if (!bounds) return { completion: 0, accuracy: 0, notes: ['No points detected'] };

  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const area = width * height;
  const canvasArea = canvasSize.width * canvasSize.height;
  const coverage = Math.min(100, Math.max(0, (area / canvasArea) * 300));

  // Check for 5 corners
  const cornerCount = findCorners(points, 5);
  const cornerScore = Math.min(100, (cornerCount / 5) * 100);
  
  // Check polygon angles
  const angleScore = polygonAngleScore(points, 5);
  
  // Check closure (start and end should be close)
  const startPoint = points[0];
  const endPoint = points[points.length - 1];
  const closureDistance = Math.hypot(endPoint.x - startPoint.x, endPoint.y - startPoint.y);
  const avgDistance = Math.hypot(width, height) / 10;
  const closureScore = Math.max(0, 100 - (closureDistance / avgDistance) * 100);

  const accuracy = Math.max(0, Math.min(100, 
    (cornerScore * 0.4 + angleScore * 0.3 + closureScore * 0.3)
  ));

  const notes: string[] = [];
  if (cornerCount < 3) notes.push('Missing corners');
  if (angleScore < 60) notes.push('Angles deviate from expected');
  if (closureScore < 60) notes.push('Shape not fully closed');

  return { completion: coverage, accuracy, notes };
}

function validateSpiral(strokes: StylusPoint[][], canvasSize: { width: number; height: number }): DrawingValidationResult {
  const points = flatten(strokes);
  if (points.length < 20) {
    return { completion: 0, accuracy: 0, notes: ['Not enough points to evaluate spiral'] };
  }

  const bounds = computeBounds(points);
  if (!bounds) return { completion: 0, accuracy: 0, notes: ['No points detected'] };

  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;
  
  // Check if points follow a spiral pattern (increasing radius from center)
  const radii: number[] = points.map(p => Math.hypot(p.x - cx, p.y - cy));
  const maxRadius = Math.max(...radii);
  const minRadius = Math.min(...radii);
  
  // Calculate how much the radius increases (should be gradual)
  let increasingCount = 0;
  let decreasingCount = 0;
  for (let i = 1; i < radii.length; i++) {
    if (radii[i] > radii[i - 1]) increasingCount++;
    if (radii[i] < radii[i - 1]) decreasingCount++;
  }
  
  // Spiral should have mostly increasing radius (outward) with some variation
  const spiralPattern = increasingCount > decreasingCount 
    ? (increasingCount / (increasingCount + decreasingCount)) * 100
    : 0;
  
  // Check angular coverage (spiral should cover multiple rotations)
  const coverage = angularCoverage(points, cx, cy);
  const expectedCoverage = 200; // Spiral should cover more than a full circle
  const coverageScore = Math.min(100, (coverage / expectedCoverage) * 100);
  
  // Check smoothness (radius should increase gradually, not jump)
  let smoothness = 100;
  for (let i = 1; i < radii.length; i++) {
    const change = Math.abs(radii[i] - radii[i - 1]);
    const maxChange = maxRadius / points.length;
    if (change > maxChange * 3) {
      smoothness -= 5;
    }
  }
  smoothness = Math.max(0, smoothness);

  const accuracy = Math.max(0, Math.min(100, 
    (spiralPattern * 0.4 + coverageScore * 0.3 + smoothness * 0.3)
  ));

  const notes: string[] = [];
  if (spiralPattern < 60) notes.push('Does not follow spiral pattern');
  if (coverageScore < 50) notes.push('Spiral does not complete enough rotations');
  if (smoothness < 60) notes.push('Spiral is not smooth');

  return { completion: Math.min(100, coverage), accuracy, notes };
}

function genericCoverage(strokes: StylusPoint[][], canvasSize: { width: number; height: number }): DrawingValidationResult {
  const points = flatten(strokes);
  if (!points.length) return { completion: 0, accuracy: 0, notes: ['No strokes detected'] };
  const bounds = computeBounds(points);
  if (!bounds) return { completion: 0, accuracy: 0, notes: ['No strokes detected'] };

  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  const area = width * height;
  const canvasArea = canvasSize.width * canvasSize.height;
  const coverage = Math.min(100, Math.max(0, (area / canvasArea) * 300));

  // For generic shapes, use a more conservative accuracy calculation
  // Base accuracy on coverage but penalize heavily for small drawings
  const accuracy = coverage < 10 ? coverage * 0.5 : Math.min(100, coverage * 0.7);

  return { completion: coverage, accuracy, notes: [] };
}

export function validateDrawing(
  reference: ReferenceShapeConfig,
  strokes: StylusPoint[][],
  canvasSize: { width: number; height: number }
): DrawingValidationResult {
  switch (reference.type) {
    case 'circle':
      return validateCircle(strokes, canvasSize);
    case 'square':
      return validateSquare(strokes, canvasSize);
    case 'triangle':
      return validateTriangle(strokes, canvasSize);
    case 'pentagon':
      return validatePentagon(strokes, canvasSize);
    case 'spiral':
      return validateSpiral(strokes, canvasSize);
    default:
      return genericCoverage(strokes, canvasSize);
  }
}










