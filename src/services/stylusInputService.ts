// Stylus Input Service for Enhanced Handwriting Capture
// Provides advanced stylus and touch input handling with pressure sensitivity

export interface StylusPoint {
  x: number;
  y: number;
  pressure: number;
  timestamp: number;
  tiltX?: number;
  tiltY?: number;
  rotation?: number;
}

export interface StylusStroke {
  points: StylusPoint[];
  startTime: number;
  endTime: number;
  strokeId: string;
  tool: 'pen' | 'eraser' | 'unknown';
}

export interface StylusCapabilities {
  pressure: boolean;
  tilt: boolean;
  rotation: boolean;
  hover: boolean;
  eraser: boolean;
}

export interface StylusSettings {
  pressureSensitivity: number;
  smoothingEnabled: boolean;
  smoothingFactor: number;
  minPressureThreshold: number;
  maxPressureThreshold: number;
}

class StylusInputService {
  private capabilities: StylusCapabilities = {
    pressure: false,
    tilt: false,
    rotation: false,
    hover: false,
    eraser: false
  };

  private settings: StylusSettings = {
    pressureSensitivity: 1.0,
    smoothingEnabled: true,
    smoothingFactor: 0.1,
    minPressureThreshold: 0.1,
    maxPressureThreshold: 1.0
  };

  private currentStroke: StylusPoint[] = [];
  private isDrawing = false;
  private strokeId = 0;

  /**
   * Initialize stylus input detection
   */
  initialize(canvas: HTMLCanvasElement): void {
    this.detectCapabilities();
    this.setupEventListeners(canvas);
  }

  /**
   * Detect stylus capabilities
   */
  private detectCapabilities(): void {
    // Check for Pointer Events API support
    if ('PointerEvent' in window) {
      this.capabilities.pressure = true;
      this.capabilities.tilt = true;
      this.capabilities.hover = true;
    }

    // Check for specific stylus features
    if ('getCoalescedEvents' in PointerEvent.prototype) {
      this.capabilities.pressure = true;
    }

    console.log('Stylus capabilities detected:', this.capabilities);
  }

