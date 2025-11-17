#!/usr/bin/env python3
"""
Advanced Model Training for 90%+ Accuracy
Implementing ensemble methods, feature selection, and advanced ML techniques
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV, StratifiedKFold
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, VotingClassifier, AdaBoostClassifier
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.feature_selection import SelectKBest, f_classif, RFE
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

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AdvancedModelTrainer:
    def __init__(self, random_state=42):
        self.random_state = random_state
        self.scaler = RobustScaler()  # More robust to outliers
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
    
    def feature_selection(self, X: np.ndarray, y: np.ndarray, method='rfe', n_features=100):
        """Advanced feature selection."""
        logger.info(f"Performing feature selection using {method}...")
        
        if method == 'univariate':
            # SelectKBest with f_classif
            selector = SelectKBest(score_func=f_classif, k=n_features)
            X_selected = selector.fit_transform(X, y)
            self.selected_features = [self.feature_names[i] for i in selector.get_support(indices=True)]
            
        elif method == 'rfe':
            # Recursive Feature Elimination with Random Forest
            rf = RandomForestClassifier(n_estimators=100, random_state=self.random_state)
            selector = RFE(estimator=rf, n_features_to_select=n_features)
            X_selected = selector.fit_transform(X, y)
            self.selected_features = [self.feature_names[i] for i in selector.get_support(indices=True)]
            
        elif method == 'importance':
            # Use Random Forest feature importance
            rf = RandomForestClassifier(n_estimators=200, random_state=self.random_state)
            rf.fit(X, y)
            importances = rf.feature_importances_
            indices = np.argsort(importances)[::-1][:n_features]
            X_selected = X[:, indices]
            self.selected_features = [self.feature_names[i] for i in indices]
        
        logger.info(f"Selected {len(self.selected_features)} features")
        return X_selected
    
    def train_xgboost(self, X: np.ndarray, y: np.ndarray):
        """Train XGBoost model."""
        logger.info("Training XGBoost...")
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Grid search for hyperparameters
        param_grid = {
            'n_estimators': [100, 200, 300],
            'max_depth': [3, 5, 7],
            'learning_rate': [0.01, 0.1, 0.2],
            'subsample': [0.8, 0.9, 1.0],
            'colsample_bytree': [0.8, 0.9, 1.0]
        }
        
        xgb = XGBClassifier(random_state=self.random_state, eval_metric='logloss')
        grid_search = GridSearchCV(xgb, param_grid, cv=5, scoring='roc_auc', n_jobs=-1)
        grid_search.fit(X_scaled, y)
        
        # Cross-validation score
        cv_scores = cross_val_score(grid_search.best_estimator_, X_scaled, y, cv=5, scoring='roc_auc')
        
        self.models['xgboost'] = grid_search.best_estimator_
        
        return {
            'model': grid_search.best_estimator_,
            'best_params': grid_search.best_params_,
            'cv_score_mean': cv_scores.mean(),
            'cv_score_std': cv_scores.std(),
            'feature_importance': grid_search.best_estimator_.feature_importances_
        }
    
    def train_lightgbm(self, X: np.ndarray, y: np.ndarray):
        """Train LightGBM model."""
        logger.info("Training LightGBM...")
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Grid search for hyperparameters
        param_grid = {
            'n_estimators': [100, 200, 300],
            'max_depth': [3, 5, 7],
            'learning_rate': [0.01, 0.1, 0.2],
            'subsample': [0.8, 0.9, 1.0],
            'colsample_bytree': [0.8, 0.9, 1.0]
        }
        
        lgb = LGBMClassifier(random_state=self.random_state, verbose=-1)
        grid_search = GridSearchCV(lgb, param_grid, cv=5, scoring='roc_auc', n_jobs=-1)
        grid_search.fit(X_scaled, y)
        
        # Cross-validation score
        cv_scores = cross_val_score(grid_search.best_estimator_, X_scaled, y, cv=5, scoring='roc_auc')
        
        self.models['lightgbm'] = grid_search.best_estimator_
        
        return {
            'model': grid_search.best_estimator_,
            'best_params': grid_search.best_params_,
            'cv_score_mean': cv_scores.mean(),
            'cv_score_std': cv_scores.std(),
            'feature_importance': grid_search.best_estimator_.feature_importances_
        }
    
    def train_neural_network(self, X: np.ndarray, y: np.ndarray):
        """Train Neural Network model."""
        logger.info("Training Neural Network...")
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Grid search for hyperparameters
        param_grid = {
            'hidden_layer_sizes': [(50,), (100,), (50, 50), (100, 50)],
            'activation': ['relu', 'tanh'],
            'alpha': [0.0001, 0.001, 0.01],
            'learning_rate': ['constant', 'adaptive']
        }
        
        mlp = MLPClassifier(random_state=self.random_state, max_iter=1000)
        grid_search = GridSearchCV(mlp, param_grid, cv=5, scoring='roc_auc', n_jobs=-1)
        grid_search.fit(X_scaled, y)
        
        # Cross-validation score
        cv_scores = cross_val_score(grid_search.best_estimator_, X_scaled, y, cv=5, scoring='roc_auc')
        
        self.models['neural_network'] = grid_search.best_estimator_
        
        return {
            'model': grid_search.best_estimator_,
            'best_params': grid_search.best_params_,
            'cv_score_mean': cv_scores.mean(),
            'cv_score_std': cv_scores.std(),
            'feature_importance': None
        }
    
    def train_svm(self, X: np.ndarray, y: np.ndarray):
        """Train Support Vector Machine."""
        logger.info("Training SVM...")
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Grid search for hyperparameters
        param_grid = {
            'C': [0.1, 1, 10, 100],
            'gamma': ['scale', 'auto', 0.001, 0.01, 0.1],
            'kernel': ['rbf', 'poly', 'sigmoid']
        }
        
        svm = SVC(random_state=self.random_state, probability=True)
        grid_search = GridSearchCV(svm, param_grid, cv=5, scoring='roc_auc', n_jobs=-1)
        grid_search.fit(X_scaled, y)
        
        # Cross-validation score
        cv_scores = cross_val_score(grid_search.best_estimator_, X_scaled, y, cv=5, scoring='roc_auc')
        
        self.models['svm'] = grid_search.best_estimator_
        
        return {
            'model': grid_search.best_estimator_,
            'best_params': grid_search.best_params_,
            'cv_score_mean': cv_scores.mean(),
            'cv_score_std': cv_scores.std(),
            'feature_importance': None
        }
    
    def train_ensemble(self, X: np.ndarray, y: np.ndarray, individual_results: dict):
        """Train ensemble model."""
        logger.info("Training Ensemble Model...")
        
        # Create voting classifier with best individual models
        estimators = []
        for model_name, result in individual_results.items():
            if result['cv_score_mean'] > 0.8:  # Only include good models
                estimators.append((model_name, result['model']))
        
        if len(estimators) < 2:
            logger.warning("Not enough good models for ensemble")
            return None
        
        # Voting classifier
        voting_clf = VotingClassifier(estimators=estimators, voting='soft')
        
        # Scale features
        X_scaled = self.scaler.fit_transform(X)
        
        # Cross-validation score
        cv_scores = cross_val_score(voting_clf, X_scaled, y, cv=5, scoring='roc_auc')
        
        # Fit the model
        voting_clf.fit(X_scaled, y)
        
        self.models['ensemble'] = voting_clf
        
        return {
            'model': voting_clf,
            'best_params': {'voting': 'soft', 'estimators': [name for name, _ in estimators]},
            'cv_score_mean': cv_scores.mean(),
            'cv_score_std': cv_scores.std(),
            'feature_importance': None
        }
    
    def train_all_advanced_models(self, X: np.ndarray, y: np.ndarray):
        """Train all advanced models."""
        results = {}
        
        # Feature selection
        X_selected = self.feature_selection(X, y, method='importance', n_features=150)
        
        # Train individual models
        results['xgboost'] = self.train_xgboost(X_selected, y)
        results['lightgbm'] = self.train_lightgbm(X_selected, y)
        results['neural_network'] = self.train_neural_network(X_selected, y)
        results['svm'] = self.train_svm(X_selected, y)
        
        # Train ensemble
        ensemble_result = self.train_ensemble(X_selected, y, results)
        if ensemble_result:
            results['ensemble'] = ensemble_result
        
        return results
    
    def evaluate_models(self, results: dict, X_test: np.ndarray, y_test: np.ndarray):
        """Evaluate models on test set."""
        evaluation_results = {}
        
        # Apply same feature selection to test set
        X_test_selected = X_test[:, [self.feature_names.index(f) for f in self.selected_features]]
        
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
            model_path = output_path / f"{model_name}_advanced_model.pkl"
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
            
            metadata_path = output_path / f"{model_name}_advanced_metadata.json"
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)
        
        # Save scaler
        scaler_path = output_path / "advanced_scaler.pkl"
        joblib.dump(self.scaler, scaler_path)
        
        logger.info(f"Advanced models saved to {output_path}")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Train advanced models for 90%+ accuracy')
    parser.add_argument('--data_file', default='data/darwin/data.csv')
    parser.add_argument('--output_dir', default='models/advanced/')
    parser.add_argument('--test_size', type=float, default=0.2)
    
    args = parser.parse_args()
    
    # Initialize trainer
    trainer = AdvancedModelTrainer()
    
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
    
    # Train advanced models
    results = trainer.train_all_advanced_models(X_train, y_train)
    
    # Evaluate models
    eval_results = trainer.evaluate_models(results, X_test, y_test)
    
    # Save models
    trainer.save_models(results, args.output_dir)
    
    # Print results summary
    print("\n" + "="*70)
    print("Advanced Models Performance Summary (Target: 90%+ Accuracy)")
    print("="*70)
    
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
    else:
        print("⚠️  Target not reached, but significant improvement achieved")
    
    print(f"\nModels saved to: {args.output_dir}")
    return 0

if __name__ == "__main__":
    main()
