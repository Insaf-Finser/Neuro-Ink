import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Target,
  Clock,
  Zap,
  Shield,
  Lightbulb
} from 'lucide-react';

const AnalysisContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const AnalysisHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f0f4f8;
`;

const AnalysisTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const RiskBadge = styled.div<{ $risk: 'low' | 'moderate' | 'high' }>`
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
  
  ${props => {
    switch (props.$risk) {
      case 'low':
        return `
          background: #e6ffed;
          color: #38a169;
          border: 1px solid #9ae6b4;
        `;
      case 'moderate':
        return `
          background: #fffbeb;
          color: #d69e2e;
          border: 1px solid #f6e05e;
        `;
      case 'high':
        return `
          background: #fed7d7;
          color: #e53e3e;
          border: 1px solid #fc8181;
        `;
    }
  }}
`;

const AnalysisGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
`;

const AnalysisCard = styled(motion.div)`
  background: #f8f9ff;
  border: 1px solid #e8ecff;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const CardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
`;

const CardIcon = styled.div<{ $color: string }>`
  color: ${props => props.$color};
  background: ${props => props.$color}20;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
`;

const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MetricLabel = styled.span`
  font-size: 0.85rem;
  color: #718096;
  font-weight: 500;
`;

const MetricValue = styled.span<{ $color?: string }>`
  font-size: 1.1rem;
  font-weight: 700;
  color: ${props => props.$color || '#2d3748'};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 8px;
`;

const ProgressFill = styled.div<{ $percentage: number; $color: string }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => props.$color};
  border-radius: 4px;
  transition: width 0.3s ease-in-out;
`;

const RecommendationsSection = styled.div`
  background: #f0f4f8;
  border-radius: 12px;
  padding: 20px;
  margin-top: 24px;
`;

const RecommendationsTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RecommendationList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
`;

const RecommendationItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 0;
  font-size: 0.9rem;
  color: #4a5568;
  line-height: 1.4;
`;

const RecommendationIcon = styled.div`
  color: #667eea;
  margin-top: 2px;
  flex-shrink: 0;
`;

const ConfidenceIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 12px;
  background: #e8ecff;
  border-radius: 8px;
`;

const ConfidenceText = styled.span`
  font-size: 0.9rem;
  color: #4a5568;
  font-weight: 500;
`;

const ConfidenceValue = styled.span`
  font-weight: 700;
  color: #667eea;
`;

interface AIAnalysisDisplayProps {
  analysis: {
    overallRisk: 'low' | 'moderate' | 'high';
    probability: number;
    testScores: {
      clockDrawing: number;
      wordRecall: number;
      imageAssociation: number;
      selectionMemory: number;
    };
    biomarkers: {
      pressure: number;
      spatialAccuracy: number;
      temporalConsistency: number;
      cognitiveLoad: number;
    };
    recommendations: string[];
  };
  modelVersion?: string;
  confidence?: number;
}

