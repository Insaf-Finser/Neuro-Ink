import { AnalysisService } from './AnalysisService';
import { HandwritingData, CognitiveTestResult, AIAnalysisResult } from '../aiAnalysisService';
import { aiAnalysisService } from '../aiAnalysisService';

/**
 * Alzheimer's-specific analysis service
 * Wraps the existing aiAnalysisService to maintain identical behavior
 */
export class AlzheimersAnalysisService implements AnalysisService {
  extractFeatures(data: HandwritingData): Record<string, number> {
    return aiAnalysisService.extractFeatures(data);
  }

  analyzeHandwriting(data: HandwritingData) {
    return aiAnalysisService.analyzeHandwriting(data);
  }

  analyzeCognitiveTests(testResults: CognitiveTestResult[]) {
    return aiAnalysisService.analyzeCognitiveTests(testResults);
  }

  generateAnalysis(
    handwritingData: HandwritingData,
    testResults: CognitiveTestResult[]
  ): AIAnalysisResult {
    return aiAnalysisService.generateAnalysis(handwritingData, testResults);
  }

  analyzeSession(data: HandwritingData, tests: CognitiveTestResult[]): AIAnalysisResult {
    return aiAnalysisService.analyzeSession(data, tests);
  }

  validateHandwritingData(data: HandwritingData) {
    return aiAnalysisService.validateHandwritingData(data);
  }
}

