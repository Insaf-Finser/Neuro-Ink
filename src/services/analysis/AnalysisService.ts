import { HandwritingData, CognitiveTestResult, AIAnalysisResult } from '../aiAnalysisService';

/**
 * Interface for disease-specific analysis services
 */
export interface AnalysisService {
  /**
   * Extract engineered features from handwriting data
   */
  extractFeatures(data: HandwritingData): Record<string, number>;

  /**
   * Analyze handwriting data using disease-specific models
   */
  analyzeHandwriting(data: HandwritingData): {
    pressure: number;
    spatialAccuracy: number;
    temporalConsistency: number;
    cognitiveLoad: number;
    darwinPrediction?: number;
    darwinRiskLevel?: 'low' | 'moderate' | 'high';
    modelVersion?: string;
    clinicalValidation?: string;
  };

  /**
   * Analyze cognitive test results
   */
  analyzeCognitiveTests(testResults: CognitiveTestResult[]): {
    clockDrawing: number;
    wordRecall: number;
    imageAssociation: number;
    selectionMemory: number;
  };

  /**
   * Generate comprehensive AI analysis result
   */
  generateAnalysis(
    handwritingData: HandwritingData,
    testResults: CognitiveTestResult[]
  ): AIAnalysisResult;

  /**
   * Analyze session with handwriting data and cognitive tests
   */
  analyzeSession(data: HandwritingData, tests: CognitiveTestResult[]): AIAnalysisResult;

  /**
   * Validate handwriting data quality
   */
  validateHandwritingData(data: HandwritingData): { isValid: boolean; errors: string[] };
}


