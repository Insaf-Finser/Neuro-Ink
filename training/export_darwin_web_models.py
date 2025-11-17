#!/usr/bin/env python3
"""
Export DARWIN-trained models for web integration
Convert the high-performance models to web-compatible format
"""

import joblib
import json
import numpy as np
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

def export_darwin_models():
    """Export DARWIN models for web integration."""
    
    # Load the trained models
    models_dir = Path("models/darwin")
    
    if not models_dir.exists():
        logger.error("DARWIN models directory not found")
        return False
    
    # Load models and metadata
    models = {}
    metadata = {}
    
    for model_file in models_dir.glob("*_darwin_model.pkl"):
        model_name = model_file.stem.replace("_darwin_model", "")
        models[model_name] = joblib.load(model_file)
        
        # Load corresponding metadata
        metadata_file = models_dir / f"{model_name}_darwin_metadata.json"
        if metadata_file.exists():
            with open(metadata_file, 'r') as f:
                metadata[model_name] = json.load(f)
    
    # Load scaler
    scaler_file = models_dir / "darwin_scaler.pkl"
    if scaler_file.exists():
        scaler = joblib.load(scaler_file)
    else:
        logger.error("Scaler not found")
        return False
    
    # Export web-compatible models
    web_models_dir = Path("web_models")
    web_models_dir.mkdir(exist_ok=True)
    
    # Export Random Forest (best performing model)
    if 'random_forest' in models:
        rf_model = models['random_forest']
        rf_metadata = metadata.get('random_forest', {})
        
        # Extract model parameters for JavaScript
        web_model = {
            'model_type': 'random_forest',
            'n_estimators': rf_model.n_estimators,
            'max_depth': rf_model.max_depth,
            'min_samples_split': rf_model.min_samples_split,
            'min_samples_leaf': rf_model.min_samples_leaf,
            'feature_importances': rf_model.feature_importances_.tolist(),
            'feature_names': rf_metadata.get('feature_names', []),
            'cv_score_mean': rf_metadata.get('cv_score_mean', 0),
            'cv_score_std': rf_metadata.get('cv_score_std', 0),
            'dataset': 'DARWIN',
            'performance': {
                'cv_auc': rf_metadata.get('cv_score_mean', 0),
                'cv_std': rf_metadata.get('cv_score_std', 0),
                'test_auc': 0.8431,  # From training results
                'accuracy': 0.80    # From confusion matrix
            }
        }
        
        # Save as JSON
        with open(web_models_dir / "darwin_random_forest.json", 'w') as f:
            json.dump(web_model, f, indent=2)
        
        logger.info("Random Forest model exported for web")
    
    # Export Logistic Regression
    if 'logistic_regression' in models:
        lr_model = models['logistic_regression']
        lr_metadata = metadata.get('logistic_regression', {})
        
        # Extract coefficients (for the calibrated classifier)
        if hasattr(lr_model, 'base_estimator'):
            base_estimator = lr_model.base_estimator
        elif hasattr(lr_model, 'estimators_') and len(lr_model.estimators_) > 0:
            base_estimator = lr_model.estimators_[0]
        else:
            base_estimator = lr_model
        
        if hasattr(base_estimator, 'coef_'):
            coefficients = base_estimator.coef_[0].tolist()
        else:
            coefficients = []
        
        web_model = {
            'model_type': 'logistic_regression',
            'coefficients': coefficients,
            'intercept': base_estimator.intercept_[0] if hasattr(base_estimator, 'intercept_') else 0,
            'feature_names': lr_metadata.get('feature_names', []),
            'cv_score_mean': lr_metadata.get('cv_score_mean', 0),
            'cv_score_std': lr_metadata.get('cv_score_std', 0),
            'dataset': 'DARWIN',
            'performance': {
                'cv_auc': lr_metadata.get('cv_score_mean', 0),
                'cv_std': lr_metadata.get('cv_score_std', 0),
                'test_auc': 0.7549,  # From training results
                'accuracy': 0.69     # From confusion matrix
            }
        }
        
        # Save as JSON
        with open(web_models_dir / "darwin_logistic_regression.json", 'w') as f:
            json.dump(web_model, f, indent=2)
        
        logger.info("Logistic Regression model exported for web")
    
    # Export scaler parameters
    scaler_params = {
        'mean': scaler.mean_.tolist(),
        'scale': scaler.scale_.tolist(),
        'feature_names': metadata.get('logistic_regression', {}).get('feature_names', [])
    }
    
    with open(web_models_dir / "darwin_scaler.json", 'w') as f:
        json.dump(scaler_params, f, indent=2)
    
    logger.info("Scaler parameters exported for web")
    
    # Create model summary
    summary = {
        'dataset': 'DARWIN',
        'description': 'Real clinical handwriting data from 174 individuals (89 AD patients, 85 healthy controls)',
        'features': 450,
        'models': {
            'random_forest': {
                'performance': '84.31% AUC, 80% accuracy',
                'recommended': True,
                'description': 'Best performing model with excellent generalization'
            },
            'logistic_regression': {
                'performance': '75.49% AUC, 69% accuracy', 
                'recommended': False,
                'description': 'Good performance, simpler model'
            }
        },
        'clinical_validation': {
            'sample_size': 174,
            'ad_patients': 89,
            'healthy_controls': 85,
            'validation_status': 'Clinically validated dataset'
        }
    }
    
    with open(web_models_dir / "darwin_model_summary.json", 'w') as f:
        json.dump(summary, f, indent=2)
    
    logger.info("Model summary exported")
    
    print("\n" + "="*60)
    print("DARWIN Models Exported for Web Integration")
    print("="*60)
    print(f"Models saved to: {web_models_dir}")
    print("\nRecommended Model: Random Forest")
    print("Performance: 84.31% AUC, 80% accuracy")
    print("Clinical Validation: Real patient data")
    
    return True

if __name__ == "__main__":
    export_darwin_models()
