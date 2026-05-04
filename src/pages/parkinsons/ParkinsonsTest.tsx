import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { RotateCcw, CheckCircle, AlertCircle, Clock, Home, Check } from 'lucide-react';
import DrawingCanvas, { DrawingCanvasRef } from '../../components/DrawingCanvas';
import TestHarness from '../../components/TestHarness';
import { PARKINSONS_TASKS } from '../../data/parkinsonsTasks';
import { getTasksForDisease } from '../../data/handwritingTasks';
import { ReferenceShapeConfig } from '../../utils/referenceShapes';
import { useTaskCompletion } from '../../hooks/useTaskCompletion';
import { getNextTaskId } from '../../utils/testTaskMapping';

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
          &:disabled { opacity: 0.6; cursor: not-allowed; }
          &:active { transform: scale(0.98); }
        `;
      case 'danger':
        return `
          background: #ef4444;
          color: white;
          &:disabled { opacity: 0.6; cursor: not-allowed; }
          &:active { transform: scale(0.98); }
        `;
      default:
        return `
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
          &:disabled { opacity: 0.6; cursor: not-allowed; }
          &:active { transform: scale(0.98); }
        `;
    }
  }}
`;

const StatusCard = styled.div<{ $status: 'waiting' | 'drawing' | 'completed' }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 12px;
  margin-bottom: 20px;
  background: ${props =>
    props.$status === 'completed' ? '#f0fdf4' :
    props.$status === 'drawing' ? '#fef3c7' : '#f3f4f6'
  };
  border: 2px solid ${props =>
    props.$status === 'completed' ? '#10b981' :
    props.$status === 'drawing' ? '#f59e0b' : '#d1d5db'
  };
`;

const StatusText = styled.span<{ $status: string }>`
  font-weight: 600;
  font-size: 15px;
  color: ${props =>
    props.$status === 'completed' ? '#059669' :
    props.$status === 'drawing' ? '#d97706' : '#6b7280'
  };
`;

const Timer = styled.div`
  text-align: center;
  margin-bottom: 20px;
  padding: 12px;
  background: #f8f9ff;
  border-radius: 10px;
`;

const TimerText = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
`;

function referenceForTask(taskId: string): ReferenceShapeConfig | undefined {
  switch (taskId) {
    case 'spiral_drawing':
      return { type: 'spiral' };
    case 'line_tracing':
      return { type: 'line' };
    default:
      return undefined;
  }
}

