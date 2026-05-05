import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { RotateCcw, CheckCircle, AlertCircle, Clock, Home, Check } from 'lucide-react';
import DrawingCanvas, { DrawingCanvasRef } from '../../components/DrawingCanvas';
import TestHarness from '../../components/TestHarness';
import { PARKINSONS_TASKS } from '../../data/parkinsonsTasks';
import { getTasksForDisease } from '../../data/handwritingTasks';
import { ReferenceShapeConfig } from '../../utils/referenceShapes';
import { useTaskCompletion } from '../../hooks/useTaskCompletion';
import { getTestResults } from '../../services/resultsStorageService';

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

const TaskProgressWrap = styled.div`
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  background: #f8fafc;
`;

const TaskProgressHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
  color: #334155;
  font-weight: 600;
`;

const TaskProgressBar = styled.div`
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: #e2e8f0;
  overflow: hidden;
  margin-bottom: 10px;
`;

const TaskProgressFill = styled.div<{ $percent: number }>`
  width: ${props => props.$percent}%;
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  transition: width 0.25s ease;
`;

const TaskDots = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(30px, 1fr));
  gap: 8px;
`;

const TaskDot = styled.div<{ $state: 'completed' | 'current' | 'pending' }>`
  height: 30px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  border: 2px solid ${props =>
    props.$state === 'completed' ? '#10b981' :
    props.$state === 'current' ? '#667eea' : '#cbd5e1'
  };
  background: ${props =>
    props.$state === 'completed' ? '#ecfdf5' :
    props.$state === 'current' ? '#eef2ff' : '#f8fafc'
  };
  color: ${props =>
    props.$state === 'completed' ? '#047857' :
    props.$state === 'current' ? '#4338ca' : '#64748b'
  };
`;

const TaskResultCard = styled.div`
  margin-top: 16px;
  margin-bottom: 8px;
  padding: 16px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #dbeafe;
`;

const TaskResultTitle = styled.div`
  font-weight: 700;
  color: #1e3a8a;
  margin-bottom: 8px;
`;

const TaskResultGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px;
`;

const TaskResultItem = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 10px;
`;

const TaskResultLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 2px;
`;

const TaskResultValue = styled.div`
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
`;

const DotOverlayContainer = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
`;

const DotLabel = styled.div<{ $top: number; $left: number; $connected?: boolean }>`
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: ${props => (props.$connected ? '#667eea' : 'rgba(255, 255, 255, 0.95)')};
  border: 2px solid #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: ${props => (props.$connected ? '#fff' : '#1f2933')};
  transform: translate(-50%, -50%);
  top: ${props => props.$top}%;
  left: ${props => props.$left}%;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.25);
`;

const MazeBoard = styled.div`
  background: #fff;
  border: 2px solid #dbeafe;
  border-radius: 14px;
  padding: 18px;
  margin-bottom: 16px;
`;

const MazeTitle = styled.h3`
  margin: 0 0 10px 0;
  color: #1e3a8a;
  font-size: 1rem;
`;

const MazeMap = styled.div`
  position: relative;
  width: 100%;
  height: 260px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
`;

const MazeNodeButton = styled.button<{ $x: number; $y: number; $active?: boolean; $isStart?: boolean; $isEnd?: boolean }>`
  position: absolute;
  left: ${p => p.$x}%;
  top: ${p => p.$y}%;
  transform: translate(-50%, -50%);
  width: 28px;
  height: 28px;
  border-radius: 999px;
  border: 2px solid ${p => (p.$active ? '#2563eb' : '#94a3b8')};
  background: ${p => (p.$isStart ? '#bbf7d0' : p.$isEnd ? '#fecaca' : p.$active ? '#dbeafe' : '#fff')};
  color: #0f172a;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
`;

