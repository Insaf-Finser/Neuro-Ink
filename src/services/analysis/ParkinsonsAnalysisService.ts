import { AnalysisService } from './AnalysisService';
import { HandwritingData, CognitiveTestResult, AIAnalysisResult } from '../aiAnalysisService';

/**
 * Parkinson's-specific analysis service (placeholder model).
 * Provides stub implementations for the assessment flow; replace with
 * real motor/kinematic model when available.
 */
export class ParkinsonsAnalysisService implements AnalysisService {
  private readonly MODEL_VERSION = '0.1.0-placeholder';

  extractFeatures(data: HandwritingData): Record<string, number> {
    if (!data.strokes.length) return {};
    const strokeCount = data.strokes.length;
    const totalPoints = data.strokes.reduce((acc, s) => acc + (s.points?.length ?? 0), 0);
    const totalTime = Math.max(1, data.totalTime);
    return {
      strokeCount,
      totalPoints,
      totalTimeMs: totalTime,
      avgPointsPerStroke: totalPoints / Math.max(1, strokeCount),
      durationSeconds: totalTime / 1000,
    };
  }

  analyzeHandwriting(data: HandwritingData) {
    const features = this.extractFeatures(data);
    return {
      pressure: 0.5,
      spatialAccuracy: 0.5,
      temporalConsistency: 0.5,
      cognitiveLoad: 0.5,
      modelVersion: this.MODEL_VERSION,
      clinicalValidation: 'Research prototype – not for clinical use',
    };
  }

  analyzeCognitiveTests(_testResults: CognitiveTestResult[]) {
    return {
      clockDrawing: 0,
      wordRecall: 0,
      imageAssociation: 0,
      selectionMemory: 0,
    };
  }

  generateAnalysis(
    handwritingData: HandwritingData,
    _testResults: CognitiveTestResult[]
  ): AIAnalysisResult {
    const biomarkers = this.analyzeHandwriting(handwritingData);
    return {
      overallRisk: 'low',
      probability: 0,
      testScores: this.analyzeCognitiveTests([]),
      biomarkers: {
        pressure: biomarkers.pressure,
        spatialAccuracy: biomarkers.spatialAccuracy,
        temporalConsistency: biomarkers.temporalConsistency,
        cognitiveLoad: biomarkers.cognitiveLoad,
      },
      recommendations: [
        'This is a research prototype. No clinical diagnosis is provided.',
        'Consult a healthcare professional for formal assessment.',
      ],
    };
  }

  analyzeSession(data: HandwritingData, tests: CognitiveTestResult[]): AIAnalysisResult {
    return this.generateAnalysis(data, tests);
  }

  validateHandwritingData(data: HandwritingData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!data.strokes?.length) errors.push('No strokes recorded');
    if (!data.canvasSize?.width || !data.canvasSize?.height) errors.push('Invalid canvas size');
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
