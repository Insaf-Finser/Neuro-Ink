import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Check, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import TestHarness from '../../components/TestHarness';
import TestResultsDisplay from '../../components/TestResultsDisplay';
import { analyzeTest } from '../../services/testAnalysisService';
import { AIAnalysisResult } from '../../services/aiAnalysisService';
import useTaskCompletion from '../../hooks/useTaskCompletion';

const Container = styled.div`
  padding: 16px 0;
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
          &:active { transform: scale(0.98); }
        `;
      case 'danger':
        return `
          background: #ef4444;
          color: white;
          &:active { transform: scale(0.98); }
        `;
      default:
        return `
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
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

const MazeNavigationTest: React.FC = () => {
  const navigate = useNavigate();

  const [hasStarted, setHasStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(120);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string[]>([]);
  const { completeTaskAndNavigate, isCompleting } = useTaskCompletion();

  const nodes: MazeNode[] = [
    { id: 'S', x: 8, y: 20 },
    { id: 'A', x: 30, y: 20 },
    { id: 'B', x: 55, y: 20 },
    { id: 'C', x: 55, y: 60 },
    { id: 'D', x: 82, y: 60 },
    { id: 'E', x: 92, y: 60 },
    { id: 'X1', x: 30, y: 60 },
    { id: 'X2', x: 30, y: 85 },
  ];
  const edges = new Set(['S-A', 'A-B', 'B-C', 'C-D', 'D-E', 'A-X1', 'X1-X2']);
  const startId = 'S';
  const endId = 'E';

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;
    if (hasStarted && timeRemaining !== null && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
        setTimeRemaining(prev => {
          if (prev === null || prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [hasStarted, timeRemaining]);

  useEffect(() => {
    if (timeRemaining === 0 && hasStarted) {
      void evaluateChoice();
    }
  }, [timeRemaining, hasStarted]);

  const handleStart = () => {
    if (!hasStarted) {
      setHasStarted(true);
      setTimeRemaining(120);
    }
  };

  const clearCanvas = () => {
    setHasStarted(false);
    setTimeElapsed(0);
    setTimeRemaining(120);
    setAiResult(null);
    setIsAnalyzing(false);
    setIsCompleted(false);
    setSelectedPath([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatus = () => {
    if (timeRemaining === 0) return 'completed';
    if (hasStarted && !isCompleted) return 'drawing';
    return 'waiting';
  };

  const toStrokePayload = (path: string[]) => {
    const pathNodes = path.map((id) => nodes.find(n => n.id === id)).filter(Boolean) as MazeNode[];
    if (!pathNodes.length) {
      return { strokes: [], canvasSize: { width: 400, height: 300 } };
    }
    const now = Date.now();
    const points = pathNodes.map((p, idx) => ({
      x: (p.x / 100) * 400,
      y: (p.y / 100) * 300,
      pressure: 0.5,
      timestamp: now + idx * 120,
      tiltX: 0,
      tiltY: 0,
      rotation: 0,
    }));
    return {
      strokes: [{ points, startTime: points[0].timestamp, endTime: points[points.length - 1].timestamp }],
      canvasSize: { width: 400, height: 300 }
    };
  };

  const evaluateChoice = async () => {
    if (selectedPath.length < 2) {
      return;
    }

    setIsAnalyzing(true);
    try {
      const { strokes, canvasSize } = toStrokePayload(selectedPath);
      const totalTimeMs = Math.max(1, timeElapsed * 1000);
      const reachedExit = selectedPath[selectedPath.length - 1] === endId;
      const containsDeadEnd = selectedPath.includes('X2');
      const cognitiveScore = reachedExit && !containsDeadEnd ? 92 : reachedExit ? 74 : 58;
      const analysis = analyzeTest('mazeNavigation', strokes, canvasSize, totalTimeMs, cognitiveScore);
      setAiResult(analysis.aiResult);
      setIsCompleted(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNext = async () => {
    if (selectedPath.length < 2) {
      navigate('/test/pattern_completion');
      return;
    }
    const { strokes, canvasSize } = toStrokePayload(selectedPath);

    await completeTaskAndNavigate(
      {
        taskId: 'maze_navigation',
        elapsedTime: timeElapsed,
        strokes,
        canvasSize,
        userInteractions: {
          pauseCount: 0,
          clearCount: 0,
          undoCount: 0,
        },
      },
      'pattern_completion'
    );
  };

  const instructions = (
    <Instructions>
      <InstructionText>• Analyze the maze and pick the best route to the exit</InstructionText>
      <InstructionText>• Tap connected map points to trace your route from S to E</InstructionText>
      <InstructionText>• Avoid dead-end branches and unnecessary detours</InstructionText>
      <InstructionText style={{ marginTop: '12px', fontWeight: 700 }}>
        ⏱️ Time Limit: 120 seconds
      </InstructionText>
    </Instructions>
  );

  return (
    <Container>
      <TestHarness
        title="Maze Navigation Test"
        step={17}
        totalSteps={21}
        instructions={instructions}
        isComplete={isCompleted}
        onRetry={clearCanvas}
        onNext={handleNext}
        canProceed={isCompleted && !isAnalyzing && !isCompleting}
      >
        <StatusCard $status={getStatus()}>
          {getStatus() === 'completed' ? (
            <CheckCircle size={20} />
          ) : getStatus() === 'drawing' ? (
            <AlertCircle size={20} />
          ) : (
            <Clock size={20} />
          )}
          <StatusText $status={getStatus()}>
            {timeRemaining === 0 ? 'Time\'s up!' :
             hasStarted ? 'Maze planning in progress...' :
             hasStarted ? 'Continue navigating...' : 'Ready to start'}
          </StatusText>
        </StatusCard>

        {hasStarted && (
          <Timer>
            <TimerText>
              ⏱️ {formatTime(timeElapsed)} / Remaining: {timeRemaining !== null ? formatTime(timeRemaining) : '--'}
            </TimerText>
          </Timer>
        )}

        <MazeBoard>
          <MazeTitle>Trace Route On Map (S → E)</MazeTitle>
          {!hasStarted && (
            <Controls>
              <Button $variant="primary" onClick={handleStart}>
                Start Maze Task
              </Button>
            </Controls>
          )}
          {hasStarted && (
            <MazeMap>
              <MazeSvg viewBox="0 0 100 100" preserveAspectRatio="none">
                {[...edges].map((edge) => {
                  const [from, to] = edge.split('-');
                  const n1 = nodes.find(n => n.id === from)!;
                  const n2 = nodes.find(n => n.id === to)!;
                  const idx = selectedPath.findIndex((id, i) => i < selectedPath.length - 1 &&
                    ((id === from && selectedPath[i + 1] === to) || (id === to && selectedPath[i + 1] === from)));
                  const active = idx >= 0;
                  return (
                    <line key={edge} x1={n1.x} y1={n1.y} x2={n2.x} y2={n2.y} stroke={active ? '#2563eb' : '#cbd5e1'} strokeWidth={active ? 3 : 2} />
                  );
                })}
              </MazeSvg>
              {nodes.map((node) => (
                <MazeNodeButton
                  key={node.id}
                  $x={node.x}
                  $y={node.y}
                  $active={selectedPath.includes(node.id)}
                  $isStart={node.id === startId}
                  $isEnd={node.id === endId}
                  disabled={isCompleted}
                  onClick={() => {
                    setSelectedPath((prev) => {
                      if (prev.length === 0) {
                        return node.id === startId ? [startId] : prev;
                      }
                      const last = prev[prev.length - 1];
                      if (node.id === last) return prev;
                      const a = `${last}-${node.id}`;
                      const b = `${node.id}-${last}`;
                      if (!edges.has(a) && !edges.has(b)) return prev;
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

        {aiResult && (
          <div style={{ marginTop: 16 }}>
            <TestResultsDisplay validation={undefined} aiResult={aiResult} />
          </div>
        )}

        {isAnalyzing && (
          <div style={{ textAlign: 'center', color: '#6b7280', marginTop: 8 }}>
            Analyzing maze navigation...
          </div>
        )}

        {hasStarted && timeRemaining !== 0 && !isAnalyzing && !isCompleted && (
          <Controls>
            <Button $variant="primary" onClick={evaluateChoice} disabled={isAnalyzing || selectedPath.length < 2}>
              <Check size={16} />
              Confirm Route
            </Button>
          </Controls>
        )}
      </TestHarness>
    </Container>
  );
};

export default MazeNavigationTest;


