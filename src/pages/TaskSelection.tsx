import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Target, 
  Eye, 
  MemoryStick, 
  Compass, 
  Activity,
  Clock,
  ArrowRight,
  Play,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { HANDWRITING_TASKS, TASK_CATEGORIES } from '../data/handwritingTasks';
import { sessionStorageService } from '../services/sessionStorageService';
import { getTestResults, getCompletedTaskIds } from '../services/resultsStorageService';

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
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const TaskCard = styled(motion.div)<{ $difficulty: string; $completed?: boolean }>`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 2px solid ${props => {
    if (props.$completed) return '#10b981';
    switch (props.$difficulty) {
      case 'easy': return '#dcfce7';
      case 'medium': return '#fef3c7';
      case 'hard': return '#fecaca';
      default: return '#f3f4f6';
    }
  }};
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }

  ${props => props.$completed && `
    &::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 0;
      height: 0;
      border-left: 20px solid transparent;
      border-top: 20px solid #10b981;
    }
  `}
`;

const TaskHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const TaskName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const TaskDifficulty = styled.span<{ $difficulty: string }>`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => {
    switch (props.$difficulty) {
      case 'easy': return '#dcfce7';
      case 'medium': return '#fef3c7';
      case 'hard': return '#fecaca';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.$difficulty) {
      case 'easy': return '#166534';
      case 'medium': return '#92400e';
      case 'hard': return '#dc2626';
      default: return '#374151';
    }
  }};
`;

const TaskDescription = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 16px;
`;

const TaskMeta = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
`;

const TaskTime = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #666;
`;

const TaskScore = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #10b981;
  font-size: 14px;
  font-weight: 600;
`;

const TaskLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;

  &:hover {
    color: #764ba2;
  }
`;

const ProgressSection = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  margin-bottom: 48px;
`;

const ProgressTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 16px;
`;

const ProgressStats = styled.div`
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 24px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
`;

const StartButton = styled(Link)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 32px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;
  margin-top: 24px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin: 16px 0;
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  width: ${props => props.$percentage}%;
  transition: width 0.5s ease;
`;

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'graphic': return <Target size={24} />;
    case 'copy': return <Eye size={24} />;
    case 'memory': return <MemoryStick size={24} />;
    case 'spatial': return <Compass size={24} />;
    case 'motor': return <Activity size={24} />;
    default: return <Target size={24} />;
  }
};

