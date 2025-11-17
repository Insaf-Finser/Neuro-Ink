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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area,
  ScatterChart,
  Scatter
} from 'recharts';
import {
  Brain,
  TrendingUp,
  Activity,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Radar as RadarIcon,
  Download,
  Share2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Shield,
  Lightbulb,
  Eye,
  BrainCircuit
} from 'lucide-react';

const DashboardContainer = styled.div`
  padding: 40px 0;
  min-height: calc(100vh - 160px);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
`;

const DashboardHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const DashboardTitle = styled.h1`
  font-size: 2.8rem;
  font-weight: 800;
  color: #2d3748;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const DashboardSubtitle = styled.p`
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

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 32px;
  margin-bottom: 40px;
`;

const ChartCard = styled(motion.div)`
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`;

const ChartTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
`;

const ChartIcon = styled.div<{ $color: string }>`
  color: ${props => props.$color};
  background: ${props => props.$color}20;
  padding: 8px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ChartContainer = styled.div`
  height: 300px;
  width: 100%;
`;

const SHAPSection = styled.div`
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
`;

const SHAPCard = styled(motion.div)`
  background: #f8f9ff;
  border: 1px solid #e8ecff;
  border-radius: 12px;
  padding: 20px;
`;

const SHAPCardTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 16px 0;
`;

const FeatureImportanceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FeatureItem = styled.div<{ $importance: number }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: white;
  border-radius: 8px;
  border-left: 4px solid ${props => {
    if (props.$importance > 0.7) return '#38a169';
    if (props.$importance > 0.4) return '#d69e2e';
    return '#e53e3e';
  }};
`;

const FeatureName = styled.span`
  font-weight: 500;
  color: #2d3748;
  flex: 1;
`;

const FeatureValue = styled.span<{ $color: string }>`
  font-weight: 600;
  color: ${props => props.$color};
`;

const ProgressBar = styled.div`
  width: 100px;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percentage: number; $color: string }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: ${props => props.$color};
  border-radius: 3px;
  transition: width 0.3s ease-in-out;
`;

const InsightsSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
`;

const InsightsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
`;

const InsightCard = styled(motion.div)`
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

const InsightHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const InsightTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
`;

const InsightContent = styled.div`
  color: #4a5568;
  line-height: 1.6;
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
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
  font-size: 1.2rem;
  font-weight: 700;
  color: ${props => props.$color || '#2d3748'};
