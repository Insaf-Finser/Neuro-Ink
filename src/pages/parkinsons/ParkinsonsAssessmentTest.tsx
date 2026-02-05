import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Clock, ArrowRight, RotateCcw, AlertCircle, Target, Activity, Compass } from 'lucide-react';
import DrawingCanvas, { DrawingCanvasRef } from '../../components/DrawingCanvas';
import TestHarness from '../../components/TestHarness';
import { PARKINSONS_TASKS, PARKINSONS_TASK_CATEGORIES } from '../../data/parkinsonsTasks';
import { analyzeTest } from '../../services/testAnalysisService';

const Container = styled.div`
  padding: 16px 0;
`;

const ResearchBanner = styled.div`
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  border: 2px solid #667eea;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ResearchLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #4338ca;
  font-size: 0.9rem;
`;

const ResearchText = styled.p`
  margin: 0;
  color: #4338ca;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const Instructions = styled.div`
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  color: #92400e;
`;

const InstructionText = styled.p`
  margin: 8px 0;
  font-weight: 500;
  font-size: 15px;
  line-height: 1.6;
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const Button = styled.button<{ $variant?: 'primary' | 'danger' | 'secondary' }>`
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          &:hover:not(:disabled) { 
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
          }
          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          &:active { transform: scale(0.98); }
        `;
      case 'danger':
        return `
          background: #ef4444;
          color: white;
          &:hover:not(:disabled) { 
            background: #dc2626;
            transform: translateY(-2px);
          }
          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          &:active { transform: scale(0.98); }
        `;
      default:
        return `
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
          &:hover:not(:disabled) { 
            background: #e8ecff;
            transform: translateY(-2px);
          }
          &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }
          &:active { transform: scale(0.98); }
        `;
    }
  }}
`;

const StatusCard = styled.div<{ $status?: 'pending' | 'completed' | 'error' }>`
  background: ${props => {
    switch (props.$status) {
      case 'completed':
        return '#ecfdf5';
      case 'error':
        return '#fef2f2';
      default:
        return '#f0f9ff';
    }
  }};
  border: 2px solid ${props => {
    switch (props.$status) {
      case 'completed':
        return '#10b981';
      case 'error':
        return '#ef4444';
      default:
        return '#0284c7';
    }
  }};
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  color: ${props => {
    switch (props.$status) {
      case 'completed':
        return '#065f46';
      case 'error':
        return '#7f1d1d';
      default:
        return '#0c2d48';
    }
  }};
`;

const StatusText = styled.span`
  font-weight: 600;
  font-size: 15px;
`;

const TaskToCompleteCard = styled.div`
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 2px solid #0284c7;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
`;

const TaskToCompleteTitle = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: #0369a1;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
`;

const TaskName = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #0c4a6e;
  margin-bottom: 6px;
`;

const TaskDescription = styled.p`
  margin: 0 0 12px 0;
  font-size: 0.95rem;
  color: #075985;
  line-height: 1.5;
`;

const TaskMeta = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
`;

const TaskBadge = styled.span<{ $variant?: 'category' | 'difficulty' }>`
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.$variant === 'difficulty' ? '#fef3c7' : '#dbeafe'};
  color: ${props => props.$variant === 'difficulty' ? '#92400e' : '#1e40af'};
`;

const TimerDisplay = styled.div<{ $urgent?: boolean }>`
  text-align: center;
  margin: 16px 0;
  font-size: 18px;
  font-weight: 700;
  color: ${props => (props.$urgent ? '#ef4444' : '#667eea')};
`;

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'motor': return <Activity size={16} />;
    case 'coordination': return <Compass size={16} />;
    case 'spatial': return <Target size={16} />;
    default: return <Target size={16} />;
  }
};

const getReferenceShape = (taskId: string) => {
  if (taskId === 'spiral_drawing') return { type: 'spiral' as const };
  if (taskId === 'line_tracing') return { type: 'line' as const };
  return undefined;
};

