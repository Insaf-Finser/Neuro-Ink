import React, { useState, useRef, useEffect, useRef as useReactRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Clock, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  CheckCircle,
  AlertCircle,
  Play,
  Pause
} from 'lucide-react';
import { stylusInputService, StylusPoint, StylusStroke } from '../../services/stylusInputService';
import { aiAnalysisService, HandwritingData } from '../../services/aiAnalysisService';
import { useTaskCompletion } from '../../hooks/useTaskCompletion';
import TestHarness from '../../components/TestHarness';
import TaskCompletionButton from '../../components/TaskCompletionButton';

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

const Instructions = styled.div`
  background: #f8f9ff;
  border: 2px solid #e8ecff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
`;

const InstructionTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const InstructionText = styled.p`
  color: #555;
  line-height: 1.6;
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

interface DrawingData extends HandwritingData {
  strokes: Array<{
    points: Array<{ x: number; y: number; pressure: number; timestamp: number }>;
    startTime: number;
    endTime: number;
  }>;
  totalTime: number;
  canvasSize: { width: number; height: number };
}

const ClockDrawingTest: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showStartButton, setShowStartButton] = useState(true);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [drawingData, setDrawingData] = useState<DrawingData>({
    strokes: [],
    totalTime: 0,
    canvasSize: { width: 0, height: 0 }
  });
  const [currentStroke, setCurrentStroke] = useState<Array<{ x: number; y: number; pressure: number; timestamp: number; tiltX?: number; tiltY?: number; rotation?: number }>>([]);
  const [allStrokes, setAllStrokes] = useState<Array<{
    points: Array<{ x: number; y: number; pressure: number; timestamp: number; tiltX?: number; tiltY?: number; rotation?: number }>;
    startTime: number;
    endTime: number;
  }>>([]);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(30);
  const [stylusCapabilities, setStylusCapabilities] = useState<any>(null);
  const isPausedRef = useReactRef(false);
  const navigate = useNavigate();
  const { isCompleting, completionError, completeTaskAndNavigate } = useTaskCompletion();

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
    
    setDrawingData(prev => ({
      ...prev,
      canvasSize: { width: rect.width, height: rect.height }
    }));

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
      const stroke = event.detail as StylusStroke;
      setIsDrawing(false);
      
      setDrawingData(prev => ({
        ...prev,
        strokes: [...prev.strokes, {
          points: stroke.points,
          startTime: stroke.startTime,
          endTime: stroke.endTime
        }]
      }));
      
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
  }, [hasStarted, currentStroke]);

  // Autosave and restore draft drawing
  useEffect(() => {
    const saved = localStorage.getItem('clockDrawingDraft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDrawingData(parsed);
      } catch {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('clockDrawingDraft', JSON.stringify(drawingData));
  }, [drawingData]);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (hasStarted && !isPaused) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hasStarted, isPaused]);

  // AI Analysis function
  const analyzeDrawing = () => {
    if (drawingData.strokes.length === 0) return;
    
    const analysis = aiAnalysisService.analyzeHandwriting(drawingData);
    console.log('Handwriting Analysis:', analysis);
    
    // Store analysis results for later use
    localStorage.setItem('clockDrawingAnalysis', JSON.stringify(analysis));
  };

  const handleStartTask = () => {
    setHasStarted(true);
    setShowStartButton(false);
    setTimeElapsed(0);
    setTimeRemaining(30);
    setAllStrokes([]); // Clear all strokes
  };

  const handlePauseToggle = () => {
    setIsPaused(prev => !prev);
  };

  const handleCompleteTask = async () => {
    if (isCompleting) return;
    
    try {
      const completionData = {
        taskId: 'clock_drawing',
        elapsedTime: timeElapsed * 1000,
        strokes: allStrokes,
        canvasSize: {
          width: canvasRef.current?.width || 800,
          height: canvasRef.current?.height || 600
        },
        userInteractions: {
          pauseCount: 0,
          clearCount: 0,
          undoCount: 0
        }
      };

      // Complete task and show comprehensive results with SHAP analysis
      await completeTaskAndNavigate(completionData, undefined, false, true);
    } catch (error) {
      console.error('Error completing task:', error);
      alert(completionError || 'An error occurred while completing the task.');
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawingData({
      strokes: [],
      totalTime: 0,
      canvasSize: { width: canvas.width, height: canvas.height }
    });
    setCurrentStroke([]);
    setAllStrokes([]); // Also clear all strokes
    setHasStarted(false);
    setShowStartButton(true);
    setTimeElapsed(0);
    setIsPaused(false);
    
    // Clear stored analysis
    localStorage.removeItem('clockDrawingAnalysis');
    console.log('Canvas cleared, resetting to start state'); // Debug log
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatus = () => {
    if (!hasStarted) return 'waiting';
    if (isDrawing) return 'drawing';
    return 'completed';
  };

  const getStatusText = () => {
    const status = getStatus();
    switch (status) {
      case 'waiting':
        return 'Ready to start drawing';
      case 'drawing':
        return 'Drawing in progress...';
      case 'completed':
        return 'Drawing completed';
      default:
        return '';
    }
  };

  return (
    <TestContainer>
      <div className="container">
        <TestHeader>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <TestTitle>Clock Drawing Test</TestTitle>
            <TestSubtitle>
              This test evaluates spatial cognition, executive function, and visual-spatial abilities
            </TestSubtitle>
          </motion.div>
        </TestHeader>

        <TestHarness
          title="Clock Drawing"
          step={1}
          totalSteps={4}
          instructions={(
            <div>
              <InstructionText>
                <strong>Step 1:</strong> Draw a clock face on the canvas below. Include all 12 numbers (1-12) positioned correctly around the circle.
              </InstructionText>
              <InstructionText>
                <strong>Step 2:</strong> Draw the hour and minute hands to show the time "10:10" (10 past 10).
              </InstructionText>
              <InstructionText>
                <strong>Step 3:</strong> Take your time and draw as accurately as possible. There's no time limit.
              </InstructionText>
            </div>
          )}
          onPause={() => setIsPaused(prev => !prev)}
          onQuit={() => {
            clearCanvas();
            navigate('/consent');
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
              <TimerText>Time: {formatTime(timeElapsed)}</TimerText>
            </Timer>

            <DrawingArea>
              <Canvas ref={canvasRef} />
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
                <TaskCompletionButton
                  isCompleting={isCompleting}
                  hasStrokes={allStrokes.length > 0}
                  onComplete={handleCompleteTask}
                />
              </>
            )}
          </Controls>

            <ButtonContainer>
              <Button to="/consent" $primary={false}>
                <ArrowLeft size={20} />
                Back to Consent
              </Button>
              <Button to="/test/word-recall" $primary={true}>
                Next Test
                <ArrowRight size={20} />
              </Button>
            </ButtonContainer>
          </TestContent>
        </TestHarness>
      </div>
    </TestContainer>
  );
};

export default ClockDrawingTest;
