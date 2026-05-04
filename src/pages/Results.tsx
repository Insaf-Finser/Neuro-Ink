import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Brain, 
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Target,
  Calendar
} from 'lucide-react';

import { HANDWRITING_TASKS } from '../data/handwritingTasks';
import SHAPVisualization from '../components/SHAPVisualization';
import { getTestResults, StoredTestResult } from '../services/resultsStorageService';
import { useDisease } from '../context/DiseaseContext';

const DISEASE_LABEL = "Alzheimer's";

const ResultsContainer = styled.div`
  padding: 40px 0;
  min-height: calc(100vh - 160px);

  @media (max-width: 1024px) {
    padding: 32px 0;
  }
  @media (max-width: 768px) {
    padding: 20px 0;
  }
`;

const ResultsHeader = styled.div`
  text-align: center;
  margin-bottom: 48px;
`;

const ResultsTitle = styled.h1`
  font-size: 2.8rem;
  font-weight: 800;
  color: #333;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 16px;
  }
`;

const ResultsSubtitle = styled.p`
  font-size: 1.3rem;
  color: #666;
  max-width: 700px;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: 1rem;
    max-width: 100%;
    padding: 0 16px;
  }
`;

const ResultsContent = styled.div`
  background: white;
  border-radius: 20px;
  padding: 60px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 1024px) {
    padding: 40px;
    max-width: 960px;
  }

  @media (max-width: 768px) {
    padding: 20px;
    border-radius: 12px;
    width: calc(100% - 32px);
    margin: 0 auto;
  }
`;

const StatsSection = styled.div`
  margin-bottom: 48px;
`;

const StatsTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
  text-align: center;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 24px;

  @media (max-width: 600px) {
    gap: 16px;
  }
`;

const StatCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 16px;
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

const TasksSection = styled.div`
  margin-top: 48px;
`;

const TasksTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
`;

const TasksList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TaskResult = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e9ecef;
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

const TaskMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
`;

const TaskDate = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #666;
  font-size: 0.9rem;
`;

const TaskScore = styled.div<{ $risk: string }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$risk) {
      case 'low': return '#dcfce7';
      case 'moderate': return '#fef3c7';
      case 'high': return '#fecaca';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.$risk) {
      case 'low': return '#166534';
      case 'moderate': return '#92400e';
      case 'high': return '#dc2626';
      default: return '#374151';
    }
  }};
`;

const TaskDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
`;

const TaskMetric = styled.div`
  text-align: center;
`;

const MetricLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 4px;
`;

const MetricValue = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
`;

const DiseasePredictionCard = styled.div<{ $positive: boolean }>`
  background: ${props => props.$positive ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' : 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'};
  border: 2px solid ${props => props.$positive ? '#f59e0b' : '#10b981'};
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  text-align: center;
`;

const DiseasePredictionTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
  margin: 0 0 8px 0;
`;

const DiseasePredictionResult = styled.div<{ $positive: boolean }>`
  font-size: 1.5rem;
  font-weight: 800;
  color: ${props => props.$positive ? '#92400e' : '#065f46'};
  margin-bottom: 8px;
`;

const DiseasePredictionSub = styled.p`
  font-size: 0.95rem;
  color: #666;
  margin: 0;