const ParkinsonsAssessmentTest: React.FC = () => {
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();
  const canvasRef = useRef<DrawingCanvasRef>(null);
  
  // Find the current task
  const currentTask = PARKINSONS_TASKS.find(t => t.id === taskId);
  const taskIndex = PARKINSONS_TASKS.findIndex(t => t.id === taskId);
  const totalTasks = PARKINSONS_TASKS.length;
  
  // State management
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(currentTask?.timeLimit || null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!hasStarted || !currentTask?.timeLimit || isCompleted) {
      return;
    }

    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
      const remaining = (currentTask.timeLimit || 0) - (timeElapsed + 1);
      setTimeRemaining(Math.max(0, remaining));

      if (remaining <= 0) {
        setIsCompleted(true);
        setTimeRemaining(0);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, timeElapsed, currentTask, isCompleted]);

  const handleStart = () => {
    setHasStarted(true);
    setTimeElapsed(0);
  };

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
      setIsEmpty(true);
      setIsDrawing(false);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const strokes = canvasRef.current?.getAllStrokes() ?? [];
      const canvasSize = canvasRef.current?.getCanvasSize() ?? { width: 0, height: 0 };
      const totalTimeMs = Math.max(1, timeElapsed * 1000);
      if (strokes.length && canvasSize.width && canvasSize.height) {
        analyzeTest(
          currentTask?.id ?? 'parkinsons_task',
          strokes,
          canvasSize,
          totalTimeMs,
          undefined,
          'parkinsons'
        );
      }
      setIsCompleted(true);
    } catch (error) {
      console.error('Error completing task:', error);
      setIsCompleted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (taskIndex < totalTasks - 1) {
      // Navigate to next task
      const nextTask = PARKINSONS_TASKS[taskIndex + 1];
      navigate(`/parkinsons/assessment-test/${nextTask.id}`);
    } else {
      // All tasks completed - navigate to results
      navigate('/parkinsons/assessment-results');
    }
  };

  const getStatus = (): 'pending' | 'completed' | 'error' => {
    if (isCompleted) return 'completed';
    return 'pending';
  };

  const getStatusMessage = (): string => {
    if (isCompleted) return 'Task completed! Ready to proceed.';
    if (isEmpty) return 'Draw on the canvas to start';
    return 'Drawing in progress...';
  };

  const instructions = (
    <Instructions>
      {currentTask?.instructions.map((instruction, idx) => (
        <InstructionText key={idx}>• {instruction}</InstructionText>
      ))}
      {currentTask?.timeLimit && (
        <InstructionText style={{ marginTop: '12px', fontWeight: 700 }}>
          ⏱️ Time Limit: {currentTask.timeLimit} seconds
        </InstructionText>
      )}
    </Instructions>
  );

  if (!currentTask) {
    return (
      <Container>
        <StatusCard $status="error">
          <AlertCircle size={20} />
          <StatusText>Task not found. Redirecting...</StatusText>
        </StatusCard>
      </Container>
    );
  }

  return (
    <Container>
      <TestHarness
        title={currentTask.name}
        step={taskIndex + 1}
        totalSteps={totalTasks}
        instructions={instructions}
        isComplete={isCompleted}
        onRetry={handleClear}
        onNext={handleNext}
        canProceed={isCompleted}
      >
        <ResearchBanner>
          <ResearchLabel>
            <AlertCircle size={18} />
            Research Mode
          </ResearchLabel>
          <ResearchText>
            Parkinson's assessment uses its own model (placeholder). Results are for research only.
          </ResearchText>
        </ResearchBanner>

        <TaskToCompleteCard>
          <TaskToCompleteTitle>Task to complete</TaskToCompleteTitle>
          <TaskName>{currentTask.name}</TaskName>
          <TaskDescription>{currentTask.description}</TaskDescription>
          <TaskMeta>
            <TaskBadge>{getCategoryIcon(currentTask.category)} {PARKINSONS_TASK_CATEGORIES[currentTask.category]}</TaskBadge>
            <TaskBadge $variant="difficulty">{currentTask.difficulty}</TaskBadge>
            {currentTask.timeLimit != null && (
              <TaskBadge $variant="difficulty">⏱️ {currentTask.timeLimit}s</TaskBadge>
            )}
          </TaskMeta>
        </TaskToCompleteCard>

        <StatusCard $status={getStatus()}>
          {getStatus() === 'completed' ? (
            <>
              ✓ Task Completed
            </>
          ) : (
            <>
              {isEmpty ? '→' : '↻'} {getStatusMessage()}
            </>
          )}
        </StatusCard>

        {!hasStarted ? (
          <Button $variant="primary" onClick={handleStart} style={{ width: '100%' }}>
            <Clock size={18} />
            Start Task
          </Button>
        ) : (
          <>
            <DrawingCanvas
              ref={canvasRef}
              referenceShape={getReferenceShape(currentTask.id)}
              onStrokeStart={() => {
                if (!hasStarted) setHasStarted(true);
                setIsDrawing(true);
                setIsEmpty(false);
              }}
              onStrokeEnd={() => setIsDrawing(false)}
            />

            {timeRemaining !== null && (
              <TimerDisplay $urgent={timeRemaining <= 10}>
                ⏱️ Time Remaining: {timeRemaining}s
              </TimerDisplay>
            )}

            {!isCompleted && (
              <Controls>
                <Button $variant="danger" onClick={handleClear} disabled={isSubmitting}>
                  <RotateCcw size={16} />
                  Clear
                </Button>
                <Button $variant="primary" onClick={handleSubmit} disabled={isEmpty || isSubmitting}>
                  {isSubmitting ? 'Submitting…' : 'Submit'}
                </Button>
              </Controls>
            )}

            {isCompleted && (
              <Controls>
                <Button $variant="primary" onClick={handleNext}>
                  <ArrowRight size={16} />
                  {taskIndex < totalTasks - 1 ? 'Next Task' : 'View Results'}
                </Button>
              </Controls>
            )}
          </>
        )}
      </TestHarness>
    </Container>
  );
};

export default ParkinsonsAssessmentTest;
