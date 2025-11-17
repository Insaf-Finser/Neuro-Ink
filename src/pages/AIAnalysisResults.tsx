import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  RefreshCw,
  Brain,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Target,
  Activity,
  Zap,
  Shield,
  Lightbulb,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import AIAnalysisDisplay from '../components/AIAnalysisDisplay';
import { enhancedAIAnalysisService, EnhancedAIAnalysisResult } from '../services/enhancedAIAnalysisService';
import { HandwritingData } from '../services/aiAnalysisService';

const ResultsContainer = styled.div`
  padding: 40px 0;
  min-height: calc(100vh - 160px);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

const ResultsHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const ResultsTitle = styled.h1`
  font-size: 2.8rem;
  font-weight: 800;
  color: #2d3748;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const ResultsSubtitle = styled.p`
  font-size: 1.2rem;
  color: #718096;
  max-width: 600px;
  margin: 0 auto 32px;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 40px;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  ${props => props.$variant === 'primary' ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    }
  ` : `
    background: white;
    color: #667eea;
    border: 2px solid #667eea;
    &:hover {
      background: #667eea;
      color: white;
    }
  `}
`;

const AnalysisSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const InsightCard = styled(motion.div)`
  background: #f8f9ff;
  border: 1px solid #e8ecff;
  border-radius: 12px;
  padding: 24px;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const InsightHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const InsightTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
`;

const InsightIcon = styled.div<{ $color: string }>`
  color: ${props => props.$color};
  background: ${props => props.$color}20;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const InsightContent = styled.div`
  color: #4a5568;
  line-height: 1.6;
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const MetricItem = styled.div`
  text-align: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const MetricLabel = styled.div`
  font-size: 0.85rem;
  color: #718096;
  font-weight: 500;
  margin-bottom: 4px;
`;

const MetricValue = styled.div<{ $color?: string }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.$color || '#2d3748'};
`;

const RecommendationsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
`;

const RecommendationCard = styled(motion.div)`
  background: #f0f4f8;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const RecommendationIcon = styled.div`
  color: #667eea;
  margin-top: 2px;
  flex-shrink: 0;
`;

const RecommendationText = styled.div`
  color: #4a5568;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 24px;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.p`
  font-size: 1.1rem;
  color: #718096;
  font-weight: 500;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 40px;
  background: #fed7d7;
  border: 1px solid #fc8181;
  border-radius: 12px;
  color: #e53e3e;
`;

const ErrorTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

const ErrorMessage = styled.p`
  font-size: 1rem;
  margin-bottom: 16px;
