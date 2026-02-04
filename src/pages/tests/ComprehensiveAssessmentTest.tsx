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

const ReferenceOverlay = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`;

const ReferenceCanvas = styled.div`
  width: 90%;
  max-width: 520px;
  height: 60%;
  max-height: 320px;
  display: grid;
  grid-template-rows: 1fr 1fr 1fr;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const RefCell = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const RefLabel = styled.div`
  position: absolute;
  top: 6px;
  left: 10px;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgba(17, 24, 39, 0.85);
  color: white;
  font-size: 10px;
  font-weight: 600;
`;

const RefBox = styled.div<{ $variant: 'house' | 'tree' | 'sun' | 'text' }>`
  width: 70%;
  height: 70%;
  border-radius: 10px;
  border: 2px dashed
    ${p =>
      p.$variant === 'house' ? '#4b5563' :
      p.$variant === 'tree' ? '#16a34a' :
      p.$variant === 'sun' ? '#f59e0b' :
      '#2563eb'};
  background: rgba(255, 255, 255, 0.8);
`;

// Heuristic scoring for comprehensive assessment:
// estimate whether required elements (house, tree, sun, name/date)
// are present in roughly the correct regions of the canvas.
const computeComprehensiveScore = (
  strokes: StylusPoint[][],
  canvasSize: { width: number; height: number }
): number => {
  const { width, height } = canvasSize;
  if (!strokes.length || width === 0 || height === 0) return 0;

  // Vertical zones
  const topThreshold = height * 0.3;
  const bottomThreshold = height * 0.7;

  let houseStrokes = 0;
  let treeStrokes = 0;
  let sunStrokes = 0;
  let textStrokes = 0;

  strokes.forEach(stroke => {
    if (!stroke.length) return;
    const xs = stroke.map(p => p.x);
    const ys = stroke.map(p => p.y);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys);
    const xCenter = (xMin + xMax) / 2;
    const yCenter = (yMin + yMax) / 2;

    // Top zone → likely sun
    if (yCenter < topThreshold) {
      sunStrokes += 1;
      return;
    }

    // Bottom zone → likely text (name/date)
    if (yCenter > bottomThreshold) {
      textStrokes += 1;
      return;
    }

    // Middle zone: split horizontally into house (left) and tree (right)
    if (xCenter < width * 0.5) {
      houseStrokes += 1;
    } else {
      treeStrokes += 1;
    }
  });

  const hasHouse = houseStrokes > 0;
  const hasTree = treeStrokes > 0;
  const hasSun = sunStrokes > 0;
  const hasText = textStrokes > 0;

  const elements = [hasHouse, hasTree, hasSun, hasText];
  const presentCount = elements.filter(Boolean).length;

  // Simple proportional score: each element worth 25 points
  return (presentCount / elements.length) * 100;
};

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

const ComprehensiveAssessmentTest: React.FC = () => {
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
      <InstructionText>• Draw a house with a tree next to it</InstructionText>
      <InstructionText>• Add a sun in the sky</InstructionText>
      <InstructionText>• Write your name below the drawing</InstructionText>
      <InstructionText>• Include the date at the bottom</InstructionText>
      <InstructionText style={{ marginTop: '12px', fontWeight: 700 }}>
        ⏱️ Time Limit: 180 seconds
      </InstructionText>
    </Instructions>
  );

  const evaluateDrawing = async () => {
    const rawStrokes = canvasRef.current?.getAllStrokes() || [];
    const canvasSize = canvasRef.current?.getCanvasSize() || { width: 0, height: 0 };
    if (!rawStrokes.length || canvasSize.width === 0 || canvasSize.height === 0) {
      return;
    }

    setIsAnalyzing(true);
    try {
      const totalTimeMs = Math.max(1, timeElapsed * 1000);
      // Heuristic cognitive score based on presence/placement of required elements
      const cognitiveScore = computeComprehensiveScore(rawStrokes, canvasSize);
      const analysis = analyzeTest('comprehensiveAssessment', rawStrokes, canvasSize, totalTimeMs, cognitiveScore);
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
      navigate('/results');
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
        taskId: 'comprehensive_assessment',
        elapsedTime: timeElapsed,
        strokes,
        canvasSize,
        userInteractions: {
          pauseCount: 0,
          clearCount: 0,
          undoCount: 0,
        },
      },
      undefined,
      true, // showAnalysis / comprehensive
      true
    );
  };

  return (
    <Container>
      <TestHarness
        title="Comprehensive Assessment Test"
        step={20}
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
          <DrawingCanvas
            ref={canvasRef}
            disabled={!hasStarted}
            placeholder={hasStarted ? (timeRemaining === 0 ? 'Time\'s up! Test completed.' : 'Draw here...') : 'Tap canvas to start test'}
            onTap={handleCanvasTap}
            onStrokeStart={handleStrokeStart}
            onStrokeEnd={handleStrokeEnd}
          />
          {/* Reference layout to show where each element should roughly go */}
          <ReferenceOverlay>
            <ReferenceCanvas>
              {/* Top row: sun */}
              <RefCell style={{ gridColumn: '1 / span 2' }}>
                <RefBox $variant="sun" />
                <RefLabel>Sun (top)</RefLabel>
              </RefCell>
              {/* Middle row: house (left), tree (right) */}
              <RefCell>
                <RefBox $variant="house" />
                <RefLabel>House (middle left)</RefLabel>
              </RefCell>
              <RefCell>
                <RefBox $variant="tree" />
                <RefLabel>Tree (middle right)</RefLabel>
              </RefCell>
              {/* Bottom row: text (name & date) */}
              <RefCell style={{ gridColumn: '1 / span 2' }}>
                <RefBox $variant="text" />
                <RefLabel>Name & Date (bottom)</RefLabel>
              </RefCell>
            </ReferenceCanvas>
          </ReferenceOverlay>
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
            Analyzing comprehensive assessment...
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

export default ComprehensiveAssessmentTest;
