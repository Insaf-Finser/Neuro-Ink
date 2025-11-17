#!/usr/bin/env python3
"""
Robust Ensemble Training Script for DARWIN Dataset
Handles feature dimension mismatches and implements advanced techniques for 90%+ accuracy
"""

import os
import sys
import json
import logging
import argparse
import numpy as np
import pandas as pd
from pathlib import Path
from typing import Dict, List, Tuple, Any
import warnings
warnings.filterwarnings('ignore')

# ML imports
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.feature_selection import SelectKBest, f_classif, RFE
from sklearn.ensemble import RandomForestClassifier, VotingClassifier, StackingClassifier
from sklearn.linear_model import LogisticRegression, ElasticNet
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.calibration import CalibratedClassifierCV
from sklearn.decomposition import PCA
from sklearn.neural_network import MLPClassifier

# Advanced ML imports (optional)
try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False
    print("XGBoost not available, skipping...")

try:
    import lightgbm as lgb
    LIGHTGBM_AVAILABLE = True
except ImportError:
    LIGHTGBM_AVAILABLE = False
    print("LightGBM not available, skipping...")

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class RobustEnsembleTrainer:
    """Robust ensemble trainer that handles feature dimension issues"""
    
    def __init__(self, random_state: int = 42):
        self.random_state = random_state
        self.scaler = None
        self.feature_selector = None
        self.models = {}
        self.feature_names = []
        self.best_model = None
        self.best_score = 0
        
    def load_data(self, data_file: str) -> Tuple[pd.DataFrame, pd.Series]:
        """Load and preprocess DARWIN dataset"""
        logger.info(f"Loading data from {data_file}")
        
        df = pd.read_csv(data_file)
        logger.info(f"Loaded {len(df)} samples with {len(df.columns)} features")
        
        # Separate features and target
        X = df.drop(['ID', 'class'], axis=1)
        y = df['class']
        
        # Store feature names
        self.feature_names = X.columns.tolist()
        
        logger.info(f"Features: {len(self.feature_names)}")
        logger.info(f"Target distribution: {y.value_counts().to_dict()}")
        
        return X, y
    
    def create_robust_features(self, X: pd.DataFrame) -> pd.DataFrame:
        """Create robust features with proper dimension handling"""
        logger.info("Creating robust feature set...")
        
        X_robust = X.copy()
        
        # Add polynomial features (degree 2) for top 20 most important features
        if len(X_robust.columns) > 20:
            # Use variance to select top features for polynomial expansion
            variances = X_robust.var()
            top_features = variances.nlargest(20).index
            
            for feat in top_features:
                if feat in X_robust.columns:
                    X_robust[f'{feat}_squared'] = X_robust[feat] ** 2
        
        # Add interaction features for highly correlated pairs
        corr_matrix = X_robust.corr().abs()
        high_corr_pairs = []
        
        for i in range(len(corr_matrix.columns)):
            for j in range(i+1, len(corr_matrix.columns)):
                if corr_matrix.iloc[i, j] > 0.7:  # High correlation threshold
                    feat1, feat2 = corr_matrix.columns[i], corr_matrix.columns[j]
                    if feat1 in X_robust.columns and feat2 in X_robust.columns:
                        X_robust[f'{feat1}_x_{feat2}'] = X_robust[feat1] * X_robust[feat2]
                        high_corr_pairs.append((feat1, feat2))
        
        logger.info(f"Enhanced features: {len(X_robust.columns)} (original: {len(X.columns)})")
        logger.info(f"Added {len(high_corr_pairs)} interaction features")
        
        return X_robust
    
    def robust_feature_selection(self, X: pd.DataFrame, y: pd.Series, n_features: int = 200) -> Tuple[pd.DataFrame, Any]:
        """Robust feature selection that handles dimension mismatches"""
        logger.info(f"Performing robust feature selection to {n_features} features...")
        
        # Use multiple feature selection methods
        methods = {
            'kbest': SelectKBest(f_classif, k=min(n_features, len(X.columns))),
            'rfe_rf': RFE(RandomForestClassifier(n_estimators=50, random_state=self.random_state), 
                         n_features_to_select=min(n_features, len(X.columns)))
        }
        
        best_method = None
        best_score = 0
        
        for method_name, selector in methods.items():
            try:
                X_selected = selector.fit_transform(X, y)
                # Quick validation with simple model
                rf_temp = RandomForestClassifier(n_estimators=10, random_state=self.random_state)
                scores = cross_val_score(rf_temp, X_selected, y, cv=3, scoring='roc_auc')
                avg_score = scores.mean()
                
                logger.info(f"{method_name}: {avg_score:.4f} AUC")
                
                if avg_score > best_score:
                    best_score = avg_score
                    best_method = selector
                    
            except Exception as e:
                logger.warning(f"Feature selection method {method_name} failed: {e}")
                continue
        
        if best_method is None:
            logger.warning("All feature selection methods failed, using original features")
            return X, None
        
        X_selected = best_method.transform(X)
        selected_features = X.columns[best_method.get_support()].tolist()
        
        logger.info(f"Selected {len(selected_features)} features using {type(best_method).__name__}")
        
        return pd.DataFrame(X_selected, columns=selected_features, index=X.index), best_method
    
    def create_ensemble_models(self) -> Dict[str, Any]:
        """Create ensemble of diverse models"""
        models = {}
        
        # Base models
        models['random_forest'] = RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=self.random_state,
            n_jobs=-1
        )
        
        models['logistic_regression'] = LogisticRegression(
            C=0.1,
            penalty='elasticnet',
            l1_ratio=0.5,
            solver='saga',
            max_iter=1000,
            random_state=self.random_state
        )
        
        models['svm'] = SVC(
            C=1.0,
            kernel='rbf',
            gamma='scale',
            probability=True,
            random_state=self.random_state
        )
        
        models['neural_network'] = MLPClassifier(
            hidden_layer_sizes=(100, 50),
            activation='relu',
            solver='adam',
            alpha=0.001,
            learning_rate='adaptive',
            max_iter=500,
            random_state=self.random_state
        )
        
        # Advanced models if available
        if XGBOOST_AVAILABLE:
            models['xgboost'] = xgb.XGBClassifier(
                n_estimators=200,
                max_depth=6,
                learning_rate=0.1,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=self.random_state,
                eval_metric='logloss'
            )
        
        if LIGHTGBM_AVAILABLE:
            models['lightgbm'] = lgb.LGBMClassifier(
                n_estimators=200,
                max_depth=6,
                learning_rate=0.1,
                subsample=0.8,
                colsample_bytree=0.8,
                random_state=self.random_state,
                verbose=-1
            )
        
        return models
    
    def train_models(self, X_train: pd.DataFrame, y_train: pd.Series, 
                    X_val: pd.DataFrame, y_val: pd.Series) -> Dict[str, Any]:
        """Train all models with proper scaling"""
        logger.info("Training ensemble models...")
        
        # Create robust scaler
        self.scaler = RobustScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_val_scaled = self.scaler.transform(X_val)
        
        # Convert back to DataFrame to maintain feature names
        X_train_scaled = pd.DataFrame(X_train_scaled, columns=X_train.columns, index=X_train.index)
        X_val_scaled = pd.DataFrame(X_val_scaled, columns=X_val.columns, index=X_val.index)
        
        models = self.create_ensemble_models()
        results = {}
        
        for name, model in models.items():
            try:
                logger.info(f"Training {name}...")
                
                # Train model
                model.fit(X_train_scaled, y_train)
                
                # Predictions
                y_pred = model.predict(X_val_scaled)
                y_pred_proba = model.predict_proba(X_val_scaled)[:, 1]
                
                # Metrics
                accuracy = accuracy_score(y_val, y_pred)
                auc = roc_auc_score(y_val, y_pred_proba)
                
                results[name] = {
                    'model': model,
                    'accuracy': accuracy,
                    'auc': auc,
                    'predictions': y_pred,
                    'probabilities': y_pred_proba
                }
                
                logger.info(f"{name}: Accuracy={accuracy:.4f}, AUC={auc:.4f}")
                
                if auc > self.best_score:
                    self.best_score = auc
                    self.best_model = name
                    
            except Exception as e:
                logger.error(f"Failed to train {name}: {e}")
                continue
        
        return results
    
    def create_stacking_ensemble(self, base_results: Dict[str, Any], 
                               X_train: pd.DataFrame, y_train: pd.Series) -> Any:
        """Create stacking ensemble from base models"""
        logger.info("Creating stacking ensemble...")
        
        # Prepare base models for stacking
        base_models = []
        for name, result in base_results.items():
            if 'model' in result:
                base_models.append((name, result['model']))
        
        if len(base_models) < 2:
            logger.warning("Not enough base models for stacking")
            return None
        
        # Create stacking classifier
        stacking_clf = StackingClassifier(
            estimators=base_models,
            final_estimator=LogisticRegression(random_state=self.random_state),
            cv=5,
            stack_method='predict_proba'
        )
        
        # Train stacking ensemble
        X_train_scaled = self.scaler.transform(X_train)
        stacking_clf.fit(X_train_scaled, y_train)
        
        return stacking_clf
    
    def evaluate_ensemble(self, results: Dict[str, Any], stacking_model: Any,
                         X_test: pd.DataFrame, y_test: pd.Series) -> Dict[str, Any]:
        """Evaluate all models including stacking ensemble"""
        logger.info("Evaluating ensemble models...")
        
        X_test_scaled = self.scaler.transform(X_test)
        
        eval_results = {}
        
        # Evaluate base models
        for name, result in results.items():
            if 'model' in result:
                model = result['model']
                y_pred = model.predict(X_test_scaled)
                y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
                
                accuracy = accuracy_score(y_test, y_pred)
                auc = roc_auc_score(y_test, y_pred_proba)
                
                eval_results[name] = {
                    'accuracy': accuracy,
                    'auc': auc,
                    'predictions': y_pred,
                    'probabilities': y_pred_proba
                }
                
                logger.info(f"{name} Test: Accuracy={accuracy:.4f}, AUC={auc:.4f}")
        
        # Evaluate stacking ensemble
        if stacking_model is not None:
            y_pred_stack = stacking_model.predict(X_test_scaled)
            y_pred_proba_stack = stacking_model.predict_proba(X_test_scaled)[:, 1]
            
            accuracy_stack = accuracy_score(y_test, y_pred_stack)
            auc_stack = roc_auc_score(y_test, y_pred_proba_stack)
            
            eval_results['stacking_ensemble'] = {
                'accuracy': accuracy_stack,
                'auc': auc_stack,
                'predictions': y_pred_stack,
                'probabilities': y_pred_proba_stack
            }
            
            logger.info(f"Stacking Ensemble Test: Accuracy={accuracy_stack:.4f}, AUC={auc_stack:.4f}")
        
        return eval_results
    
    def save_models(self, results: Dict[str, Any], stacking_model: Any, 
                   output_dir: str, eval_results: Dict[str, Any]):
        """Save trained models and results"""
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Save individual models
        for name, result in results.items():
            if 'model' in result:
                model_path = output_path / f"{name}_model.pkl"
                import pickle
                with open(model_path, 'wb') as f:
                    pickle.dump(result['model'], f)
        
        # Save stacking model
        if stacking_model is not None:
            stacking_path = output_path / "stacking_ensemble.pkl"
            import pickle
            with open(stacking_path, 'wb') as f:
                pickle.dump(stacking_model, f)
        
        # Save scaler
        scaler_path = output_path / "scaler.pkl"
        import pickle
        with open(scaler_path, 'wb') as f:
            pickle.dump(self.scaler, f)
        
        # Save feature names
        feature_names_path = output_path / "feature_names.json"
        with open(feature_names_path, 'w') as f:
            json.dump(self.feature_names, f, indent=2)
        
        # Save evaluation results
        eval_path = output_path / "evaluation_results.json"
        eval_data = {}
        for name, result in eval_results.items():
            eval_data[name] = {
                'accuracy': float(result['accuracy']),
                'auc': float(result['auc'])
            }
        
        with open(eval_path, 'w') as f:
            json.dump(eval_data, f, indent=2)
        
        # Save summary
        summary_path = output_path / "model_summary.json"
        best_model_name = max(eval_results.keys(), key=lambda k: eval_results[k]['auc'])
        best_auc = eval_results[best_model_name]['auc']
        best_accuracy = eval_results[best_model_name]['accuracy']
        
        summary = {
            'best_model': best_model_name,
            'best_auc': float(best_auc),
            'best_accuracy': float(best_accuracy),
            'total_models': len(eval_results),
            'models_available': list(eval_results.keys()),
            'feature_count': len(self.feature_names),
            'dataset': 'DARWIN'
        }
        
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2)
        
        logger.info(f"Models saved to {output_dir}")
        logger.info(f"Best model: {best_model_name} (AUC: {best_auc:.4f}, Accuracy: {best_accuracy:.4f})")

