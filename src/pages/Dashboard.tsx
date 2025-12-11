import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Brain, 
  FileText, 
  Shield, 
  Mail, 
  User, 
  Settings, 
  BarChart3,
  Clock,
  CheckCircle,
  Download,
  Trash2,
  TrendingUp,
  Activity
} from 'lucide-react';

import { useTaskCompletion } from '../hooks/useTaskCompletion';
import { HANDWRITING_TASKS } from '../data/handwritingTasks';
import TaskProgressTracker from '../components/TaskProgressTracker';
import DataExportPanel from '../components/DataExportPanel';
import { getTestResults, getCompletedTaskIds } from '../services/resultsStorageService';
import { sessionStorageService } from '../services/sessionStorageService';
import { useAuth } from '../context/AuthContext';

const DashboardContainer = styled.div`
  padding: 20px 12px;
  min-height: calc(100vh - 160px);
  max-width: 100%;
  margin: 0 auto;
`;

const DashboardHeader = styled.div`
  text-align: left;
  margin-bottom: 24px;
  padding: 0 4px;
`;

const DashboardTitle = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
`;

const DashboardSubtitle = styled.p`
  font-size: 0.95rem;
  color: #666;
  line-height: 1.5;
`;

const ProgressOverview = styled.div`
  background: white;
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
`;

const ProgressTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  text-align: left;
`;

const ProgressStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 12px;
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border-radius: 12px;
  border: 1px solid #e8ecff;
  text-align: center;
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 8px;
`;

const StatContent = styled.div`
  width: 100%;
`;

const StatNumber = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #333;
  line-height: 1.2;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #666;
  font-weight: 500;
`;

const DashboardGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
`;

const DashboardCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }
`;

const CardIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: white;
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
`;

const CardDescription = styled.p`
  color: #666;
  line-height: 1.5;
  font-size: 0.9rem;
  margin-bottom: 12px;
`;

const CardButton = styled(Link)`
  display: inline-flex;
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

const QuickActions = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  margin-bottom: 16px;
`;

const QuickActionsTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 8px;
`;

const QuickActionsSubtitle = styled.p`
  font-size: 0.9rem;
  opacity: 0.9;
  margin-bottom: 16px;
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ActionButton = styled(Link)`
  background: white;
  color: #667eea;
  padding: 14px 20px;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.2s ease;
  font-size: 0.95rem;

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
`;

const StatusSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 16px;
`;

const StatusTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const StatusIcon = styled.div<{ $status: 'completed' | 'pending' | 'warning' }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => 
    props.$status === 'completed' ? '#10b981' :
    props.$status === 'warning' ? '#f59e0b' : '#e5e7eb'
  };
  color: white;
  flex-shrink: 0;
`;

const StatusText = styled.div`
  flex: 1;
  min-width: 0;
`;

const StatusLabel = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
  margin-bottom: 2px;
`;

const StatusDescription = styled.div`
  font-size: 0.8rem;
  color: #666;
  line-height: 1.4;
`;

const DataSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
`;

const DataTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 24px;
  color: #333;
`;

