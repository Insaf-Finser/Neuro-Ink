import React from 'react';
import styled from 'styled-components';
import { DrawingValidationResult } from '../services/drawingValidationService';
import { AIAnalysisResult } from '../services/aiAnalysisService';

const Panel = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
  margin-top: 12px;
`;

const Title = styled.h3`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 6px 0;
  font-size: 14px;
  color: #374151;
`;

const Badge = styled.span<{ $tone?: 'success' | 'warning' | 'info' }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: ${({ $tone }) =>
    $tone === 'success' ? '#065f46' : $tone === 'warning' ? '#92400e' : '#1f2937'};
  background: ${({ $tone }) =>
    $tone === 'success' ? '#d1fae5' : $tone === 'warning' ? '#fef3c7' : '#e5e7eb'};
`;

const Notes = styled.ul`
  margin: 8px 0 0 16px;
  color: #4b5563;
  font-size: 13px;
`;

interface Props {
  validation?: DrawingValidationResult;
  aiResult?: AIAnalysisResult;
}

const TestResultsDisplay: React.FC<Props> = ({ validation, aiResult }) => {
  if (!validation && !aiResult) return null;

  return (
    <Panel>
      <Title>Test Results</Title>

      {validation && (
        <>
          <StatRow>
            <span>Completion</span>
            <Badge $tone={validation.completion >= 70 ? 'success' : 'warning'}>
              {validation.completion.toFixed(0)}%
            </Badge>
          </StatRow>
          <StatRow>
            <span>Accuracy</span>
            <Badge $tone={validation.accuracy >= 70 ? 'success' : 'warning'}>
              {validation.accuracy.toFixed(0)}%
            </Badge>
          </StatRow>
          {validation.notes.length > 0 && (
            <Notes>
              {validation.notes.map((note, idx) => (
                <li key={idx}>{note}</li>
              ))}
            </Notes>
          )}
        </>
      )}

      {aiResult && (
        <>
          <StatRow style={{ marginTop: 10 }}>
            <span>Overall Risk</span>
            <Badge
              $tone={
                aiResult.overallRisk === 'low'
                  ? 'success'
                  : aiResult.overallRisk === 'moderate'
                  ? 'info'
                  : 'warning'
              }
            >
              {aiResult.overallRisk} ({aiResult.probability}%)
            </Badge>
          </StatRow>
          <Notes style={{ marginTop: 6 }}>
            <li>Pressure: {aiResult.biomarkers.pressure.toFixed(0)}</li>
            <li>Spatial Accuracy: {aiResult.biomarkers.spatialAccuracy.toFixed(0)}</li>
            <li>Temporal Consistency: {aiResult.biomarkers.temporalConsistency.toFixed(0)}</li>
          </Notes>
        </>
      )}
    </Panel>
  );
};

export default TestResultsDisplay;


