// Enhanced AI Analysis Service
// Provides comprehensive AI analysis with detailed insights and recommendations

import { aiAnalysisService, HandwritingData, AIAnalysisResult } from './aiAnalysisService';

export interface EnhancedAIAnalysisResult extends AIAnalysisResult {
  detailedInsights: {
    handwritingQuality: {
      score: number;
      factors: string[];
      improvements: string[];
    };
    cognitivePerformance: {
      score: number;
      strengths: string[];
      areasForImprovement: string[];
    };
    motorControl: {
      score: number;
      stability: number;
      precision: number;
      consistency: number;
    };
    temporalPatterns: {
      score: number;
      rhythm: number;
      pacing: number;
      pauses: number;
    };
  };
  comparativeAnalysis: {
    percentile: number;
    ageGroupComparison: string;
    performanceLevel: 'excellent' | 'good' | 'average' | 'below_average' | 'concerning';
    trendAnalysis: 'improving' | 'stable' | 'declining';
  };
  clinicalInsights: {
    riskFactors: string[];
    protectiveFactors: string[];
    monitoringRecommendations: string[];
    followUpTimeline: string;
  };
  personalizedPlan: {
    immediateActions: string[];
    shortTermGoals: string[];
    longTermStrategy: string[];
    resources: string[];
  };
}

export interface TaskAnalysisContext {
  taskId: string;
  taskName: string;
  category: string;
  difficulty: string;
  userAge?: number;
  previousResults?: EnhancedAIAnalysisResult[];
}

class EnhancedAIAnalysisService {
  private readonly MODEL_VERSION = '3.0.0-LightGBM-Enhanced';
  private readonly CONFIDENCE_THRESHOLD = 0.85;

  /**
   * Perform comprehensive AI analysis with enhanced insights
   */
  async performEnhancedAnalysis(
    handwritingData: HandwritingData,
    context: TaskAnalysisContext
  ): Promise<EnhancedAIAnalysisResult> {
    try {
      // Get base AI analysis
      const baseAnalysis = await aiAnalysisService.analyzeHandwriting(handwritingData);
      
      // Generate comprehensive analysis
      const detailedInsights = this.generateDetailedInsights(handwritingData, baseAnalysis);
      const comparativeAnalysis = this.generateComparativeAnalysis(baseAnalysis, context);
      const clinicalInsights = this.generateClinicalInsights(baseAnalysis, context);
      const personalizedPlan = this.generatePersonalizedPlan(baseAnalysis, clinicalInsights, context);

      // Create enhanced result
      const enhancedResult: EnhancedAIAnalysisResult = {
        overallRisk: this.determineOverallRisk(baseAnalysis),
        probability: baseAnalysis.darwinPrediction || 0.5,
        testScores: {
          clockDrawing: 0.8, // Placeholder - would be calculated from actual test results
          wordRecall: 0.8,
          imageAssociation: 0.8,
          selectionMemory: 0.8
        },
        biomarkers: {
          pressure: baseAnalysis.pressure,
          spatialAccuracy: baseAnalysis.spatialAccuracy,
          temporalConsistency: baseAnalysis.temporalConsistency,
          cognitiveLoad: baseAnalysis.cognitiveLoad
        },
        recommendations: this.generateRecommendations(baseAnalysis),
        detailedInsights,
        comparativeAnalysis,
        clinicalInsights,
        personalizedPlan
      };

      return enhancedResult;
    } catch (error) {
      console.error('Enhanced AI analysis failed:', error);
      throw new Error('Failed to perform enhanced AI analysis');
    }
  }

  /**
   * Generate detailed insights about handwriting quality and cognitive performance
   */
  private generateDetailedInsights(
    handwritingData: HandwritingData,
    baseAnalysis: any
  ): EnhancedAIAnalysisResult['detailedInsights'] {
    const handwritingQuality = this.analyzeHandwritingQuality(handwritingData);
    const cognitivePerformance = this.analyzeCognitivePerformance(handwritingData, baseAnalysis);
    const motorControl = this.analyzeMotorControl(handwritingData);
    const temporalPatterns = this.analyzeTemporalPatterns(handwritingData);

    return {
      handwritingQuality,
      cognitivePerformance,
      motorControl,
      temporalPatterns
    };
  }