const AIAnalysisDisplay: React.FC<AIAnalysisDisplayProps> = ({ 
  analysis, 
  modelVersion = '3.0.0-LightGBM',
  confidence = 0.88
}) => {
  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'low': return <CheckCircle size={20} />;
      case 'moderate': return <AlertTriangle size={20} />;
      case 'high': return <AlertTriangle size={20} />;
      default: return <Activity size={20} />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return '#38a169';
      case 'moderate': return '#d69e2e';
      case 'high': return '#e53e3e';
      default: return '#667eea';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#38a169';
    if (score >= 60) return '#d69e2e';
    return '#e53e3e';
  };

  return (
    <AnalysisContainer>
      <AnalysisHeader>
        <AnalysisTitle>
          <Brain size={28} />
          AI Analysis Results
        </AnalysisTitle>
        <RiskBadge $risk={analysis.overallRisk}>
          {getRiskIcon(analysis.overallRisk)}
          {analysis.overallRisk.toUpperCase()} RISK
        </RiskBadge>
      </AnalysisHeader>

      <AnalysisGrid>
        {/* Overall Risk Assessment */}
        <AnalysisCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <CardHeader>
            <CardIcon $color={getRiskColor(analysis.overallRisk)}>
              <Target size={20} />
            </CardIcon>
            <CardTitle>Overall Risk Assessment</CardTitle>
          </CardHeader>
          <MetricGrid>
            <MetricItem>
              <MetricLabel>Risk Level</MetricLabel>
              <MetricValue $color={getRiskColor(analysis.overallRisk)}>
                {analysis.overallRisk.toUpperCase()}
              </MetricValue>
            </MetricItem>
            <MetricItem>
              <MetricLabel>Probability</MetricLabel>
              <MetricValue $color={getRiskColor(analysis.overallRisk)}>
                {Math.round(analysis.probability)}%
              </MetricValue>
            </MetricItem>
          </MetricGrid>
          <ProgressBar>
            <ProgressFill 
              $percentage={analysis.probability} 
              $color={getRiskColor(analysis.overallRisk)}
            />
          </ProgressBar>
        </AnalysisCard>

        {/* Biomarkers */}
        <AnalysisCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <CardHeader>
            <CardIcon $color="#667eea">
              <Activity size={20} />
            </CardIcon>
            <CardTitle>Biomarkers</CardTitle>
          </CardHeader>
          <MetricGrid>
            <MetricItem>
              <MetricLabel>Pressure Control</MetricLabel>
              <MetricValue $color={getScoreColor(analysis.biomarkers.pressure)}>
                {Math.round(analysis.biomarkers.pressure)}%
              </MetricValue>
            </MetricItem>
            <MetricItem>
              <MetricLabel>Spatial Accuracy</MetricLabel>
              <MetricValue $color={getScoreColor(analysis.biomarkers.spatialAccuracy)}>
                {Math.round(analysis.biomarkers.spatialAccuracy)}%
              </MetricValue>
            </MetricItem>
            <MetricItem>
              <MetricLabel>Temporal Consistency</MetricLabel>
              <MetricValue $color={getScoreColor(analysis.biomarkers.temporalConsistency)}>
                {Math.round(analysis.biomarkers.temporalConsistency)}%
              </MetricValue>
            </MetricItem>
            <MetricItem>
              <MetricLabel>Cognitive Load</MetricLabel>
              <MetricValue $color={getScoreColor(100 - analysis.biomarkers.cognitiveLoad)}>
                {Math.round(100 - analysis.biomarkers.cognitiveLoad)}%
              </MetricValue>
            </MetricItem>
          </MetricGrid>
        </AnalysisCard>

        {/* Test Scores */}
        <AnalysisCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CardHeader>
            <CardIcon $color="#9f7aea">
              <TrendingUp size={20} />
            </CardIcon>
            <CardTitle>Test Performance</CardTitle>
          </CardHeader>
          <MetricGrid>
            <MetricItem>
              <MetricLabel>Clock Drawing</MetricLabel>
              <MetricValue $color={getScoreColor(analysis.testScores.clockDrawing * 100)}>
                {Math.round(analysis.testScores.clockDrawing * 100)}%
              </MetricValue>
            </MetricItem>
            <MetricItem>
              <MetricLabel>Word Recall</MetricLabel>
              <MetricValue $color={getScoreColor(analysis.testScores.wordRecall * 100)}>
                {Math.round(analysis.testScores.wordRecall * 100)}%
              </MetricValue>
            </MetricItem>
            <MetricItem>
              <MetricLabel>Image Association</MetricLabel>
              <MetricValue $color={getScoreColor(analysis.testScores.imageAssociation * 100)}>
                {Math.round(analysis.testScores.imageAssociation * 100)}%
              </MetricValue>
            </MetricItem>
            <MetricItem>
              <MetricLabel>Selection Memory</MetricLabel>
              <MetricValue $color={getScoreColor(analysis.testScores.selectionMemory * 100)}>
                {Math.round(analysis.testScores.selectionMemory * 100)}%
              </MetricValue>
            </MetricItem>
          </MetricGrid>
        </AnalysisCard>

        {/* Model Information */}
        <AnalysisCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <CardHeader>
            <CardIcon $color="#38a169">
              <Shield size={20} />
            </CardIcon>
            <CardTitle>Model Information</CardTitle>
          </CardHeader>
          <MetricGrid>
            <MetricItem>
              <MetricLabel>Model Version</MetricLabel>
              <MetricValue>{modelVersion}</MetricValue>
            </MetricItem>
            <MetricItem>
              <MetricLabel>Confidence</MetricLabel>
              <MetricValue $color="#38a169">
                {Math.round(confidence * 100)}%
              </MetricValue>
            </MetricItem>
          </MetricGrid>
          <ConfidenceIndicator>
            <Zap size={16} />
            <ConfidenceText>Analysis powered by LightGBM with 88.57% accuracy</ConfidenceText>
          </ConfidenceIndicator>
        </AnalysisCard>
      </AnalysisGrid>

      {/* Recommendations */}
      <RecommendationsSection>
        <RecommendationsTitle>
          <Lightbulb size={20} />
          Personalized Recommendations
        </RecommendationsTitle>
        <RecommendationList>
          {analysis.recommendations.map((recommendation, index) => (
            <RecommendationItem key={index}>
              <RecommendationIcon>
                <CheckCircle size={16} />
              </RecommendationIcon>
              {recommendation}
            </RecommendationItem>
          ))}
        </RecommendationList>
      </RecommendationsSection>
    </AnalysisContainer>
  );
};

export default AIAnalysisDisplay;
