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
  Home,
  TreePine,
  Sun,
  Type,
  Calendar
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

const ElementsList = styled.div`
  background: #f0f9ff;
  border: 2px solid #0ea5e9;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
`;

const ElementItem = styled.div<{ $completed?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  color: ${props => props.$completed ? '#059669' : '#0c4a6e'};
  font-weight: 600;
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

const ComprehensiveAssessmentTest: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showStartButton, setShowStartButton] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Array<{ x: number; y: number; pressure: number; timestamp: number; tiltX?: number; tiltY?: number; rotation?: number }>>([]);
  const [stylusCapabilities, setStylusCapabilities] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(180); // 180 seconds for comprehensive assessment
  const [completedElements, setCompletedElements] = useState<string[]>([]);
  
  const isPausedRef = useRef(false);

  const requiredElements = [
    { id: 'house', name: 'House', icon: Home },
    { id: 'tree', name: 'Tree', icon: TreePine },
    { id: 'sun', name: 'Sun', icon: Sun },
    { id: 'name', name: 'Your Name', icon: Type },
    { id: 'date', name: 'Date', icon: Calendar }
  ];

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
    setTimeRemaining(180);
    setCompletedElements([]);
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
      <p>Draw a house with a tree next to it</p>
      <p>Add a sun in the sky</p>
      <p>Write your name below the drawing</p>
      <p>Include the date at the bottom</p>
      <p><strong>Time Limit: 180 seconds</strong></p>
    </>
  );

  return (
    <TestContainer>
      <div className="container">
        <TestHarness title="Comprehensive Assessment"
          instructions={instructionsContent}
          onQuit={handleQuitTest}
          onPause={handlePauseToggle} step={1} totalSteps={21}
        >
          <ElementsList>
            <h4 style={{ margin: '0 0 16px 0', color: '#0c4a6e', fontSize: '18px' }}>Required Elements:</h4>
            {requiredElements.map((element) => {
              const IconComponent = element.icon;
              const isCompleted = completedElements.includes(element.id);
              return (
                <ElementItem key={element.id} $completed={isCompleted}>
                  <IconComponent size={20} />
                  {element.name}
                  {isCompleted && <CheckCircle size={16} />}
                </ElementItem>
              );
            })}
          </ElementsList>

          <Instructions>
            <InstructionsText>
              Complete all the required elements in your drawing
            </InstructionsText>
          </Instructions>

          <StatusIndicator $status={getStatus()}>
            {getStatus() === 'completed' ? (
              <CheckCircle size={20} />
            ) : getStatus() === 'drawing' ? (
              <Home size={20} />
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
              {hasStarted ? 'Draw your comprehensive assessment here...' : 'Click to begin drawing'}
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
            {showStartButton && (
              <ControlButton onClick={handleStartTask} $variant="primary">
                <Play size={16} />
                Start Task
              </ControlButton>
            )}
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
            <Button to="/test/rapid_writing" $primary={false}>
              <ArrowLeft size={20} />
              Previous Task
            </Button>
            <Button to="/results" $primary={true}>
              View Results
              <ArrowRight size={20} />
            </Button>
          </ButtonContainer>
        </TestHarness>
      </div>
    </TestContainer>
  );
};

export default ComprehensiveAssessmentTest;
