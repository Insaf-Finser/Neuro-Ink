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

const DashboardContainer = styled.div`
  padding: 40px 0;
  min-height: calc(100vh - 160px);
`;

const DashboardHeader = styled.div`
  text-align: center;
  margin-bottom: 48px;
`;

const DashboardTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 16px;
`;

const DashboardSubtitle = styled.p`
  font-size: 1.2rem;
  color: #666;
  max-width: 600px;
  margin: 0 auto;
`;

const ProgressOverview = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
`;

const ProgressTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
  text-align: center;
`;

const ProgressStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
`;

const StatCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-top: 4px;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 32px;
  margin-bottom: 48px;
`;

const DashboardCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const CardIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  color: white;
`;

const CardTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
`;

const CardDescription = styled.p`
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
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
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  margin-bottom: 48px;
`;

const QuickActionsTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 16px;
`;

const QuickActionsSubtitle = styled.p`
  font-size: 1.1rem;
  opacity: 0.9;
  margin-bottom: 32px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
`;

const ActionButton = styled(Link)`
  background: white;
  color: #667eea;
  padding: 16px 32px;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  }
`;

const StatusSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const StatusTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 24px;
  color: #333;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const StatusIcon = styled.div<{ $status: 'completed' | 'pending' | 'warning' }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => 
    props.$status === 'completed' ? '#10b981' :
    props.$status === 'warning' ? '#f59e0b' : '#e5e7eb'
  };
  color: white;
`;

const StatusText = styled.div`
  flex: 1;
`;

const StatusLabel = styled.div`
  font-weight: 600;
  color: #333;
`;

const StatusDescription = styled.div`
  font-size: 0.9rem;
  color: #666;
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
  const [completionStats, setCompletionStats] = useState<any>(null);

  // Load task statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        const stats = await getCompletionStats();
        setCompletionStats(stats);
      } catch (error) {
        console.error('Failed to load task statistics:', error);
      }
    };

    loadStats();
  }, [getCompletionStats]);

  return (
    <DashboardContainer>
      <div className="container">
        <DashboardHeader>
          <DashboardTitle>Your Cognitive Health Dashboard</DashboardTitle>
          <DashboardSubtitle>
            Monitor your cognitive health, track progress, and access personalized insights
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
                  <StatNumber>{Math.round(completionStats.averageScore * 100)}%</StatNumber>
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

        <DashboardGrid>
          <DashboardCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <CardIcon>
              <Brain size={28} />
            </CardIcon>
            <CardTitle>Assessment History</CardTitle>
            <CardDescription>
              View your previous assessments and track changes in your cognitive health over time.
            </CardDescription>
            <CardButton to="/results">
              View History
              <BarChart3 size={16} />
            </CardButton>
          </DashboardCard>

          <DashboardCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <CardIcon>
              <User size={28} />
            </CardIcon>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>
              Manage your personal information, preferences, and notification settings.
            </CardDescription>
            <CardButton to="/about">
              Manage Profile
              <Settings size={16} />
            </CardButton>
          </DashboardCard>

          <DashboardCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <CardIcon>
              <Shield size={28} />
            </CardIcon>
            <CardTitle>Privacy & Security</CardTitle>
            <CardDescription>
              Learn about how we protect your data and review our privacy policies.
            </CardDescription>
            <CardButton to="/about">
              Privacy Policy
              <FileText size={16} />
            </CardButton>
          </DashboardCard>

          <DashboardCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <CardIcon>
              <Mail size={28} />
            </CardIcon>
            <CardTitle>Support & Contact</CardTitle>
            <CardDescription>
              Get help with your assessment or contact our support team for assistance.
            </CardDescription>
            <CardButton to="/contact">
              Contact Support
              <Mail size={16} />
            </CardButton>
          </DashboardCard>
        </DashboardGrid>

        <StatusSection>
          <StatusTitle>Assessment Status</StatusTitle>
          <StatusItem>
            <StatusIcon $status="completed">
              <CheckCircle size={20} />
            </StatusIcon>
            <StatusText>
              <StatusLabel>Consent Form</StatusLabel>
              <StatusDescription>Completed - You've agreed to participate in the assessment</StatusDescription>
            </StatusText>
          </StatusItem>
          <StatusItem>
            <StatusIcon $status="pending">
              <Clock size={20} />
            </StatusIcon>
            <StatusText>
              <StatusLabel>Clock Drawing Test</StatusLabel>
              <StatusDescription>Ready to begin - This test analyzes spatial cognition</StatusDescription>
            </StatusText>
          </StatusItem>
          <StatusItem>
            <StatusIcon $status="pending">
              <Clock size={20} />
            </StatusIcon>
            <StatusText>
              <StatusLabel>Word Recall Test</StatusLabel>
              <StatusDescription>Ready to begin - This test evaluates memory function</StatusDescription>
            </StatusText>
          </StatusItem>
          <StatusItem>
            <StatusIcon $status="pending">
              <Clock size={20} />
            </StatusIcon>
            <StatusText>
              <StatusLabel>Image Association Test</StatusLabel>
              <StatusDescription>Ready to begin - This test assesses visual memory</StatusDescription>
            </StatusText>
          </StatusItem>
          <StatusItem>
            <StatusIcon $status="pending">
              <Clock size={20} />
            </StatusIcon>
            <StatusText>
              <StatusLabel>Selection Memory Test</StatusLabel>
              <StatusDescription>Ready to begin - This test evaluates attention and memory</StatusDescription>
            </StatusText>
          </StatusItem>
        </StatusSection>

        <DataExportPanel />
      </div>
    </DashboardContainer>
  );
};

export default Dashboard;
