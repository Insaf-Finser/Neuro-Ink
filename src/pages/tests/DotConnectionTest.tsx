import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Check, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { StylusPoint } from '../../services/stylusInputService';
import DrawingCanvas, { DrawingCanvasRef } from '../../components/DrawingCanvas';
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

const PauseOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 24px 32px;
  border-radius: 16px;
  font-size: 18px;
  font-weight: 700;
  z-index: 10;
  pointer-events: none;
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

const DotConnectionTest: React.FC = () => {
  // Version identifier to verify updated code is loaded
  useEffect(() => {
    console.log('[DotConnectionTest] v2.0 - AI Integration Enabled');
  }, []);

  const canvasRef = useRef<DrawingCanvasRef>(null);
  const navigate = useNavigate();
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(60);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [connectedIndices, setConnectedIndices] = useState<number[]>([]);
  const [lastReachedIndex, setLastReachedIndex] = useState(-1);
  const [deviationScore, setDeviationScore] = useState<number | null>(null);
  const [currentPath, setCurrentPath] = useState<StylusPoint[]>([]);
  const { completeTaskAndNavigate, isCompleting } = useTaskCompletion();
  const DOT_COUNT = 10;
  const [dotLayout, setDotLayout] = useState<Array<{ n: number; top: number; left: number }>>([]);

  const generateDotLayout = (count: number) => {
    const dots: Array<{ n: number; top: number; left: number }> = [];
    const minDist = 12; // percentage distance between dots
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
    // Fallback: if we couldn't place all with spacing, just fill remaining randomly.
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
    setDotLayout(generateDotLayout(DOT_COUNT));
  }, []);

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

  // Handle task completion
  useEffect(() => {
    if (timeRemaining === 0 && hasStarted) {
      // Task completed - timer ran out
      setIsDrawing(false);
      evaluateDrawing();
    }
  }, [timeRemaining, hasStarted]);

  const handleCanvasTap = () => {
    if (!hasStarted) {
      setHasStarted(true);
      setTimeRemaining(60);
    }
  };

  const handleStrokeStart = (point: StylusPoint) => {
    if (!hasStarted) return;
    const expectedStart = lastReachedIndex === -1 ? 0 : lastReachedIndex;
    const hit = findHitDotIndex(point);
    if (hit !== expectedStart) return;
    setIsDrawing(true);
    setCurrentPath([point]);
  };

  const handleStrokeEnd = () => {
    setIsDrawing(false);
    if (!isCompleted) {
      setCurrentPath([]);
    }
  };

  const clearCanvas = () => {
    canvasRef.current?.clear();
    setHasStarted(false);
    setIsDrawing(false);
    setTimeElapsed(0);
    setTimeRemaining(60);
    setIsCompleted(false);
    setConnectedIndices([]);
    setLastReachedIndex(-1);
    setDeviationScore(null);
    setCurrentPath([]);
    setDotLayout(generateDotLayout(DOT_COUNT));
  };

  const pointToNorm = (p: StylusPoint) => {
    const size = canvasRef.current?.getCanvasSize() || { width: 1, height: 1 };
    return {
      x: p.x / Math.max(1, size.width),
      y: p.y / Math.max(1, size.height),
    };
  };

  const distanceToSegment = (p: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) => {
    const l2 = (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
    if (l2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
    let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    const projection = { x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) };
    return Math.hypot(p.x - projection.x, p.y - projection.y);
  };

  const findHitDotIndex = (p: StylusPoint) => {
    const np = pointToNorm(p);
    for (let i = 0; i < dotLayout.length; i++) {
      const d = dotLayout[i];
      if (Math.hypot(np.x - d.left / 100, np.y - d.top / 100) < 0.08) return i;
    }
    return -1;
  };

  const segmentDeviation = (path: StylusPoint[], startIdx: number, endIdx: number) => {
    if (!path.length) return 0;
    const a = { x: dotLayout[startIdx].left / 100, y: dotLayout[startIdx].top / 100 };
    const b = { x: dotLayout[endIdx].left / 100, y: dotLayout[endIdx].top / 100 };
    const avg = path.reduce((sum, pt) => sum + distanceToSegment(pointToNorm(pt), a, b), 0) / path.length;
    return avg * 1.6;
  };

  const completeSegment = (pathPoints: StylusPoint[], startIdx: number, endIdx: number) => {
    const dev = segmentDeviation(pathPoints, startIdx, endIdx);
    setConnectedIndices(prev => {
      const next = [...prev];
      if (!next.includes(startIdx)) next.push(startIdx);
      if (!next.includes(endIdx)) next.push(endIdx);
      return next;
    });
    setDeviationScore(prev => (prev ?? 0) + dev);
    setLastReachedIndex(endIdx);
    setCurrentPath([]);
    if (endIdx === dotLayout.length - 1) {
      setIsCompleted(true);
      setIsDrawing(false);
      setDeviationScore(prev => ((prev ?? 0) + dev) / (dotLayout.length - 1));
    }
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

  const instructions = (
    <Instructions>
      <InstructionText>• Connect the {DOT_COUNT} dots in strict order (1 → {DOT_COUNT})</InstructionText>
      <InstructionText>• Start exactly on the current expected dot</InstructionText>
      <InstructionText>• Try to draw straight and steady between dots</InstructionText>
      <InstructionText style={{ marginTop: '12px', fontWeight: 700 }}>
        ⏱️ Time Limit: 60 seconds
      </InstructionText>
    </Instructions>
  );

  const evaluateDrawing = async () => {
    const strokes = canvasRef.current?.getAllStrokes() || [];
    const canvasSize = canvasRef.current?.getCanvasSize() || { width: 0, height: 0 };
    if (!strokes.length || canvasSize.width === 0 || canvasSize.height === 0) {
      return;
    }

    setIsAnalyzing(true);
    try {
      const totalTimeMs = Math.max(1, timeElapsed * 1000);
      const cognitiveScore = Math.max(40, Math.round(100 - ((deviationScore ?? 0.12) * 600)));
      const analysis = analyzeTest('dotConnection', strokes, canvasSize, totalTimeMs, cognitiveScore);
      setAiResult(analysis.aiResult);
      setIsCompleted(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNext = async () => {
    const rawStrokes = canvasRef.current?.getAllStrokes() || [];
    const canvasSize = canvasRef.current?.getCanvasSize() || { width: 0, height: 0 };

    if (!rawStrokes.length || canvasSize.width === 0 || canvasSize.height === 0) {
      navigate('/test/maze_navigation');
      return;
    }

    const strokes = rawStrokes.map(stroke => ({
      points: stroke.map(p => ({
        x: p.x,
        y: p.y,
        pressure: p.pressure ?? 0,
        timestamp: p.timestamp ?? 0,
        tiltX: p.tiltX,
        tiltY: p.tiltY,
        rotation: p.rotation,
      })),
      startTime: stroke[0]?.timestamp ?? 0,
      endTime: stroke[stroke.length - 1]?.timestamp ?? 0,
    }));

    await completeTaskAndNavigate(
      {
        taskId: 'dot_connection',
        elapsedTime: timeElapsed,
        strokes,
        canvasSize,
        userInteractions: {
          pauseCount: 0,
          clearCount: 0,
          undoCount: 0,
        },
      },
      'maze_navigation'
    );
  };

  return (
    <Container>
      <TestHarness
        title="Dot Connection Test"
        step={16}
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
             isDrawing ? 'Drawing in progress...' : 
             hasStarted ? 'Continue drawing...' : 'Ready to start'}
          </StatusText>
        </StatusCard>

        {hasStarted && (
          <Timer>
            <TimerText>
              ⏱️ {formatTime(timeElapsed)} / Remaining: {timeRemaining !== null ? formatTime(timeRemaining) : '--'}
            </TimerText>
          </Timer>
        )}

        <div style={{ position: 'relative' }}>
          {/* Numbered dots with ordered-connection logic */}
          <DotOverlayContainer>
            {dotLayout.map((dot, idx) => (
              <DotLabel key={dot.n} $top={dot.top} $left={dot.left} $connected={connectedIndices.includes(idx)}>
                {dot.n}
              </DotLabel>
            ))}
          </DotOverlayContainer>

          <DrawingCanvas
            ref={canvasRef}
            disabled={!hasStarted}
            placeholder={hasStarted ? (timeRemaining === 0 ? 'Time\'s up! Test completed.' : 'Draw here...') : 'Tap canvas to start test'}
            onTap={handleCanvasTap}
            onStrokeStart={handleStrokeStart}
            onPointAdded={(p) => {
              if (!hasStarted || isCompleted) return;
              setCurrentPath(prev => {
                const next = [...prev, p];
                const hit = findHitDotIndex(p);
                const start = lastReachedIndex === -1 ? 0 : lastReachedIndex;
                const target = start + 1;
                if (hit === target && target < dotLayout.length) {
                  completeSegment(next, start, target);
                }
                return next;
              });
            }}
            onStrokeEnd={handleStrokeEnd}
          />
          {timeRemaining === 0 && hasStarted && (
            <PauseOverlay style={{ background: 'rgba(16, 185, 129, 0.9)' }}>
              ✓ Test Completed
            </PauseOverlay>
          )}
        </div>

        {aiResult && (
          <div style={{ marginTop: 16 }}>
            <TestResultsDisplay validation={undefined} aiResult={aiResult} />
          </div>
        )}

        {isAnalyzing && (
          <div style={{ textAlign: 'center', color: '#6b7280', marginTop: 8 }}>
            Analyzing dot connection...
          </div>
        )}

        {hasStarted && timeRemaining !== 0 && !isAnalyzing && !isCompleted && (
          <Controls>
            <Button $variant="primary" onClick={evaluateDrawing} disabled={isAnalyzing || connectedIndices.length < dotLayout.length}>
              <Check size={16} />
              Done
            </Button>
          </Controls>
        )}
      </TestHarness>
    </Container>
  );
};

export default DotConnectionTest;
