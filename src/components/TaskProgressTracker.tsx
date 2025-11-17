// Task Progress Tracker Component
// Shows completion status and progress across all handwriting tasks

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { CheckCircle, Clock, AlertCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { useTaskCompletion } from '../hooks/useTaskCompletion';
import { HANDWRITING_TASKS } from '../data/handwritingTasks';

const ProgressContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const ProgressHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`;

const ProgressTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const ProgressStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
`;

const ProgressBar = styled.div`
  background: #e5e7eb;
  border-radius: 8px;
  height: 8px;
  overflow: hidden;
  margin-bottom: 16px;
`;

const ProgressFill = styled.div<{ $percentage: number }>`
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  height: 100%;
  width: ${props => props.$percentage}%;
  transition: width 0.3s ease;
`;

const TaskList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
`;

const TaskItem = styled.div<{ $completed: boolean; $category: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: ${props => props.$completed ? '#f0fdf4' : '#f9fafb'};
  border: 1px solid ${props => props.$completed ? '#d1fae5' : '#e5e7eb'};
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const TaskIcon = styled.div<{ $completed: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$completed ? '#10b981' : '#6b7280'};
  color: white;
`;

const TaskInfo = styled.div`
  flex: 1;
`;

const TaskName = styled.div`
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 2px;
`;

const TaskCategory = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TaskScore = styled.div<{ $score?: number }>`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${props => {
    if (!props.$score) return '#6b7280';
    if (props.$score > 0.8) return '#10b981';
    if (props.$score > 0.6) return '#f59e0b';
    return '#ef4444';
  }};
`;

const CategoryLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
`;

const CategoryItem = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: #6b7280;
`;

const CategoryDot = styled.div<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$color};
`;

const TaskProgressTracker: React.FC = () => {
  const { getCompletionStats, getTaskProgress } = useTaskCompletion();
  const [completionStats, setCompletionStats] = useState<any>(null);
  const [taskProgresses, setTaskProgresses] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  const categoryColors = {
    graphic: '#3b82f6',
    copy: '#8b5cf6',
    memory: '#f59e0b',
    spatial: '#10b981',
    motor: '#ef4444',
    comprehensive: '#6366f1'
  };

  useEffect(() => {
    const loadProgress = async () => {
      try {
        const stats = await getCompletionStats();
        setCompletionStats(stats);

        // Load individual task progress
        const progresses: Record<string, any> = {};
        for (const task of HANDWRITING_TASKS) {
          const progress = await getTaskProgress(task.id);
          progresses[task.id] = progress;
        }
        setTaskProgresses(progresses);
      } catch (error) {
        console.error('Failed to load task progress:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [getCompletionStats, getTaskProgress]);

  if (loading) {
    return (
      <ProgressContainer>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: '1.125rem', color: '#6b7280' }}>Loading progress...</div>
        </div>
      </ProgressContainer>
    );
  }

  return (
    <ProgressContainer>
      <ProgressHeader>
        <BarChart3 size={24} color="#667eea" />
        <ProgressTitle>Task Progress Overview</ProgressTitle>
      </ProgressHeader>

      <ProgressStats>
        <StatCard>
          <StatNumber>{completionStats?.completedTasks || 0}</StatNumber>
          <StatLabel>Completed Tasks</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{completionStats?.totalTasks || 0}</StatNumber>
          <StatLabel>Total Tasks</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{Math.round(completionStats?.completionRate || 0)}%</StatNumber>
          <StatLabel>Completion Rate</StatLabel>
        </StatCard>
        {completionStats?.averageScore > 0 && (
          <StatCard>
            <StatNumber>{Math.round(completionStats.averageScore * 100)}%</StatNumber>
            <StatLabel>Average Score</StatLabel>
          </StatCard>
        )}
      </ProgressStats>

      <ProgressBar>
        <ProgressFill $percentage={completionStats?.completionRate || 0} />
      </ProgressBar>

      <TaskList>
        {HANDWRITING_TASKS.map(task => {
          const progress = taskProgresses[task.id];
          const isCompleted = progress?.isCompleted || false;
          const score = progress?.score;

          return (
            <TaskItem key={task.id} $completed={isCompleted} $category={task.category}>
              <TaskIcon $completed={isCompleted}>
                {isCompleted ? <CheckCircle size={16} /> : <Clock size={16} />}
              </TaskIcon>
              <TaskInfo>
                <TaskName>{task.name}</TaskName>
                <TaskCategory>{task.category}</TaskCategory>
              </TaskInfo>
              {isCompleted && score !== undefined && (
                <TaskScore $score={score}>
                  {Math.round(score * 100)}%
                </TaskScore>
              )}
            </TaskItem>
          );
        })}
      </TaskList>

      <CategoryLegend>
        {Object.entries(categoryColors).map(([category, color]) => (
          <CategoryItem key={category} $color={color}>
            <CategoryDot $color={color} />
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </CategoryItem>
        ))}
      </CategoryLegend>
    </ProgressContainer>
  );
};

export default TaskProgressTracker;
