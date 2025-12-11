import { RefObject } from 'react';

export type ReferenceShapeType =
  | 'circle'
  | 'square'
  | 'triangle'
  | 'pentagon'
  | 'spiral'
  | 'line'
  | 'dotGrid';

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