  /**
   * Setup event listeners for stylus input
   */
  private setupEventListeners(canvas: HTMLCanvasElement): void {
    // Pointer Events (preferred for stylus)
    canvas.addEventListener('pointerdown', this.handlePointerDown.bind(this));
    canvas.addEventListener('pointermove', this.handlePointerMove.bind(this));
    canvas.addEventListener('pointerup', this.handlePointerUp.bind(this));
    canvas.addEventListener('pointercancel', this.handlePointerCancel.bind(this));

    // Touch Events (fallback)
    canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
    canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
    canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));

    // Mouse Events (fallback)
    canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
  }

  /**
   * Handle pointer down events (stylus/touch)
   */
  private handlePointerDown(event: PointerEvent): void {
    if (event.pointerType === 'pen' || event.pointerType === 'touch') {
      event.preventDefault();
      this.startStroke(event);
    }
  }

  /**
   * Handle pointer move events
   */
  private handlePointerMove(event: PointerEvent): void {
    if (this.isDrawing && (event.pointerType === 'pen' || event.pointerType === 'touch')) {
      event.preventDefault();
      this.addPoint(event);
    }
  }

  /**
   * Handle pointer up events
   */
  private handlePointerUp(event: PointerEvent): void {
    if (event.pointerType === 'pen' || event.pointerType === 'touch') {
      event.preventDefault();
      this.endStroke();
    }
  }

  /**
   * Handle pointer cancel events
   */
  private handlePointerCancel(event: PointerEvent): void {
    event.preventDefault();
    this.cancelStroke();
  }

  /**
   * Handle touch start events
   */
  private handleTouchStart(event: TouchEvent): void {
    if (event.touches.length === 1) {
      event.preventDefault();
      const touch = event.touches[0];
      this.startStrokeFromTouch(touch);
    }
  }

  /**
   * Handle touch move events
   */
  private handleTouchMove(event: TouchEvent): void {
    if (this.isDrawing && event.touches.length === 1) {
      event.preventDefault();
      const touch = event.touches[0];
      this.addPointFromTouch(touch);
    }
  }

  /**
   * Handle touch end events
   */
  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    this.endStroke();
  }

  /**
   * Handle mouse down events (fallback)
   */
  private handleMouseDown(event: MouseEvent): void {
    if (!this.isDrawing) {
      this.startStrokeFromMouse(event);
    }
  }

  /**
   * Handle mouse move events
   */
  private handleMouseMove(event: MouseEvent): void {
    if (this.isDrawing) {
      this.addPointFromMouse(event);
    }
  }

  /**
   * Handle mouse up events
   */
  private handleMouseUp(event: MouseEvent): void {
    this.endStroke();
  }

  /**
   * Handle mouse leave events
   */
  private handleMouseLeave(event: MouseEvent): void {
    this.endStroke();
  }

  /**
   * Start a new stroke
   */
  private startStroke(event: PointerEvent): void {
    const canvas = event.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    
    const point: StylusPoint = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      pressure: this.normalizePressure(event.pressure),
      timestamp: Date.now(),
      tiltX: event.tiltX,
      tiltY: event.tiltY,
      rotation: event.twist
    };

    this.currentStroke = [point];
    this.isDrawing = true;
    this.strokeId++;

    // Emit stroke start event
    this.emitStrokeStart(point);
  }

  /**
   * Add point to current stroke
   */
  private addPoint(event: PointerEvent): void {
    if (!this.isDrawing) return;

    const canvas = event.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    
    const point: StylusPoint = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      pressure: this.normalizePressure(event.pressure),
      timestamp: Date.now(),
      tiltX: event.tiltX,
      tiltY: event.tiltY,
      rotation: event.twist
    };

    // Apply smoothing if enabled
    if (this.settings.smoothingEnabled && this.currentStroke.length > 0) {
      const lastPoint = this.currentStroke[this.currentStroke.length - 1];
      point.x = this.smoothValue(lastPoint.x, point.x);
      point.y = this.smoothValue(lastPoint.y, point.y);
    }

    this.currentStroke.push(point);

    // Emit point added event
    this.emitPointAdded(point);
  }

  /**
   * End current stroke
   */
  private endStroke(): void {
    if (!this.isDrawing || this.currentStroke.length === 0) return;

    const stroke: StylusStroke = {
      points: [...this.currentStroke],
      startTime: this.currentStroke[0].timestamp,
      endTime: Date.now(),
      strokeId: `stroke_${this.strokeId}`,
      tool: 'pen'
    };

    this.isDrawing = false;
    this.currentStroke = [];

    // Emit stroke end event
    this.emitStrokeEnd(stroke);
  }

  /**
   * Cancel current stroke
   */
  private cancelStroke(): void {
    this.isDrawing = false;
    this.currentStroke = [];
    this.emitStrokeCancel();
  }

  /**
   * Start stroke from touch event
   */
  private startStrokeFromTouch(touch: Touch): void {
    const canvas = touch.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    
    const point: StylusPoint = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      pressure: 1.0, // Default pressure for touch
      timestamp: Date.now()
    };

    this.currentStroke = [point];
    this.isDrawing = true;
    this.strokeId++;

    this.emitStrokeStart(point);
  }

  /**
   * Add point from touch event
   */
  private addPointFromTouch(touch: Touch): void {
    if (!this.isDrawing) return;

    const canvas = touch.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    
    const point: StylusPoint = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      pressure: 1.0,
      timestamp: Date.now()
    };

    if (this.settings.smoothingEnabled && this.currentStroke.length > 0) {
      const lastPoint = this.currentStroke[this.currentStroke.length - 1];
      point.x = this.smoothValue(lastPoint.x, point.x);
      point.y = this.smoothValue(lastPoint.y, point.y);
    }

    this.currentStroke.push(point);
    this.emitPointAdded(point);
  }

  /**
   * Start stroke from mouse event
   */
  private startStrokeFromMouse(event: MouseEvent): void {
    const canvas = event.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    
    const point: StylusPoint = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      pressure: 1.0, // Default pressure for mouse
      timestamp: Date.now()
    };

    this.currentStroke = [point];
    this.isDrawing = true;
    this.strokeId++;

    this.emitStrokeStart(point);
  }

  /**
   * Add point from mouse event
   */
  private addPointFromMouse(event: MouseEvent): void {
    if (!this.isDrawing) return;

    const canvas = event.target as HTMLCanvasElement;
    const rect = canvas.getBoundingClientRect();
    
    const point: StylusPoint = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      pressure: 1.0,
      timestamp: Date.now()
    };

    if (this.settings.smoothingEnabled && this.currentStroke.length > 0) {
      const lastPoint = this.currentStroke[this.currentStroke.length - 1];
      point.x = this.smoothValue(lastPoint.x, point.x);
      point.y = this.smoothValue(lastPoint.y, point.y);
    }

    this.currentStroke.push(point);
    this.emitPointAdded(point);
  }

  /**
   * Normalize pressure value
   */
  private normalizePressure(pressure: number): number {
    return Math.max(
      this.settings.minPressureThreshold,
      Math.min(this.settings.maxPressureThreshold, pressure * this.settings.pressureSensitivity)
    );
  }

  /**
   * Apply smoothing to coordinate values
   */
  private smoothValue(previous: number, current: number): number {
    return previous + (current - previous) * this.settings.smoothingFactor;
  }

  /**
   * Event emitters
   */
  private emitStrokeStart(point: StylusPoint): void {
    const event = new CustomEvent('stylusStrokeStart', { detail: point });
    window.dispatchEvent(event);
  }

  private emitPointAdded(point: StylusPoint): void {
    const event = new CustomEvent('stylusPointAdded', { detail: point });
    window.dispatchEvent(event);
  }

  private emitStrokeEnd(stroke: StylusStroke): void {
    const event = new CustomEvent('stylusStrokeEnd', { detail: stroke });
    window.dispatchEvent(event);
  }

  private emitStrokeCancel(): void {
    const event = new CustomEvent('stylusStrokeCancel');
    window.dispatchEvent(event);
  }

  /**
   * Update stylus settings
   */
  updateSettings(newSettings: Partial<StylusSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Get current capabilities
   */
  getCapabilities(): StylusCapabilities {
    return { ...this.capabilities };
  }

  /**
   * Get current settings
   */
  getSettings(): StylusSettings {
    return { ...this.settings };
  }

  /**
   * Check if currently drawing
   */
  isCurrentlyDrawing(): boolean {
    return this.isDrawing;
  }

  /**
   * Get current stroke data
   */
  getCurrentStroke(): StylusPoint[] {
    return [...this.currentStroke];
  }
}

// Export singleton instance
export const stylusInputService = new StylusInputService();

// Types are already exported above