const TaskSelection: React.FC = () => {
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [taskProgress, setTaskProgress] = useState<Record<string, any>>({});

  // Load completed tasks from both session storage and Firebase test results
  useEffect(() => {
    const loadProgress = async () => {
      try {
        // Load from session storage (for handwriting tasks)
        const sessions = await sessionStorageService.getSessions();
        const sessionCompleted = sessions
          .filter(session => session.taskId && session.completed)
          .map(session => session.taskId!);
        
        // Load from Firebase test results (for drawing tests)
        const testResults = await getTestResults();
        const testCompleted = await getCompletedTaskIds();
        
        // Combine both sources
        const allCompleted = new Set([...sessionCompleted, ...testCompleted]);
        setCompletedTasks(Array.from(allCompleted));

        // Create progress object from sessions
        const progress: Record<string, any> = {};
        sessions.forEach(session => {
          if (session.taskId) {
            progress[session.taskId] = {
              completed: session.completed || false,
              score: session.results?.overallRisk || 'unknown',
              timestamp: session.timestamp
            };
          }
        });
        
        // Add progress from test results
        testResults.forEach(result => {
          if (result.taskId) {
            progress[result.taskId] = {
              completed: true,
              score: result.aiResult?.overallRisk || result.validation?.accuracy || 'unknown',
              timestamp: new Date(result.completedAt).getTime()
            };
          }
        });
        
        setTaskProgress(progress);
      } catch (error) {
        console.error('Failed to load task progress:', error);
      }
    };

    loadProgress();
  }, []);

  // Group tasks by category
  const tasksByCategory = HANDWRITING_TASKS.reduce((acc, task) => {
    if (!acc[task.category]) {
      acc[task.category] = [];
    }
    acc[task.category].push(task);
    return acc;
  }, {} as Record<string, typeof HANDWRITING_TASKS>);

  const totalTasks = HANDWRITING_TASKS.length;
  const completedCount = completedTasks.length;
  const progressPercentage = Math.round((completedCount / totalTasks) * 100);

  // Get next incomplete task
  const nextTask = HANDWRITING_TASKS.find(task => !completedTasks.includes(task.id));

  return (
    <TaskSelectionContainer>
      <div className="container">
        <TaskSelectionHeader>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <TaskSelectionTitle>Handwriting Assessment Tasks</TaskSelectionTitle>
            <TaskSelectionSubtitle>
              Complete all 20 handwriting tasks to get a comprehensive cognitive assessment. 
              Each task evaluates different aspects of cognitive function.
            </TaskSelectionSubtitle>
          </motion.div>
        </TaskSelectionHeader>

        <ProgressSection>
          <ProgressTitle>Assessment Progress</ProgressTitle>
          <ProgressStats>
            <StatItem>
              <StatNumber>{completedCount}</StatNumber>
              <StatLabel>Completed</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>{totalTasks}</StatNumber>
              <StatLabel>Total Tasks</StatLabel>
            </StatItem>
            <StatItem>
              <StatNumber>{progressPercentage}%</StatNumber>
              <StatLabel>Progress</StatLabel>
            </StatItem>
          </ProgressStats>
          <ProgressBar>
            <ProgressFill $percentage={progressPercentage} />
          </ProgressBar>
          {nextTask ? (
            <StartButton to={`/test/${nextTask.id}`}>
              <Play size={20} />
              {completedCount === 0 ? 'Start First Task' : 'Continue Assessment'}
            </StartButton>
          ) : (
            <StartButton to="/results">
              <BarChart3 size={20} />
              View Complete Results
            </StartButton>
          )}
        </ProgressSection>

        {Object.entries(tasksByCategory).map(([category, tasks]) => (
          <CategorySection key={category}>
            <CategoryTitle>
              {getCategoryIcon(category)}
              {TASK_CATEGORIES[category as keyof typeof TASK_CATEGORIES]} ({tasks.length} tasks)
            </CategoryTitle>
            <TasksGrid>
              {tasks.map((task, index) => {
                const isCompleted = completedTasks.includes(task.id);
                const progress = taskProgress[task.id];
                
                return (
                  <TaskCard
                    key={task.id}
                    $difficulty={task.difficulty.toLowerCase()}
                    $completed={isCompleted}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <TaskHeader>
                      <TaskName>{task.name}</TaskName>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {isCompleted && <CheckCircle size={20} color="#10b981" />}
                        <TaskDifficulty $difficulty={task.difficulty.toLowerCase()}>
                          {task.difficulty.toUpperCase()}
                        </TaskDifficulty>
                      </div>
                    </TaskHeader>
                    <TaskDescription>{task.instructions[0]}</TaskDescription>
                    <TaskMeta>
                      {task.timeLimit && (
                        <TaskTime>
                          <Clock size={16} />
                          {task.timeLimit}s
                        </TaskTime>
                      )}
                      {isCompleted && progress && (
                        <TaskScore>
                          <BarChart3 size={16} />
                          Completed
                        </TaskScore>
                      )}
                    </TaskMeta>
                    <TaskLink to={`/test/${task.id}`}>
                      {isCompleted ? 'Review Task' : 'Start Task'}
                      <ArrowRight size={16} />
                    </TaskLink>
                  </TaskCard>
                );
              })}
            </TasksGrid>
          </CategorySection>
        ))}
      </div>
    </TaskSelectionContainer>
  );
};

export default TaskSelection;