  /**
   * Analyze handwriting quality
   */
  private analyzeHandwritingQuality(handwritingData: HandwritingData): {
    score: number;
    factors: string[];
    improvements: string[];
  } {
    const { strokes } = handwritingData;
    let score = 50;
    const factors: string[] = [];
    const improvements: string[] = [];

    // Analyze stroke continuity
    const avgStrokeLength = strokes.reduce((sum, stroke) => sum + stroke.points.length, 0) / strokes.length;
    if (avgStrokeLength > 20) {
      score += 15;
      factors.push('Good stroke continuity');
    } else {
      improvements.push('Try to draw with longer, more continuous strokes');
    }

    // Analyze pressure consistency
    const pressures = strokes.flatMap(stroke => stroke.points.map(p => p.pressure));
    const pressureVariance = this.calculateVariance(pressures);
    if (pressureVariance < 0.1) {
      score += 10;
      factors.push('Consistent pressure control');
    } else {
      improvements.push('Work on maintaining consistent pressure while drawing');
    }

    // Analyze spatial organization
    const spatialScore = this.calculateSpatialOrganization(strokes, handwritingData.canvasSize);
    if (spatialScore > 70) {
      score += 15;
      factors.push('Good spatial organization');
    } else {
      improvements.push('Practice organizing elements spatially on the page');
    }

    return {
      score: Math.min(100, score),
      factors,
      improvements
    };
  }

  /**
   * Analyze cognitive performance
   */
  private analyzeCognitivePerformance(
    handwritingData: HandwritingData,
    baseAnalysis: any
  ): {
    score: number;
    strengths: string[];
    areasForImprovement: string[];
  } {
    let score = 50;
    const strengths: string[] = [];
    const areasForImprovement: string[] = [];

    // Analyze planning and execution
    if (handwritingData.strokes.length > 5) {
      score += 10;
      strengths.push('Good task planning and execution');
    } else {
      areasForImprovement.push('Try to break down complex tasks into smaller steps');
    }

    // Analyze attention to detail
    const detailScore = this.calculateAttentionToDetail(handwritingData);
    if (detailScore > 60) {
      score += 15;
      strengths.push('Good attention to detail');
    } else {
      areasForImprovement.push('Focus on completing all aspects of the task');
    }

    // Analyze working memory
    const memoryScore = this.calculateWorkingMemory(handwritingData);
    if (memoryScore > 60) {
      score += 10;
      strengths.push('Good working memory utilization');
    } else {
      areasForImprovement.push('Practice memory exercises and task chunking');
    }

    return {
      score: Math.min(100, score),
      strengths,
      areasForImprovement
    };
  }

  /**
   * Analyze motor control
   */
  private analyzeMotorControl(handwritingData: HandwritingData): {
    score: number;
    stability: number;
    precision: number;
    consistency: number;
  } {
    const { strokes } = handwritingData;
    
    // Calculate stability (smoothness of movement)
    const stability = this.calculateMovementStability(strokes);
    
    // Calculate precision (accuracy of placement)
    const precision = this.calculateMovementPrecision(strokes);
    
    // Calculate consistency (repeatability)
    const consistency = this.calculateMovementConsistency(strokes);
    
    // Overall motor control score
    const score = (stability + precision + consistency) / 3;

    return {
      score: Math.round(score),
      stability: Math.round(stability),
      precision: Math.round(precision),
      consistency: Math.round(consistency)
    };
  }

