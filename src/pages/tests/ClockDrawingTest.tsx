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

const ClockOverlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ClockReference = styled.div`
  width: 300px;
  height: 300px;
  border: 3px solid rgba(102, 126, 234, 0.6);
  border-radius: 50%;
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  
  @media (max-width: 768px) {
    width: 250px;
    height: 250px;
  }
  
  @media (max-width: 480px) {
    width: 200px;
    height: 200px;
  }
`;

const CenterLine = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 2px;
  height: 80%;
  background: rgba(102, 126, 234, 0.4);
  
  @media (max-width: 768px) {
    height: 75%;
  }
  
  @media (max-width: 480px) {
    height: 70%;
  }
`;

const ClockMarker = styled.div<{ $angle: number }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(${props => props.$angle}deg) translateY(-135px) rotate(${props => -props.$angle}deg);
  width: 3px;
  height: 20px;
  background: rgba(102, 126, 234, 0.6);
  border-radius: 2px;
  
  @media (max-width: 768px) {
    transform: translate(-50%, -50%) rotate(${props => props.$angle}deg) translateY(-113px) rotate(${props => -props.$angle}deg);
    height: 18px;
  }
  
  @media (max-width: 480px) {
    transform: translate(-50%, -50%) rotate(${props => props.$angle}deg) translateY(-90px) rotate(${props => -props.$angle}deg);
    height: 16px;
    width: 2px;
  }
`;

const ClockHands = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 4px;
  background: #667eea;
  border-radius: 50%;
  
  &::before {
    content: '';
    position: absolute;
    width: 3px;
    height: 60px;
    background: #667eea;
    top: -60px;
    left: 50%;
    transform: translateX(-50%);
    transform-origin: bottom center;
    transform: translateX(-50%) rotate(30deg);
    border-radius: 2px;
  }
  
  &::after {
    content: '';
    position: absolute;
    width: 2px;
    height: 80px;
    background: #667eea;
    top: -80px;
    left: 50%;
    transform: translateX(-50%);
    transform-origin: bottom center;
    transform: translateX(-50%) rotate(60deg);
    border-radius: 1px;
  }
  
  @media (max-width: 768px) {
    &::before {
      height: 45px;
      top: -45px;
    }
    
    &::after {
      height: 60px;
      top: -60px;
    }
  }
`;

const ClockDrawingTest: React.FC = () => {
  // Version identifier to verify updated code is loaded
  useEffect(() => {
    console.log('[ClockDrawingTest] v2.0 - AI Integration Enabled');
  }, []);

  const canvasRef = useRef<DrawingCanvasRef>(null);
  const navigate = useNavigate();
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(180);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
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
      // Run analysis once time is up
      evaluateDrawing();
    }
  }, [timeRemaining, hasStarted]);

  const handleCanvasTap = () => {
    if (!hasStarted) {
      setHasStarted(true);
      setTimeRemaining(180);
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
    setTimeRemaining(180);
    setIsCompleted(false);
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
      <InstructionText>• Draw a clock face with all 12 numbers</InstructionText>
      <InstructionText>• Draw the hour and minute hands showing 10:10</InstructionText>
      <InstructionText>• Make sure the numbers are in the right positions</InstructionText>
      <InstructionText style={{ marginTop: '12px', fontWeight: 700 }}>
        ⏱️ Time Limit: 180 seconds
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
      // For now, use a simple completeness score placeholder (100 when finished)
      const cognitiveScore = 100;
      const analysis = analyzeTest('clockDrawing', strokes, canvasSize, totalTimeMs, cognitiveScore);
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
      navigate('/test/dot_connection');
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
        taskId: 'clock-drawing',
        elapsedTime: timeElapsed,
        strokes,
        canvasSize,
        userInteractions: {
          pauseCount: 0,
          clearCount: 0,
          undoCount: 0,
        },
      },
      'dot_connection'
    );
  };

  return (
    <Container>
      <TestHarness
        title="Clock Drawing Test"
        step={15}
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
          <ClockOverlay>
            <ClockReference>
              {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, idx) => {
                const angle = (idx * 30) - 90; // Start at top (12 o'clock)
                return (
                  <ClockMarker key={num} $angle={angle} />
                );
              })}
            </ClockReference>
          </ClockOverlay>
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
            Analyzing clock drawing...
          </div>
        )}

        {hasStarted && timeRemaining !== 0 && !isAnalyzing && !isCompleted && (
          <Controls>
            <Button $variant="primary" onClick={evaluateDrawing} disabled={isAnalyzing}>
              <Check size={16} />
              Done
            </Button>
          </Controls>
        )}
      </TestHarness>
    </Container>
  );
};

export default ClockDrawingTest;
