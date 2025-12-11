import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { RotateCcw, Play, Pause, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { StylusPoint } from '../../services/stylusInputService';
import DrawingCanvas, { DrawingCanvasRef } from '../../components/DrawingCanvas';
import TestHarness from '../../components/TestHarness';
import { validateDrawing, DrawingValidationResult } from '../../services/drawingValidationService';
import { analyzeTest } from '../../services/testAnalysisService';
import TestResultsDisplay from '../../components/TestResultsDisplay';
import { AIAnalysisResult } from '../../services/aiAnalysisService';
import { saveTestResult } from '../../services/resultsStorageService';

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

const SpiralDrawingTest: React.FC = () => {
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const navigate = useNavigate();
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(45);
  const [validationResult, setValidationResult] = useState<DrawingValidationResult | null>(null);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
      setTimeRemaining(45);
    }
  };

  const handleStrokeStart = (point: StylusPoint) => {
    if (!hasStarted) return;
    setIsDrawing(true);
  };

  const handleStrokeEnd = () => {
    setIsDrawing(false);
  };

  const evaluateDrawing = async () => {
    const strokes = canvasRef.current?.getAllStrokes() || [];
    const canvasSize = canvasRef.current?.getCanvasSize() || { width: 0, height: 0 };
    if (!strokes.length || canvasSize.width === 0 || canvasSize.height === 0) {
      setValidationResult({ completion: 0, accuracy: 0, notes: ['No strokes detected'] });
      return;
    }

    setIsAnalyzing(true);
    try {
      const validation = validateDrawing({ type: 'spiral' }, strokes, canvasSize);
      setValidationResult(validation);

      const totalTimeMs = Math.max(1, timeElapsed * 1000);
      const analysis = analyzeTest('spiralDrawing', strokes, canvasSize, totalTimeMs, validation.accuracy);
      setAiResult(analysis.aiResult);

      await saveTestResult({
        testName: 'spiralDrawing',
        durationMs: totalTimeMs,
        validation,
        aiResult: analysis.aiResult,
        features: analysis.features
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearCanvas = () => {
    canvasRef.current?.clear();
    setHasStarted(false);
    setIsDrawing(false);
    setTimeElapsed(0);
    setTimeRemaining(45);
    setValidationResult(null);
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

  const instructions = (
    <Instructions>
      <InstructionText>• Start from the center and draw outward</InstructionText>
      <InstructionText>• Keep the spiral smooth and even</InstructionText>
      <InstructionText>• Make about 3-4 complete turns</InstructionText>
      <InstructionText style={{ marginTop: '12px', fontWeight: 700 }}>
        ⏱️ Time Limit: 45 seconds
      </InstructionText>
    </Instructions>
  );

  return (
    <Container>
      <TestHarness
        title="Spiral Drawing Test"
        step={5}
        totalSteps={21}
        instructions={instructions}
        isComplete={timeRemaining === 0 && hasStarted}
        onRetry={clearCanvas}
        onNext={() => navigate('/test/letter_copy')}
        canProceed={timeRemaining === 0 && hasStarted}
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
            referenceShape={{ type: 'spiral' }}
          />
          {timeRemaining === 0 && hasStarted && (
            <PauseOverlay style={{ background: 'rgba(16, 185, 129, 0.9)' }}>
              ✓ Test Completed
            </PauseOverlay>
          )}
        </div>

        {hasStarted && (
          <Controls>
            <Button $variant="danger" onClick={clearCanvas}>
              <RotateCcw size={16} />
              Retry
            </Button>
          </Controls>
        )}

        {(validationResult || aiResult) && (
          <TestResultsDisplay validation={validationResult || undefined} aiResult={aiResult || undefined} />
        )}

        {isAnalyzing && <div style={{ textAlign: 'center', color: '#6b7280' }}>Analyzing...</div>}
      </TestHarness>
    </Container>
  );
};

export default SpiralDrawingTest;


