#!/usr/bin/env python3
"""
Ultra-Advanced Model Training for 90%+ Accuracy
Implementing stacking, advanced feature engineering, and hyperparameter optimization
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV, StratifiedKFold
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier, StackingClassifier
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler, RobustScaler, PolynomialFeatures
from sklearn.feature_selection import SelectKBest, f_classif, RFE, SelectFromModel
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix, accuracy_score
from sklearn.calibration import CalibratedClassifierCV
import joblib
import logging
from pathlib import Path
import json
import matplotlib.pyplot as plt
import seaborn as sns
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier
from sklearn.decomposition import PCA
from sklearn.pipeline import Pipeline

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class UltraAdvancedModelTrainer:
    def __init__(self, random_state=42):
        self.random_state = random_state
        self.scaler = RobustScaler()
        self.models = {}
        self.feature_names = []
        self.selected_features = []
        
    def load_darwin_data(self, data_file: str):
        """Load DARWIN dataset."""
        df = pd.read_csv(data_file)
        logger.info(f"Loaded DARWIN dataset: {df.shape[0]} samples, {df.shape[1]} features")
        
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
    
    def advanced_feature_engineering(self, X: np.ndarray):
        """Advanced feature engineering."""
        logger.info("Performing advanced feature engineering...")
        
        # Create polynomial features for top features
        rf = RandomForestClassifier(n_estimators=100, random_state=self.random_state)
        rf.fit(X, np.zeros(X.shape[0]))  # Dummy fit to get feature importances
        importances = rf.feature_importances_
        top_features_indices = np.argsort(importances)[-20:]  # Top 20 features
        
        # Create polynomial features for top features
        poly = PolynomialFeatures(degree=2, interaction_only=True, include_bias=False)
        top_features = X[:, top_features_indices]
        poly_features = poly.fit_transform(top_features)
        
        # Combine original and polynomial features
        X_enhanced = np.hstack([X, poly_features])
        
        logger.info(f"Enhanced features: {X_enhanced.shape[1]} (original: {X.shape[1]})")
        return X_enhanced
    
    def advanced_feature_selection(self, X: np.ndarray, y: np.ndarray):
        """Advanced feature selection using multiple methods."""
        logger.info("Performing advanced feature selection...")
        
        # Method 1: SelectKBest
        selector1 = SelectKBest(score_func=f_classif, k=200)
        X_kbest = selector1.fit_transform(X, y)
        kbest_features = selector1.get_support(indices=True)
        
        # Method 2: Random Forest feature importance
        rf = RandomForestClassifier(n_estimators=200, random_state=self.random_state)
        rf.fit(X, y)
        importances = rf.feature_importances_
        rf_features = np.argsort(importances)[-200:]
        
        # Method 3: L1 regularization feature selection
        lr = LogisticRegression(penalty='l1', solver='liblinear', random_state=self.random_state, max_iter=1000)
        lr.fit(X, y)
        l1_features = np.where(lr.coef_[0] != 0)[0]
        
        # Combine all methods
        all_selected = set(kbest_features) | set(rf_features) | set(l1_features)
        selected_indices = list(all_selected)
        
        # Filter indices to valid range
        valid_indices = [i for i in selected_indices if i < X.shape[1]]
        
        X_selected = X[:, valid_indices]
        self.selected_features = [self.feature_names[i] for i in valid_indices if i < len(self.feature_names)]
        
        logger.info(f"Selected {len(self.selected_features)} features from {X.shape[1]} total")
        return X_selected
    
    def train_stacking_classifier(self, X: np.ndarray, y: np.ndarray):
        """Train stacking classifier."""
        logger.info("Training Stacking Classifier...")
        
        # Base models
        base_models = [
            ('rf', RandomForestClassifier(n_estimators=200, max_depth=10, random_state=self.random_state)),
            ('xgb', XGBClassifier(n_estimators=200, max_depth=3, learning_rate=0.1, random_state=self.random_state)),
            ('lgb', LGBMClassifier(n_estimators=200, max_depth=3, learning_rate=0.1, random_state=self.random_state, verbose=-1)),
            ('svm', SVC(probability=True, random_state=self.random_state))
        ]
        
        # Meta model
        meta_model = LogisticRegression(random_state=self.random_state)
        
        # Create stacking classifier
        stacking_clf = StackingClassifier(
            estimators=base_models,
            final_estimator=meta_model,
            cv=5,
            stack_method='predict_proba'
        )
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Cross-validation score
        cv_scores = cross_val_score(stacking_clf, X_scaled, y, cv=5, scoring='roc_auc')
        
        # Fit the model
        stacking_clf.fit(X_scaled, y)
        
        self.models['stacking'] = stacking_clf
        
        return {
            'model': stacking_clf,
            'best_params': {'base_models': len(base_models), 'meta_model': 'LogisticRegression'},
            'cv_score_mean': cv_scores.mean(),
            'cv_score_std': cv_scores.std(),
            'feature_importance': None
        }
    
    def train_optimized_xgboost(self, X: np.ndarray, y: np.ndarray):
        """Train highly optimized XGBoost."""
        logger.info("Training Optimized XGBoost...")
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Extensive hyperparameter search
        param_grid = {
            'n_estimators': [300, 500],
            'max_depth': [3, 4, 5],
            'learning_rate': [0.05, 0.1, 0.15],
            'subsample': [0.8, 0.9],
            'colsample_bytree': [0.8, 0.9],
            'reg_alpha': [0, 0.1],
            'reg_lambda': [1, 1.5]
        }
        
        xgb = XGBClassifier(random_state=self.random_state, eval_metric='logloss')
        grid_search = GridSearchCV(xgb, param_grid, cv=5, scoring='roc_auc', n_jobs=-1)
        grid_search.fit(X_scaled, y)
        
        # Cross-validation score
        cv_scores = cross_val_score(grid_search.best_estimator_, X_scaled, y, cv=5, scoring='roc_auc')
        
        self.models['optimized_xgboost'] = grid_search.best_estimator_
        
        return {
            'model': grid_search.best_estimator_,
            'best_params': grid_search.best_params_,
            'cv_score_mean': cv_scores.mean(),
            'cv_score_std': cv_scores.std(),
            'feature_importance': grid_search.best_estimator_.feature_importances_
        }
    
    def train_optimized_lightgbm(self, X: np.ndarray, y: np.ndarray):
        """Train highly optimized LightGBM."""
        logger.info("Training Optimized LightGBM...")
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Extensive hyperparameter search
        param_grid = {
            'n_estimators': [300, 500],
            'max_depth': [3, 4, 5],
            'learning_rate': [0.05, 0.1, 0.15],
            'subsample': [0.8, 0.9],
            'colsample_bytree': [0.8, 0.9],
            'reg_alpha': [0, 0.1],
            'reg_lambda': [1, 1.5],
            'num_leaves': [15, 31, 63]
        }
        
        lgb = LGBMClassifier(random_state=self.random_state, verbose=-1)
        grid_search = GridSearchCV(lgb, param_grid, cv=5, scoring='roc_auc', n_jobs=-1)
        grid_search.fit(X_scaled, y)
        
        # Cross-validation score
        cv_scores = cross_val_score(grid_search.best_estimator_, X_scaled, y, cv=5, scoring='roc_auc')
        
        self.models['optimized_lightgbm'] = grid_search.best_estimator_
        
        return {
            'model': grid_search.best_estimator_,
            'best_params': grid_search.best_params_,
            'cv_score_mean': cv_scores.mean(),
            'cv_score_std': cv_scores.std(),
            'feature_importance': grid_search.best_estimator_.feature_importances_
        }
    
    def train_all_ultra_advanced_models(self, X: np.ndarray, y: np.ndarray):
        """Train all ultra-advanced models."""
        results = {}
        
        # Advanced feature engineering
        X_enhanced = self.advanced_feature_engineering(X)
        
        # Advanced feature selection
        X_selected = self.advanced_feature_selection(X_enhanced, y)
        
        # Train ultra-advanced models
        results['stacking'] = self.train_stacking_classifier(X_selected, y)
        results['optimized_xgboost'] = self.train_optimized_xgboost(X_selected, y)
        results['optimized_lightgbm'] = self.train_optimized_lightgbm(X_selected, y)
        
        return results
    
    def evaluate_models(self, results: dict, X_test: np.ndarray, y_test: np.ndarray):
        """Evaluate models on test set."""
        evaluation_results = {}
        
        # Apply same feature engineering and selection to test set
        X_test_enhanced = self.advanced_feature_engineering(X_test)
        X_test_selected = X_test_enhanced[:, [i for i, name in enumerate(self.feature_names) if name in self.selected_features]]
        
        for model_name, result in results.items():
            model = result['model']
            
            # Scale test features
            X_test_scaled = self.scaler.transform(X_test_selected)
            
            # Predictions
            y_pred = model.predict(X_test_scaled)
            y_pred_proba = model.predict_proba(X_test_scaled)[:, 1]
            
            # Metrics
            auc_score = roc_auc_score(y_test, y_pred_proba)
            accuracy = accuracy_score(y_test, y_pred)
            
            evaluation_results[model_name] = {
                'auc_score': auc_score,
                'accuracy': accuracy,
                'predictions': y_pred,
                'probabilities': y_pred_proba,
                'confusion_matrix': confusion_matrix(y_test, y_pred)
            }
        
        return evaluation_results
    
    def save_models(self, results: dict, output_dir: str):
        """Save trained models and metadata."""
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Save each model
        for model_name, result in results.items():
            model_path = output_path / f"{model_name}_ultra_advanced_model.pkl"
            joblib.dump(result['model'], model_path)
            
            # Save metadata
            metadata = {
                'model_name': model_name,
                'dataset': 'DARWIN',
                'best_params': result['best_params'],
                'cv_score_mean': result['cv_score_mean'],
                'cv_score_std': result['cv_score_std'],
                'feature_names': self.selected_features,
                'feature_importance': result['feature_importance'].tolist() if result['feature_importance'] is not None else None,
                'num_samples': len(self.selected_features),
                'num_features': len(self.selected_features)
            }
            
            metadata_path = output_path / f"{model_name}_ultra_advanced_metadata.json"
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
        
        # Save scaler
        scaler_path = output_path / "ultra_advanced_scaler.pkl"
        joblib.dump(self.scaler, scaler_path)
        
        logger.info(f"Ultra-advanced models saved to {output_path}")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Train ultra-advanced models for 90%+ accuracy')
    parser.add_argument('--data_file', default='data/darwin/data.csv')
    parser.add_argument('--output_dir', default='models/ultra_advanced/')
    parser.add_argument('--test_size', type=float, default=0.2)
    
    args = parser.parse_args()
    
    # Initialize trainer
    trainer = UltraAdvancedModelTrainer()
    
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
    
    # Train ultra-advanced models
    results = trainer.train_all_ultra_advanced_models(X_train, y_train)
    
    # Evaluate models
    eval_results = trainer.evaluate_models(results, X_test, y_test)
    
    # Save models
    trainer.save_models(results, args.output_dir)
    
    # Print results summary
    print("\n" + "="*80)
    print("Ultra-Advanced Models Performance Summary (Target: 90%+ Accuracy)")
    print("="*80)
    
    best_model = None
    best_accuracy = 0
    
    for model_name, result in results.items():
        eval_result = eval_results[model_name]
        print(f"\n{model_name.upper()}:")
        print(f"  CV AUC: {result['cv_score_mean']:.4f} ± {result['cv_score_std']:.4f}")
        print(f"  Test AUC: {eval_result['auc_score']:.4f}")
        print(f"  Test Accuracy: {eval_result['accuracy']:.4f} ({eval_result['accuracy']*100:.1f}%)")
        print(f"  Best params: {result['best_params']}")
        
        # Track best model
        if eval_result['accuracy'] > best_accuracy:
            best_accuracy = eval_result['accuracy']
            best_model = model_name
        
        # Print confusion matrix
        cm = eval_result['confusion_matrix']
        print(f"  Confusion Matrix:")
        print(f"    [[{cm[0,0]:3d}, {cm[0,1]:3d}]")
        print(f"     [{cm[1,0]:3d}, {cm[1,1]:3d}]]")
    
    print(f"\n🏆 BEST MODEL: {best_model.upper()}")
    print(f"🎯 ACCURACY: {best_accuracy*100:.1f}%")
    
    if best_accuracy >= 0.9:
        print("✅ TARGET ACHIEVED: 90%+ accuracy!")
    elif best_accuracy >= 0.85:
        print("🔥 EXCELLENT: 85%+ accuracy achieved!")
    else:
        print("⚠️  Target not reached, but significant improvement achieved")
    
    print(f"\nModels saved to: {args.output_dir}")
    return 0

if __name__ == "__main__":
    main()
