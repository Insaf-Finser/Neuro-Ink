import { DiseaseType } from '../../context/DiseaseContext';
import { AnalysisService } from './AnalysisService';
import { AlzheimersAnalysisService } from './AlzheimersAnalysisService';
import { ParkinsonsAnalysisService } from './ParkinsonsAnalysisService';

/**
 * Factory for creating disease-specific analysis services
 */
export class AnalysisServiceFactory {
  private static alzheimersService: AnalysisService | null = null;
  private static parkinsonsService: AnalysisService | null = null;

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
        if (!this.parkinsonsService) {
          this.parkinsonsService = new ParkinsonsAnalysisService();
        }
        return this.parkinsonsService;
      default:
        // Default to Alzheimer's for backward compatibility
        if (!this.alzheimersService) {
          this.alzheimersService = new AlzheimersAnalysisService();
        }
        return this.alzheimersService;
    }
  }
}



