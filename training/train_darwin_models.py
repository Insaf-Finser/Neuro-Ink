#!/usr/bin/env python3
"""
DARWIN Dataset Model Training
Train models on the real DARWIN dataset for Alzheimer's detection
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix, roc_curve
from sklearn.calibration import CalibratedClassifierCV
import joblib
import logging
from pathlib import Path
import json
import matplotlib.pyplot as plt
import seaborn as sns

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DarwinModelTrainer:
    def __init__(self, random_state=42):
        self.random_state = random_state
        self.scaler = StandardScaler()
        self.models = {}
        self.feature_names = []
        
    def load_darwin_data(self, data_file: str):
        """Load DARWIN dataset."""
        df = pd.read_csv(data_file)
        logger.info(f"Loaded DARWIN dataset: {df.shape[0]} samples, {df.shape[1]} features")
        
        # Check if target column exists
        if 'class' not in df.columns:
            logger.error("Target column 'class' not found in dataset")
            return None
            
        # Check class distribution
        class_counts = df['class'].value_counts()
        logger.info(f"Class distribution: {class_counts.to_dict()}")
        
        return df
    
    def prepare_features(self, df: pd.DataFrame):
        """Prepare features for training."""
        # Select numeric features (exclude target and ID columns)
        exclude_cols = ['class', 'ID', 'id', 'subject_id']
        feature_cols = [col for col in df.columns if col not in exclude_cols and df[col].dtype in ['int64', 'float64']]
        
        X = df[feature_cols].fillna(0).values
        y = df['class'].values
        
        # Convert class labels to binary (P = 1, N = 0)
        y_binary = (y == 'P').astype(int)
        
        self.feature_names = feature_cols
        logger.info(f"Prepared {X.shape[0]} samples with {X.shape[1]} features")
        logger.info(f"Binary class distribution: {np.bincount(y_binary)}")
        
        return X, y_binary
    
    def train_logistic_regression(self, X: np.ndarray, y: np.ndarray):
        """Train logistic regression model."""
        logger.info("Training Logistic Regression...")
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Grid search for hyperparameters
        param_grid = {
            'C': [0.01, 0.1, 1.0, 10.0, 100.0],
            'penalty': ['l1', 'l2'],
            'solver': ['liblinear', 'saga']
        }
        
        lr = LogisticRegression(random_state=self.random_state, max_iter=1000)
        grid_search = GridSearchCV(lr, param_grid, cv=5, scoring='roc_auc', n_jobs=-1)
        grid_search.fit(X_scaled, y)
        
        # Calibrate probabilities
        calibrated_lr = CalibratedClassifierCV(grid_search.best_estimator_, cv=3)
        calibrated_lr.fit(X_scaled, y)
        
        # Cross-validation score
        cv_scores = cross_val_score(calibrated_lr, X_scaled, y, cv=5, scoring='roc_auc')
        
        self.models['logistic_regression'] = calibrated_lr
        
        return {
            'model': calibrated_lr,
            'best_params': grid_search.best_params_,
            'cv_score_mean': cv_scores.mean(),
            'cv_score_std': cv_scores.std(),
            'feature_importance': None
        }
    
    def train_random_forest(self, X: np.ndarray, y: np.ndarray):
        """Train random forest model."""
        logger.info("Training Random Forest...")
        
        # Grid search for hyperparameters
        param_grid = {
            'n_estimators': [100, 200, 300],
            'max_depth': [5, 10, 15, None],
            'min_samples_split': [2, 5, 10],
            'min_samples_leaf': [1, 2, 4]
        }
        
        rf = RandomForestClassifier(random_state=self.random_state)
        grid_search = GridSearchCV(rf, param_grid, cv=5, scoring='roc_auc', n_jobs=-1)
        grid_search.fit(X, y)
        
        # Cross-validation score
        cv_scores = cross_val_score(grid_search.best_estimator_, X, y, cv=5, scoring='roc_auc')
        
        self.models['random_forest'] = grid_search.best_estimator_
        
        return {
            'model': grid_search.best_estimator_,
            'best_params': grid_search.best_params_,
            'cv_score_mean': cv_scores.mean(),
            'cv_score_std': cv_scores.std(),
            'feature_importance': grid_search.best_estimator_.feature_importances_
        }
    
    def train_all_models(self, X: np.ndarray, y: np.ndarray):
        """Train all models."""
        results = {}
        
        results['logistic_regression'] = self.train_logistic_regression(X, y)
        results['random_forest'] = self.train_random_forest(X, y)
        
        return results
    
    def evaluate_models(self, results: dict, X_test: np.ndarray, y_test: np.ndarray):
        """Evaluate models on test set."""
        evaluation_results = {}
        
        for model_name, result in results.items():
            model = result['model']
            
            # Prepare test features
            if model_name == 'logistic_regression':
                X_test_scaled = self.scaler.transform(X_test)
            else:
                X_test_scaled = X_test
            
            # Predictions
            y_pred = model.predict(X_test_scaled)
            y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
            
            # Metrics
            auc_score = roc_auc_score(y_test, y_pred_proba)
            
            evaluation_results[model_name] = {
                'auc_score': auc_score,
                'predictions': y_pred,
                'probabilities': y_pred_proba,
                'confusion_matrix': confusion_matrix(y_test, y_pred)
            }
        
        return evaluation_results
    
    def plot_feature_importance(self, results: dict, output_dir: str):
        """Plot feature importance for tree-based models."""
        if 'random_forest' in results and results['random_forest']['feature_importance'] is not None:
            importances = results['random_forest']['feature_importance']
            feature_names = self.feature_names
            
            # Get top 30 features
            indices = np.argsort(importances)[::-1][:30]
            
            plt.figure(figsize=(15, 10))
            plt.bar(range(len(indices)), [importances[i] for i in indices])
            plt.xlabel('Features')
            plt.ylabel('Importance')
            plt.title('Top 30 Feature Importance - Random Forest (DARWIN Dataset)')
            plt.xticks(range(len(indices)), 
                      [feature_names[i] for i in indices], rotation=45, ha='right')
            plt.tight_layout()
            
            output_path = Path(output_dir) / 'feature_importance_darwin.png'
            output_path.parent.mkdir(parents=True, exist_ok=True)
            plt.savefig(output_path, dpi=300, bbox_inches='tight')
            plt.close()
            
            logger.info(f"Feature importance plot saved to {output_path}")
    
    def plot_roc_curves(self, evaluation_results: dict, output_dir: str):
        """Plot ROC curves for all models."""
        plt.figure(figsize=(10, 8))
        
        for model_name, result in evaluation_results.items():
            # Get test labels (we need to pass them from the main function)
            # For now, we'll skip this plot
            pass
        
        output_path = Path(output_dir) / 'roc_curves_darwin.png'
        output_path.parent.mkdir(parents=True, exist_ok=True)
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        plt.close()
        
        logger.info(f"ROC curves plot saved to {output_path}")
    
    def save_models(self, results: dict, output_dir: str):
        """Save trained models and metadata."""
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Save each model
        for model_name, result in results.items():
            model_path = output_path / f"{model_name}_darwin_model.pkl"
            joblib.dump(result['model'], model_path)
            
            # Save metadata
            metadata = {
                'model_name': model_name,
                'dataset': 'DARWIN',
                'best_params': result['best_params'],
                'cv_score_mean': result['cv_score_mean'],
                'cv_score_std': result['cv_score_std'],
                'feature_names': self.feature_names,
                'feature_importance': result['feature_importance'].tolist() if result['feature_importance'] is not None else None,
                'num_samples': len(self.feature_names),
                'num_features': len(self.feature_names)
            }
            
            metadata_path = output_path / f"{model_name}_darwin_metadata.json"
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
        
        # Save scaler
        scaler_path = output_path / "darwin_scaler.pkl"
        joblib.dump(self.scaler, scaler_path)
        
        logger.info(f"DARWIN models saved to {output_path}")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Train models on DARWIN dataset')
    parser.add_argument('--data_file', default='data/darwin/data.csv')
    parser.add_argument('--output_dir', default='models/darwin/')
    parser.add_argument('--test_size', type=float, default=0.2)
    
    args = parser.parse_args()
    
    # Initialize trainer
    trainer = DarwinModelTrainer()
    
    # Load DARWIN data
    df = trainer.load_darwin_data(args.data_file)
    if df is None:
        logger.error("Failed to load DARWIN dataset")
        return 1
    
    # Prepare features
    X, y = trainer.prepare_features(df)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=args.test_size, random_state=42, stratify=y
    )
    
    logger.info(f"Training set: {X_train.shape[0]} samples")
    logger.info(f"Test set: {X_test.shape[0]} samples")
    
    # Train models
    results = trainer.train_all_models(X_train, y_train)
    
    # Evaluate models
    eval_results = trainer.evaluate_models(results, X_test, y_test)
    
    # Plot feature importance
    trainer.plot_feature_importance(results, args.output_dir)
    
    # Save models
    trainer.save_models(results, args.output_dir)
    
    # Print results summary
    print("\n" + "="*60)
    print("DARWIN Dataset Model Performance Summary")
    print("="*60)
    for model_name, result in results.items():
        eval_result = eval_results[model_name]
        print(f"\n{model_name.upper()}:")
        print(f"  CV AUC: {result['cv_score_mean']:.4f} ± {result['cv_score_std']:.4f}")
        print(f"  Test AUC: {eval_result['auc_score']:.4f}")
        print(f"  Best params: {result['best_params']}")
        
        # Print confusion matrix
        cm = eval_result['confusion_matrix']
        print(f"  Confusion Matrix:")
        print(f"    [[{cm[0,0]:3d}, {cm[0,1]:3d}]")
        print(f"     [{cm[1,0]:3d}, {cm[1,1]:3d}]]")
    
    print(f"\nModels saved to: {args.output_dir}")
    return 0

if __name__ == "__main__":
    main()