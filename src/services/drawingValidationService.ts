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
  const radius = Math.max(1, Math.min(width, height) / 2);
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cy = (bounds.minY + bounds.maxY) / 2;

  const idealRadius = Math.min(canvasSize.width, canvasSize.height) * 0.35;
  const meanDist = averageDistanceFromCenter(points, cx, cy);
  const radiusError = Math.abs(meanDist - idealRadius);
  const radiusAccuracy = Math.max(0, 100 - (radiusError / idealRadius) * 100);

  const coverage = angularCoverage(points, cx, cy);

  const aspectRatio = width > 0 ? height / width : 1;
  const roundness = Math.max(0, 100 - Math.abs(1 - aspectRatio) * 120); // penalize non-circular bounds

  const accuracy = Math.max(0, Math.min(100, (radiusAccuracy * 0.6 + roundness * 0.2 + coverage * 0.2)));

  const completion = Math.min(100, Math.max(0, coverage));

  const notes: string[] = [];
  if (coverage < 60) notes.push('Circle not fully closed');
  if (radiusAccuracy < 60) notes.push('Radius deviates from guideline');
  if (roundness < 60) notes.push('Shape appears uneven');

  return { completion, accuracy, notes };
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
  const coverage = Math.min(100, Math.max(0, (area / canvasArea) * 500)); // heuristic scaling

  return { completion: coverage, accuracy: coverage, notes: [] };
}

export function validateDrawing(
  reference: ReferenceShapeConfig,
  strokes: StylusPoint[][],
  canvasSize: { width: number; height: number }
): DrawingValidationResult {
  switch (reference.type) {
    case 'circle':
      return validateCircle(strokes, canvasSize);
    default:
      return genericCoverage(strokes, canvasSize);
  }
}


