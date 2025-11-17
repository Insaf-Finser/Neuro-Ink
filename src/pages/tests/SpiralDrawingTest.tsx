import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Clock,
  Target
} from 'lucide-react';
import { stylusInputService, StylusPoint } from '../../services/stylusInputService';
import { useTaskCompletion } from '../../hooks/useTaskCompletion';
import TestHarness from '../../components/TestHarness';

const TestContainer = styled.div`
  padding: 40px 0;
  min-height: calc(100vh - 160px);
`;

const DrawingArea = styled.div`
  border: 3px dashed #667eea;
  border-radius: 16px;
  background: #fafbff;
  min-height: 500px;
  position: relative;
  margin-bottom: 32px;
  overflow: hidden;
`;

const Canvas = styled.canvas`
  width: 100%;
  height: 100%;
  cursor: crosshair;
  display: block;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
`;

const Controls = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 24px;
`;

const ControlButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
          }
        `;
      case 'danger':
        return `
          background: #ef4444;
          color: white;
          &:hover {
            background: #dc2626;
          }
        `;
      default:
        return `
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
          &:hover {
            background: #667eea;
            color: white;
          }
        `;
    }
  }}
`;

const Timer = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const TimerText = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: #667eea;
`;

const StatusIndicator = styled.div<{ $status: 'waiting' | 'drawing' | 'completed' }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  background: ${props => 
    props.$status === 'completed' ? '#f0fdf4' :
    props.$status === 'drawing' ? '#fef3c7' : '#f3f4f6'
  };
  border: 2px solid ${props => 
    props.$status === 'completed' ? '#10b981' :
    props.$status === 'drawing' ? '#f59e0b' : '#d1d5db'
  };
`;

const StatusText = styled.div<{ $status: string }>`
  font-weight: 600;
  color: ${props => 
    props.$status === 'completed' ? '#059669' :
    props.$status === 'drawing' ? '#d97706' : '#6b7280'
  };
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 32px;
`;

const Button = styled(Link)<{ $primary?: boolean }>`
  padding: 16px 32px;
  border-radius: 12px;
  text-decoration: none;
  font-size: 16px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;

  ${props => props.$primary ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 8px 30px rgba(102, 126, 234, 0.3);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4);
    }
  ` : `
    background: white;
    color: #667eea;
    border: 2px solid #667eea;

    &:hover {
      background: #667eea;
      color: white;
    }
  `}
`;

