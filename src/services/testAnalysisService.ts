import { HandwritingData, CognitiveTestResult, AIAnalysisResult } from './aiAnalysisService';
import { AnalysisServiceFactory } from './analysis/AnalysisServiceFactory';
import { StylusPoint } from './stylusInputService';

export interface TestAnalysisResponse {
  aiResult: AIAnalysisResult;
  features: Record<string, number>;
}

export function buildHandwritingData(
  strokes: StylusPoint[][],
  canvasSize: { width: number; height: number },
  totalTimeMs: number
): HandwritingData {
  // Estimate stroke start/end times from point timestamps
  const processedStrokes = strokes.map(stroke => {
    if (!stroke.length) {
      return {
        points: [],
        startTime: 0,
        endTime: 0
      };
    }
    const startTime = stroke[0].timestamp;
    const endTime = stroke[stroke.length - 1].timestamp;
    return {
      points: stroke,
      startTime,
      endTime
    };
  });

  return {
    strokes: processedStrokes,
    totalTime: Math.max(totalTimeMs, 0),
    canvasSize
  };
}

export function analyzeTest(
  testName: string,
  strokes: StylusPoint[][],
  canvasSize: { width: number; height: number },
  totalTimeMs: number,
  cognitiveScore?: number,
  disease: 'alzheimers' | 'parkinsons' = 'alzheimers'
): TestAnalysisResponse {
  const handwritingData = buildHandwritingData(strokes, canvasSize, totalTimeMs);
  // Use disease-aware analysis service (defaults to 'alzheimers')
  const analysisService = AnalysisServiceFactory.getService(disease);
  const features = analysisService.extractFeatures(handwritingData);

  const tests: CognitiveTestResult[] = [];
  if (cognitiveScore !== undefined) {
    tests.push({
      testName,
      score: cognitiveScore,
      accuracy: cognitiveScore,
      responseTime: totalTimeMs,
      errors: 0
    });
  }

  const aiResult = analysisService.analyzeSession(handwritingData, tests);

  return {
    aiResult,
    features
  };
}