const DataActions = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const DataButton = styled.button<{ $variant?: 'primary' | 'danger' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;

  ${props => {
    switch (props.$variant) {
      case 'primary':
        return `
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
          }
        `;
      case 'danger':
        return `
          background: #ef4444;
          color: white;
          &:hover {
            background: #dc2626;
          }
        `;
      default:
        return `
          background: white;
          color: #667eea;
          border: 2px solid #667eea;
          &:hover {
            background: #667eea;
            color: white;
          }
        `;
    }
  }}
`;

const Dashboard: React.FC = () => {
  const { getCompletionStats } = useTaskCompletion();
  const { user } = useAuth();
  const [completionStats, setCompletionStats] = useState<any>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Load task statistics from Firebase and sessionStorage
  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        
        // Load from Firebase test results
        const firebaseResults = await getTestResults();
        setTestResults(firebaseResults);
        
        // Get completed task IDs from Firebase
        const firebaseCompleted = await getCompletedTaskIds();
        
        // Load from sessionStorage
        const sessions = await sessionStorageService.getSessions();
        const sessionCompleted = sessions
          .filter(session => session.taskId && session.completed)
          .map(session => session.taskId!);
        
        // Combine both sources
        const allCompleted = new Set([...firebaseCompleted, ...sessionCompleted]);
        setCompletedTaskIds(Array.from(allCompleted));
        
        // Calculate stats
        const totalTasks = HANDWRITING_TASKS.length;
        const completedCount = allCompleted.size;
        const completionRate = totalTasks > 0 ? (completedCount / totalTasks) * 100 : 0;
        
        // Calculate average score from test results
        // Normalize all scores to 0-1 range before averaging
        const scores = firebaseResults
          .map(result => {
            // validation.accuracy is in 0-100 range, convert to 0-1
            if (result.validation?.accuracy != null) {
              return result.validation.accuracy / 100;
            }
            // aiResult.probability is in 0-100 range, convert to 0-1
            if (result.aiResult?.probability != null) {
              return result.aiResult.probability / 100;
            }
            return null;
          })
          .filter((score): score is number => score !== null && score > 0);
        
        const averageScore = scores.length > 0 
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length
          : 0;
        
        setCompletionStats({
          totalTasks,
          completedTasks: completedCount,
          completionRate,
          averageScore // Already in 0-1 range
        });
      } catch (error) {
        console.error('Failed to load task statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [user]);

  // Get task status from Firebase data
  const getTaskStatus = (taskId: string) => {
    const isCompleted = completedTaskIds.includes(taskId);
    const result = testResults.find(r => r.taskId === taskId);
    return {
      completed: isCompleted,
      result: result,
      status: isCompleted ? 'completed' : 'pending' as 'completed' | 'pending' | 'warning'
    };
  };

  if (loading) {
    return (
      <DashboardContainer>
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          Loading dashboard...
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <DashboardHeader>
        <DashboardTitle>Dashboard</DashboardTitle>
        <DashboardSubtitle>
          Track your progress and cognitive health
        </DashboardSubtitle>
      </DashboardHeader>

        <ProgressOverview>
          <ProgressTitle>Assessment Progress</ProgressTitle>
          <ProgressStats>
            <StatCard>
              <StatIcon>
                <CheckCircle size={24} />
              </StatIcon>
              <StatContent>
                <StatNumber>{completionStats?.completedTasks || 0}</StatNumber>
                <StatLabel>Tasks Completed</StatLabel>
              </StatContent>
            </StatCard>
            <StatCard>
              <StatIcon>
                <Activity size={24} />
              </StatIcon>
              <StatContent>
                <StatNumber>{completionStats?.totalTasks || 0}</StatNumber>
                <StatLabel>Total Tasks</StatLabel>
              </StatContent>
            </StatCard>
            <StatCard>
              <StatIcon>
                <TrendingUp size={24} />
              </StatIcon>
              <StatContent>
                <StatNumber>{Math.round(completionStats?.completionRate || 0)}%</StatNumber>
                <StatLabel>Progress</StatLabel>
              </StatContent>
            </StatCard>
            {completionStats?.averageScore > 0 && (
              <StatCard>
                <StatIcon>
                  <BarChart3 size={24} />
                </StatIcon>
                <StatContent>
                  <StatNumber>{(completionStats.averageScore * 100).toFixed(2)}%</StatNumber>
                  <StatLabel>Avg Score</StatLabel>
                </StatContent>
              </StatCard>
            )}
          </ProgressStats>
        </ProgressOverview>

        <TaskProgressTracker />

        <QuickActions>
          <QuickActionsTitle>Quick Actions</QuickActionsTitle>
          <QuickActionsSubtitle>
            Start your assessment or view previous results
          </QuickActionsSubtitle>
          <ActionButtons>
            <ActionButton to="/tasks">
              <Brain size={20} />
              Start Assessment
            </ActionButton>
            <ActionButton to="/results">
              <BarChart3 size={20} />
              View Results
            </ActionButton>
            <ActionButton to="/model-demo">
              <Brain size={20} />
              AI Model Demo
            </ActionButton>
          </ActionButtons>
        </QuickActions>

        <StatusSection>
          <StatusTitle>Recent Tests</StatusTitle>
          {testResults.slice(0, 5).map((result, index) => {
            const task = HANDWRITING_TASKS.find(t => t.id === result.taskId);
            if (!task) return null;
            
            const status = getTaskStatus(result.taskId);
            return (
              <StatusItem key={result.id || index}>
                <StatusIcon $status={status.status}>
                  {status.completed ? <CheckCircle size={18} /> : <Clock size={18} />}
                </StatusIcon>
                <StatusText>
                  <StatusLabel>{task.name}</StatusLabel>
                  <StatusDescription>
                    {status.completed 
                      ? `Completed - ${new Date(result.completedAt).toLocaleDateString()}`
                      : task.description}
                  </StatusDescription>
                </StatusText>
              </StatusItem>
            );
          })}
          {testResults.length === 0 && (
            <StatusItem>
              <StatusIcon $status="pending">
                <Clock size={18} />
              </StatusIcon>
              <StatusText>
                <StatusLabel>No tests completed yet</StatusLabel>
                <StatusDescription>Start your first assessment to see results here</StatusDescription>
              </StatusText>
            </StatusItem>
          )}
        </StatusSection>

        <DataExportPanel />
    </DashboardContainer>
  );
};

export default Dashboard;