const SpiralDrawingTest: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Array<{ x: number; y: number; pressure: number; timestamp: number; tiltX?: number; tiltY?: number; rotation?: number }>>([]);
  const [stylusCapabilities, setStylusCapabilities] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(30);
  
  const isPausedRef = useRef(false);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Configure drawing context
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#667eea';

    // Initialize stylus input service
    stylusInputService.initialize(canvas);
    setStylusCapabilities(stylusInputService.getCapabilities());

    // Setup stylus event listeners
    const handleStrokeStart = (event: CustomEvent) => {
      if (isPausedRef.current) return;
      const point = event.detail as StylusPoint;
      setIsDrawing(true);
      if (!hasStarted) {
        setHasStarted(true);
      }
      setCurrentStroke([{
        x: point.x,
        y: point.y,
        pressure: point.pressure,
        timestamp: point.timestamp,
        tiltX: point.tiltX,
        tiltY: point.tiltY,
        rotation: point.rotation
      }]);
    };

    const handlePointAdded = (event: CustomEvent) => {
      if (isPausedRef.current) return;
      const point = event.detail as StylusPoint;
      setCurrentStroke(prev => [...prev, {
        x: point.x,
        y: point.y,
        pressure: point.pressure,
        timestamp: point.timestamp,
        tiltX: point.tiltX,
        tiltY: point.tiltY,
        rotation: point.rotation
      }]);
      
      // Draw the stroke
      if (ctx && currentStroke.length > 0) {
        const lastPoint = currentStroke[currentStroke.length - 1];
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
    };

    const handleStrokeEnd = (event: CustomEvent) => {
      if (isPausedRef.current) return;
      setIsDrawing(false);
      setCurrentStroke([]);
  };

    // Add event listeners
    canvas.addEventListener('stylus:strokeStart', handleStrokeStart as EventListener);
    canvas.addEventListener('stylus:pointAdded', handlePointAdded as EventListener);
    canvas.addEventListener('stylus:strokeEnd', handleStrokeEnd as EventListener);

    return () => {
      canvas.removeEventListener('stylus:strokeStart', handleStrokeStart as EventListener);
      canvas.removeEventListener('stylus:pointAdded', handlePointAdded as EventListener);
      canvas.removeEventListener('stylus:strokeEnd', handleStrokeEnd as EventListener);
    };
  }, [currentStroke, hasStarted]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (hasStarted && !isPaused) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
        if (timeRemaining !== null) {
          setTimeRemaining(prev => {
            const newTime = prev! - 1;
            if (newTime <= 0) {
              setIsPaused(true);
            }
            return newTime;
          });
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hasStarted, isPaused, timeRemaining]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasStarted(false);
    setTimeElapsed(0);
    setTimeRemaining(30);
  };

  const handlePauseToggle = () => {
    setIsPaused(prev => !prev);
  };

  const handleQuitTest = () => {
    clearCanvas();
    navigate('/tasks');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatus = () => {
    if (timeRemaining === 0) return 'completed';
    if (isDrawing) return 'drawing';
    return 'waiting';
  };

  const getStatusText = () => {
    if (timeRemaining === 0) return 'Time\'s up!';
    if (isDrawing) return 'Drawing in progress...';
    if (hasStarted) return 'Continue drawing...';
    return 'Ready to start';
  };

  const instructionsContent = (
    <>
      <p>Start from the center and draw outward</p>
      <p>Keep the spiral smooth and even</p>
      <p>Make about 3-4 complete turns</p>
      <p><strong>Time Limit: 45 seconds</strong></p>
    </>
  );

  return (
    <TestContainer>
      <div className="container">
        <TestHarness title="Spiral Drawing"
          instructions={instructionsContent}
          onQuit={handleQuitTest}
          onPause={handlePauseToggle} step={1} totalSteps={21}
        >
          <StatusIndicator $status={getStatus()}>
            {getStatus() === 'completed' ? (
              <CheckCircle size={20} />
            ) : getStatus() === 'drawing' ? (
              <Play size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <StatusText $status={getStatus()}>
              {getStatusText()}{isPaused ? ' (Paused)' : ''}
            </StatusText>
          </StatusIndicator>

          <Timer>
            <TimerText>
              Time: {formatTime(timeElapsed)}
              {timeRemaining !== null && (
                <span style={{ marginLeft: '16px', color: timeRemaining < 10 ? '#ef4444' : '#667eea' }}>
                  Remaining: {formatTime(timeRemaining)}
                </span>
              )}
            </TimerText>
          </Timer>

          <DrawingArea>
            <Canvas ref={canvasRef} />
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)',
              color: '#9ca3af',
              fontSize: '16px',
              fontWeight: '500',
              pointerEvents: 'none',
              zIndex: 1
            }}>
              {hasStarted ? 'Draw your spiral here...' : 'Click to begin drawing'}
            </div>
            {stylusCapabilities && (
              <div style={{ 
                position: 'absolute', 
                top: '10px', 
                right: '10px', 
                background: 'rgba(102, 126, 234, 0.9)', 
                color: 'white', 
                padding: '8px 12px', 
                borderRadius: '8px', 
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {stylusCapabilities.pressure ? 'Stylus Detected' : 'Touch/Mouse Mode'}
              </div>
            )}
            {isPaused && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                padding: '20px',
                borderRadius: '12px',
                fontSize: '18px',
                fontWeight: '600'
              }}>
                Task Paused
              </div>
            )}
          </DrawingArea>

          <Controls>
            
            {hasStarted && (
              <>
                <ControlButton onClick={clearCanvas} $variant="danger">
                  <RotateCcw size={16} />
                  Clear
                </ControlButton>
                <ControlButton onClick={handlePauseToggle} $variant="secondary">
                  {isPaused ? <Play size={16} /> : <Pause size={16} />}
                  {isPaused ? 'Resume' : 'Pause'}
                </ControlButton>
              </>
            )}
          </Controls>

          <ButtonContainer>
            <Button to="/test/pentagon_drawing" $primary={false}>
              <ArrowLeft size={20} />
              Previous Task
            </Button>
            <Button to="/test/letter_copy" $primary={true}>
              Next Task
              <ArrowRight size={20} />
            </Button>
          </ButtonContainer>
        </TestHarness>
      </div>
    </TestContainer>
  );
};

export default SpiralDrawingTest;