`;


const Results: React.FC = () => {
  const { currentDisease } = useDisease();
  const [sessions, setSessions] = useState<StoredTestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [overallStats, setOverallStats] = useState({
    totalSessions: 0,
    completedTasks: 0,
    averageScore: 0,
    riskDistribution: { low: 0, moderate: 0, high: 0 }
  });

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const allResults = await getTestResults();
        const disease = currentDisease || 'alzheimers';
        const diseaseResults = allResults.filter(r => (r.disease || 'alzheimers') === disease);

        // Deduplicate by taskId so re-taking the same task doesn't inflate counts.
        // Keep the most recent completion for each task (by completedAt).
        const latestByTaskId = new Map<string, StoredTestResult>();
        for (const r of diseaseResults) {
          if (!r.taskId) continue;
          const existing = latestByTaskId.get(r.taskId);
          const rTime = Date.parse(r.completedAt) || 0;
          const existingTime = existing ? (Date.parse(existing.completedAt) || 0) : 0;
          if (!existing || rTime > existingTime) {
            latestByTaskId.set(r.taskId, r);
          }
        }

        const uniqueCompletedSessions = Array.from(latestByTaskId.values()).sort(
          (a, b) => (Date.parse(b.completedAt) || 0) - (Date.parse(a.completedAt) || 0)
        );

        setSessions(uniqueCompletedSessions);

        // Calculate overall statistics
        const totalSessions = uniqueCompletedSessions.length;
        const scores = uniqueCompletedSessions
          .map(r => (r.aiResult?.probability ?? 0))
          .map(p => (p > 1 ? p : p * 100)) // supports both 0-1 and 0-100 representations
          .filter(score => score > 0);
        const averageScore = scores.length > 0 
          ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
          : 0;

        // Calculate risk distribution
        const riskDistribution = uniqueCompletedSessions.reduce((acc, session) => {
          const risk = session.aiResult?.overallRisk || 'unknown';
          if (risk === 'low') acc.low++;
          else if (risk === 'moderate') acc.moderate++;
          else if (risk === 'high') acc.high++;
          return acc;
        }, { low: 0, moderate: 0, high: 0 });

        setOverallStats({
          totalSessions,
          completedTasks: totalSessions,
          averageScore,
          riskDistribution
        });
      } catch (error) {
        console.error('Failed to load sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [currentDisease]);

  const getTaskName = (taskId: string) => {
    const task = HANDWRITING_TASKS.find(t => t.id === taskId);
    return task ? task.name : taskId;
  };


  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <CheckCircle size={20} color="#10b981" />;
      case 'moderate': return <AlertCircle size={20} color="#f59e0b" />;
      case 'high': return <AlertCircle size={20} color="#ef4444" />;
      default: return <Target size={20} color="#6b7280" />;
    }
  };

  const diseasePredictionPositive = sessions.some(s => s.aiResult?.overallRisk === 'high');



  if (loading) {
    return (
      <ResultsContainer>
        <div className="container">
          <ResultsContent>
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{ fontSize: '3rem', marginBottom: '24px' }}
              >
                🧠
              </motion.div>
              <h2 style={{ fontSize: '1.8rem', color: '#333', marginBottom: '16px' }}>
                Loading Your Results
              </h2>
              <p style={{ color: '#666', fontSize: '1.1rem' }}>
                Analyzing your completed assessment sessions...
              </p>
            </div>
          </ResultsContent>
        </div>
      </ResultsContainer>
    );
  }

  if (sessions.length === 0) {
    return (
      <ResultsContainer>
        <div className="container">
          <ResultsHeader>
            <ResultsTitle>No Results Available</ResultsTitle>
            <ResultsSubtitle>
              Complete some assessment tasks to see your cognitive health analysis
            </ResultsSubtitle>
          </ResultsHeader>
          <ResultsContent>
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <Target size={64} color="#ccc" style={{ marginBottom: '24px' }} />
              <h3 style={{ fontSize: '1.5rem', color: '#666', marginBottom: '16px' }}>
                Start Your Assessment
              </h3>
              <p style={{ color: '#999', marginBottom: '32px' }}>
                Complete handwriting tasks to get personalized cognitive health insights
              </p>
              <Link to="/tasks" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '16px 32px',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: '600'
              }}>
                <Brain size={20} />
                Start Assessment
              </Link>
            </div>
          </ResultsContent>
        </div>
      </ResultsContainer>
    );
  }

  return (
    <ResultsContainer>
      <div className="container">
        <ResultsHeader>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <ResultsTitle>Your Cognitive Assessment Results</ResultsTitle>
            <ResultsSubtitle>
              Analysis of {overallStats.completedTasks} completed tasks with AI-powered insights
            </ResultsSubtitle>
          </motion.div>
        </ResultsHeader>

        <ResultsContent>
          {/* Disease prediction */}
          <DiseasePredictionCard $positive={diseasePredictionPositive}>
            <DiseasePredictionTitle>Disease prediction</DiseasePredictionTitle>
            <DiseasePredictionResult $positive={diseasePredictionPositive}>
              {diseasePredictionPositive
                ? `Possible signs of ${DISEASE_LABEL} risk indicated`
                : `No signs of ${DISEASE_LABEL} detected`
              }
            </DiseasePredictionResult>
            <DiseasePredictionSub>
              {diseasePredictionPositive
                ? `Based on your tasks, the model suggests possible risk (${overallStats.averageScore}% average probability). This is not a diagnosis — please discuss with a healthcare provider.`
                : `Based on your completed tasks, the model did not detect significant signs of ${DISEASE_LABEL}. This is screening only, not a diagnosis.`
              }
            </DiseasePredictionSub>
          </DiseasePredictionCard>

          {/* Overall Statistics */}
          <StatsSection>
            <StatsTitle>Assessment Overview</StatsTitle>
            <StatsGrid>
              <StatCard>
                <StatIcon>
                  <CheckCircle size={24} />
                </StatIcon>
                <StatContent>
                  <StatNumber>{overallStats.completedTasks}</StatNumber>
                  <StatLabel>Tasks Completed</StatLabel>
                </StatContent>
              </StatCard>
              <StatCard>
                <StatIcon>
                  <BarChart3 size={24} />
                </StatIcon>
                <StatContent>
                  <StatNumber>{overallStats.averageScore}%</StatNumber>
                  <StatLabel>Average Score</StatLabel>
                </StatContent>
              </StatCard>
              <StatCard>
                <StatIcon>
                  <TrendingUp size={24} />
                </StatIcon>
                <StatContent>
                  <StatNumber>{overallStats.riskDistribution.low}</StatNumber>
                  <StatLabel>Low Risk Tasks</StatLabel>
                </StatContent>
              </StatCard>
              <StatCard>
                <StatIcon>
                  <AlertCircle size={24} />
                </StatIcon>
                <StatContent>
                  <StatNumber>{overallStats.riskDistribution.moderate + overallStats.riskDistribution.high}</StatNumber>
                  <StatLabel>Higher Risk Tasks</StatLabel>
                </StatContent>
              </StatCard>
            </StatsGrid>
          </StatsSection>

          {/* Individual Task Results */}
          <TasksSection>
            <TasksTitle>Task-by-Task Results</TasksTitle>
            <TasksList>
              {sessions.map((session, index) => (
                <TaskResult key={session.id || index}>
                  <TaskHeader>
                    <TaskName>{getTaskName(session.taskId || 'unknown')}</TaskName>
                    <TaskMeta>
                      <TaskDate>
                        <Calendar size={16} />
                        {new Date(session.completedAt).toLocaleDateString()}
                      </TaskDate>
                      <TaskScore $risk={session.aiResult?.overallRisk || 'unknown'}>
                        {getRiskIcon(session.aiResult?.overallRisk || 'unknown')}
                        {session.aiResult?.overallRisk?.toUpperCase() || 'UNKNOWN'}
                      </TaskScore>
                    </TaskMeta>
                  </TaskHeader>
                  <TaskDetails>
                    <TaskMetric>
                      <MetricLabel>Risk Probability</MetricLabel>
                      <MetricValue>
                        {Math.round(
                          (session.aiResult?.probability ?? 0) > 1
                            ? (session.aiResult?.probability ?? 0)
                            : (session.aiResult?.probability ?? 0) * 100
                        )}%
                      </MetricValue>
                    </TaskMetric>
                    <TaskMetric>
                      <MetricLabel>Pressure Score</MetricLabel>
                      <MetricValue>{Math.round((session.aiResult?.biomarkers?.pressure ?? 0) * 100)}%</MetricValue>
                    </TaskMetric>
                    <TaskMetric>
                      <MetricLabel>Spatial Accuracy</MetricLabel>
                      <MetricValue>{Math.round((session.aiResult?.biomarkers?.spatialAccuracy ?? 0) * 100)}%</MetricValue>
                    </TaskMetric>
                  </TaskDetails>
                </TaskResult>
              ))}
            </TasksList>
          </TasksSection>

          {/* SHAP visualizations */}
          <div style={{ marginTop: '48px' }}>
            <SHAPVisualization />
          </div>
        </ResultsContent>
      </div>
    </ResultsContainer>
  );
};

export default Results;
