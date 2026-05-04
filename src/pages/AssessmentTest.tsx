import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { Clock, ArrowRight, RotateCcw, AlertCircle } from 'lucide-react';
import DrawingCanvas, { DrawingCanvasRef } from '../components/DrawingCanvas';
import { PARKINSONS_TASKS } from '../data/parkinsonsTasks';
import { HANDWRITING_TASKS, getTasksForDisease } from '../data/handwritingTasks';
import { useDisease } from '../context/DiseaseContext';
import { useTaskCompletion } from '../hooks/useTaskCompletion';

const Container = styled.div`
  padding: 16px 0;

  @media (max-width: 768px) {
    padding: 12px 0;
  }
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

  @media (max-width: 600px) {
    padding: 12px;
    flex-direction: column;
    align-items: flex-start;
  }
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

  @media (max-width: 600px) {
    font-size: 0.85rem;
  }
`;

const Instructions = styled.div`
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  color: #92400e;

  @media (max-width: 600px) {
    padding: 12px;
  }
`;

const InstructionText = styled.p`
  margin: 8px 0;
  font-weight: 500;
  font-size: 15px;
  line-height: 1.6;

  @media (max-width: 600px) {
    font-size: 14px;
  }
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 20px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    gap: 8px;
  }
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

  @media (max-width: 480px) {
    padding: 10px 16px;
    font-size: 13px;
    width: 100%;
  }
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

  @media (max-width: 600px) {
    padding: 12px;
    flex-direction: column;
    align-items: flex-start;
  }
`;

const StatusContent = styled.div`
  flex: 1;
`;

const StatusTitle = styled.div`
  font-weight: 700;
  font-size: 15px;
  margin-bottom: 4px;
`;

const StatusMessage = styled.div`
  font-size: 14px;
`;

const ProgressContainer = styled.div`
  margin-bottom: 20px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled.div<{ $percent: number }>`
  width: ${props => props.$percent}%;
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  text-align: center;
  font-size: 13px;
  color: #666;
  font-weight: 500;
`;

const CanvasContainer = styled.div`
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;

  @media (max-width: 600px) {
    padding: 12px;
  }
