import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { RotateCcw, CheckCircle, AlertCircle, Clock, Beaker, Home } from 'lucide-react';
import { StylusPoint } from '../../services/stylusInputService';
import DrawingCanvas, { DrawingCanvasRef } from '../../components/DrawingCanvas';
import { PARKINSONS_TASKS } from '../../data/parkinsonsTasks';

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

const CompletionModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
`;

const CompletionCard = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  max-width: 500px;
  width: 100%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const CompletionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
`;

const CompletionText = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
`;

const CompletionNote = styled.div`
  background: #fef3c7;
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 16px;
  margin: 24px 0;
  text-align: left;
`;

const CompletionNoteText = styled.p`
  color: #92400e;
  margin: 0;
  line-height: 1.6;
  font-size: 0.9rem;
`;

const ParkinsonsTest: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const canvasRef = useRef<DrawingCanvasRef>(null);
  const navigate = useNavigate();
  
  const task = PARKINSONS_TASKS.find(t => t.id === taskId);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<StylusPoint[][]>([]);
  const [startTime] = useState(Date.now());
  const [showCompletion, setShowCompletion] = useState(false);

  if (!task) {
    return (
      <Container>
        <StatusCard $status="waiting">
          <AlertCircle size={20} />
          <StatusText $status="waiting">Task not found</StatusText>
        </StatusCard>
        <Controls>
          <Button onClick={() => navigate('/parkinsons/tests')}>
            Back to Tasks
          </Button>
        </Controls>
      </Container>
    );
  }

  const handleStartDrawing = () => {
    setIsDrawing(true);
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
    setStrokes([]);
  };

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
    setStrokes([]);
    setIsDrawing(false);
  };

  const handleComplete = () => {
    // Collect strokes (but don't analyze or store)
    const currentStrokes = canvasRef.current?.getAllStrokes() || [];
    
    // Discard data - this is UI only
    console.log('Task completed (data discarded - UI prototype only)');
    
    setShowCompletion(true);
  };

  const handleBackToHome = () => {
    navigate('/parkinsons');
  };

  const handleBackToTasks = () => {
    navigate('/parkinsons/tests');
  };

  return (
    <>
      <Container>
        <ResearchBanner>
          <ResearchLabel>
            <Beaker size={18} />
            Prototype / Research UI
          </ResearchLabel>
          <ResearchText>
            No medical analysis performed. This is a UI demonstration only.
          </ResearchText>
        </ResearchBanner>

        <Instructions>
          <InstructionText style={{ fontWeight: 700, marginBottom: 12 }}>
            {task.name}
          </InstructionText>
          {task.instructions.map((instruction, index) => (
            <InstructionText key={index}>{instruction}</InstructionText>
          ))}
          {task.timeLimit && (
            <InstructionText style={{ marginTop: 12, fontStyle: 'italic' }}>
              <Clock size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
              Time limit: {task.timeLimit} seconds
            </InstructionText>
          )}
        </Instructions>

        <StatusCard $status={isDrawing ? 'drawing' : 'waiting'}>
          {isDrawing ? (
            <>
              <CheckCircle size={20} />
              <StatusText $status="drawing">Drawing in progress...</StatusText>
            </>
          ) : (
            <>
              <AlertCircle size={20} />
              <StatusText $status="waiting">Ready to start</StatusText>
            </>
          )}
        </StatusCard>

        <DrawingCanvas
          ref={canvasRef}
          onStrokeStart={() => setIsDrawing(true)}
          onStrokeEnd={(stroke) => {
            setStrokes(prev => [...prev, stroke]);
          }}
        />

        <Controls>
          {!isDrawing ? (
            <Button $variant="primary" onClick={handleStartDrawing}>
              Start Drawing
            </Button>
          ) : (
            <>
              <Button $variant="danger" onClick={handleClear}>
                <RotateCcw size={16} />
                Clear
              </Button>
              <Button $variant="primary" onClick={handleComplete}>
                <CheckCircle size={16} />
                Complete Task
              </Button>
            </>
          )}
          <Button onClick={() => navigate('/parkinsons/tests')}>
            Back to Tasks
          </Button>
        </Controls>
      </Container>

      {showCompletion && (
        <CompletionModal onClick={() => setShowCompletion(false)}>
          <CompletionCard onClick={(e) => e.stopPropagation()}>
            <CompletionTitle>
              <CheckCircle size={32} color="#10b981" />
              Task Completed
            </CompletionTitle>
            <CompletionText>
              You have successfully completed the {task.name} task.
            </CompletionText>
            <CompletionNote>
              <CompletionNoteText>
                <strong>Note:</strong> This is a prototype UI. No analysis, scoring, or data storage 
                was performed. Medical analysis capabilities will be added in a future update.
              </CompletionNoteText>
            </CompletionNote>
            <Controls style={{ marginTop: 24 }}>
              <Button $variant="primary" onClick={handleBackToTasks}>
                Back to Tasks
              </Button>
              <Button onClick={handleBackToHome}>
                <Home size={16} />
                Back to Home
              </Button>
            </Controls>
          </CompletionCard>
        </CompletionModal>
      )}
    </>
  );
};

export default ParkinsonsTest;

