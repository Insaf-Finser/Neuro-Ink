import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  RotateCcw, 
  Home,
  Beaker
} from 'lucide-react';
import { PARKINSONS_TASKS } from '../data/parkinsonsTasks';
import { HANDWRITING_TASKS } from '../data/handwritingTasks';
import { useDisease } from '../context/DiseaseContext';

const Container = styled(motion.div)`
  padding: 40px 0;
  min-height: calc(100vh - 160px);

  @media (max-width: 1024px) {
    padding: 32px 0;
  }

  @media (max-width: 768px) {
    padding: 20px 0;
  }
`;

const Content = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 0 20px;

  @media (max-width: 1024px) {
    max-width: 720px;
    padding: 0 18px;
  }

  @media (max-width: 768px) {
    max-width: 100%;
    padding: 0 16px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  @media (max-width: 768px) {
    font-size: 1.6rem;
    gap: 8px;
    flex-direction: column;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 0.95rem;
  }
`;

const ResearchBanner = styled.div`
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  border: 2px solid #667eea;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 32px;
  display: flex;
  align-items: flex-start;
  gap: 12px;

  @media (max-width: 600px) {
    padding: 16px;
    flex-direction: column;
  }
`;

const ResearchContent = styled.div`
  flex: 1;
`;

const ResearchLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #4338ca;
  font-size: 0.95rem;
  margin-bottom: 8px;

  @media (max-width: 600px) {
    font-size: 0.9rem;
  }
`;

const ResearchText = styled.p`
  margin: 0;
  color: #4338ca;
  font-size: 0.9rem;
  line-height: 1.6;

  @media (max-width: 600px) {
    font-size: 0.85rem;
  }
`;

const SummaryCard = styled(motion.div)`
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;

  &:hover {
    border-color: #667eea;
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.15);
  }

  @media (max-width: 768px) {
    padding: 16px;
    margin-bottom: 16px;
    border-width: 1px;
  }
`;

const SummaryTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 12px 0;

  @media (max-width: 600px) {
    font-size: 1rem;
  }
`;

const SummaryText = styled.p`
  color: #666;
  line-height: 1.6;
  margin: 0;
  font-size: 0.95rem;

  @media (max-width: 600px) {
    font-size: 0.9rem;
  }
`;

const TasksList = styled.div`
  margin: 24px 0;
`;

const TaskItem = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
`;

const TaskName = styled.div`
  flex: 1;
  font-weight: 600;
  color: #333;

  @media (max-width: 600px) {
    font-size: 0.95rem;
  }
`;

const TaskStatus = styled.div`
  background: #10b981;
  color: white;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;

  @media (max-width: 600px) {
    width: 100%;
    text-align: center;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 32px;
  justify-content: center;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
    align-items: stretch;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 12px 28px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
    }
  ` : `
    background: white;
    color: #667eea;
    border: 2px solid #667eea;
    
    &:hover {
      background: #e8ecff;
      transform: translateY(-2px);
    }
  `}
  
  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
    padding: 12px 18px;
    font-size: 15px;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const AssessmentResults: React.FC = () => {
  const navigate = useNavigate();
  const { currentDisease } = useDisease();
  const [completedAt, setCompletedAt] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    setCompletedAt(now.toLocaleString());
  }, []);

  const tasks = currentDisease === 'parkinsons' ? PARKINSONS_TASKS : HANDWRITING_TASKS;
  const diseaseLabel = currentDisease === 'parkinsons' ? "Parkinson's" : 'Alzheimer\'s';

  const handleRetake = () => {
    const firstTask = tasks[0];
    navigate(`/assessment-test/${firstTask.id}`);
  };

  const handleReturnHome = () => {
    navigate(`/${currentDisease || 'alzheimers'}`);
  };

  return (
    <Container
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Content>
        <Header>
          <Title>
            <CheckCircle2 size={32} />
            Assessment Complete
          </Title>
          <Subtitle>Thank you for participating in our research prototype</Subtitle>
        </Header>

        <ResearchBanner>
          <ResearchContent>
            <ResearchLabel>
              <Beaker size={18} />
              Research Mode
            </ResearchLabel>
            <ResearchText>
              This is a prototype research interface for {diseaseLabel} disease testing. 
              No clinical analysis or diagnosis is performed. Results are for research purposes only.
            </ResearchText>
          </ResearchContent>
        </ResearchBanner>

        <SummaryCard
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SummaryTitle>Assessment Summary</SummaryTitle>
          <SummaryText>
            You have successfully completed all {tasks.length} tasks in the {diseaseLabel} research assessment.
          </SummaryText>
          <SummaryText style={{ marginTop: '12px', fontSize: '0.9rem', color: '#999' }}>
            Completed at: {completedAt}
          </SummaryText>
        </SummaryCard>

        <SummaryCard
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <SummaryTitle>Tasks Completed</SummaryTitle>
          <TasksList>
            {tasks.map((task, idx) => (
              <TaskItem key={task.id}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#667eea' }}>
                  {idx + 1}
                </div>
                <TaskName>{task.name}</TaskName>
                <TaskStatus>✓ Complete</TaskStatus>
              </TaskItem>
            ))}
          </TasksList>
        </SummaryCard>

        <SummaryCard
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <SummaryTitle>Next Steps</SummaryTitle>
          <SummaryText>
            This research interface collects your assessment patterns for research analysis. 
            Your data will help advance our understanding of cognitive and motor patterns.
          </SummaryText>
          <SummaryText style={{ marginTop: '12px' }}>
            For official {diseaseLabel} disease diagnosis or medical advice, please consult with a qualified healthcare professional.
          </SummaryText>
        </SummaryCard>

        <ActionButtons>
          <Button $variant="secondary" onClick={handleRetake}>
            <RotateCcw size={16} />
            Retake Assessment
          </Button>
          <Button $variant="primary" onClick={handleReturnHome}>
            <Home size={16} />
            Return to Home
          </Button>
        </ActionButtons>
      </Content>
    </Container>
  );
};

export default AssessmentResults;