def main():
    parser = argparse.ArgumentParser(description='Train robust ensemble models on DARWIN dataset')
    parser.add_argument('--data_file', type=str, required=True, help='Path to DARWIN dataset CSV')
    parser.add_argument('--output_dir', type=str, required=True, help='Output directory for models')
    parser.add_argument('--test_size', type=float, default=0.2, help='Test set size')
    parser.add_argument('--val_size', type=float, default=0.2, help='Validation set size')
    parser.add_argument('--n_features', type=int, default=200, help='Number of features to select')
    parser.add_argument('--random_state', type=int, default=42, help='Random state')
    
    args = parser.parse_args()
    
    # Initialize trainer
    trainer = RobustEnsembleTrainer(random_state=args.random_state)
    
    # Load data
    X, y = trainer.load_data(args.data_file)
    
    # Create robust features
    X_enhanced = trainer.create_robust_features(X)
    
    # Feature selection
    X_selected, feature_selector = trainer.robust_feature_selection(
        X_enhanced, y, n_features=args.n_features
    )
    
    # Split data
    X_temp, X_test, y_temp, y_test = train_test_split(
        X_selected, y, test_size=args.test_size, random_state=args.random_state, stratify=y
    )
    
    X_train, X_val, y_train, y_val = train_test_split(
        X_temp, y_temp, test_size=args.val_size/(1-args.test_size), 
        random_state=args.random_state, stratify=y_temp
    )
    
    logger.info(f"Data split: Train={len(X_train)}, Val={len(X_val)}, Test={len(X_test)}")
    
    # Train models
    results = trainer.train_models(X_train, y_train, X_val, y_val)
    
    # Create stacking ensemble
    stacking_model = trainer.create_stacking_ensemble(results, X_train, y_train)
    
    # Evaluate ensemble
    eval_results = trainer.evaluate_ensemble(results, stacking_model, X_test, y_test)
    
    # Save models
    trainer.save_models(results, stacking_model, args.output_dir, eval_results)
    
    # Print final results
    logger.info("\n" + "="*50)
    logger.info("FINAL RESULTS")
    logger.info("="*50)
    
    for name, result in eval_results.items():
        logger.info(f"{name:20s}: AUC={result['auc']:.4f}, Accuracy={result['accuracy']:.4f}")
    
    best_model = max(eval_results.keys(), key=lambda k: eval_results[k]['auc'])
    best_auc = eval_results[best_model]['auc']
    best_accuracy = eval_results[best_model]['accuracy']
    
    logger.info(f"\nBest Model: {best_model}")
    logger.info(f"Best AUC: {best_auc:.4f}")
    logger.info(f"Best Accuracy: {best_accuracy:.4f}")
    
    if best_accuracy >= 0.90:
        logger.info("🎉 SUCCESS: Achieved 90%+ accuracy!")
    else:
        logger.info(f"Target accuracy not reached. Current best: {best_accuracy:.4f}")

if __name__ == "__main__":
    main()