`;

const AssessmentTest: React.FC = () => {
  const navigate = useNavigate();
  const { taskId } = useParams<{ taskId: string }>();
  const { currentDisease } = useDisease();
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const startTimeRef = useRef(Date.now());
  const { completeTask, isCompleting } = useTaskCompletion();
  
  const [taskIndex, setTaskIndex] = useState(0);
  const [testStatus, setTestStatus] = useState<'pending' | 'completed' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState('');

  // Get tasks based on disease (Parkinson's uses dedicated task list + shared validation shape)
  const tasks = currentDisease === 'parkinsons' ? getTasksForDisease('parkinsons') : HANDWRITING_TASKS;
  const currentTask = tasks[taskIndex];
  const totalTasks = tasks.length;
  const progress = ((taskIndex + 1) / totalTasks) * 100;

  // Use TestHarness for drawing tasks (Parkinsons uses drawing)
  const isDrawingTask = currentDisease === 'parkinsons' && currentTask;

  useEffect(() => {
    if (currentDisease !== 'parkinsons' || !taskId) return;
    const idx = PARKINSONS_TASKS.findIndex(t => t.id === taskId);
    if (idx >= 0) setTaskIndex(idx);
  }, [taskId, currentDisease]);

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [taskIndex, currentDisease]);

  const handleClearCanvas = () => {
    canvasRef.current?.clear();
  };

  const handleSubmit = async () => {
    try {
      setTestStatus('pending');
      setErrorMessage('');

      if (isDrawingTask && canvasRef.current) {
        const strokes = canvasRef.current.getAllStrokes();
        
        if (strokes.length === 0) {
          setTestStatus('error');
          setErrorMessage('Please draw something before submitting');
          return;
        }

        const canvasSize = canvasRef.current.getCanvasSize() || { width: 800, height: 600 };
        const elapsedSec = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

        await completeTask({
          taskId: currentTask.id,
          elapsedTime: elapsedSec,
          strokes,
          canvasSize
        });

        setTestStatus('completed');
      }
    } catch (error) {
      setTestStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleNext = () => {
    if (taskIndex < totalTasks - 1) {
      const nextId = tasks[taskIndex + 1].id;
      if (currentDisease === 'parkinsons') {
        navigate(`/parkinsons/assessment-test/${nextId}`);
      } else {
        setTaskIndex(taskIndex + 1);
      }
      setTestStatus('pending');
      setErrorMessage('');
      canvasRef.current?.clear();
    } else {
      navigate('/parkinsons/assessment-results', { state: { disease: currentDisease } });
    }
  };

  const handleRetry = () => {
    setTestStatus('pending');
    setErrorMessage('');
    canvasRef.current?.clear();
  };

  if (!currentTask) {
    return (
      <Container className="container">
        <StatusCard $status="error">
          <AlertCircle size={24} color="#ef4444" />
          <StatusContent>
            <StatusTitle>Invalid Task</StatusTitle>
            <StatusMessage>Could not find the requested task.</StatusMessage>
          </StatusContent>
        </StatusCard>
      </Container>
    );
  }

  // For Parkinsons, use drawing canvas; otherwise use basic test placeholder
  if (isDrawingTask) {
    return (
      <Container className="container">
        <ResearchBanner>
          <ResearchLabel>Research Mode</ResearchLabel>
          <ResearchText>
            {currentDisease === 'parkinsons' 
              ? 'Parkinson\'s handwriting assessment with AI analysis. Results are saved to your account. Not a clinical diagnosis.'
              : 'This is a research assessment interface. Results are for research purposes only.'}
          </ResearchText>
        </ResearchBanner>

        <Instructions>
          <InstructionText>📋 Task {taskIndex + 1} of {totalTasks}</InstructionText>
          <InstructionText><strong>{currentTask.name}:</strong> {currentTask.description}</InstructionText>
        </Instructions>

        <ProgressContainer>
          <ProgressBar>
            <ProgressFill $percent={progress} />
          </ProgressBar>
          <ProgressText>Progress: {taskIndex + 1} of {totalTasks}</ProgressText>
        </ProgressContainer>

        <CanvasContainer>
          <DrawingCanvas
            ref={canvasRef}
          />
        </CanvasContainer>

        {testStatus === 'error' && (
          <StatusCard $status="error">
            <AlertCircle size={24} color="#ef4444" />
            <StatusContent>
              <StatusTitle>Submission Error</StatusTitle>
              <StatusMessage>{errorMessage}</StatusMessage>
            </StatusContent>
          </StatusCard>
        )}

        {testStatus === 'completed' && (
          <StatusCard $status="completed">
            <div style={{ color: '#10b981', fontSize: '24px' }}>✓</div>
            <StatusContent>
              <StatusTitle>Task Completed</StatusTitle>
              <StatusMessage>Your submission has been recorded. Ready for next task?</StatusMessage>
            </StatusContent>
          </StatusCard>
        )}

        <Controls>
          <Button onClick={handleClearCanvas}>
            <RotateCcw size={16} />
            Clear
          </Button>
          <Button 
            $variant="primary" 
            onClick={testStatus === 'completed' ? handleNext : handleSubmit}
            disabled={
              isCompleting ||
              (testStatus === 'pending' && canvasRef.current?.getAllStrokes().length === 0)
            }
          >
            {testStatus === 'completed' ? (
              <>
                {taskIndex < totalTasks - 1 ? 'Next Task' : 'View Results'}
                <ArrowRight size={16} />
              </>
            ) : (
              <>
                <Clock size={16} />
                {isCompleting ? 'Analyzing…' : 'Submit'}
              </>
            )}
          </Button>
          {testStatus === 'error' && (
            <Button $variant="danger" onClick={handleRetry}>
              <RotateCcw size={16} />
              Retry
            </Button>
          )}
        </Controls>
      </Container>
    );
  }

  // For Alzheimers, show placeholder message
  return (
    <Container className="container">
      <ResearchBanner>
        <ResearchLabel>Research Mode</ResearchLabel>
        <ResearchText>
          This is a research assessment interface. Results are for research purposes only.
        </ResearchText>
      </ResearchBanner>

      <Instructions>
        <InstructionText>
          The Alzheimer's disease assessment uses the main test interface. 
          Please navigate to the test selection to begin.
        </InstructionText>
      </Instructions>
    </Container>
  );
};

export default AssessmentTest;
