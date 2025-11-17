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
  Brain,
  Eye,
  EyeOff,
  Type,
  Users
} from 'lucide-react';
import { stylusInputService, StylusPoint } from '../../services/stylusInputService';
import TestHarness from '../../components/TestHarness';

const TestContainer = styled.div`
  padding: 40px 0;
  min-height: calc(100vh - 160px);
`;

const WritingArea = styled.div`
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

const MemoryPhase = styled.div`
  background: #f0f9ff;
  border: 2px solid #0ea5e9;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  text-align: center;
`;

const MemoryText = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: #0c4a6e;
  letter-spacing: 0.2rem;
  font-family: 'Courier New', monospace;
  margin-bottom: 16px;
  line-height: 1.4;
`;

const PhaseIndicator = styled.div<{ $phase: 'memorize' | 'recall' }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  background: ${props => 
    props.$phase === 'memorize' ? '#fef3c7' : '#f0fdf4'
  };
  border: 2px solid ${props => 
    props.$phase === 'memorize' ? '#f59e0b' : '#10b981'
  };
`;

const PhaseText = styled.div<{ $phase: string }>`
  font-weight: 600;
  color: ${props => 
    props.$phase === 'memorize' ? '#d97706' : '#059669'
  };
`;

const CountdownTimer = styled.div`
  background: #dc2626;
  color: white;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 24px;
  font-size: 1.5rem;
  font-weight: 700;
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

const StatusIndicator = styled.div<{ $status: 'waiting' | 'memorizing' | 'recalling' | 'completed' }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  background: ${props => 
    props.$status === 'completed' ? '#f0fdf4' :
    props.$status === 'recalling' ? '#fef3c7' :
    props.$status === 'memorizing' ? '#dbeafe' : '#f3f4f6'
  };
  border: 2px solid ${props => 
    props.$status === 'completed' ? '#10b981' :
    props.$status === 'recalling' ? '#f59e0b' :
    props.$status === 'memorizing' ? '#3b82f6' : '#d1d5db'
  };
`;

const StatusText = styled.div<{ $status: string }>`
  font-weight: 600;
  color: ${props => 
    props.$status === 'completed' ? '#059669' :
    props.$status === 'recalling' ? '#d97706' :
    props.$status === 'memorizing' ? '#2563eb' : '#6b7280'
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

const NameMemoryTest: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  
  const [isWriting, setIsWriting] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
    const [currentStroke, setCurrentStroke] = useState<Array<{ x: number; y: number; pressure: number; timestamp: number; tiltX?: number; tiltY?: number; rotation?: number }>>([]);
  const [stylusCapabilities, setStylusCapabilities] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(90); // 90 seconds total
  const [phase, setPhase] = useState<'memorize' | 'recall'>('memorize');
  const [memorizeTime, setMemorizeTime] = useState(30); // 30 seconds to memorize
  const [showNames, setShowNames] = useState(true);
  
  const isPausedRef = useRef(false);

  const namesToMemorize = ['JOHN', 'MARY', 'DAVID', 'SARAH', 'MICHAEL'];

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
      if (isPausedRef.current || phase === 'memorize') return;
      const point = event.detail as StylusPoint;
      setIsWriting(true);
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
      if (isPausedRef.current || phase === 'memorize') return;
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
      if (isPausedRef.current || phase === 'memorize') return;
      setIsWriting(false);
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
  }, [currentStroke, hasStarted, phase]);

  // Phase transition effect
  useEffect(() => {
    if (phase === 'memorize' && memorizeTime > 0) {
      const timer = setTimeout(() => {
        setMemorizeTime(prev => {
          if (prev <= 1) {
            setPhase('recall');
            setShowNames(false);
            setTimeRemaining(60); // 60 seconds to write
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, memorizeTime]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (hasStarted && !isPaused && phase === 'recall') {
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
  }, [hasStarted, isPaused, timeRemaining, phase]);

  const handleStartTask = () => {
    setHasStarted(true);
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
            setTimeElapsed(0);
    setTimeRemaining(90);
    setPhase('memorize');
    setMemorizeTime(30);
    setShowNames(true);
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
    if (isWriting) return 'recalling';
    if (phase === 'memorize') return 'memorizing';
    return 'waiting';
  };

  const getStatusText = () => {
    if (timeRemaining === 0) return 'Time\'s up!';
    if (isWriting) return 'Writing names from memory...';
    if (phase === 'memorize') return 'Memorizing names...';
    if (hasStarted) return 'Continue writing...';
    return 'Ready to start';
  };

  const instructionsContent = (
    <>
      <p>Remember these names: JOHN, MARY, DAVID, SARAH, MICHAEL</p>
      <p>After 30 seconds, write them from memory</p>
      <p>Write them in any order</p>
      <p><strong>Time Limit: 90 seconds total</strong></p>
    </>
  );

  return (
    <TestContainer>
      <div className="container">
        <TestHarness title="Name Memory"
          instructions={instructionsContent}
          onQuit={handleQuitTest}
          onPause={handlePauseToggle} step={1} totalSteps={21}
        >
          {phase === 'memorize' && showNames && (
            <MemoryPhase>
              <MemoryText>{namesToMemorize.join(' ')}</MemoryText>
              <CountdownTimer>
                Memorize Time: {formatTime(memorizeTime)}
              </CountdownTimer>
            </MemoryPhase>
          )}

          <PhaseIndicator $phase={phase}>
            {phase === 'memorize' ? (
              <Eye size={20} />
            ) : (
              <Users size={20} />
            )}
            <PhaseText $phase={phase}>
              {phase === 'memorize' ? 'Memorization Phase' : 'Recall Phase'}
            </PhaseText>
          </PhaseIndicator>

          <StatusIndicator $status={getStatus()}>
            {getStatus() === 'completed' ? (
              <CheckCircle size={20} />
            ) : getStatus() === 'recalling' ? (
              <Type size={20} />
            ) : getStatus() === 'memorizing' ? (
              <Eye size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <StatusText $status={getStatus()}>
              {getStatusText()}{isPaused ? ' (Paused)' : ''}
            </StatusText>
          </StatusIndicator>

          {phase === 'recall' && (
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
          )}

          <WritingArea>
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
              {phase === 'memorize' ? 'Memorize the names above...' : 
               hasStarted ? 'Write the names from memory...' : 'Click "Start Task" button to begin'}
            </div>
            {stylusCapabilities && phase === 'recall' && (
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
            {isPaused && phase === 'recall' && (
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
          </WritingArea>

          <Controls>
            {!hasStarted && (
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
            <Button to="/test/line_tracing" $primary={false}>
              <ArrowLeft size={20} />
              Previous Task
            </Button>
            <Button to="/test/number_memory" $primary={true}>
              Next Task
              <ArrowRight size={20} />
            </Button>
          </ButtonContainer>
        </TestHarness>
      </div>
    </TestContainer>
  );
};

export default NameMemoryTest;
