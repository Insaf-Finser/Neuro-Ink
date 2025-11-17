#!/usr/bin/env python3
"""
Alzheimer's Handwriting Analysis - Model Evaluation
Evaluates trained models and generates performance metrics.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    classification_report, confusion_matrix, roc_auc_score, 
    roc_curve, precision_recall_curve, average_precision_score,
    calibration_curve
)
import joblib
import json
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class ModelEvaluator:
    def __init__(self, models_dir: str):
        self.models_dir = Path(models_dir)
        self.models = {}
        self.metadata = {}
        self.scaler = None
        
    def load_models(self):
        """Load all trained models and metadata."""
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
    
    def evaluate_model(self, model_name: str, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, Any]:
        """Evaluate a single model."""
        if model_name not in self.models:
            raise ValueError(f"Model {model_name} not found")
        
        model = self.models[model_name]
        
        # Prepare features
        if model_name == 'logistic_regression' and self.scaler is not None:
            X_test_scaled = self.scaler.transform(X_test)
        else:
            X_test_scaled = X_test
        
        # Predictions
        y_pred = model.predict(X_test_scaled)
        y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
        
        # Metrics
        auc_score = roc_auc_score(y_test, y_pred_proba)
        ap_score = average_precision_score(y_test, y_pred_proba)
        
        # Classification report
        class_report = classification_report(y_test, y_pred, output_dict=True)
        
        # Confusion matrix
        cm = confusion_matrix(y_test, y_pred)
        
        # ROC curve
        fpr, tpr, roc_thresholds = roc_curve(y_test, y_pred_proba)
        
        # Precision-Recall curve
        precision, recall, pr_thresholds = precision_recall_curve(y_test, y_pred_proba)
        
        # Calibration curve
        fraction_of_positives, mean_predicted_value = calibration_curve(
            y_test, y_pred_proba, n_bins=10
        )
        
        return {
            'model_name': model_name,
            'auc_score': auc_score,
            'ap_score': ap_score,
            'classification_report': class_report,
            'confusion_matrix': cm,
            'roc_curve': (fpr, tpr, roc_thresholds),
            'pr_curve': (precision, recall, pr_thresholds),
            'calibration_curve': (fraction_of_positives, mean_predicted_value),
            'predictions': y_pred,
            'probabilities': y_pred_proba
        }
    
    def evaluate_all_models(self, X_test: np.ndarray, y_test: np.ndarray) -> Dict[str, Dict[str, Any]]:
        """Evaluate all loaded models."""
        results = {}
        
        for model_name in self.models.keys():
            logger.info(f"Evaluating {model_name}...")
            results[model_name] = self.evaluate_model(model_name, X_test, y_test)
        
        return results
    
    def plot_roc_curves(self, results: Dict[str, Dict[str, Any]], output_dir: str):
        """Plot ROC curves for all models."""
        plt.figure(figsize=(10, 8))
        
        for model_name, result in results.items():
            fpr, tpr, _ = result['roc_curve']
            auc_score = result['auc_score']
            plt.plot(fpr, tpr, label=f'{model_name} (AUC = {auc_score:.3f})')
        
        plt.plot([0, 1], [0, 1], 'k--', label='Random')
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title('ROC Curves Comparison')
        plt.legend()
        plt.grid(True)
        
        output_path = Path(output_dir) / 'roc_curves.png'
        output_path.parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        logger.info(f"ROC curves saved to {output_path}")
    
    def plot_precision_recall_curves(self, results: Dict[str, Dict[str, Any]], output_dir: str):
        """Plot Precision-Recall curves for all models."""
        plt.figure(figsize=(10, 8))
        
        for model_name, result in results.items():
            precision, recall, _ = result['pr_curve']
            ap_score = result['ap_score']
            plt.plot(recall, precision, label=f'{model_name} (AP = {ap_score:.3f})')
        
        plt.xlabel('Recall')
        plt.ylabel('Precision')
        plt.title('Precision-Recall Curves Comparison')
        plt.legend()
        plt.grid(True)
        
        output_path = Path(output_dir) / 'precision_recall_curves.png'
        output_path.parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        logger.info(f"Precision-Recall curves saved to {output_path}")
    
    def plot_calibration_curves(self, results: Dict[str, Dict[str, Any]], output_dir: str):
        """Plot calibration curves for all models."""
        plt.figure(figsize=(10, 8))
        
        for model_name, result in results.items():
            fraction_of_positives, mean_predicted_value = result['calibration_curve']
            plt.plot(mean_predicted_value, fraction_of_positives, 
                    marker='o', label=f'{model_name}')
        
        plt.plot([0, 1], [0, 1], 'k--', label='Perfectly Calibrated')
        plt.xlabel('Mean Predicted Probability')
        plt.ylabel('Fraction of Positives')
        plt.title('Calibration Curves')
        plt.legend()
        plt.grid(True)
        
        output_path = Path(output_dir) / 'calibration_curves.png'
        output_path.parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        logger.info(f"Calibration curves saved to {output_path}")
    
    def plot_feature_importance(self, results: Dict[str, Dict[str, Any]], output_dir: str):
        """Plot feature importance for tree-based models."""
        tree_models = ['xgboost', 'lightgbm']
        
        for model_name in tree_models:
            if model_name in results and model_name in self.metadata:
                feature_importance = self.metadata[model_name].get('feature_importance')
                feature_names = self.metadata[model_name].get('feature_names', [])
                
                if feature_importance is not None:
                    # Sort features by importance
                    indices = np.argsort(feature_importance)[::-1][:20]  # Top 20 features
                    
                    plt.figure(figsize=(12, 8))
                    plt.bar(range(len(indices)), [feature_importance[i] for i in indices])
                    plt.xlabel('Features')
                    plt.ylabel('Importance')
                    plt.title(f'Feature Importance - {model_name.title()}')
                    plt.xticks(range(len(indices)), 
                              [feature_names[i] for i in indices], rotation=45, ha='right')
                    plt.tight_layout()
                    
                    output_path = Path(output_dir) / f'feature_importance_{model_name}.png'
                    output_path.parent.mkdir(parents=True, exist_ok=True)
                    plt.savefig(output_path, dpi=300, bbox_inches='tight')
                    plt.close()
                    
                    logger.info(f"Feature importance plot saved to {output_path}")
    
    def generate_report(self, results: Dict[str, Dict[str, Any]], output_dir: str):
        """Generate comprehensive evaluation report."""
        report_path = Path(output_dir) / 'evaluation_report.txt'
        report_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(report_path, 'w') as f:
            f.write("Model Evaluation Report\n")
            f.write("=" * 50 + "\n\n")
            
            # Summary table
            f.write("Performance Summary:\n")
            f.write("-" * 30 + "\n")
            f.write(f"{'Model':<20} {'AUC':<8} {'AP':<8}\n")
            f.write("-" * 30 + "\n")
            
            for model_name, result in results.items():
                f.write(f"{model_name:<20} {result['auc_score']:<8.3f} {result['ap_score']:<8.3f}\n")
            
            f.write("\n")
            
            # Detailed results for each model
            for model_name, result in results.items():
                f.write(f"\n{model_name.upper()} DETAILED RESULTS:\n")
                f.write("-" * 40 + "\n")
                
                # Classification report
                class_report = result['classification_report']
                f.write("Classification Report:\n")
                f.write(f"Precision: {class_report['1']['precision']:.3f}\n")
                f.write(f"Recall: {class_report['1']['recall']:.3f}\n")
                f.write(f"F1-Score: {class_report['1']['f1-score']:.3f}\n")
                f.write(f"Support: {class_report['1']['support']}\n")
                
                # Confusion matrix
                cm = result['confusion_matrix']
                f.write(f"\nConfusion Matrix:\n")
                f.write(f"TN: {cm[0,0]}, FP: {cm[0,1]}\n")
                f.write(f"FN: {cm[1,0]}, TP: {cm[1,1]}\n")
        
        logger.info(f"Evaluation report saved to {report_path}")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Evaluate trained models')
    parser.add_argument('--models_dir', default='models/', help='Directory containing trained models')
    parser.add_argument('--test_data', default='data/processed/test_data.csv', help='Test dataset')
    parser.add_argument('--output_dir', default='results/', help='Output directory for results')
    
    args = parser.parse_args()
    
    # Load evaluator
    evaluator = ModelEvaluator(args.models_dir)
    evaluator.load_models()
    
    # Load test data
    df_test = pd.read_csv(args.test_data)
    X_test = df_test.drop('risk_level', axis=1).values
    y_test = df_test['risk_level'].values
    
    logger.info(f"Loaded test data: {X_test.shape[0]} samples")
    
    # Evaluate models
    results = evaluator.evaluate_all_models(X_test, y_test)
    
    # Generate plots and report
    evaluator.plot_roc_curves(results, args.output_dir)
    evaluator.plot_precision_recall_curves(results, args.output_dir)
    evaluator.plot_calibration_curves(results, args.output_dir)
    evaluator.plot_feature_importance(results, args.output_dir)
    evaluator.generate_report(results, args.output_dir)
    
    logger.info("Evaluation completed!")

if __name__ == "__main__":
    main()