  /**
   * Analyze temporal patterns
   */
  private analyzeTemporalPatterns(handwritingData: HandwritingData): {
    score: number;
    rhythm: number;
    pacing: number;
    pauses: number;
  } {
    const { strokes, totalTime } = handwritingData;
    
    // Calculate rhythm (regularity of timing)
    const rhythm = this.calculateRhythm(strokes);
    
    // Calculate pacing (appropriate speed)
    const pacing = this.calculatePacing(strokes, totalTime);
    
    // Calculate pause patterns
    const pauses = this.calculatePausePatterns(strokes);
    
    // Overall temporal score
    const score = (rhythm + pacing + pauses) / 3;

    return {
      score: Math.round(score),
      rhythm: Math.round(rhythm),
      pacing: Math.round(pacing),
      pauses: Math.round(pauses)
    };
  }

  /**
   * Generate comparative analysis
   */
  private generateComparativeAnalysis(
    baseAnalysis: any,
    context: TaskAnalysisContext
  ): EnhancedAIAnalysisResult['comparativeAnalysis'] {
    // Calculate percentile based on performance
    const percentile = this.calculatePercentile(baseAnalysis);
    
    // Determine age group comparison
    const ageGroupComparison = this.getAgeGroupComparison(percentile, context.userAge);
    
    // Determine performance level
    const performanceLevel = this.determinePerformanceLevel(percentile);
    
    // Analyze trends (if previous results available)
    const trendAnalysis = this.analyzeTrends(context.previousResults);

    return {
      percentile,
      ageGroupComparison,
      performanceLevel,
      trendAnalysis
    };
  }

  /**
   * Generate clinical insights
   */
  private generateClinicalInsights(
    baseAnalysis: any,
    context: TaskAnalysisContext
  ): EnhancedAIAnalysisResult['clinicalInsights'] {
    const riskFactors: string[] = [];
    const protectiveFactors: string[] = [];
    const monitoringRecommendations: string[] = [];
    let followUpTimeline = '6 months';

    // Identify risk factors
    if (baseAnalysis.spatialAccuracy < 60) {
      riskFactors.push('Reduced spatial processing ability');
    }
    if (baseAnalysis.temporalConsistency < 60) {
      riskFactors.push('Inconsistent temporal processing');
    }
    if (baseAnalysis.cognitiveLoad > 70) {
      riskFactors.push('High cognitive load during tasks');
    }

    // Identify protective factors
    if (baseAnalysis.pressure > 70) {
      protectiveFactors.push('Good motor control and pressure regulation');
    }
    if (baseAnalysis.spatialAccuracy > 80) {
      protectiveFactors.push('Strong spatial processing abilities');
    }

    // Generate monitoring recommendations
    if (riskFactors.length > 0) {
      monitoringRecommendations.push('Regular cognitive assessments every 3 months');
      followUpTimeline = '3 months';
    }
    if (baseAnalysis.darwinRiskLevel === 'high') {
      monitoringRecommendations.push('Consider neurological consultation');
      followUpTimeline = '1 month';
    }

    return {
      riskFactors,
      protectiveFactors,
      monitoringRecommendations,
      followUpTimeline
    };
  }

  /**
   * Generate personalized plan
   */
  private generatePersonalizedPlan(
    baseAnalysis: any,
    clinicalInsights: EnhancedAIAnalysisResult['clinicalInsights'],
    context: TaskAnalysisContext
  ): EnhancedAIAnalysisResult['personalizedPlan'] {
    const immediateActions: string[] = [];
    const shortTermGoals: string[] = [];
    const longTermStrategy: string[] = [];
    const resources: string[] = [];

    // Immediate actions based on risk level
    if (baseAnalysis.darwinRiskLevel === 'high') {
      immediateActions.push('Schedule consultation with healthcare provider');
      immediateActions.push('Begin cognitive monitoring program');
    } else if (baseAnalysis.darwinRiskLevel === 'moderate') {
      immediateActions.push('Implement cognitive training exercises');
      immediateActions.push('Monitor cognitive changes over time');
    } else {
      immediateActions.push('Maintain current cognitive health practices');
      immediateActions.push('Continue regular assessments');
    }

    // Short-term goals (3-6 months)
    shortTermGoals.push('Complete cognitive training program');
    shortTermGoals.push('Establish regular exercise routine');
    shortTermGoals.push('Improve sleep quality and duration');

    // Long-term strategy (6+ months)
    longTermStrategy.push('Maintain active lifestyle with regular physical and mental exercise');
    longTermStrategy.push('Continue regular cognitive assessments');
    longTermStrategy.push('Build strong social support network');

    // Resources
    resources.push('Cognitive training apps and programs');
    resources.push('Physical exercise guidelines for brain health');
    resources.push('Nutrition recommendations for cognitive health');

    return {
      immediateActions,
      shortTermGoals,
      longTermStrategy,
      resources
    };
  }