const MazeSvg = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
`;

type MazeNode = {
  id: string;
  x: number;
  y: number;
};

function referenceForTask(taskId: string): ReferenceShapeConfig | undefined {
  switch (taskId) {
    case 'spiral_drawing':
      return { type: 'spiral' };
    case 'line_tracing':
      return { type: 'line' };
    case 'dot_target_tapping':
      return undefined;
    case 'clock_layout_copy':
      return { type: 'circle' };
    case 'symmetry_copy':
      return { type: 'patternBoxes' };
    case 'maze_path_trace':
      return undefined;
    default:
      return undefined;
  }
}

function drawingPlaceholderForTask(taskId: string, hasStarted: boolean, submitDone: boolean): string {
  if (!hasStarted) return 'Tap canvas to start';
  if (submitDone) return 'Task complete';
  switch (taskId) {
    case 'trail_making':
      return 'Trace the alternating sequence path';
    case 'micrographia_sentence':
      return 'Write the sentence three times';
    case 'rapid_stroke_repetition':
      return 'Repeat short vertical strokes';
    case 'signature_repetition':
      return 'Write your signature 3 times';
    default:
      return 'Draw here…';
  }
}

const ParkinsonsTest: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const navigate = useNavigate();
  const { completeTask, isCompleting, completionError } = useTaskCompletion();

  const task = PARKINSONS_TASKS.find(t => t.id === taskId) ?? null;
  const tasks = getTasksForDisease('parkinsons');
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  const totalSteps = tasks.length;

  const [hasStarted, setHasStarted] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [submitDone, setSubmitDone] = useState(false);
  const [taskResult, setTaskResult] = useState<any | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [dotConnectedIndices, setDotConnectedIndices] = useState<number[]>([]);
  const [dotLastReachedIndex, setDotLastReachedIndex] = useState(-1);
  const [dotCurrentPath, setDotCurrentPath] = useState<any[]>([]);
  const submitStartedRef = useRef(false);
  const DOT_COUNT = 10;
  const [dotLayout, setDotLayout] = useState<Array<{ n: number; top: number; left: number }>>([]);
  const isDotTask = task?.id === 'dot_target_tapping';
  const generateDotLayout = (count: number) => {
    const dots: Array<{ n: number; top: number; left: number }> = [];
    const minDist = 12;
    let attempts = 0;
    while (dots.length < count && attempts < 500) {
      attempts++;
      const candidate = {
        n: dots.length + 1,
        top: 12 + Math.random() * 76,
        left: 10 + Math.random() * 80,
      };
      const tooClose = dots.some(d => Math.hypot(d.left - candidate.left, d.top - candidate.top) < minDist);
      if (!tooClose) dots.push(candidate);
    }
    while (dots.length < count) {
      dots.push({
        n: dots.length + 1,
        top: 12 + Math.random() * 76,
        left: 10 + Math.random() * 80,
      });
    }
    return dots;
  };

  useEffect(() => {
    if (isDotTask) {
      setDotLayout(generateDotLayout(DOT_COUNT));
    }
  }, [isDotTask, taskId]);
  const isMazeTask = task?.id === 'maze_path_trace';
  const [selectedMazePath, setSelectedMazePath] = useState<string[]>([]);
  const mazeNodes: MazeNode[] = [
    { id: 'S', x: 8, y: 20 },
    { id: 'A', x: 30, y: 20 },
    { id: 'B', x: 55, y: 20 },
    { id: 'C', x: 55, y: 60 },
    { id: 'D', x: 82, y: 60 },
    { id: 'E', x: 92, y: 60 },
    { id: 'X1', x: 30, y: 60 },
    { id: 'X2', x: 30, y: 85 },
  ];
  const mazeEdges = new Set(['S-A', 'A-B', 'B-C', 'C-D', 'D-E', 'A-X1', 'X1-X2']);
  const mazeStartId = 'S';
  const mazeEndId = 'E';

  useEffect(() => {
    let cancelled = false;
    getTestResults()
      .then((results) => {
        if (cancelled) return;
        const ids = new Set(
          results
            .filter((r) => (r.disease || 'alzheimers') === 'parkinsons' && !!r.taskId)
            .map((r) => r.taskId as string)
        );
        setCompletedTaskIds(ids);
      })
      .catch(() => {
        if (!cancelled) setCompletedTaskIds(new Set());
      });

    return () => {
      cancelled = true;
    };
  }, [taskId]);

  const runSubmit = useCallback(async () => {
    if (!task) return;
    if (submitDone || isCompleting || submitStartedRef.current) return;
    submitStartedRef.current = true;
    let strokes = canvasRef.current?.getAllStrokes() || [];
    let canvasSize = canvasRef.current?.getCanvasSize() || { width: 0, height: 0 };

    if (isMazeTask) {
      if (selectedMazePath.length < 2) {
        submitStartedRef.current = false;
        return;
      }
      const now = Date.now();
      const pathNodes = selectedMazePath.map((id) => mazeNodes.find(n => n.id === id)).filter(Boolean) as MazeNode[];
      const points = pathNodes.map((p, idx) => ({
        x: (p.x / 100) * 400,
        y: (p.y / 100) * 300,
        pressure: 0.5,
        timestamp: now + idx * 120,
        tiltX: 0,
        tiltY: 0,
        rotation: 0,
      }));
      strokes = [points];
      canvasSize = { width: 400, height: 300 };
    }

    if (!strokes.length || canvasSize.width === 0) {
      submitStartedRef.current = false;
      return;
    }

    const elapsed = Math.max(1, timeElapsed || task.timeLimit || 1);

    try {
      const result = await completeTask({
        taskId: task.id,
        disease: 'parkinsons',
        elapsedTime: elapsed,
        strokes,
        canvasSize
      });
      setSubmitDone(true);
      setCompletedTaskIds(prev => {
        const next = new Set(prev);
        next.add(task.id);
        return next;
      });
      setTaskResult(result?.aiAnalysis || null);
    } catch {
      submitStartedRef.current = false;
    }
  }, [task, submitDone, isCompleting, timeElapsed, completeTask, isMazeTask, selectedMazePath, mazeNodes]);

  useEffect(() => {
    if (!task?.timeLimit) return;
    setTimeRemaining(task.timeLimit);
  }, [task?.timeLimit, taskId]);

  useEffect(() => {
    submitStartedRef.current = false;
    setHasStarted(false);
    setIsDrawing(false);
    setTimeElapsed(0);
    setSubmitDone(false);
    if (task?.timeLimit != null) {
      setTimeRemaining(task.timeLimit);
    } else {
      setTimeRemaining(null);
    }
    setTaskResult(null);
    setSelectedMazePath([]);
    setDotConnectedIndices([]);
    setDotLastReachedIndex(-1);
    setDotCurrentPath([]);
    if (isDotTask) {
      setDotLayout(generateDotLayout(DOT_COUNT));
    }
    canvasRef.current?.clear();
  }, [taskId, task?.timeLimit]);

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

  if (!task) {
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
    setTaskResult(null);
    setSelectedMazePath([]);
    setDotConnectedIndices([]);
    setDotLastReachedIndex(-1);
    setDotCurrentPath([]);
    if (isDotTask) {
      setDotLayout(generateDotLayout(DOT_COUNT));
    }
    submitStartedRef.current = false;
  };

  const pointToNorm = (p: any) => {
    const size = canvasRef.current?.getCanvasSize() || { width: 1, height: 1 };
    return { x: p.x / Math.max(1, size.width), y: p.y / Math.max(1, size.height) };
  };

  const findHitDotIndex = (p: any) => {
    const np = pointToNorm(p);
    for (let i = 0; i < dotLayout.length; i++) {
      const d = dotLayout[i];
      if (Math.hypot(np.x - d.left / 100, np.y - d.top / 100) < 0.08) return i;
    }
    return -1;
  };

  const completeDotSegment = (startIdx: number, endIdx: number) => {
    setDotConnectedIndices(prev => {
      const next = [...prev];
      if (!next.includes(startIdx)) next.push(startIdx);
      if (!next.includes(endIdx)) next.push(endIdx);
      return next;
    });
    setDotLastReachedIndex(endIdx);
    setDotCurrentPath([]);
  };

  const handleHarnessNext = () => {
    const nextTask = taskIndex >= 0 ? tasks[taskIndex + 1] : undefined;
    if (nextTask) {
      navigate(`/parkinsons/test/${nextTask.id}`);
    } else {
      navigate('/parkinsons/cognitive-results');
    }
  };

  const rawProbability = taskResult?.probability ?? taskResult?.darwinPrediction ?? null;
  const probabilityPercent = rawProbability == null
    ? null
    : Math.round(rawProbability > 1 ? rawProbability : rawProbability * 100);
  const riskLabel = String(taskResult?.overallRisk || taskResult?.darwinRiskLevel || 'unknown').toUpperCase();
  const completedCount = tasks.filter((t) => completedTaskIds.has(t.id)).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

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
      {isMazeTask && (
        <InstructionText style={{ marginTop: 8 }}>
          Tap connected map points to trace your route from S to E.
        </InstructionText>
      )}
      {isDotTask && (
        <InstructionText style={{ marginTop: 8 }}>
          Connect dots in exact order: 1 → {DOT_COUNT}
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

        <TaskProgressWrap>
          <TaskProgressHeader>
            <span>Task Progress</span>
            <span>{completedCount}/{totalSteps} completed</span>
          </TaskProgressHeader>
          <TaskProgressBar>
            <TaskProgressFill $percent={progressPercent} />
          </TaskProgressBar>
          <TaskDots>
            {tasks.map((t, idx) => {
              const state: 'completed' | 'current' | 'pending' =
                completedTaskIds.has(t.id)
                  ? 'completed'
                  : t.id === task.id
                    ? 'current'
                    : 'pending';
              return (
                <TaskDot key={t.id} $state={state} title={`${idx + 1}. ${t.name}`}>
                  {state === 'completed' ? '✓' : idx + 1}
                </TaskDot>
              );
            })}
          </TaskDots>
        </TaskProgressWrap>

        <StatusCard $status={getStatus()}>
          {getStatus() === 'completed' ? <CheckCircle size={20} /> : getStatus() === 'drawing' ? <AlertCircle size={20} /> : <Clock size={20} />}
          <StatusText $status={getStatus()}>
            {submitDone
              ? 'Saved — continue to the next task.'
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

        {isMazeTask ? (
          <MazeBoard>
            <MazeTitle>Trace Route On Map (S → E)</MazeTitle>
            {!hasStarted && (
              <Controls>
                <Button $variant="primary" onClick={handleCanvasTap}>
                  Start Maze Task
                </Button>
              </Controls>
            )}
            {hasStarted && (
              <MazeMap>
                <MazeSvg viewBox="0 0 100 100" preserveAspectRatio="none">
                  {[...mazeEdges].map((edge) => {
                    const [from, to] = edge.split('-');
                    const n1 = mazeNodes.find(n => n.id === from)!;
                    const n2 = mazeNodes.find(n => n.id === to)!;
                    const idx = selectedMazePath.findIndex((id, i) => i < selectedMazePath.length - 1 &&
                      ((id === from && selectedMazePath[i + 1] === to) || (id === to && selectedMazePath[i + 1] === from)));
                    const active = idx >= 0;
                    return (
                      <line key={edge} x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} stroke={active ? '#2563eb' : '#cbd5e1'} strokeWidth={active ? 3 : 2} />
                    );
                  })}
                </MazeSvg>
                {mazeNodes.map((node) => (
                  <MazeNodeButton
                    key={node.id}
                    $x={node.x}
                    $y={node.y}
                    $active={selectedMazePath.includes(node.id)}
                    $isStart={node.id === mazeStartId}
                    $isEnd={node.id === mazeEndId}
                    disabled={submitDone}
                    onClick={() => {
                      setSelectedMazePath((prev) => {
                        if (prev.length === 0) {
                          return node.id === mazeStartId ? [mazeStartId] : prev;
                        }
                        const last = prev[prev.length - 1];
                        if (node.id === last) return prev;
                        const a = `${last}-${node.id}`;
                        const b = `${node.id}-${last}`;
                        if (!mazeEdges.has(a) && !mazeEdges.has(b)) return prev;
                        return [...prev, node.id];
                      });
                    }}
                  >
                    {node.id}
                  </MazeNodeButton>
                ))}
              </MazeMap>
            )}
          </MazeBoard>
        ) : (
          <div style={{ position: 'relative' }}>
            {isDotTask && (
              <DotOverlayContainer>
                {dotLayout.map((dot, idx) => (
                  <DotLabel key={dot.n} $top={dot.top} $left={dot.left} $connected={dotConnectedIndices.includes(idx)}>
                    {dot.n}
                  </DotLabel>
                ))}
              </DotOverlayContainer>
            )}
            <DrawingCanvas
              key={task.id}
              ref={canvasRef}
              disabled={!hasStarted || submitDone}
              placeholder={drawingPlaceholderForTask(task.id, hasStarted, submitDone)}
              onTap={handleCanvasTap}
              onStrokeStart={(p) => {
                if (isDotTask) {
                  const expectedStart = dotLastReachedIndex === -1 ? 0 : dotLastReachedIndex;
                  const hit = findHitDotIndex(p);
                  if (hit !== expectedStart) return;
                  setDotCurrentPath([p]);
                }
                setIsDrawing(true);
              }}
              onPointAdded={(p) => {
                if (!isDotTask || submitDone) return;
                setDotCurrentPath(prev => {
                  const next = [...prev, p];
                  const hit = findHitDotIndex(p);
                  const start = dotLastReachedIndex === -1 ? 0 : dotLastReachedIndex;
                  const target = start + 1;
                  if (hit === target && target < dotLayout.length) {
                    completeDotSegment(start, target);
                  }
                  return next;
                });
              }}
              onStrokeEnd={() => {
                setIsDrawing(false);
                if (isDotTask && !submitDone) setDotCurrentPath([]);
              }}
              referenceShape={refShape}
            />
          </div>
        )}

        {hasStarted && !submitDone && timeRemaining !== 0 && (
          <Controls>
            <Button $variant="danger" onClick={clearCanvas} disabled={isCompleting}>
              <RotateCcw size={16} />
              Clear
            </Button>
            <Button
              $variant="primary"
              onClick={() => void handleSubmit()}
              disabled={
                isCompleting ||
                (isDotTask && dotConnectedIndices.length < dotLayout.length) ||
                (isMazeTask && selectedMazePath.length < 2)
              }
            >
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
              {taskIndex < totalSteps - 1 ? 'Next task' : 'View all results'}
            </Button>
            <Button onClick={() => navigate('/parkinsons')}>
              <Home size={16} />
              Home
            </Button>
          </Controls>
        )}

        {submitDone && taskResult && (
          <TaskResultCard>
            <TaskResultTitle>Task result for {task.name}</TaskResultTitle>
            <TaskResultGrid>
              <TaskResultItem>
                <TaskResultLabel>Risk level</TaskResultLabel>
                <TaskResultValue>{riskLabel}</TaskResultValue>
              </TaskResultItem>
              <TaskResultItem>
                <TaskResultLabel>Probability</TaskResultLabel>
                <TaskResultValue>{probabilityPercent !== null ? `${probabilityPercent}%` : 'N/A'}</TaskResultValue>
              </TaskResultItem>
              <TaskResultItem>
                <TaskResultLabel>Pressure</TaskResultLabel>
                <TaskResultValue>{taskResult?.biomarkers?.pressure != null ? `${Math.round(taskResult.biomarkers.pressure * 100)}%` : 'N/A'}</TaskResultValue>
              </TaskResultItem>
              <TaskResultItem>
                <TaskResultLabel>Spatial accuracy</TaskResultLabel>
                <TaskResultValue>{taskResult?.biomarkers?.spatialAccuracy != null ? `${Math.round(taskResult.biomarkers.spatialAccuracy * 100)}%` : 'N/A'}</TaskResultValue>
              </TaskResultItem>
            </TaskResultGrid>
          </TaskResultCard>
        )}
      </TestHarness>
    </Container>
  );
};

export default ParkinsonsTest;