const ParkinsonsTest: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const navigate = useNavigate();
  const { completeTask, isCompleting, completionError } = useTaskCompletion();

  const task = PARKINSONS_TASKS.find(t => t.id === taskId) ?? null;
  const tasks = getTasksForDisease('parkinsons');
  const hwTask = tasks.find(t => t.id === taskId) ?? null;
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  const totalSteps = tasks.length;

  const [hasStarted, setHasStarted] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [submitDone, setSubmitDone] = useState(false);
  const submitStartedRef = useRef(false);

  const runSubmit = useCallback(async () => {
    if (!task || !hwTask) return;
    if (submitDone || isCompleting || submitStartedRef.current) return;
    submitStartedRef.current = true;
    const strokes = canvasRef.current?.getAllStrokes() || [];
    const canvasSize = canvasRef.current?.getCanvasSize() || { width: 0, height: 0 };

    if (!strokes.length || canvasSize.width === 0) {
      submitStartedRef.current = false;
      return;
    }

    const elapsed = Math.max(1, timeElapsed || task.timeLimit || 1);

    try {
      await completeTask({
        taskId: task.id,
        elapsedTime: elapsed,
        strokes,
        canvasSize
      });
      setSubmitDone(true);
      navigate('/parkinsons/ai-analysis', {
        state: {
          completionData: {
            taskId: task.id,
            taskName: task.name,
            category: hwTask.category,
            difficulty: task.difficulty,
            elapsedTime: elapsed,
            strokes,
            canvasSize
          }
        }
      });
    } catch {
      submitStartedRef.current = false;
    }
  }, [task, hwTask, submitDone, isCompleting, timeElapsed, completeTask, navigate]);

  useEffect(() => {
    if (!task?.timeLimit) return;
    setTimeRemaining(task.timeLimit);
  }, [task?.timeLimit, taskId]);

  useEffect(() => {
    submitStartedRef.current = false;
  }, [taskId]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (hasStarted && timeRemaining !== null && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) return 0;
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hasStarted, timeRemaining]);

  useEffect(() => {
    if (timeRemaining === 0 && hasStarted && !submitDone) {
      void runSubmit();
    }
  }, [timeRemaining, hasStarted, submitDone, runSubmit]);

  if (!task || !hwTask) {
    return (
      <Container>
        <StatusCard $status="waiting">
          <AlertCircle size={20} />
          <StatusText $status="waiting">Task not found</StatusText>
        </StatusCard>
        <Controls>
          <Button onClick={() => navigate('/parkinsons/tests')}>Back to Tasks</Button>
        </Controls>
      </Container>
    );
  }

  const refShape = referenceForTask(task.id);

  const handleCanvasTap = () => {
    if (!hasStarted) {
      setHasStarted(true);
      setTimeRemaining(task.timeLimit ?? null);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatus = (): 'waiting' | 'drawing' | 'completed' => {
    if (submitDone) return 'completed';
    if (timeRemaining === 0) return 'completed';
    if (isDrawing) return 'drawing';
    return 'waiting';
  };

  const handleSubmit = () => void runSubmit();

  const clearCanvas = () => {
    canvasRef.current?.clear();
    setHasStarted(false);
    setIsDrawing(false);
    setTimeElapsed(0);
    setTimeRemaining(task.timeLimit ?? null);
    setSubmitDone(false);
    submitStartedRef.current = false;
  };

  const handleHarnessNext = () => {
    const nextId = getNextTaskId(task.id, 'parkinsons');
    if (nextId) {
      navigate(`/parkinsons/test/${nextId}`);
    } else {
      navigate('/parkinsons/cognitive-results');
    }
  };

  const instructions = (
    <Instructions>
      <InstructionText style={{ fontWeight: 700, marginBottom: 8 }}>{task.name}</InstructionText>
      {task.instructions.map((instruction, index) => (
        <InstructionText key={index}>• {instruction}</InstructionText>
      ))}
      {task.timeLimit != null && (
        <InstructionText style={{ marginTop: 12, fontWeight: 700 }}>
          <Clock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
          Time limit: {task.timeLimit} seconds
        </InstructionText>
      )}
    </Instructions>
  );

  return (
    <Container>
      <TestHarness
        title={`${task.name} — Parkinson's`}
        step={Math.max(1, taskIndex + 1)}
        totalSteps={totalSteps}
        instructions={instructions}
        isComplete={submitDone}
        onRetry={clearCanvas}
        onNext={handleHarnessNext}
        canProceed={submitDone && !isCompleting}
      >
        <ResearchBanner>
          <ResearchLabel>
            <CheckCircle size={18} />
            AI-assisted screening
          </ResearchLabel>
          <ResearchText>
            Your drawing is analyzed with the same on-device pipeline as other NeuroInk handwriting tasks.
            Results are saved to your account. This is not a clinical diagnosis.
          </ResearchText>
        </ResearchBanner>

        <StatusCard $status={getStatus()}>
          {getStatus() === 'completed' ? <CheckCircle size={20} /> : getStatus() === 'drawing' ? <AlertCircle size={20} /> : <Clock size={20} />}
          <StatusText $status={getStatus()}>
            {submitDone
              ? 'Saved — review AI analysis.'
              : timeRemaining === 0
                ? 'Time is up — submitting…'
                : isDrawing
                  ? 'Drawing in progress…'
                  : hasStarted
                    ? 'Continue drawing…'
                    : 'Tap the canvas to start'}
          </StatusText>
        </StatusCard>

        {completionError && (
          <StatusCard $status="drawing">
            <AlertCircle size={20} />
            <StatusText $status="drawing">{completionError}</StatusText>
          </StatusCard>
        )}

        {hasStarted && task.timeLimit != null && (
          <Timer>
            <TimerText>
              {formatTime(timeElapsed)} elapsed · {timeRemaining !== null ? `${formatTime(timeRemaining)} left` : ''}
            </TimerText>
          </Timer>
        )}

        <div style={{ position: 'relative' }}>
          <DrawingCanvas
            ref={canvasRef}
            disabled={!hasStarted || submitDone}
            placeholder={
              !hasStarted
                ? 'Tap canvas to start'
                : submitDone
                  ? 'Task complete'
                  : 'Draw here…'
            }
            onTap={handleCanvasTap}
            onStrokeStart={() => setIsDrawing(true)}
            onStrokeEnd={() => setIsDrawing(false)}
            referenceShape={refShape}
          />
        </div>

        {hasStarted && !submitDone && timeRemaining !== 0 && (
          <Controls>
            <Button $variant="danger" onClick={clearCanvas} disabled={isCompleting}>
              <RotateCcw size={16} />
              Clear
            </Button>
            <Button $variant="primary" onClick={() => void handleSubmit()} disabled={isCompleting}>
              <Check size={16} />
              {isCompleting ? 'Analyzing…' : 'Done'}
            </Button>
            <Button onClick={() => navigate('/parkinsons/tests')} disabled={isCompleting}>
              Back to tasks
            </Button>
          </Controls>
        )}

        {submitDone && (
          <Controls>
            <Button $variant="primary" onClick={handleHarnessNext}>
              {getNextTaskId(task.id, 'parkinsons') ? 'Next task' : 'View all results'}
            </Button>
            <Button onClick={() => navigate('/parkinsons')}>
              <Home size={16} />
              Home
            </Button>
          </Controls>
        )}
      </TestHarness>
    </Container>
  );
};

export default ParkinsonsTest;
