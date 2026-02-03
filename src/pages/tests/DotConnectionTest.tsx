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

const DotLabel = styled.div<{ $top: number; $left: number }>`
  position: absolute;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.95);
  border: 2px solid #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: #1f2933;
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
    setTimeRemaining(60);
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
      <InstructionText>• Connect the dots in order from 1 to 10</InstructionText>
      <InstructionText>• Draw straight lines between consecutive numbers</InstructionText>
      <InstructionText>• Don't lift your pen until finished</InstructionText>
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
      // Placeholder cognitive score; can be refined with dot-order logic later
      const cognitiveScore = 100;
      const analysis = analyzeTest('dotConnection', strokes, canvasSize, totalTimeMs, cognitiveScore);
      setAiResult(analysis.aiResult);
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
          {/* Numbered dots 1–10 so the task is visually correct */}
          <DotOverlayContainer>
            {[
              { n: 1, top: 20, left: 20 },
              { n: 2, top: 20, left: 40 },
              { n: 3, top: 20, left: 60 },
              { n: 4, top: 20, left: 80 },
              { n: 5, top: 40, left: 80 },
              { n: 6, top: 60, left: 80 },
              { n: 7, top: 80, left: 80 },
              { n: 8, top: 80, left: 60 },
              { n: 9, top: 80, left: 40 },
              { n: 10, top: 80, left: 20 },
            ].map(dot => (
              <DotLabel key={dot.n} $top={dot.top} $left={dot.left}>
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

export default DotConnectionTest;