  // Helper methods for calculations
  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private calculateSpatialOrganization(strokes: any[], canvasSize: { width: number; height: number }): number {
    // Simplified spatial organization calculation
    return 75; // Placeholder
  }

  private calculateAttentionToDetail(handwritingData: HandwritingData): number {
    // Simplified attention to detail calculation
    return 70; // Placeholder
  }

  private calculateWorkingMemory(handwritingData: HandwritingData): number {
    // Simplified working memory calculation
    return 65; // Placeholder
  }

  private calculateMovementStability(strokes: any[]): number {
    // Simplified movement stability calculation
    return 72; // Placeholder
  }

  private calculateMovementPrecision(strokes: any[]): number {
    // Simplified movement precision calculation
    return 68; // Placeholder
  }

  private calculateMovementConsistency(strokes: any[]): number {
    // Simplified movement consistency calculation
    return 74; // Placeholder
  }

  private calculateRhythm(strokes: any[]): number {
    // Simplified rhythm calculation
    return 70; // Placeholder
  }

  private calculatePacing(strokes: any[], totalTime: number): number {
    // Simplified pacing calculation
    return 75; // Placeholder
  }

  private calculatePausePatterns(strokes: any[]): number {
    // Simplified pause patterns calculation
    return 68; // Placeholder
  }

  private calculatePercentile(baseAnalysis: any): number {
    // Simplified percentile calculation
    return 65; // Placeholder
  }

  private getAgeGroupComparison(percentile: number, userAge?: number): string {
    if (percentile >= 80) return 'Above average for your age group';
    if (percentile >= 60) return 'Average for your age group';
    if (percentile >= 40) return 'Below average for your age group';
    return 'Significantly below average for your age group';
  }

  private determinePerformanceLevel(percentile: number): 'excellent' | 'good' | 'average' | 'below_average' | 'concerning' {
    if (percentile >= 90) return 'excellent';
    if (percentile >= 75) return 'good';
    if (percentile >= 50) return 'average';
    if (percentile >= 25) return 'below_average';
    return 'concerning';
  }

  private analyzeTrends(previousResults?: EnhancedAIAnalysisResult[]): 'improving' | 'stable' | 'declining' {
    if (!previousResults || previousResults.length < 2) return 'stable';
    
    // Simplified trend analysis
    const recentScore = previousResults[previousResults.length - 1].probability;
    const previousScore = previousResults[previousResults.length - 2].probability;
    
    if (recentScore > previousScore + 5) return 'improving';
    if (recentScore < previousScore - 5) return 'declining';
    return 'stable';
  }

  private determineOverallRisk(baseAnalysis: any): 'low' | 'moderate' | 'high' {
    return baseAnalysis.darwinRiskLevel || 'low';
  }

  private generateRecommendations(baseAnalysis: any): string[] {
    const recommendations: string[] = [];
    
    if (baseAnalysis.spatialAccuracy < 70) {
      recommendations.push('Practice spatial reasoning exercises');
    }
    
    if (baseAnalysis.temporalConsistency < 70) {
      recommendations.push('Engage in rhythm-based activities');
    }
    
    if (baseAnalysis.cognitiveLoad > 70) {
      recommendations.push('Consider stress management techniques');
    }
    
    recommendations.push('Maintain regular physical exercise');
    recommendations.push('Engage in mentally stimulating activities');
    
    return recommendations;
  }
}

export const enhancedAIAnalysisService = new EnhancedAIAnalysisService();
export default enhancedAIAnalysisService;
