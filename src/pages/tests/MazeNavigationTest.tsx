import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { RotateCcw, CheckCircle, AlertCircle, Clock } from 'lucide-react';
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

const MazeOverlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
`;

const MazeWall = styled.div<{ $top: number; $left: number; $width: number; $height: number }>`
  position: absolute;
  background: rgba(15, 23, 42, 0.35);
  border-radius: 6px;
  top: ${p => p.$top}%;
  left: ${p => p.$left}%;
  width: ${p => p.$width}%;
  height: ${p => p.$height}%;
`;

const MazeLabel = styled.div<{ $top: number; $left: number }>`
  position: absolute;
  transform: translate(-50%, -50%);
  top: ${p => p.$top}%;
  left: ${p => p.$left}%;
  background: rgba(255, 255, 255, 0.95);
  color: #111827;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(15, 23, 42, 0.25);
`;

const MazeNavigationTest: React.FC = () => {
  // Version identifier to verify updated code is loaded
  useEffect(() => {
    console.log('[MazeNavigationTest] v2.0 - AI Integration Enabled');
  }, []);

  const canvasRef = useRef<DrawingCanvasRef>(null);
  const navigate = useNavigate();

  const [isDrawing, setIsDrawing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(120);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { completeTaskAndNavigate, isCompleting } = useTaskCompletion();

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
      setIsDrawing(false);
      evaluateDrawing();
    }
  }, [timeRemaining, hasStarted]);

  const handleCanvasTap = () => {
    if (!hasStarted) {
      setHasStarted(true);
      setTimeRemaining(120);
    }
  };

  const handleStrokeStart = (point: StylusPoint) => {
    if (!hasStarted) return;
    setIsDrawing(true);
  };

  const handleStrokeEnd = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    canvasRef.current?.clear();
    setHasStarted(false);
    setIsDrawing(false);
    setTimeElapsed(0);
    setTimeRemaining(120);
    setAiResult(null);
    setIsAnalyzing(false);
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

  const evaluateDrawing = async () => {
    const strokes = canvasRef.current?.getAllStrokes() || [];
    const canvasSize = canvasRef.current?.getCanvasSize() || { width: 0, height: 0 };
    if (!strokes.length || canvasSize.width === 0 || canvasSize.height === 0) {
      return;
    }

    setIsAnalyzing(true);
    try {
      const totalTimeMs = Math.max(1, timeElapsed * 1000);
      // Placeholder cognitive score for now; can be refined with wall-collision logic
      const cognitiveScore = 100;
      const analysis = analyzeTest('mazeNavigation', strokes, canvasSize, totalTimeMs, cognitiveScore);
      setAiResult(analysis.aiResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNext = async () => {
    const rawStrokes = canvasRef.current?.getAllStrokes() || [];
    const canvasSize = canvasRef.current?.getCanvasSize() || { width: 0, height: 0 };

    if (!rawStrokes.length || canvasSize.width === 0 || canvasSize.height === 0) {
      // If no data, just move on to pattern completion
      navigate('/test/pattern_completion');
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
      <InstructionText>• Start at the entrance marked "S"</InstructionText>
      <InstructionText>• Draw a path through the maze to the exit marked "E"</InstructionText>
      <InstructionText>• Try not to cross the maze walls</InstructionText>
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
        isComplete={timeRemaining === 0 && hasStarted}
        onRetry={clearCanvas}
        onNext={handleNext}
        canProceed={timeRemaining === 0 && hasStarted && !isAnalyzing && !isCompleting}
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

        <div style={{ position: 'relative' }}>
          <DrawingCanvas
            ref={canvasRef}
            disabled={!hasStarted}
            placeholder={hasStarted ? (timeRemaining === 0 ? 'Time\'s up! Test completed.' : 'Navigate the maze here...') : 'Tap canvas to start test'}
            onTap={handleCanvasTap}
            onStrokeStart={handleStrokeStart}
            onStrokeEnd={handleStrokeEnd}
          />
          <MazeOverlay>
            {/* Simple rectangular maze layout, proportional to canvas */}
            {/* Outer walls */}
            <MazeWall $top={10} $left={10} $width={80} $height={6} />
            <MazeWall $top={84} $left={10} $width={80} $height={6} />
            <MazeWall $top={16} $left={10} $width={6} $height={68} />
            <MazeWall $top={16} $left={84} $width={6} $height={68} />
            {/* Inner walls */}
            <MazeWall $top={30} $left={20} $width={60} $height={4} />
            <MazeWall $top={50} $left={20} $width={40} $height={4} />
            <MazeWall $top={70} $left={40} $width={40} $height={4} />
            <MazeWall $top={30} $left={20} $width={4} $height={30} />
            <MazeWall $top={44} $left={56} $width={4} $height={30} />

            <MazeLabel $top={90} $left={12}>S</MazeLabel>
            <MazeLabel $top={12} $left={88}>E</MazeLabel>
          </MazeOverlay>
        </div>

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

        {hasStarted && (
          <Controls>
            <Button $variant="danger" onClick={clearCanvas}>
              <RotateCcw size={16} />
              Retry
            </Button>
          </Controls>
        )}
      </TestHarness>
    </Container>
  );
};

export default MazeNavigationTest;


