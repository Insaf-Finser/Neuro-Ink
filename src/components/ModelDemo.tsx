import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Brain, Zap, Target, TrendingUp } from 'lucide-react';
import { aiAnalysisService, HandwritingData } from '../services/aiAnalysisService';

const ModelDemoContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #718096;
  margin-bottom: 1rem;
`;

const ModelInfo = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
`;

const ModelStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: #718096;
  font-size: 0.9rem;
`;

const DemoSection = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
`;

const DemoButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const ResultDisplay = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
  border-left: 4px solid #667eea;
`;

const ResultText = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: #2d3748;
  white-space: pre-wrap;
`;

const ModelDemo: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateSampleData = (): HandwritingData => {
    // Generate sample handwriting data for demonstration
    const strokes = [];
    const numStrokes = Math.floor(Math.random() * 5) + 3;
    let totalPoints = 0;
    
    for (let i = 0; i < numStrokes; i++) {
      const points = [];
      const numPoints = Math.floor(Math.random() * 20) + 10;
      totalPoints += numPoints;
      
      for (let j = 0; j < numPoints; j++) {
        points.push({
          x: Math.random() * 400 + 50,
          y: Math.random() * 300 + 50,
          pressure: Math.random() * 0.5 + 0.5,
          timestamp: Date.now() + j * 10,
          tiltX: Math.random() * 0.2 - 0.1,
          tiltY: Math.random() * 0.2 - 0.1,
          rotation: Math.random() * 0.1 - 0.05
        });
      }
      
      strokes.push({
        points,
        startTime: Date.now() + i * 1000,
        endTime: Date.now() + i * 1000 + numPoints * 10
      });
    }
    
    return {
      strokes,
      totalTime: numStrokes * 1000 + totalPoints * 10,
      canvasSize: { width: 500, height: 400 }
    };
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setResult('Analyzing handwriting data...\n');
    
    try {
      // Generate sample data
      const sampleData = generateSampleData();
      
      // Extract features
      const features = aiAnalysisService.extractFeatures(sampleData);
      
      // Analyze handwriting
      const analysis = aiAnalysisService.analyzeHandwriting(sampleData);
      
      // Generate result text
      const resultText = `
🎯 LightGBM Model Analysis Results (88.57% Accuracy)

📊 Extracted Features:
${Object.entries(features).map(([key, value]) => `  ${key}: ${value.toFixed(3)}`).join('\n')}

🧠 AI Analysis Results:
  Pressure Score: ${analysis.pressure.toFixed(1)}%
  Spatial Accuracy: ${analysis.spatialAccuracy.toFixed(1)}%
  Temporal Consistency: ${analysis.temporalConsistency.toFixed(1)}%
  Cognitive Load: ${analysis.cognitiveLoad.toFixed(1)}%

🎯 Model Prediction:
  Probability: ${(analysis.darwinPrediction! * 100).toFixed(1)}%
  Risk Level: ${analysis.darwinRiskLevel?.toUpperCase()}
  Model Version: ${analysis.modelVersion}
  Validation: ${analysis.clinicalValidation}

⚡ Model Performance:
  Training Accuracy: 88.57%
  AUC Score: 96.08%
  Dataset: DARWIN (174 samples)
  Algorithm: LightGBM Gradient Boosting

🔬 Technical Details:
  - 200 decision trees
  - Max depth: 6 levels
  - Learning rate: 0.1
  - Feature selection: 150 most important features
  - Cross-validation: 5-fold stratified
      `;
      
      setResult(resultText);
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <ModelDemoContainer>
      <Header>
        <Title>LightGBM Model Demo</Title>
        <Subtitle>Experience the 88.57% accuracy AI model in action</Subtitle>
      </Header>

      <ModelInfo>
        <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Brain size={24} />
          Advanced AI Model Integration
        </h3>
        <p style={{ margin: 0, opacity: 0.9 }}>
          This demo showcases the LightGBM model that achieved 88.57% accuracy on the DARWIN dataset. 
          The model analyzes handwriting patterns to detect early signs of cognitive changes.
        </p>
      </ModelInfo>

      <ModelStats>
        <StatCard>
          <StatValue>88.57%</StatValue>
          <StatLabel>Accuracy</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>96.08%</StatValue>
          <StatLabel>AUC Score</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>200</StatValue>
          <StatLabel>Decision Trees</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>150</StatValue>
          <StatLabel>Features</StatLabel>
        </StatCard>
      </ModelStats>

      <DemoSection>
        <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Zap size={20} />
          Live Model Demo
        </h3>
        <p style={{ margin: '0 0 1rem 0', color: '#718096' }}>
          Click the button below to run the LightGBM model on sample handwriting data and see the analysis results.
        </p>
        
        <DemoButton onClick={runAnalysis} disabled={isAnalyzing}>
          {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
        </DemoButton>

        {result && (
          <ResultDisplay>
            <ResultText>{result}</ResultText>
          </ResultDisplay>
        )}
      </DemoSection>

      <DemoSection>
        <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={20} />
          Model Integration Steps
        </h3>
        <ol style={{ color: '#718096', lineHeight: '1.6' }}>
          <li><strong>Model Export:</strong> Trained LightGBM model exported to JSON format</li>
          <li><strong>Feature Mapping:</strong> Handwriting features mapped to DARWIN dataset features</li>
          <li><strong>Scaling:</strong> Features normalized using trained RobustScaler</li>
          <li><strong>Prediction:</strong> LightGBM algorithm applied using feature importances</li>
          <li><strong>Risk Assessment:</strong> Probability converted to risk levels (low/moderate/high)</li>
        </ol>
      </DemoSection>
    </ModelDemoContainer>
  );
};

export default ModelDemo;
