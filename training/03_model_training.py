#!/usr/bin/env python3
"""
Alzheimer's Handwriting Analysis - Model Training
Trains baseline models for cognitive risk assessment.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, roc_auc_score, roc_curve
from sklearn.calibration import CalibratedClassifierCV
import xgboost as xgb
import lightgbm as lgb
import joblib
import logging
from pathlib import Path
import json

logger = logging.getLogger(__name__)

class ModelTrainer:
    def __init__(self, random_state=42):
        self.random_state = random_state
        self.scaler = StandardScaler()
        self.models = {}
        self.feature_names = []
        
    def prepare_data(self, df: pd.DataFrame, target_column: str = 'risk_level') -> Tuple[np.ndarray, np.ndarray]:
        """Prepare features and target for training."""
        # Select numeric features
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        feature_cols = [col for col in numeric_cols if col != target_column]
        
        X = df[feature_cols].fillna(0).values
        y = df[target_column].values if target_column in df.columns else np.zeros(len(df))
        
        self.feature_names = feature_cols
        logger.info(f"Prepared {X.shape[0]} samples with {X.shape[1]} features")
        
        return X, y
    
    def train_logistic_regression(self, X: np.ndarray, y: np.ndarray) -> Dict[str, Any]:
        """Train logistic regression model."""
        logger.info("Training Logistic Regression...")
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Grid search for hyperparameters
        param_grid = {
            'C': [0.1, 1.0, 10.0],
            'penalty': ['l1', 'l2'],
            'solver': ['liblinear', 'saga']
        }
        
        lr = LogisticRegression(random_state=self.random_state, max_iter=1000)
        grid_search = GridSearchCV(lr, param_grid, cv=5, scoring='roc_auc')
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
            'feature_importance': None  # LR doesn't have direct feature importance
        }
    
    def train_xgboost(self, X: np.ndarray, y: np.ndarray) -> Dict[str, Any]:
        """Train XGBoost model."""
        logger.info("Training XGBoost...")
        
        # Grid search for hyperparameters
        param_grid = {
            'n_estimators': [100, 200],
            'max_depth': [3, 6],
            'learning_rate': [0.01, 0.1],
            'subsample': [0.8, 1.0]
        }
        
        xgb_model = xgb.XGBClassifier(random_state=self.random_state, eval_metric='logloss')
        grid_search = GridSearchCV(xgb_model, param_grid, cv=5, scoring='roc_auc')
        grid_search.fit(X, y)
        
        # Cross-validation score
        cv_scores = cross_val_score(grid_search.best_estimator_, X, y, cv=5, scoring='roc_auc')
        
        self.models['xgboost'] = grid_search.best_estimator_
        
        return {
            'model': grid_search.best_estimator_,
            'best_params': grid_search.best_params_,
            'cv_score_mean': cv_scores.mean(),
            'cv_score_std': cv_scores.std(),
            'feature_importance': grid_search.best_estimator_.feature_importances_
        }
    
    def train_lightgbm(self, X: np.ndarray, y: np.ndarray) -> Dict[str, Any]:
        """Train LightGBM model."""
        logger.info("Training LightGBM...")
        
        # Grid search for hyperparameters
        param_grid = {
            'n_estimators': [100, 200],
            'max_depth': [3, 6],
            'learning_rate': [0.01, 0.1],
            'num_leaves': [31, 63]
        }
        
        lgb_model = lgb.LGBMClassifier(random_state=self.random_state, verbose=-1)
        grid_search = GridSearchCV(lgb_model, param_grid, cv=5, scoring='roc_auc')
        grid_search.fit(X, y)
        
        # Cross-validation score
        cv_scores = cross_val_score(grid_search.best_estimator_, X, y, cv=5, scoring='roc_auc')
        
        self.models['lightgbm'] = grid_search.best_estimator_
        
        return {
            'model': grid_search.best_estimator_,
            'best_params': grid_search.best_params_,
            'cv_score_mean': cv_scores.mean(),
            'cv_score_std': cv_scores.std(),
            'feature_importance': grid_search.best_estimator_.feature_importances_
        }
    
    def train_all_models(self, X: np.ndarray, y: np.ndarray) -> Dict[str, Dict[str, Any]]:
        """Train all baseline models."""
        results = {}
        
        # Train each model
        results['logistic_regression'] = self.train_logistic_regression(X, y)
        results['xgboost'] = self.train_xgboost(X, y)
        results['lightgbm'] = self.train_lightgbm(X, y)
        
        return results
    
    def select_best_model(self, results: Dict[str, Dict[str, Any]]) -> str:
        """Select the best performing model."""
        best_model = None
        best_score = -np.inf
        
        for model_name, result in results.items():
            score = result['cv_score_mean']
            if score > best_score:
                best_score = score
                best_model = model_name
        
        logger.info(f"Best model: {best_model} (CV AUC: {best_score:.4f})")
        return best_model
    
    def save_models(self, results: Dict[str, Dict[str, Any]], output_dir: str):
        """Save trained models and metadata."""
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Save each model
        for model_name, result in results.items():
            model_path = output_path / f"{model_name}_model.pkl"
            joblib.dump(result['model'], model_path)
            
            # Save metadata
            metadata = {
                'model_name': model_name,
                'best_params': result['best_params'],
                'cv_score_mean': result['cv_score_mean'],
                'cv_score_std': result['cv_score_std'],
                'feature_names': self.feature_names,
                'feature_importance': result['feature_importance'].tolist() if result['feature_importance'] is not None else None
            }
            
            metadata_path = output_path / f"{model_name}_metadata.json"
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
        
        # Save scaler
        scaler_path = output_path / "scaler.pkl"
        joblib.dump(self.scaler, scaler_path)
        
        logger.info(f"Models saved to {output_path}")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Train models for cognitive risk assessment')
    parser.add_argument('--input_file', default='data/processed/engineered_features.csv')
    parser.add_argument('--output_dir', default='models/')
    parser.add_argument('--test_size', type=float, default=0.2, help='Test set size')
    
    args = parser.parse_args()
    
    # Load data
    df = pd.read_csv(args.input_file)
    logger.info(f"Loaded {len(df)} samples")
    
    # Create synthetic target for demonstration (in practice, this would come from labels)
    np.random.seed(42)
    df['risk_level'] = np.random.binomial(1, 0.3, len(df))  # 30% positive rate
    
    # Initialize trainer
    trainer = ModelTrainer()
    
    # Prepare data
    X, y = trainer.prepare_data(df)
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=args.test_size, random_state=42, stratify=y
    )
    
    logger.info(f"Training set: {X_train.shape[0]} samples")
    logger.info(f"Test set: {X_test.shape[0]} samples")
    
    # Train models
    results = trainer.train_all_models(X_train, y_train)
    
    # Select best model
    best_model_name = trainer.select_best_model(results)
    
    # Save models
    trainer.save_models(results, args.output_dir)
    
    # Print results summary
    print("\nModel Performance Summary:")
    print("-" * 50)
    for model_name, result in results.items():
        print(f"{model_name}:")
        print(f"  CV AUC: {result['cv_score_mean']:.4f} ± {result['cv_score_std']:.4f}")
        print(f"  Best params: {result['best_params']}")
        print()

if __name__ == "__main__":
    main()
