import { RefObject } from 'react';

export type ReferenceShapeType =
  | 'circle'
  | 'square'
  | 'triangle'
  | 'pentagon'
  | 'spiral'
  | 'line'
  | 'dotGrid'
  | 'maze'
  | 'patternBoxes';

export interface ReferenceShapeOptions {
  color?: string;
  lineWidth?: number;
  opacity?: number;
}

export interface ReferenceShapeConfig {
  type: ReferenceShapeType;
  options?: ReferenceShapeOptions;
}

const TWO_PI = Math.PI * 2;

const defaultOptions: Required<ReferenceShapeOptions> = {
  color: 'rgba(102, 126, 234, 0.6)',
  lineWidth: 3,
  opacity: 0.6
};

// Helper function to draw rounded rectangle with fallback for older browsers
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  if (typeof (ctx as any).roundRect === 'function') {
    (ctx as any).roundRect(x, y, width, height, radius);
  } else {
    // Fallback for browsers that don't support roundRect
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}

const withDefaults = (options?: ReferenceShapeOptions) => ({
  ...defaultOptions,
  ...(options || {})
});

export function drawReferenceShape(
  ctx: CanvasRenderingContext2D,
  type: ReferenceShapeType,
  width: number,
  height: number,
  options?: ReferenceShapeOptions
): void {
  const { color, lineWidth, opacity } = withDefaults(options);
  ctx.save();
  ctx.clearRect(0, 0, width, height);
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  switch (type) {
    case 'circle':
      drawCircle(ctx, width, height);
      break;
    case 'square':
      drawPolygon(ctx, 4, width, height);
      break;
    case 'triangle':
      drawPolygon(ctx, 3, width, height);
      break;
    case 'pentagon':
      drawPolygon(ctx, 5, width, height);
      break;
    case 'spiral':
      drawSpiral(ctx, width, height);
      break;
    case 'line':
      drawLine(ctx, width, height);
      break;
    case 'dotGrid':
      drawDotGrid(ctx, width, height);
      break;
    case 'maze':
      drawMaze(ctx, width, height);
      break;
    case 'patternBoxes':
      drawPatternBoxes(ctx, width, height);
      break;
    default:
      break;
  }

  ctx.restore();
}

function drawCircle(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const radius = Math.min(width, height) * 0.35;
  const cx = width / 2;
  const cy = height / 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, TWO_PI);
  ctx.stroke();
}

function drawPolygon(ctx: CanvasRenderingContext2D, sides: number, width: number, height: number) {
  const radius = Math.min(width, height) * 0.35;
  const cx = width / 2;
  const cy = height / 2;
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (-Math.PI / 2) + (TWO_PI * i) / sides;
    const x = cx + radius * Math.cos(angle);
    const y = cy + radius * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.stroke();
}

function drawSpiral(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const radius = Math.min(width, height) * 0.35;
  const cx = width / 2;
  const cy = height / 2;
  const turns = 3.2;
  const steps = 240;
  ctx.beginPath();
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * turns * TWO_PI;
    const r = (i / steps) * radius;
    const x = cx + r * Math.cos(t);
    const y = cy + r * Math.sin(t);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawLine(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const margin = Math.min(width, height) * 0.2;
  ctx.beginPath();
  ctx.moveTo(margin, height / 2);
  ctx.lineTo(width - margin, height / 2);
  ctx.stroke();
}

function drawDotGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const spacing = Math.min(width, height) / 6;
  const radius = 3;
  for (let x = spacing; x < width; x += spacing) {
    for (let y = spacing; y < height; y += spacing) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, TWO_PI);
      ctx.fillStyle = 'rgba(156, 163, 175, 0.8)';
      ctx.fill();
    }
  }
}

