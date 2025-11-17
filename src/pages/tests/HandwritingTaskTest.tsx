import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
  MemoryStick,
  Compass,
  Activity
} from 'lucide-react';
import { stylusInputService, StylusPoint } from '../../services/stylusInputService';
// Removed unused HandwritingData import
import TestHarness from '../../components/TestHarness';
import { HANDWRITING_TASKS, TASK_CATEGORIES } from '../../data/handwritingTasks';

const TestContainer = styled.div`
  padding: 40px 0;
  min-height: calc(100vh - 160px);
`;

const TestHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
`;

const TestTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
`;

const TestSubtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
`;

const TestContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  max-width: 1000px;
  margin: 0 auto;
`;

// Removed unused Instructions styled component

// Removed unused InstructionTitle styled component

// Removed unused InstructionText styled component

const InstructionList = styled.ul`
  color: #555;
  line-height: 1.6;
  margin-left: 20px;
`;

const InstructionItem = styled.li`
  margin-bottom: 8px;
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
  margin-bottom: 32px;
  flex-wrap: wrap;
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

const TaskInfo = styled.div`
  background: #f0f9ff;
  border: 2px solid #e0f2fe;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
`;

const TaskMeta = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 8px;
`;

const TaskCategory = styled.span<{ $category: string }>`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    switch (props.$category) {
      case 'graphic': return '#fef3c7';
      case 'copy': return '#dbeafe';
      case 'memory': return '#fce7f3';
      case 'spatial': return '#dcfce7';
      case 'motor': return '#f3e8ff';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.$category) {
      case 'graphic': return '#92400e';
      case 'copy': return '#1e40af';
      case 'memory': return '#be185d';
      case 'spatial': return '#166534';
      case 'motor': return '#7c3aed';
      default: return '#374151';
    }
  }};
`;

const TaskDifficulty = styled.span<{ $difficulty: string }>`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    switch (props.$difficulty) {
      case 'easy': return '#dcfce7';
      case 'medium': return '#fef3c7';
      case 'hard': return '#fecaca';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.$difficulty) {
      case 'easy': return '#166534';
      case 'medium': return '#92400e';
      case 'hard': return '#dc2626';
      default: return '#374151';
    }
  }};
`;

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'graphic': return <Target size={20} />;
    case 'copy': return <Eye size={20} />;
    case 'memory': return <MemoryStick size={20} />;
    case 'spatial': return <Compass size={20} />;
    case 'motor': return <Activity size={20} />;
    default: return <Brain size={20} />;
  }
};

// Removed unused DrawingData interface

