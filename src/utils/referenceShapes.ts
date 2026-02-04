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
  // Helper to draw a rectangular wall using percentage coordinates
  const wall = (topPct: number, leftPct: number, widthPct: number, heightPct: number) => {
    const x = (leftPct / 100) * width;
    const y = (topPct / 100) * height;
    const w = (widthPct / 100) * width;
    const h = (heightPct / 100) * height;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();
  };

  ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';

  // Outer walls (match the test layout proportions)
  wall(10, 10, 80, 6);
  wall(84, 10, 80, 6);
  wall(16, 10, 6, 68);
  wall(16, 84, 6, 68);

  // Inner walls
  wall(30, 20, 60, 4);
  wall(50, 20, 40, 4);
  wall(70, 40, 40, 4);
  wall(30, 20, 4, 30);
  wall(44, 56, 4, 30);

  // Start (S) and End (E) markers
  const drawLabel = (text: string, topPct: number, leftPct: number) => {
    const x = (leftPct / 100) * width;
    const y = (topPct / 100) * height;
    const radius = Math.min(width, height) * 0.035;
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.arc(x, y, radius, 0, TWO_PI);
    ctx.fill();

    ctx.fillStyle = '#111827';
    ctx.font = `${radius * 1.1}px system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  };

  drawLabel('S', 90, 12);
  drawLabel('E', 12, 88);
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
    ctx.beginPath();
    if (dashed) {
      ctx.setLineDash([6, 6]);
    }
    ctx.roundRect(x, y, w, h, 8);
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









