import { DiseaseType } from '../../context/DiseaseContext';
import { AnalysisService } from './AnalysisService';
import { AlzheimersAnalysisService } from './AlzheimersAnalysisService';

/**
 * Factory for creating disease-specific analysis services
 */
export class AnalysisServiceFactory {
  private static alzheimersService: AnalysisService | null = null;

  /**
   * Get the analysis service for a specific disease
   * @param disease - The disease type
   * @returns The appropriate analysis service
   */
  static getService(disease: DiseaseType): AnalysisService {
    switch (disease) {
      case 'alzheimers':
        if (!this.alzheimersService) {
          this.alzheimersService = new AlzheimersAnalysisService();
        }
        return this.alzheimersService;
      case 'parkinsons':
        // Parkinson's service not implemented yet
        throw new Error('Parkinson\'s analysis service is not implemented');
      default:
        // Default to Alzheimer's for backward compatibility
        if (!this.alzheimersService) {
          this.alzheimersService = new AlzheimersAnalysisService();
        }
        return this.alzheimersService;
    }
  }
}