`;

const AIAnalysisResults: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<EnhancedAIAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const performAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get task completion data from location state
        const completionData = location.state?.completionData;
        if (!completionData) {
          throw new Error('No completion data available for analysis');
        }

        // Prepare handwriting data
        const handwritingData: HandwritingData = {
          strokes: completionData.strokes,
          totalTime: completionData.elapsedTime,
          canvasSize: completionData.canvasSize
        };

        // Prepare analysis context
        const context = {
          taskId: completionData.taskId,
          taskName: completionData.taskName,
          category: completionData.category,
          difficulty: completionData.difficulty,
          userAge: 45 // Default age, would come from user profile
        };

        // Perform enhanced AI analysis
        const result = await enhancedAIAnalysisService.performEnhancedAnalysis(handwritingData, context);
        setAnalysis(result);

      } catch (err) {
        console.error('AI analysis failed:', err);
        setError(err instanceof Error ? err.message : 'Analysis failed');
      } finally {
        setLoading(false);
      }
    };

    performAnalysis();
  }, [location.state]);

  const handleDownloadReport = () => {
    if (!analysis) return;
    
    const reportData = {
      timestamp: new Date().toISOString(),
      analysis: analysis,
      modelVersion: '3.0.0-LightGBM-Enhanced'
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neuroink-analysis-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareResults = () => {
    if (!analysis) return;
    
    const shareText = `My NeuroInk cognitive assessment results: ${analysis.overallRisk.toUpperCase()} risk level with ${Math.round(analysis.probability)}% probability. Get your own assessment at NeuroInk!`;
    
    if (navigator.share) {
      navigator.share({
        title: 'NeuroInk Analysis Results',
        text: shareText,
        url: window.location.origin
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Results copied to clipboard!');
    }
  };

  const handleNewAssessment = () => {
    navigate('/tasks');
  };

  if (loading) {
    return (
      <ResultsContainer>
        <div className="container">
          <LoadingContainer>
            <LoadingSpinner />
            <LoadingText>Performing AI Analysis...</LoadingText>
            <p style={{ color: '#718096', fontSize: '0.9rem' }}>
              Analyzing your handwriting patterns with our advanced LightGBM model
            </p>
          </LoadingContainer>
        </div>
      </ResultsContainer>
    );
  }

  if (error) {
    return (
      <ResultsContainer>
        <div className="container">
          <ErrorContainer>
            <ErrorTitle>Analysis Failed</ErrorTitle>
            <ErrorMessage>{error}</ErrorMessage>
            <ActionButton onClick={() => navigate('/tasks')}>
              <ArrowLeft size={16} />
              Back to Tasks
            </ActionButton>
          </ErrorContainer>
        </div>
      </ResultsContainer>
    );
  }

  if (!analysis) {
    return (
      <ResultsContainer>
        <div className="container">
          <ErrorContainer>
            <ErrorTitle>No Analysis Available</ErrorTitle>
            <ErrorMessage>Unable to load analysis results.</ErrorMessage>
            <ActionButton onClick={() => navigate('/tasks')}>
              <ArrowLeft size={16} />
              Back to Tasks
            </ActionButton>
          </ErrorContainer>
        </div>
      </ResultsContainer>
    );
  }

  return (
    <ResultsContainer>
      <div className="container">
        <ResultsHeader>
          <ResultsTitle>AI Analysis Results</ResultsTitle>
          <ResultsSubtitle>
            Comprehensive cognitive assessment powered by advanced machine learning
          </ResultsSubtitle>
          <ActionButtons>
            <ActionButton onClick={handleDownloadReport}>
              <Download size={16} />
              Download Report
            </ActionButton>
            <ActionButton onClick={handleShareResults}>
              <Share2 size={16} />
              Share Results
            </ActionButton>
            <ActionButton onClick={handleNewAssessment}>
              <RefreshCw size={16} />
              New Assessment
            </ActionButton>
          </ActionButtons>
        </ResultsHeader>

        {/* Main AI Analysis Display */}
        <AIAnalysisDisplay 
          analysis={analysis}
          modelVersion="3.0.0-LightGBM-Enhanced"
          confidence={0.8857}
        />

        {/* Detailed Insights */}
        <AnalysisSection>
          <SectionTitle>
            <Brain size={28} />
            Detailed Insights
          </SectionTitle>
          <InsightsGrid>
            <InsightCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <InsightHeader>
                <InsightIcon $color="#667eea">
                  <Target size={20} />
                </InsightIcon>
                <InsightTitle>Handwriting Quality</InsightTitle>
              </InsightHeader>
              <InsightContent>
                <p>Score: {analysis.detailedInsights.handwritingQuality.score}%</p>
                {analysis.detailedInsights.handwritingQuality.factors.length > 0 && (
                  <div>
                    <strong>Strengths:</strong>
                    <ul>
                      {analysis.detailedInsights.handwritingQuality.factors.map((factor, index) => (
                        <li key={index}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.detailedInsights.handwritingQuality.improvements.length > 0 && (
                  <div>
                    <strong>Areas for Improvement:</strong>
                    <ul>
                      {analysis.detailedInsights.handwritingQuality.improvements.map((improvement, index) => (
                        <li key={index}>{improvement}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </InsightContent>
            </InsightCard>

            <InsightCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <InsightHeader>
                <InsightIcon $color="#9f7aea">
                  <TrendingUp size={20} />
                </InsightIcon>
                <InsightTitle>Cognitive Performance</InsightTitle>
              </InsightHeader>
              <InsightContent>
                <p>Score: {analysis.detailedInsights.cognitivePerformance.score}%</p>
                {analysis.detailedInsights.cognitivePerformance.strengths.length > 0 && (
                  <div>
                    <strong>Strengths:</strong>
                    <ul>
                      {analysis.detailedInsights.cognitivePerformance.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.detailedInsights.cognitivePerformance.areasForImprovement.length > 0 && (
                  <div>
                    <strong>Areas for Improvement:</strong>
                    <ul>
                      {analysis.detailedInsights.cognitivePerformance.areasForImprovement.map((area, index) => (
                        <li key={index}>{area}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </InsightContent>
            </InsightCard>

            <InsightCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <InsightHeader>
                <InsightIcon $color="#38a169">
                  <Activity size={20} />
                </InsightIcon>
                <InsightTitle>Motor Control</InsightTitle>
              </InsightHeader>
              <InsightContent>
                <MetricGrid>
                  <MetricItem>
                    <MetricLabel>Overall</MetricLabel>
                    <MetricValue $color="#38a169">{analysis.detailedInsights.motorControl.score}%</MetricValue>
                  </MetricItem>
                  <MetricItem>
                    <MetricLabel>Stability</MetricLabel>
                    <MetricValue>{analysis.detailedInsights.motorControl.stability}%</MetricValue>
                  </MetricItem>
                  <MetricItem>
                    <MetricLabel>Precision</MetricLabel>
                    <MetricValue>{analysis.detailedInsights.motorControl.precision}%</MetricValue>
                  </MetricItem>
                  <MetricItem>
                    <MetricLabel>Consistency</MetricLabel>
                    <MetricValue>{analysis.detailedInsights.motorControl.consistency}%</MetricValue>
                  </MetricItem>
                </MetricGrid>
              </InsightContent>
            </InsightCard>

            <InsightCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <InsightHeader>
                <InsightIcon $color="#d69e2e">
                  <Clock size={20} />
                </InsightIcon>
                <InsightTitle>Temporal Patterns</InsightTitle>
              </InsightHeader>
              <InsightContent>
                <MetricGrid>
                  <MetricItem>
                    <MetricLabel>Overall</MetricLabel>
                    <MetricValue $color="#d69e2e">{analysis.detailedInsights.temporalPatterns.score}%</MetricValue>
                  </MetricItem>
                  <MetricItem>
                    <MetricLabel>Rhythm</MetricLabel>
                    <MetricValue>{analysis.detailedInsights.temporalPatterns.rhythm}%</MetricValue>
                  </MetricItem>
                  <MetricItem>
                    <MetricLabel>Pacing</MetricLabel>
                    <MetricValue>{analysis.detailedInsights.temporalPatterns.pacing}%</MetricValue>
                  </MetricItem>
                  <MetricItem>
                    <MetricLabel>Pauses</MetricLabel>
                    <MetricValue>{analysis.detailedInsights.temporalPatterns.pauses}%</MetricValue>
                  </MetricItem>
                </MetricGrid>
              </InsightContent>
            </InsightCard>
          </InsightsGrid>
        </AnalysisSection>

        {/* Personalized Plan */}
        <AnalysisSection>
          <SectionTitle>
            <Lightbulb size={28} />
            Personalized Action Plan
          </SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            <div>
              <h3 style={{ color: '#e53e3e', marginBottom: '12px' }}>Immediate Actions</h3>
              <RecommendationsList>
                {analysis.personalizedPlan.immediateActions.map((action, index) => (
                  <RecommendationCard key={index}>
                    <RecommendationIcon>
                      <AlertTriangle size={16} />
                    </RecommendationIcon>
                    <RecommendationText>{action}</RecommendationText>
                  </RecommendationCard>
                ))}
              </RecommendationsList>
            </div>
            
            <div>
              <h3 style={{ color: '#d69e2e', marginBottom: '12px' }}>Short-term Goals (3-6 months)</h3>
              <RecommendationsList>
                {analysis.personalizedPlan.shortTermGoals.map((goal, index) => (
                  <RecommendationCard key={index}>
                    <RecommendationIcon>
                      <Target size={16} />
                    </RecommendationIcon>
                    <RecommendationText>{goal}</RecommendationText>
                  </RecommendationCard>
                ))}
              </RecommendationsList>
            </div>
            
            <div>
              <h3 style={{ color: '#38a169', marginBottom: '12px' }}>Long-term Strategy (6+ months)</h3>
              <RecommendationsList>
                {analysis.personalizedPlan.longTermStrategy.map((strategy, index) => (
                  <RecommendationCard key={index}>
                    <RecommendationIcon>
                      <TrendingUp size={16} />
                    </RecommendationIcon>
                    <RecommendationText>{strategy}</RecommendationText>
                  </RecommendationCard>
                ))}
              </RecommendationsList>
            </div>
          </div>
        </AnalysisSection>
      </div>
    </ResultsContainer>
  );
};

export default AIAnalysisResults;