`;

interface ResultsDashboardProps {
  analysisData?: any;
  sessionData?: any;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ 
  analysisData, 
  sessionData 
}) => {
  const [shapData, setShapData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration - in real implementation, this would come from the AI analysis
  const mockData = {
    biomarkers: [
      { name: 'Pressure Control', value: 85, color: '#38a169' },
      { name: 'Spatial Accuracy', value: 72, color: '#d69e2e' },
      { name: 'Temporal Consistency', value: 68, color: '#e53e3e' },
      { name: 'Cognitive Load', value: 45, color: '#667eea' }
    ],
    performanceOverTime: [
      { time: 'Week 1', score: 65 },
      { time: 'Week 2', score: 68 },
      { time: 'Week 3', score: 72 },
      { time: 'Week 4', score: 75 },
      { time: 'Week 5', score: 78 },
      { time: 'Week 6', score: 82 }
    ],
    taskScores: [
      { task: 'Clock Drawing', score: 85 },
      { task: 'Word Recall', score: 72 },
      { task: 'Image Association', score: 68 },
      { task: 'Selection Memory', score: 75 },
      { task: 'Spatial Tasks', score: 80 },
      { task: 'Motor Tasks', score: 70 }
    ],
    riskFactors: [
      { factor: 'Age', impact: 0.3, direction: 'negative' },
      { factor: 'Education', impact: 0.2, direction: 'positive' },
      { factor: 'Physical Activity', impact: 0.25, direction: 'positive' },
      { factor: 'Sleep Quality', impact: 0.15, direction: 'positive' }
    ]
  };

  // Mock SHAP data - in real implementation, this would come from the AI model
  const mockSHAPData = {
    featureImportance: [
      { feature: 'Pressure Variance', importance: 0.85, impact: 'positive' },
      { feature: 'Spatial Accuracy', importance: 0.78, impact: 'positive' },
      { feature: 'Temporal Consistency', importance: 0.72, impact: 'positive' },
      { feature: 'Stroke Duration', importance: 0.65, impact: 'negative' },
      { feature: 'Pause Frequency', importance: 0.58, impact: 'negative' },
      { feature: 'Velocity Variance', importance: 0.52, impact: 'negative' },
      { feature: 'Acceleration Mean', importance: 0.48, impact: 'positive' },
      { feature: 'Curvature Std', importance: 0.42, impact: 'negative' }
    ],
    shapValues: [
      { feature: 'Pressure Variance', shapValue: 0.15, baseValue: 0.5 },
      { feature: 'Spatial Accuracy', shapValue: 0.12, baseValue: 0.5 },
      { feature: 'Temporal Consistency', shapValue: 0.08, baseValue: 0.5 },
      { feature: 'Stroke Duration', shapValue: -0.06, baseValue: 0.5 },
      { feature: 'Pause Frequency', shapValue: -0.04, baseValue: 0.5 }
    ]
  };

  useEffect(() => {
    // Simulate loading SHAP data
    setLoading(true);
    setTimeout(() => {
      setShapData(mockSHAPData);
      setLoading(false);
    }, 1000);
  }, []);

  const handleDownloadReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      analysis: analysisData,
      session: sessionData,
      shapData: shapData
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neuroink-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShareResults = () => {
    const shareText = `My NeuroInk cognitive assessment dashboard shows comprehensive analysis with SHAP feature importance. Get your own assessment at NeuroInk!`;
    
    if (navigator.share) {
      navigator.share({
        title: 'NeuroInk Dashboard Results',
        text: shareText,
        url: window.location.origin
      });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Dashboard results copied to clipboard!');
    }
  };

  const getColorForValue = (value: number) => {
    if (value >= 80) return '#38a169';
    if (value >= 60) return '#d69e2e';
    return '#e53e3e';
  };

  const getImpactColor = (impact: string) => {
    return impact === 'positive' ? '#38a169' : '#e53e3e';
  };

  return (
    <DashboardContainer>
      <div className="container">
        <DashboardHeader>
          <DashboardTitle>Comprehensive Results Dashboard</DashboardTitle>
          <DashboardSubtitle>
            Advanced analytics with SHAP feature importance and detailed insights
          </DashboardSubtitle>
          <ActionButtons>
            <ActionButton onClick={handleDownloadReport}>
              <Download size={16} />
              Download Report
            </ActionButton>
            <ActionButton onClick={handleShareResults}>
              <Share2 size={16} />
              Share Dashboard
            </ActionButton>
            <ActionButton $variant="primary">
              <RefreshCw size={16} />
              Refresh Analysis
            </ActionButton>
          </ActionButtons>
        </DashboardHeader>

        {/* SHAP Analysis Section */}
        <SHAPSection>
          <SHAPHeader>
            <BrainCircuit size={32} color="#667eea" />
            <div>
              <SHAPTitle>SHAP Feature Importance Analysis</SHAPTitle>
              <SHAPDescription>
                SHapley Additive exPlanations (SHAP) values show how each feature contributes to the AI model's prediction
              </SHAPDescription>
            </div>
          </SHAPHeader>
          
          <SHAPGrid>
            <SHAPCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SHAPCardTitle>Feature Importance Ranking</SHAPCardTitle>
              <FeatureImportanceList>
                {shapData?.featureImportance.map((feature: any, index: number) => (
                  <FeatureItem key={index} $importance={feature.importance}>
                    <FeatureName>{feature.feature}</FeatureName>
                    <ProgressBar>
                      <ProgressFill 
                        $percentage={feature.importance * 100} 
                        $color={getImpactColor(feature.impact)}
                      />
                    </ProgressBar>
                    <FeatureValue $color={getImpactColor(feature.impact)}>
                      {(feature.importance * 100).toFixed(1)}%
                    </FeatureValue>
                  </FeatureItem>
                ))}
              </FeatureImportanceList>
            </SHAPCard>

            <SHAPCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <SHAPCardTitle>SHAP Values Distribution</SHAPCardTitle>
              <ChartContainer>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shapData?.shapValues}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="feature" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="shapValue" fill="#667eea" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </SHAPCard>
          </SHAPGrid>
        </SHAPSection>

        {/* Charts Grid */}
        <ChartsGrid>
          {/* Biomarkers Radar Chart */}
          <ChartCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ChartHeader>
              <ChartIcon $color="#667eea">
                <RadarIcon size={20} />
              </ChartIcon>
              <ChartTitle>Biomarkers Radar Analysis</ChartTitle>
            </ChartHeader>
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={mockData.biomarkers}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Biomarkers"
                    dataKey="value"
                    stroke="#667eea"
                    fill="#667eea"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartCard>

          {/* Performance Over Time */}
          <ChartCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ChartHeader>
              <ChartIcon $color="#38a169">
                <LineChartIcon size={20} />
              </ChartIcon>
              <ChartTitle>Performance Over Time</ChartTitle>
            </ChartHeader>
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData.performanceOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#38a169" 
                    strokeWidth={3}
                    dot={{ fill: '#38a169', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartCard>

          {/* Task Scores Bar Chart */}
          <ChartCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ChartHeader>
              <ChartIcon $color="#d69e2e">
                <BarChart3 size={20} />
              </ChartIcon>
              <ChartTitle>Task Performance Scores</ChartTitle>
            </ChartHeader>
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockData.taskScores}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="task" angle={-45} textAnchor="end" height={80} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#d69e2e" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartCard>

          {/* Risk Factors Pie Chart */}
          <ChartCard
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <ChartHeader>
              <ChartIcon $color="#e53e3e">
                <PieChartIcon size={20} />
              </ChartIcon>
              <ChartTitle>Risk Factor Impact</ChartTitle>
            </ChartHeader>
            <ChartContainer>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockData.riskFactors}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ factor, impact }: any) => `${factor}: ${(impact * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="impact"
                  >
                    {mockData.riskFactors.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getImpactColor(entry.direction)} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartCard>
        </ChartsGrid>

        {/* Insights Section */}
        <InsightsSection>
          <ChartHeader>
            <ChartIcon $color="#9f7aea">
              <Lightbulb size={24} />
            </ChartIcon>
            <ChartTitle>Key Insights & Recommendations</ChartTitle>
          </ChartHeader>
          
          <InsightsGrid>
            <InsightCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <InsightHeader>
                <ChartIcon $color="#38a169">
                  <CheckCircle size={20} />
                </ChartIcon>
                <InsightTitle>Strengths Identified</InsightTitle>
              </InsightHeader>
              <InsightContent>
                <p>Based on SHAP analysis, your strongest cognitive indicators are:</p>
                <ul>
                  <li>Excellent pressure control (85% importance)</li>
                  <li>Strong spatial processing abilities</li>
                  <li>Consistent temporal patterns</li>
                </ul>
              </InsightContent>
            </InsightCard>

            <InsightCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <InsightHeader>
                <ChartIcon $color="#d69e2e">
                  <AlertTriangle size={20} />
                </ChartIcon>
                <InsightTitle>Areas for Improvement</InsightTitle>
              </InsightHeader>
              <InsightContent>
                <p>SHAP analysis suggests focusing on:</p>
                <ul>
                  <li>Stroke duration consistency</li>
                  <li>Pause frequency optimization</li>
                  <li>Velocity variance reduction</li>
                </ul>
              </InsightContent>
            </InsightCard>

            <InsightCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <InsightHeader>
                <ChartIcon $color="#667eea">
                  <Target size={20} />
                </ChartIcon>
                <InsightTitle>Personalized Recommendations</InsightTitle>
              </InsightHeader>
              <InsightContent>
                <p>Based on your SHAP feature profile:</p>
                <ul>
                  <li>Practice spatial reasoning exercises</li>
                  <li>Engage in rhythm-based activities</li>
                  <li>Focus on consistent stroke patterns</li>
                </ul>
              </InsightContent>
            </InsightCard>

            <InsightCard
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <InsightHeader>
                <ChartIcon $color="#9f7aea">
                  <Brain size={20} />
                </ChartIcon>
                <InsightTitle>Model Confidence</InsightTitle>
              </InsightHeader>
              <InsightContent>
                <MetricGrid>
                  <MetricItem>
                    <MetricLabel>Overall Confidence</MetricLabel>
                    <MetricValue $color="#38a169">88.5%</MetricValue>
                  </MetricItem>
                  <MetricItem>
                    <MetricLabel>Feature Coverage</MetricLabel>
                    <MetricValue $color="#d69e2e">92%</MetricValue>
                  </MetricItem>
                  <MetricItem>
                    <MetricLabel>SHAP Stability</MetricLabel>
                    <MetricValue $color="#667eea">95%</MetricValue>
                  </MetricItem>
                </MetricGrid>
              </InsightContent>
            </InsightCard>
          </InsightsGrid>
        </InsightsSection>
      </div>
    </DashboardContainer>
  );
};

export default ResultsDashboard;
