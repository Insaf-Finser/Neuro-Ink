#!/usr/bin/env python3
"""
Alzheimer's Handwriting Analysis - Model Export
Exports trained models for deployment in the web interface.
"""

import json
import joblib
import numpy as np
from pathlib import Path
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class ModelExporter:
    def __init__(self, models_dir: str):
        self.models_dir = Path(models_dir)
        self.models = {}
        self.metadata = {}
        self.scaler = None
        
    def load_models(self):
        """Load trained models and metadata."""
        # Load scaler
        scaler_path = self.models_dir / "scaler.pkl"
        if scaler_path.exists():
            self.scaler = joblib.load(scaler_path)
        
        # Load models and metadata
        for model_file in self.models_dir.glob("*_model.pkl"):
            model_name = model_file.stem.replace("_model", "")
            
            # Load model
            self.models[model_name] = joblib.load(model_file)
            
            # Load metadata
            metadata_file = self.models_dir / f"{model_name}_metadata.json"
            if metadata_file.exists():
                with open(metadata_file, 'r') as f:
                    self.metadata[model_name] = json.load(f)
        
        logger.info(f"Loaded {len(self.models)} models")
    
    def select_best_model(self) -> str:
        """Select the best performing model based on CV score."""
        best_model = None
        best_score = -np.inf
        
        for model_name, metadata in self.metadata.items():
            cv_score = metadata.get('cv_score_mean', 0)
            if cv_score > best_score:
                best_score = cv_score
                best_model = model_name
        
        logger.info(f"Selected best model: {best_model} (CV AUC: {best_score:.4f})")
        return best_model
    
    def create_deployment_package(self, model_name: str, output_dir: str) -> Dict[str, Any]:
        """Create a deployment package for the web interface."""
        if model_name not in self.models:
            raise ValueError(f"Model {model_name} not found")
        
        model = self.models[model_name]
        metadata = self.metadata.get(model_name, {})
        
        # Create deployment package
        package = {
            'model_version': '1.0.0',
            'model_name': model_name,
            'model_type': 'sklearn' if hasattr(model, 'predict_proba') else 'other',
            'feature_names': metadata.get('feature_names', []),
            'feature_importance': metadata.get('feature_importance', []),
            'performance_metrics': {
                'cv_auc_mean': metadata.get('cv_score_mean', 0),
                'cv_auc_std': metadata.get('cv_score_std', 0),
                'best_params': metadata.get('best_params', {})
            },
            'risk_thresholds': {
                'low': 0.3,
                'moderate': 0.6,
                'high': 0.8
            },
            'created_at': metadata.get('created_at', 'unknown'),
            'description': f"Trained {model_name} model for cognitive risk assessment"
        }
        
        return package
    
    def export_model_for_web(self, model_name: str, output_dir: str):
        """Export model in a format suitable for web deployment."""
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        model = self.models[model_name]
        metadata = self.metadata.get(model_name, {})
        
        # Export model as JSON (simplified for web)
        if hasattr(model, 'coef_') and hasattr(model, 'intercept_'):
            # Logistic regression
            web_model = {
                'type': 'logistic_regression',
                'coefficients': model.coef_.tolist(),
                'intercept': model.intercept_.tolist(),
                'feature_names': metadata.get('feature_names', [])
            }
        elif hasattr(model, 'feature_importances_'):
            # Tree-based model (simplified)
            web_model = {
                'type': 'tree_based',
                'feature_importances': model.feature_importances_.tolist(),
                'feature_names': metadata.get('feature_names', []),
                'note': 'Full model requires server-side inference'
            }
        else:
            # Generic model
            web_model = {
                'type': 'generic',
                'note': 'Model requires server-side inference'
            }
        
        # Save web-compatible model
        web_model_path = output_path / 'web_model.json'
        with open(web_model_path, 'w') as f:
            json.dump(web_model, f, indent=2)
        
        # Save deployment package
        package = self.create_deployment_package(model_name, output_dir)
        package_path = output_path / 'deployment_package.json'
        with open(package_path, 'w') as f:
            json.dump(package, f, indent=2)
        
        # Save scaler if available
        if self.scaler is not None:
            scaler_data = {
                'mean': self.scaler.mean_.tolist(),
                'scale': self.scaler.scale_.tolist(),
                'feature_names': metadata.get('feature_names', [])
            }
            scaler_path = output_path / 'scaler.json'
            with open(scaler_path, 'w') as f:
                json.dump(scaler_data, f, indent=2)
        
        logger.info(f"Web deployment package saved to {output_path}")
        return package
    
    def create_model_loader_script(self, output_dir: str):
        """Create a JavaScript model loader for the web interface."""
        js_script = """
// Model loader for web interface
class ModelLoader {
    constructor() {
        this.model = null;
        this.scaler = null;
        this.featureNames = [];
    }
    
    async loadModel(modelPath = '/models/web_model.json') {
        try {
            const response = await fetch(modelPath);
            this.model = await response.json();
            console.log('Model loaded:', this.model.type);
            return true;
        } catch (error) {
            console.error('Failed to load model:', error);
            return false;
        }
    }
    
    async loadScaler(scalerPath = '/models/scaler.json') {
        try {
            const response = await fetch(scalerPath);
            this.scaler = await response.json();
            this.featureNames = this.scaler.feature_names;
            console.log('Scaler loaded');
            return true;
        } catch (error) {
            console.error('Failed to load scaler:', error);
            return false;
        }
    }
    
    predict(features) {
        if (!this.model) {
            throw new Error('Model not loaded');
        }
        
        if (this.model.type === 'logistic_regression') {
            return this.predictLogisticRegression(features);
        } else {
            // For tree-based models, use feature importance as proxy
            return this.predictWithFeatureImportance(features);
        }
    }
    
    predictLogisticRegression(features) {
        const coefficients = this.model.coefficients[0];
        const intercept = this.model.intercept[0];
        
        // Scale features if scaler is available
        let scaledFeatures = features;
        if (this.scaler) {
            scaledFeatures = features.map((val, idx) => 
                (val - this.scaler.mean[idx]) / this.scaler.scale[idx]
            );
        }
        
        // Compute linear combination
        let score = intercept;
        for (let i = 0; i < scaledFeatures.length; i++) {
            score += coefficients[i] * scaledFeatures[i];
        }
        
        // Convert to probability using sigmoid
        const probability = 1 / (1 + Math.exp(-score));
        return probability;
    }
    
    predictWithFeatureImportance(features) {
        // Simple heuristic based on feature importance
        const importances = this.model.feature_importances;
        let weightedSum = 0;
        let totalImportance = 0;
        
        for (let i = 0; i < features.length; i++) {
            weightedSum += features[i] * importances[i];
            totalImportance += importances[i];
        }
        
        // Normalize and convert to probability
        const normalizedScore = weightedSum / totalImportance;
        const probability = Math.max(0, Math.min(1, (normalizedScore + 1) / 2));
        return probability;
    }
    
    getRiskLevel(probability) {
        if (probability < 0.3) return 'low';
        if (probability < 0.6) return 'moderate';
        return 'high';
    }
}

// Export for use in web interface
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModelLoader;
} else if (typeof window !== 'undefined') {
    window.ModelLoader = ModelLoader;
}
"""
        
        script_path = Path(output_dir) / 'model_loader.js'
        with open(script_path, 'w') as f:
            f.write(js_script)
        
        logger.info(f"Model loader script saved to {script_path}")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Export models for web deployment')
    parser.add_argument('--models_dir', default='models/', help='Directory containing trained models')
    parser.add_argument('--output_dir', default='web_models/', help='Output directory for web deployment')
    parser.add_argument('--model_name', help='Specific model to export (if not specified, best model is selected)')
    
    args = parser.parse_args()
    
    # Load exporter
    exporter = ModelExporter(args.models_dir)
    exporter.load_models()
    
    # Select model
    if args.model_name:
        model_name = args.model_name
    else:
        model_name = exporter.select_best_model()
    
    if not model_name:
        logger.error("No model found to export")
        return
    
    # Export model
    package = exporter.export_model_for_web(model_name, args.output_dir)
    
    # Create model loader script
    exporter.create_model_loader_script(args.output_dir)
    
    logger.info("Model export completed!")
    logger.info(f"Exported model: {model_name}")
    logger.info(f"Output directory: {args.output_dir}")

if __name__ == "__main__":
    main()
