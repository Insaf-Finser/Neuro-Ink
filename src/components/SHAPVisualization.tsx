import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  Activity,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

const SHAPContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
`;

const SHAPHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const SHAPTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
`;

const SHAPDescription = styled.p`
  color: #718096;
  font-size: 1rem;
  margin: 8px 0 0 0;
`;

const SHAPGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
`;

const SHAPCard = styled(motion.div)`
  background: #f8f9ff;
  border: 1px solid #e8ecff;
  border-radius: 12px;
  padding: 20px;
`;

const SHAPCardTitle = styled.h4`
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ChartContainer = styled.div`
  height: 300px;
  width: 100%;
`;

const FeatureList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FeatureItem = styled(motion.div)<{ $importance: number; $impact: string }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid ${props => {
    if (props.$impact === 'positive') return '#38a169';
    if (props.$impact === 'negative') return '#e53e3e';
    return '#d69e2e';
  }};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const FeatureName = styled.span`
  font-weight: 500;
  color: #2d3748;
  flex: 1;
  font-size: 0.9rem;
`;

const FeatureValue = styled.span<{ $color: string }>`
  font-weight: 600;
  color: ${props => props.$color};
  font-size: 0.9rem;
`;

const ProgressBar = styled.div`
  width: 120px;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percentage: number; $color: string }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => props.$color};
  border-radius: 4px;
  transition: width 0.3s ease-in-out;
`;

const ImpactIcon = styled.div<{ $impact: string }>`
  color: ${props => {
    if (props.$impact === 'positive') return '#38a169';
    if (props.$impact === 'negative') return '#e53e3e';
    return '#d69e2e';
  }};
  display: flex;
  align-items: center;
`;

const SHAPSummary = styled.div`
  background: #f0f4f8;
  border-radius: 12px;
  padding: 20px;
  margin-top: 24px;
`;

const SummaryTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 16px 0;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const SummaryItem = styled.div`
  text-align: center;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

const SummaryLabel = styled.div`
  font-size: 0.85rem;
  color: #718096;
  font-weight: 500;
  margin-bottom: 4px;
`;

const SummaryValue = styled.div<{ $color?: string }>`
  font-size: 1.2rem;
  font-weight: 700;
  color: ${props => props.$color || '#2d3748'};
`;

const InterpretationSection = styled.div`
  background: #f8f9ff;
  border-radius: 12px;
  padding: 20px;
  margin-top: 24px;
`;

const InterpretationTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InterpretationText = styled.p`
  color: #4a5568;
  line-height: 1.6;
  margin: 0;