const HandwritingTaskTest: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // Removed unused drawingData state
  const [currentStroke, setCurrentStroke] = useState<Array<{ x: number; y: number; pressure: number; timestamp: number; tiltX?: number; tiltY?: number; rotation?: number }>>([]);
  const [stylusCapabilities, setStylusCapabilities] = useState<any>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  
  const isPausedRef = useRef(false);
  const task = HANDWRITING_TASKS.find(t => t.id === taskId);
  
  console.log('HandwritingTaskTest - taskId from params:', taskId);
  console.log('HandwritingTaskTest - Available tasks:', HANDWRITING_TASKS.map(t => t.id));
  console.log('HandwritingTaskTest - Found task:', task);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    if (!task) {
      console.log('Task not found, navigating to dashboard');
      return;
    }

    console.log('Setting up task:', task.name);
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log('Canvas not found');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Removed setDrawingData call - canvas size tracking not needed

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
      // Removed unused stroke variable
      setIsDrawing(false);
      
      // Removed setDrawingData call - stroke data tracking not needed
      
      setCurrentStroke([]);
    };

    window.addEventListener('stylusStrokeStart', handleStrokeStart as EventListener);
    window.addEventListener('stylusPointAdded', handlePointAdded as EventListener);
    window.addEventListener('stylusStrokeEnd', handleStrokeEnd as EventListener);

    return () => {
      window.removeEventListener('stylusStrokeStart', handleStrokeStart as EventListener);
      window.removeEventListener('stylusPointAdded', handlePointAdded as EventListener);
      window.removeEventListener('stylusStrokeEnd', handleStrokeEnd as EventListener);
    };
  }, [hasStarted, currentStroke, task, navigate]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (hasStarted && !isPaused) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
        if (task?.timeLimit && timeRemaining !== null) {
          setTimeRemaining(prev => {
            const newTime = prev! - 1;
            if (newTime <= 0) {
              // Time's up
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
  }, [hasStarted, isPaused, task?.timeLimit, timeRemaining]);

  useEffect(() => {
    if (task?.timeLimit) {
      setTimeRemaining(task.timeLimit);
    }
  }, [task?.timeLimit]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Removed setDrawingData call - data tracking not needed
    setCurrentStroke([]);
    setHasStarted(false);
    setTimeElapsed(0);
    setIsPaused(false);
    if (task?.timeLimit) {
      setTimeRemaining(task.timeLimit);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatus = () => {
    if (!hasStarted) return 'waiting';
    if (isPaused) return 'waiting';
    if (isDrawing) return 'drawing';
    return 'completed';
  };

  const getStatusText = () => {
    const status = getStatus();
    switch (status) {
      case 'waiting':
        return 'Ready to start';
      case 'drawing':
        return 'Drawing in progress...';
      case 'completed':
        return 'Task completed';
      default:
        return '';
    }
  };

  const getNextTask = () => {
    const currentIndex = HANDWRITING_TASKS.findIndex(t => t.id === taskId);
    if (currentIndex < HANDWRITING_TASKS.length - 1) {
      return HANDWRITING_TASKS[currentIndex + 1];
    }
    return null;
  };

  const getPrevTask = () => {
    const currentIndex = HANDWRITING_TASKS.findIndex(t => t.id === taskId);
    if (currentIndex > 0) {
      return HANDWRITING_TASKS[currentIndex - 1];
    }
    return null;
  };

  if (!task) {
    console.log('Task not found for taskId:', taskId);
    return <div>Task not found</div>;
  }

  console.log('Rendering task:', task.name, 'with taskId:', taskId);

  const currentIndex = HANDWRITING_TASKS.findIndex(t => t.id === taskId);
  const nextTask = getNextTask();
  const prevTask = getPrevTask();

  return (
    <TestContainer>
      <div className="container">
        <TestHeader>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <TestTitle>{task.name}</TestTitle>
            <TestSubtitle>
              {task.description}
            </TestSubtitle>
          </motion.div>
        </TestHeader>

        <TestHarness
          title={task.name}
          step={currentIndex + 1}
          totalSteps={HANDWRITING_TASKS.length}
          instructions={(
            <div>
              <TaskInfo>
                <TaskMeta>
                  <TaskCategory $category={task.category}>
                    {getCategoryIcon(task.category)} {TASK_CATEGORIES[task.category]}
                  </TaskCategory>
                  <TaskDifficulty $difficulty={task.difficulty}>
                    {task.difficulty.toUpperCase()}
                  </TaskDifficulty>
                  {task.timeLimit && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px', color: '#666' }}>
                      <Clock size={16} />
                      {task.timeLimit}s limit
                    </span>
                  )}
                </TaskMeta>
              </TaskInfo>
              <InstructionList>
                {task.instructions.map((instruction, index) => (
                  <InstructionItem key={index}>{instruction}</InstructionItem>
                ))}
              </InstructionList>
            </div>
          )}
          onPause={() => setIsPaused(prev => !prev)}
          onQuit={() => {
            clearCanvas();
            navigate('/dashboard');
          }}
        >
          <TestContent>
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
                  <span style={{ marginLeft: '16px', color: timeRemaining < 30 ? '#ef4444' : '#667eea' }}>
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
                {hasStarted ? 'Draw here...' : 'Click "Start Task" to begin drawing'}
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
                  inset: 0,
                  background: 'rgba(0,0,0,0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 700
                }}>
                  Paused
                </div>
              )}
            </DrawingArea>

            <Controls>
              <ControlButton onClick={clearCanvas} $variant="danger">
                <RotateCcw size={16} />
                Clear Drawing
              </ControlButton>
              <ControlButton onClick={() => setIsPaused(prev => !prev)} $variant={isPaused ? 'primary' : undefined}>
                {isPaused ? <Play size={16} /> : <Pause size={16} />}
                {isPaused ? 'Resume' : 'Pause'}
              </ControlButton>
            </Controls>

            <ButtonContainer>
              {prevTask ? (
                <Button to={`/test/${prevTask.id}`} $primary={false}>
                  <ArrowLeft size={20} />
                  Previous Task
                </Button>
              ) : (
                <Button to="/dashboard" $primary={false}>
                  <ArrowLeft size={20} />
                  Back to Dashboard
                </Button>
              )}
              {nextTask ? (
                <Button to={`/test/${nextTask.id}`} $primary={true}>
                  Next Task
                  <ArrowRight size={20} />
                </Button>
              ) : (
                <Button to="/results" $primary={true}>
                  View Results
                  <ArrowRight size={20} />
                </Button>
              )}
            </ButtonContainer>
          </TestContent>
        </TestHarness>
      </div>
    </TestContainer>
  );
};

export default HandwritingTaskTest;
