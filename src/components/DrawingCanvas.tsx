import React, { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import styled from 'styled-components';
import { stylusInputService, StylusPoint } from '../services/stylusInputService';

const DrawingArea = styled.div`
  border: 3px dashed #667eea;
  border-radius: 16px;
  background: #fafbff;
  height: 500px;
  position: relative;
  margin-bottom: 24px;
  overflow: hidden;
  width: 100%;
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  overscroll-behavior: contain;
  box-sizing: border-box;

  @media (max-width: 768px) {
    height: 400px;
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    height: 500px;
  }

  @media (min-width: 1025px) {
    height: 600px;
  }
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  cursor: crosshair;
  display: block;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
  box-sizing: border-box;
`;

const PlaceholderText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #9ca3af;
  font-size: 16px;
  font-weight: 500;
  pointer-events: none;
  z-index: 1;
  text-align: center;
  padding: 0 20px;
`;

const StylusIndicator = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(102, 126, 234, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  z-index: 2;
`;

export interface DrawingCanvasRef {
  clear: () => void;
  getCanvasSize: () => { width: number; height: number };
  getAllStrokes: () => StylusPoint[][];
}

export interface DrawingCanvasProps {
  onStrokeStart?: (point: StylusPoint) => void;
  onPointAdded?: (point: StylusPoint) => void;
  onStrokeEnd?: (points: StylusPoint[]) => void;
  onTap?: () => void;
  disabled?: boolean;
  placeholder?: string;
  showStylusIndicator?: boolean;
  lineWidth?: number;
  strokeColor?: string;
}

const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  (
    {
      onStrokeStart,
      onPointAdded,
      onStrokeEnd,
      onTap,
      disabled = false,
      placeholder = 'Draw here...',
      showStylusIndicator = true,
      lineWidth = 3,
      strokeColor = '#667eea',
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const lastPointRef = useRef<StylusPoint | null>(null);
    const isDrawingRef = useRef(false);
    const allStrokesRef = useRef<StylusPoint[][]>([]);
    const currentStrokeRef = useRef<StylusPoint[]>([]);

    // Initialize canvas and context with fixed size
    const initializeCanvas = useCallback(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      
      // Fixed size based on container
      const width = rect.width;
      const height = rect.height;
      
      // Set display size (CSS)
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      // Set actual size in memory (scaled for device pixel ratio)
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }

      // Reset transformation matrix and scale context to match device pixel ratio
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // Configure drawing context
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = strokeColor;

      ctxRef.current = ctx;
    }, [lineWidth, strokeColor]);

    // Clear canvas
    const clear = useCallback(() => {
      const canvas = canvasRef.current;
      const ctx = ctxRef.current;
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      lastPointRef.current = null;
      isDrawingRef.current = false;
      allStrokesRef.current = [];
      currentStrokeRef.current = [];
    }, []);

    // Get canvas size
    const getCanvasSize = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas) return { width: 0, height: 0 };
      return {
        width: canvas.width / (window.devicePixelRatio || 1),
        height: canvas.height / (window.devicePixelRatio || 1),
      };
    }, []);

    // Get all strokes
    const getAllStrokes = useCallback(() => {
      return allStrokesRef.current;
    }, []);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      clear,
      getCanvasSize,
      getAllStrokes,
    }));

    // Initialize canvas when container is ready
    useEffect(() => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      // Wait for container to have dimensions
      const checkAndInit = () => {
        const rect = container.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          initializeCanvas();
          // Initialize stylus input service after canvas is ready
          stylusInputService.initialize(canvas);
        } else {
          // Retry after a short delay if container isn't ready yet
          setTimeout(checkAndInit, 50);
        }
      };

      checkAndInit();
    }, [initializeCanvas]);

    // Setup canvas and event listeners
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Setup event listeners
      const handleStrokeStart = (event: Event) => {
        if (disabled) return;
        const customEvent = event as CustomEvent<StylusPoint>;
        const point = customEvent.detail;
        isDrawingRef.current = true;
        lastPointRef.current = point;
        currentStrokeRef.current = [point];
        
        if (onStrokeStart) {
          onStrokeStart(point);
        }
      };

      const handlePointAdded = (event: Event) => {
        if (disabled || !isDrawingRef.current) return;
        const customEvent = event as CustomEvent<StylusPoint>;
        const point = customEvent.detail;
        const ctx = ctxRef.current;
        const lastPoint = lastPointRef.current;

        if (ctx && lastPoint) {
          // Draw immediately using refs (not state)
          ctx.beginPath();
          ctx.moveTo(lastPoint.x, lastPoint.y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
        }

        lastPointRef.current = point;
        currentStrokeRef.current.push(point);

        if (onPointAdded) {
          onPointAdded(point);
        }
      };

      const handleStrokeEnd = (event: Event) => {
        if (!isDrawingRef.current) return;
        const customEvent = event as CustomEvent<{ points: StylusPoint[] }>;
        isDrawingRef.current = false;
        
        const stroke = [...currentStrokeRef.current];
        if (stroke.length > 0) {
          allStrokesRef.current.push(stroke);
        }
        
        lastPointRef.current = null;
        currentStrokeRef.current = [];

        if (onStrokeEnd && stroke.length > 0) {
          onStrokeEnd(stroke);
        }
      };

      // Handle tap/click to start task (only when disabled/not started)
      const handleTap = (e: MouseEvent | TouchEvent) => {
        // Only handle tap if canvas is disabled (not started yet)
        if (disabled && onTap) {
          e.preventDefault();
          e.stopPropagation();
          onTap();
        }
      };

      // Add event listeners - stylus service dispatches on window
      window.addEventListener('stylusStrokeStart', handleStrokeStart);
      window.addEventListener('stylusPointAdded', handlePointAdded);
      window.addEventListener('stylusStrokeEnd', handleStrokeEnd);
      
      // Add tap handlers for starting task
      if (onTap) {
        canvas.addEventListener('click', handleTap);
        canvas.addEventListener('touchend', handleTap);
      }

      return () => {
        window.removeEventListener('stylusStrokeStart', handleStrokeStart);
        window.removeEventListener('stylusPointAdded', handlePointAdded);
        window.removeEventListener('stylusStrokeEnd', handleStrokeEnd);
        if (onTap) {
          canvas.removeEventListener('click', handleTap);
          canvas.removeEventListener('touchend', handleTap);
        }
      };
    }, [disabled, initializeCanvas, onStrokeStart, onPointAdded, onStrokeEnd, onTap]);

    const stylusCapabilities = stylusInputService.getCapabilities();

    return (
      <DrawingArea ref={containerRef}>
        <Canvas ref={canvasRef} />
        <PlaceholderText>{placeholder}</PlaceholderText>
        {showStylusIndicator && stylusCapabilities && (
          <StylusIndicator>
            {stylusCapabilities.pressure ? 'Stylus Detected' : 'Touch/Mouse Mode'}
          </StylusIndicator>
        )}
      </DrawingArea>
    );
  }
);

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;