`;

interface SHAPVisualizationProps {
  shapData?: {
    featureImportance: Array<{
      feature: string;
      importance: number;
      impact: 'positive' | 'negative' | 'neutral';
      shapValue: number;
    }>;
    shapValues: Array<{
      feature: string;
      shapValue: number;
      baseValue: number;
    }>;
    modelPrediction: number;
    confidence: number;
  };
  loading?: boolean;
}

const SHAPVisualization: React.FC<SHAPVisualizationProps> = ({ 
  shapData, 
  loading = false 
}) => {
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);

  // Mock data for demonstration
  const mockSHAPData = {
    featureImportance: [
      { feature: 'Pressure Variance', importance: 0.85, impact: 'positive', shapValue: 0.15 },
      { feature: 'Spatial Accuracy', importance: 0.78, impact: 'positive', shapValue: 0.12 },
      { feature: 'Temporal Consistency', importance: 0.72, impact: 'positive', shapValue: 0.08 },
      { feature: 'Stroke Duration', importance: 0.65, impact: 'negative', shapValue: -0.06 },
      { feature: 'Pause Frequency', importance: 0.58, impact: 'negative', shapValue: -0.04 },
      { feature: 'Velocity Variance', importance: 0.52, impact: 'negative', shapValue: -0.03 },
      { feature: 'Acceleration Mean', importance: 0.48, impact: 'positive', shapValue: 0.02 },
      { feature: 'Curvature Std', importance: 0.42, impact: 'negative', shapValue: -0.01 }
    ],
    shapValues: [
      { feature: 'Pressure Variance', shapValue: 0.15, baseValue: 0.5 },
      { feature: 'Spatial Accuracy', shapValue: 0.12, baseValue: 0.5 },
      { feature: 'Temporal Consistency', shapValue: 0.08, baseValue: 0.5 },
      { feature: 'Stroke Duration', shapValue: -0.06, baseValue: 0.5 },
      { feature: 'Pause Frequency', shapValue: -0.04, baseValue: 0.5 }
    ],
    modelPrediction: 0.73,
    confidence: 0.885
  };

  const data = shapData || mockSHAPData;

  const getColorForImpact = (impact: string) => {
    switch (impact) {
      case 'positive': return '#38a169';
      case 'negative': return '#e53e3e';
      default: return '#d69e2e';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive': return <TrendingUp size={16} />;
      case 'negative': return <TrendingDown size={16} />;
      default: return <Activity size={16} />;
    }
  };

  const getInterpretation = () => {
    const positiveFeatures = data.featureImportance.filter(f => f.impact === 'positive').length;
    const negativeFeatures = data.featureImportance.filter(f => f.impact === 'negative').length;
    
    if (positiveFeatures > negativeFeatures) {
      return "Your handwriting patterns show predominantly positive cognitive indicators, suggesting good cognitive health and motor control.";
    } else if (negativeFeatures > positiveFeatures) {
      return "Your handwriting patterns show some areas of concern that may benefit from targeted cognitive exercises and monitoring.";
    } else {
      return "Your handwriting patterns show a balanced mix of indicators, suggesting moderate cognitive health with room for improvement.";
    }
  };

  if (loading) {
    return (
      <SHAPContainer>
        <SHAPHeader>
          <Brain size={32} color="#667eea" />
          <div>
            <SHAPTitle>SHAP Analysis</SHAPTitle>
            <SHAPDescription>Loading feature importance analysis...</SHAPDescription>
          </div>
        </SHAPHeader>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #e2e8f0', 
            borderTop: '4px solid #667eea', 
            borderRadius: '50%', 
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#718096' }}>Analyzing feature contributions...</p>
        </div>
      </SHAPContainer>
    );
  }

  return (
    <SHAPContainer>
      <SHAPHeader>
        <Brain size={32} color="#667eea" />
        <div>
          <SHAPTitle>SHAP Feature Importance Analysis</SHAPTitle>
          <SHAPDescription>
            SHapley Additive exPlanations (SHAP) values reveal how each handwriting feature contributes to the AI model's cognitive assessment
          </SHAPDescription>
        </div>
      </SHAPHeader>

      <SHAPGrid>
        {/* Feature Importance Bar Chart */}
        <SHAPCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <SHAPCardTitle>
            <Target size={20} />
            Feature Importance Ranking
          </SHAPCardTitle>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.featureImportance} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 1]} />
                <YAxis dataKey="feature" type="category" width={120} />
                <Tooltip 
                  formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, 'Importance']}
                  labelFormatter={(label) => `Feature: ${label}`}
                />
                <Bar 
                  dataKey="importance" 
                  fill="#667eea"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </SHAPCard>

        {/* SHAP Values Scatter Plot */}
        <SHAPCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <SHAPCardTitle>
            <Zap size={20} />
            SHAP Values Distribution
          </SHAPCardTitle>
          <ChartContainer>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={data.shapValues}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="feature" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(3)}`, 'SHAP Value']}
                  labelFormatter={(label) => `Feature: ${label}`}
                />
                <Scatter 
                  dataKey="shapValue" 
                  fill="#667eea"
                  stroke="#667eea"
                  strokeWidth={2}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </ChartContainer>
        </SHAPCard>
      </SHAPGrid>

      {/* Feature List with Details */}
      <SHAPCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <SHAPCardTitle>
          <Activity size={20} />
          Detailed Feature Analysis
        </SHAPCardTitle>
        <FeatureList>
          {data.featureImportance.map((feature, index) => (
            <FeatureItem
              key={index}
              $importance={feature.importance}
              $impact={feature.impact}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => setSelectedFeature(selectedFeature === feature.feature ? null : feature.feature)}
              style={{ cursor: 'pointer' }}
            >
              <ImpactIcon $impact={feature.impact}>
                {getImpactIcon(feature.impact)}
              </ImpactIcon>
              <FeatureName>{feature.feature}</FeatureName>
              <ProgressBar>
                <ProgressFill 
                  $percentage={feature.importance * 100} 
                  $color={getColorForImpact(feature.impact)}
                />
              </ProgressBar>
              <FeatureValue $color={getColorForImpact(feature.impact)}>
                {(feature.importance * 100).toFixed(1)}%
              </FeatureValue>
            </FeatureItem>
          ))}
        </FeatureList>
      </SHAPCard>

      {/* SHAP Summary */}
      <SHAPSummary>
        <SummaryTitle>SHAP Analysis Summary</SummaryTitle>
        <SummaryGrid>
          <SummaryItem>
            <SummaryLabel>Model Prediction</SummaryLabel>
            <SummaryValue $color="#667eea">
              {(data.modelPrediction * 100).toFixed(1)}%
            </SummaryValue>
          </SummaryItem>
          <SummaryItem>
            <SummaryLabel>Confidence Level</SummaryLabel>
            <SummaryValue $color="#38a169">
              {(data.confidence * 100).toFixed(1)}%
            </SummaryValue>
          </SummaryItem>
          <SummaryItem>
            <SummaryLabel>Positive Features</SummaryLabel>
            <SummaryValue $color="#38a169">
              {data.featureImportance.filter(f => f.impact === 'positive').length}
            </SummaryValue>
          </SummaryItem>
          <SummaryItem>
            <SummaryLabel>Negative Features</SummaryLabel>
            <SummaryValue $color="#e53e3e">
              {data.featureImportance.filter(f => f.impact === 'negative').length}
            </SummaryValue>
          </SummaryItem>
        </SummaryGrid>
      </SHAPSummary>

      {/* Interpretation */}
      <InterpretationSection>
        <InterpretationTitle>
          <Info size={20} />
          AI Model Interpretation
        </InterpretationTitle>
        <InterpretationText>
          {getInterpretation()}
        </InterpretationText>
      </InterpretationSection>
    </SHAPContainer>
  );
};

export default SHAPVisualization;
