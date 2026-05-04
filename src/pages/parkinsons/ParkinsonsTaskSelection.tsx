import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Activity,
  Clock,
  ArrowRight,
  Play,
  AlertTriangle,
  Beaker
} from 'lucide-react';
import { PARKINSONS_TASKS, PARKINSONS_TASK_CATEGORIES } from '../../data/parkinsonsTasks';
import { getTestResults } from '../../services/resultsStorageService';

const TaskSelectionContainer = styled.div`
  padding: 40px 0;
  min-height: calc(100vh - 160px);
`;

const TaskSelectionHeader = styled.div`
  text-align: center;
  margin-bottom: 48px;
`;

const TaskSelectionTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
`;

const TaskSelectionSubtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
  margin-bottom: 24px;
`;

const WarningBanner = styled.div`
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 2px solid #f59e0b;
  border-radius: 12px;
  padding: 20px;
  margin: 0 auto 32px;
  max-width: 800px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const WarningIcon = styled(AlertTriangle)`
  flex-shrink: 0;
  color: #d97706;
  margin-top: 2px;
`;

const WarningContent = styled.div`
  flex: 1;
`;

const WarningTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  color: #92400e;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const WarningText = styled.p`
  color: #92400e;
  line-height: 1.6;
  margin: 0;
  font-size: 0.95rem;
`;

const ResearchLabel = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 16px;
`;

const CategorySection = styled.div`
  margin-bottom: 48px;
`;

const CategoryTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const TasksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
`;

const TaskCard = styled(motion.div)<{ $difficulty: string; $completed?: boolean }>`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid ${props => 
    props.$completed ? '#10b981' : '#e5e7eb'
  };
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
`;

const TaskName = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  flex: 1;
`;

const TaskDifficulty = styled.span<{ $difficulty: string }>`
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  background: ${props => 
    props.$difficulty === 'easy' ? '#d1fae5' :
    props.$difficulty === 'medium' ? '#fef3c7' : '#fee2e2'
  };
  color: ${props => 
    props.$difficulty === 'easy' ? '#065f46' :
    props.$difficulty === 'medium' ? '#92400e' : '#991b1b'
  };
`;

const TaskDescription = styled.p`
  color: #666;
  line-height: 1.6;
  margin: 0;
`;

const TaskMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 0.9rem;
  color: #666;
`;

const TaskTime = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TaskLink = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  margin-top: auto;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ParkinsonsTaskSelection: React.FC = () => {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    getTestResults()
      .then((results) => {
        if (cancelled) return;
        const ids = new Set(
          results
            .filter((r) => (r.disease || 'alzheimers') === 'parkinsons' && r.taskId)
            .map((r) => r.taskId as string)
        );
        setCompletedIds(ids);
      })
      .catch(() => setCompletedIds(new Set()));
    return () => {
      cancelled = true;
    };
  }, []);

  const tasksByCategory = PARKINSONS_TASKS.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, typeof PARKINSONS_TASKS>);

  return (
    <TaskSelectionContainer>
      <div className="container">
        <TaskSelectionHeader>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <ResearchLabel>
              <Beaker size={16} />
              Research assessment
            </ResearchLabel>
            <TaskSelectionTitle>Parkinson's handwriting tasks</TaskSelectionTitle>
            <TaskSelectionSubtitle>
              Full AI analysis and results — same pipeline as other NeuroInk handwriting assessments. Not a clinical diagnosis.
            </TaskSelectionSubtitle>
          </motion.div>
        </TaskSelectionHeader>

        <WarningBanner>
          <WarningIcon size={24} />
          <WarningContent>
            <WarningTitle>
              <AlertTriangle size={18} />
              Screening only
            </WarningTitle>
            <WarningText>
              Results use research-grade AI models for screening and are saved to your signed-in account.
              They do not replace a clinical evaluation by a qualified professional.
            </WarningText>
          </WarningContent>
        </WarningBanner>

        {Object.entries(tasksByCategory).map(([category, tasks]) => (
          <CategorySection key={category}>
            <CategoryTitle>
              <Activity size={28} />
              {PARKINSONS_TASK_CATEGORIES[category as keyof typeof PARKINSONS_TASK_CATEGORIES]}
            </CategoryTitle>
            <TasksGrid>
              {tasks.map((task, index) => (
                <TaskCard
                  key={task.id}
                  $difficulty={task.difficulty.toLowerCase()}
                  $completed={completedIds.has(task.id)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <TaskHeader>
                    <TaskName>{task.name}</TaskName>
                    <TaskDifficulty $difficulty={task.difficulty.toLowerCase()}>
                      {task.difficulty.toUpperCase()}
                    </TaskDifficulty>
                  </TaskHeader>
                  <TaskDescription>{task.description}</TaskDescription>
                  <TaskMeta>
                    {task.timeLimit && (
                      <TaskTime>
                        <Clock size={16} />
                        {task.timeLimit}s
                      </TaskTime>
                    )}
                  </TaskMeta>
                  <TaskLink to={`/parkinsons/test/${task.id}`}>
                    <Play size={16} />
                    Start Task
                    <ArrowRight size={16} />
                  </TaskLink>
                </TaskCard>
              ))}
            </TasksGrid>
          </CategorySection>
        ))}
      </div>
    </TaskSelectionContainer>
  );
};

export default ParkinsonsTaskSelection;



