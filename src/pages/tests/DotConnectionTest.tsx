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
  Target,
  Hash,
  Circle
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

const DotGrid = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
`;

const Dot = styled.div<{ $x: number; $y: number; $number: number }>`
  position: absolute;
  left: ${props => props.$x}px;
  top: ${props => props.$y}px;
  width: 20px;
  height: 20px;
  background: #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 12px;
  transform: translate(-50%, -50%);
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Instructions = styled.div`
  background: #fef3c7;
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  text-align: center;
`;

const InstructionsText = styled.div`
  font-weight: 600;
  color: #d97706;
  font-size: 16px;
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

const DotConnectionTest: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showStartButton, setShowStartButton] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Array<{ x: number; y: number; pressure: number; timestamp: number; tiltX?: number; tiltY?: number; rotation?: number }>>([]);
  const [stylusCapabilities, setStylusCapabilities] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(60); // 60 seconds for dot connection
  
  const isPausedRef = useRef(false);

  // Generate dots in a pattern
  const generateDots = () => {
    const dots = [];
    const centerX = 300;
    const centerY = 250;
    const radius = 150;
    
    for (let i = 1; i <= 10; i++) {
      const angle = (i - 1) * (2 * Math.PI / 10) - Math.PI / 2; // Start from top
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      dots.push({ x, y, number: i });
    }
    return dots;
  };

  const dots = generateDots();

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

  const handleStartTask = () => {
    setHasStarted(true);
    setShowStartButton(false);
    setTimeElapsed(0);
    setTimeRemaining(30);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasStarted(false);
    setShowStartButton(true);
    setShowStartButton(true);
    setTimeElapsed(0);
    setTimeRemaining(60);
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
      <p>Connect the dots in order from 1 to 10</p>
      <p>Draw straight lines between consecutive numbers</p>
      <p>Don't lift your pen until finished</p>
      <p><strong>Time Limit: 60 seconds</strong></p>
    </>
  );

  return (
    <TestContainer>
      <div className="container">
        <TestHarness title="Dot Connection"
          instructions={instructionsContent}
          onQuit={handleQuitTest}
          onPause={handlePauseToggle} step={1} totalSteps={21}
        >
          <Instructions>
            <InstructionsText>
              Connect the numbered dots in order from 1 to 10
            </InstructionsText>
          </Instructions>

          <StatusIndicator $status={getStatus()}>
            {getStatus() === 'completed' ? (
              <CheckCircle size={20} />
            ) : getStatus() === 'drawing' ? (
              <Hash size={20} />
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
            <DotGrid>
              {dots.map((dot) => (
                <Dot key={dot.number} $x={dot.x} $y={dot.y} $number={dot.number}>
                  {dot.number}
                </Dot>
              ))}
            </DotGrid>
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
              {hasStarted ? 'Connect the dots...' : 'Click to begin drawing'}
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
            <Button to="/test/pattern_completion" $primary={false}>
              <ArrowLeft size={20} />
              Previous Task
            </Button>
            <Button to="/test/maze_navigation" $primary={true}>
              Next Task
              <ArrowRight size={20} />
            </Button>
          </ButtonContainer>
        </TestHarness>
      </div>
    </TestContainer>
  );
};

export default DotConnectionTest;