function drawMaze(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const wallThickness = Math.min(width, height) * 0.033; // ~10px for 300px canvas
  const margin = wallThickness * 1.5;
  const mazeWidth = width - (margin * 2);
  const mazeHeight = height - (margin * 2);
  
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.lineWidth = wallThickness;
  ctx.lineCap = 'square';
  ctx.lineJoin = 'miter';

  // Helper to draw a line segment
  const drawLine = (x1: number, y1: number, x2: number, y2: number) => {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  // Outer walls - top and bottom (full width)
  drawLine(margin, margin, margin + mazeWidth, margin);
  drawLine(margin, margin + mazeHeight, margin + mazeWidth, margin + mazeHeight);

  // Outer walls - left and right (with gaps for entry/exit)
  const gapSize = mazeHeight * 0.1; // Gap size (~30px for 300px)
  const gapY = margin + (mazeHeight - gapSize) / 2; // Center the gap vertically
  
  // Left wall (entry side) - top part
  drawLine(margin, margin, margin, gapY);
  // Left wall - bottom part (skip gap)
  drawLine(margin, gapY + gapSize, margin, margin + mazeHeight);

  // Right wall (exit side) - top part
  drawLine(margin + mazeWidth, margin, margin + mazeWidth, gapY);
  // Right wall - bottom part (skip gap)
  drawLine(margin + mazeWidth, gapY + gapSize, margin + mazeWidth, margin + mazeHeight);

  // Vertical walls positions (based on SVG: 50, 100, 150, 200 for 300px canvas)
  const vWall1 = margin + mazeWidth * 0.167; // ~50px for 300px
  const vWall2 = margin + mazeWidth * 0.333; // ~100px
  const vWall3 = margin + mazeWidth * 0.5;   // ~150px
  const vWall4 = margin + mazeWidth * 0.667; // ~200px

  // Vertical wall 1: from y=50 to bottom (with gap at top)
  const v1GapTop = margin + mazeHeight * 0.167; // Gap starts at ~50px
  drawLine(vWall1, v1GapTop, vWall1, margin + mazeHeight);

  // Vertical wall 2: from top to y=50 (with gap at bottom)
  const v2GapBottom = margin + mazeHeight * 0.167; // Gap ends at ~50px
  drawLine(vWall2, margin, vWall2, v2GapBottom);

  // Vertical wall 3: from y=50 to bottom (with gap at top)
  const v3GapTop = margin + mazeHeight * 0.167; // Gap starts at ~50px
  drawLine(vWall3, v3GapTop, vWall3, margin + mazeHeight);

  // Vertical wall 4: from top to y=50 (with gap at bottom)
  const v4GapBottom = margin + mazeHeight * 0.167; // Gap ends at ~50px
  drawLine(vWall4, margin, vWall4, v4GapBottom);

  // Horizontal walls positions (based on SVG: 50, 100, 150, 200 for 300px canvas)
  const hWall1 = margin + mazeHeight * 0.167; // ~50px
  const hWall2 = margin + mazeHeight * 0.333; // ~100px
  const hWall3 = margin + mazeHeight * 0.5;   // ~150px
  const hWall4 = margin + mazeHeight * 0.667; // ~200px

  // Horizontal wall 1: from x=50 to right (with gap at left)
  const h1GapLeft = margin + mazeWidth * 0.167; // Gap starts at ~50px
  drawLine(h1GapLeft, hWall1, margin + mazeWidth, hWall1);

  // Horizontal wall 2: from left to x=200 (with gap at right)
  const h2GapRight = margin + mazeWidth * 0.667; // Gap ends at ~200px
  drawLine(margin, hWall2, h2GapRight, hWall2);

  // Horizontal wall 3: from x=50 to right (with gap at left)
  const h3GapLeft = margin + mazeWidth * 0.167; // Gap starts at ~50px
  drawLine(h3GapLeft, hWall3, margin + mazeWidth, hWall3);

  // Horizontal wall 4: from left to x=200 (with gap at right)
  const h4GapRight = margin + mazeWidth * 0.667; // Gap ends at ~200px
  drawLine(margin, hWall4, h4GapRight, hWall4);

  // Start (S) and End (E) markers
  const drawLabel = (text: string, x: number, y: number) => {
    const radius = Math.min(width, height) * 0.04;
    ctx.beginPath();
    ctx.fillStyle = 'rgba(16, 185, 129, 0.95)';
    ctx.arc(x, y, radius, 0, TWO_PI);
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.font = `bold ${radius * 1.2}px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  };

  // Start marker on left side (centered in gap)
  drawLabel('S', margin - wallThickness * 0.3, gapY + gapSize / 2);
  // End marker on right side (centered in gap)
  drawLabel('E', margin + mazeWidth + wallThickness * 0.3, gapY + gapSize / 2);
}

function drawPatternBoxes(ctx: CanvasRenderingContext2D, width: number, height: number) {
  // Draw a row of 5 boxes: filled, empty, filled, empty, dashed (next)
  const marginX = width * 0.1;
  const boxAreaWidth = width - marginX * 2;
  const boxWidth = boxAreaWidth / 5;
  const boxHeight = height * 0.25;
  const y = height * 0.35;

  const drawBox = (index: number, filled: boolean, dashed: boolean) => {
    const x = marginX + index * boxWidth + boxWidth * 0.1;
    const w = boxWidth * 0.8;
    const h = boxHeight;

    ctx.save();
    if (dashed) {
      ctx.setLineDash([6, 6]);
    }
    ctx.beginPath();
    drawRoundedRect(ctx, x, y, w, h, 8);
    ctx.stroke();

    if (filled) {
      ctx.fillStyle = 'rgba(75, 85, 99, 0.9)';
      ctx.fill();
    }
    ctx.restore();
  };

  // Outline color
  ctx.strokeStyle = 'rgba(75, 85, 99, 0.9)';
  ctx.lineWidth = 2;

  drawBox(0, true, false);
  drawBox(1, false, false);
  drawBox(2, true, false);
  drawBox(3, false, false);
  drawBox(4, false, true);
}

export function sizeReferenceCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number
): CanvasRenderingContext2D | null {
  const dpr = window.devicePixelRatio || 1;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);
  return ctx;
}









