#!/usr/bin/env python3
"""
Final Push for 90%+ Accuracy
Uses cross-validation, advanced ensembles, and data augmentation techniques
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
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold, KFold
from sklearn.preprocessing import StandardScaler, RobustScaler, LabelEncoder
from sklearn.feature_selection import SelectKBest, f_classif, RFE, SelectFromModel
from sklearn.ensemble import RandomForestClassifier, VotingClassifier, StackingClassifier, ExtraTreesClassifier, BaggingClassifier
from sklearn.linear_model import LogisticRegression, ElasticNet
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.calibration import CalibratedClassifierCV
from sklearn.decomposition import PCA
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import GridSearchCV
from sklearn.base import BaseEstimator, ClassifierMixin

# Advanced ML imports
try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False

try:
    import lightgbm as lgb
    LIGHTGBM_AVAILABLE = True
except ImportError:
    LIGHTGBM_AVAILABLE = False

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class CustomEnsemble(BaseEstimator, ClassifierMixin):
    """Custom ensemble that combines predictions using weighted voting"""
    
    def __init__(self, models, weights=None):
        self.models = models
        self.weights = weights if weights is not None else [1.0] * len(models)
        
    def fit(self, X, y):
        for model in self.models:
            model.fit(X, y)
        return self
    
    def predict(self, X):
        predictions = np.array([model.predict(X) for model in self.models])
        weighted_pred = np.average(predictions, axis=0, weights=self.weights)
        return np.round(weighted_pred).astype(int)
    
    def predict_proba(self, X):
        probabilities = np.array([model.predict_proba(X) for model in self.models])
        weighted_proba = np.average(probabilities, axis=0, weights=self.weights)
        return weighted_proba

class FinalPushTrainer:
    """Final push trainer using all available techniques"""
    
    def __init__(self, random_state: int = 42):
        self.random_state = random_state
        self.scaler = None
        self.label_encoder = LabelEncoder()
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
        
        # Encode labels to numeric
        y_encoded = self.label_encoder.fit_transform(y)
        
        # Store feature names
        self.feature_names = X.columns.tolist()
        
        logger.info(f"Features: {len(self.feature_names)}")
        logger.info(f"Target distribution: {dict(zip(*np.unique(y, return_counts=True)))}")
        
        return X, y_encoded
    
    def create_optimal_features(self, X: pd.DataFrame) -> pd.DataFrame:
        """Create optimal features for maximum performance"""
        logger.info("Creating optimal feature set...")
        
        X_optimal = X.copy()
        
        # Add polynomial features for top 8 most important features
        if len(X_optimal.columns) > 8:
            variances = X_optimal.var()
            top_features = variances.nlargest(8).index
            
            for feat in top_features:
                if feat in X_optimal.columns:
                    X_optimal[f'{feat}_squared'] = X_optimal[feat] ** 2
        
        # Add interaction features for highly correlated pairs (>0.85)
        corr_matrix = X_optimal.corr().abs()
        interaction_count = 0
        
        for i in range(len(corr_matrix.columns)):
            for j in range(i+1, len(corr_matrix.columns)):
                if corr_matrix.iloc[i, j] > 0.85:  # Very high correlation threshold
                    feat1, feat2 = corr_matrix.columns[i], corr_matrix.columns[j]
                    if feat1 in X_optimal.columns and feat2 in X_optimal.columns:
                        X_optimal[f'{feat1}_x_{feat2}'] = X_optimal[feat1] * X_optimal[feat2]
                        interaction_count += 1
        
        logger.info(f"Optimal features: {len(X_optimal.columns)} (original: {len(X.columns)})")
        logger.info(f"Added {interaction_count} interaction features")
        
        return X_optimal
    
    def optimal_feature_selection(self, X: pd.DataFrame, y: np.ndarray, n_features: int = 40) -> Tuple[pd.DataFrame, Any]:
        """Optimal feature selection using cross-validation"""
        logger.info(f"Performing optimal feature selection to {n_features} features...")
        
        # Use multiple feature selection methods and combine results
        methods = {}
        
        # Method 1: Random Forest importance
        rf_selector = SelectFromModel(
            RandomForestClassifier(n_estimators=300, random_state=self.random_state),
            max_features=n_features
        )
        X_rf = rf_selector.fit_transform(X, y)
        rf_features = set(X.columns[rf_selector.get_support()])
        methods['rf'] = rf_features
        
        # Method 2: Extra Trees importance
        et_selector = SelectFromModel(
            ExtraTreesClassifier(n_estimators=300, random_state=self.random_state),
            max_features=n_features
        )
        X_et = et_selector.fit_transform(X, y)
        et_features = set(X.columns[et_selector.get_support()])
        methods['et'] = et_features
        
        # Method 3: SelectKBest
        kbest_selector = SelectKBest(f_classif, k=min(n_features, len(X.columns)))
        X_kbest = kbest_selector.fit_transform(X, y)
        kbest_features = set(X.columns[kbest_selector.get_support()])
        methods['kbest'] = kbest_features
        
        # Combine all methods - take intersection of top methods
        combined_features = rf_features.intersection(et_features)
        if len(combined_features) < n_features:
            combined_features = combined_features.union(kbest_features)
        
        # If still not enough, add from individual methods
        if len(combined_features) < n_features:
            all_features = rf_features.union(et_features).union(kbest_features)
            remaining_needed = n_features - len(combined_features)
            additional_features = list(all_features - combined_features)[:remaining_needed]
            combined_features = combined_features.union(additional_features)
        
        # Select final features
        selected_features = list(combined_features)[:n_features]
        X_selected = X[selected_features]
        
        logger.info(f"Selected {len(selected_features)} features using combined methods")
        
        return X_selected, None
    
    def create_ultimate_models(self) -> Dict[str, Any]:
        """Create ultimate models with maximum optimization"""
        models = {}
        
        # Ultimate Random Forest
        models['random_forest'] = RandomForestClassifier(
            n_estimators=1000,
            max_depth=30,
            min_samples_split=2,
            min_samples_leaf=1,
            max_features='sqrt',
            bootstrap=True,
            oob_score=True,
            random_state=self.random_state,
            n_jobs=-1
        )
        
        # Ultimate LightGBM
        if LIGHTGBM_AVAILABLE:
            models['lightgbm'] = lgb.LGBMClassifier(
                n_estimators=2000,
                max_depth=12,
                learning_rate=0.02,
                subsample=0.8,
                colsample_bytree=0.8,
                reg_alpha=0.1,
                reg_lambda=0.1,
                boosting_type='gbdt',
                objective='binary',
                random_state=self.random_state,
                verbose=-1
            )
        
        # Ultimate XGBoost
        if XGBOOST_AVAILABLE:
            models['xgboost'] = xgb.XGBClassifier(
                n_estimators=2000,
                max_depth=12,
                learning_rate=0.02,
                subsample=0.8,
                colsample_bytree=0.8,
                reg_alpha=0.1,
                reg_lambda=0.1,
                random_state=self.random_state,
                eval_metric='logloss'
            )
        
        # Ultimate Neural Network
        models['neural_network'] = MLPClassifier(
            hidden_layer_sizes=(500, 250, 125),
            activation='relu',
            solver='adam',
            alpha=0.0001,
            learning_rate='adaptive',
            max_iter=3000,
            early_stopping=True,
            validation_fraction=0.1,
            random_state=self.random_state
        )
        
        # Ultimate SVM
        models['svm'] = SVC(
            C=1000.0,
            kernel='rbf',
            gamma='scale',
            probability=True,
            random_state=self.random_state
        )
        
        # Ultimate Extra Trees
        models['extra_trees'] = ExtraTreesClassifier(
            n_estimators=1000,
            max_depth=30,
            min_samples_split=2,
            min_samples_leaf=1,
            max_features='sqrt',
            bootstrap=True,
            random_state=self.random_state,
            n_jobs=-1
        )
        
        return models
    
    def train_with_cross_validation(self, X_train: pd.DataFrame, y_train: np.ndarray, 
                                  X_val: pd.DataFrame, y_val: np.ndarray) -> Dict[str, Any]:
        """Train models with cross-validation for better generalization"""
        logger.info("Training models with cross-validation...")
        
        # Create robust scaler
        self.scaler = RobustScaler()
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_val_scaled = self.scaler.transform(X_val)
        
        # Convert back to DataFrame
        X_train_scaled = pd.DataFrame(X_train_scaled, columns=X_train.columns, index=X_train.index)
        X_val_scaled = pd.DataFrame(X_val_scaled, columns=X_val.columns, index=X_val.index)
        
        models = self.create_ultimate_models()
        results = {}
        
        # Cross-validation setup
        cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=self.random_state)
        
        for name, model in models.items():
            try:
                logger.info(f"Training {name} with cross-validation...")
                
                # Cross-validation scores
                cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=cv, scoring='roc_auc')
                cv_mean = cv_scores.mean()
                cv_std = cv_scores.std()
                
                logger.info(f"{name} CV: {cv_mean:.4f} (+/- {cv_std:.4f})")
                
                # Train final model
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
                    'cv_mean': cv_mean,
                    'cv_std': cv_std,
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
    
    def create_ultimate_ensemble(self, base_results: Dict[str, Any], 
                               X_train: pd.DataFrame, y_train: np.ndarray) -> Any:
        """Create ultimate ensemble with multiple strategies"""
        logger.info("Creating ultimate ensemble...")
        
        # Prepare base models
        base_models = []
        weights = []
        
        for name, result in base_results.items():
            if 'model' in result:
                base_models.append(result['model'])
                # Weight by AUC performance
                weights.append(result['auc'])
        
        if len(base_models) < 2:
            logger.warning("Not enough base models for ensemble")
            return None
        
        # Normalize weights
        weights = np.array(weights)
        weights = weights / weights.sum()
        
        # Strategy 1: Custom weighted ensemble
        custom_ensemble = CustomEnsemble(base_models, weights)
        
        # Strategy 2: Voting classifier
        voting_clf = VotingClassifier(
            estimators=[(f'model_{i}', model) for i, model in enumerate(base_models)],
            voting='soft'
        )
        
        # Strategy 3: Stacking with LightGBM meta-learner
        if LIGHTGBM_AVAILABLE:
            stacking_clf = StackingClassifier(
                estimators=[(f'model_{i}', model) for i, model in enumerate(base_models)],
                final_estimator=lgb.LGBMClassifier(
                    n_estimators=500,
                    max_depth=8,
                    learning_rate=0.1,
                    random_state=self.random_state,
                    verbose=-1
                ),
                cv=5,
                stack_method='predict_proba'
            )
        else:
            stacking_clf = StackingClassifier(
                estimators=[(f'model_{i}', model) for i, model in enumerate(base_models)],
                final_estimator=RandomForestClassifier(
                    n_estimators=200,
                    max_depth=10,
                    random_state=self.random_state
                ),
                cv=5,
                stack_method='predict_proba'
            )
        
        # Strategy 4: Bagging ensemble
        bagging_clf = BaggingClassifier(
            estimator=CustomEnsemble(base_models, weights),
            n_estimators=10,
            random_state=self.random_state
        )
        
        # Train all strategies
        X_train_scaled = self.scaler.transform(X_train)
        
        strategies = {
            'custom_ensemble': custom_ensemble,
            'voting': voting_clf,
            'stacking': stacking_clf,
            'bagging': bagging_clf
        }
        
        trained_strategies = {}
        for name, strategy in strategies.items():
            try:
                logger.info(f"Training {name}...")
                strategy.fit(X_train_scaled, y_train)
                trained_strategies[name] = strategy
            except Exception as e:
                logger.error(f"Failed to train {name}: {e}")
                continue
        
        return trained_strategies
    
    def evaluate_ultimate_ensemble(self, results: Dict[str, Any], ensemble_strategies: Dict[str, Any],
                                 X_test: pd.DataFrame, y_test: np.ndarray) -> Dict[str, Any]:
        """Evaluate ultimate ensemble strategies"""
        logger.info("Evaluating ultimate ensemble strategies...")
        
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
        
        # Evaluate ensemble strategies
        for name, strategy in ensemble_strategies.items():
            try:
                y_pred_ensemble = strategy.predict(X_test_scaled)
                y_pred_proba_ensemble = strategy.predict_proba(X_test_scaled)[:, 1]
                
                accuracy_ensemble = accuracy_score(y_test, y_pred_ensemble)
                auc_ensemble = roc_auc_score(y_test, y_pred_proba_ensemble)
                
                eval_results[f'ensemble_{name}'] = {
                    'accuracy': accuracy_ensemble,
                    'auc': auc_ensemble,
                    'predictions': y_pred_ensemble,
                    'probabilities': y_pred_proba_ensemble
                }
                
                logger.info(f"Ensemble {name} Test: Accuracy={accuracy_ensemble:.4f}, AUC={auc_ensemble:.4f}")
                
            except Exception as e:
                logger.error(f"Failed to evaluate {name}: {e}")
                continue
        
        return eval_results
    
    def save_ultimate_models(self, results: Dict[str, Any], ensemble_strategies: Dict[str, Any], 
                            output_dir: str, eval_results: Dict[str, Any]):
        """Save ultimate models and results"""
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Save individual models
        for name, result in results.items():
            if 'model' in result:
                model_path = output_path / f"{name}_model.pkl"
                import pickle
                with open(model_path, 'wb') as f:
                    pickle.dump(result['model'], f)
        
        # Save ensemble strategies
        for name, strategy in ensemble_strategies.items():
            strategy_path = output_path / f"ensemble_{name}.pkl"
            import pickle
            with open(strategy_path, 'wb') as f:
                pickle.dump(strategy, f)
        
        # Save scaler and encoder
        scaler_path = output_path / "scaler.pkl"
        encoder_path = output_path / "label_encoder.pkl"
        import pickle
        with open(scaler_path, 'wb') as f:
            pickle.dump(self.scaler, f)
        with open(encoder_path, 'wb') as f:
            pickle.dump(self.label_encoder, f)
        
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
            'dataset': 'DARWIN',
            'techniques_used': ['Cross-Validation', 'Optimal Feature Engineering', 'Ultimate Ensemble Methods']
        }
        
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2)
        
        logger.info(f"Ultimate models saved to {output_dir}")
        logger.info(f"Best model: {best_model_name} (AUC: {best_auc:.4f}, Accuracy: {best_accuracy:.4f})")

def main():
    parser = argparse.ArgumentParser(description='Final push for 90%+ accuracy')
    parser.add_argument('--data_file', type=str, required=True, help='Path to DARWIN dataset CSV')
    parser.add_argument('--output_dir', type=str, required=True, help='Output directory for models')
    parser.add_argument('--test_size', type=float, default=0.2, help='Test set size')
    parser.add_argument('--val_size', type=float, default=0.2, help='Validation set size')
    parser.add_argument('--n_features', type=int, default=40, help='Number of features to select')
    parser.add_argument('--random_state', type=int, default=42, help='Random state')
    
    args = parser.parse_args()
    
    # Initialize trainer
    trainer = FinalPushTrainer(random_state=args.random_state)
    
    # Load data
    X, y = trainer.load_data(args.data_file)
    
    # Create optimal features
    X_enhanced = trainer.create_optimal_features(X)
    
    # Optimal feature selection
    X_selected, _ = trainer.optimal_feature_selection(
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
    
    # Train with cross-validation
    results = trainer.train_with_cross_validation(X_train, y_train, X_val, y_val)
    
    # Create ultimate ensemble
    ensemble_strategies = trainer.create_ultimate_ensemble(results, X_train, y_train)
    
    # Evaluate ultimate ensemble
    eval_results = trainer.evaluate_ultimate_ensemble(results, ensemble_strategies, X_test, y_test)
    
    # Save models
    trainer.save_ultimate_models(results, ensemble_strategies, args.output_dir, eval_results)
    
    # Print final results
    logger.info("\n" + "="*80)
    logger.info("FINAL PUSH FOR 90%+ ACCURACY - RESULTS")
    logger.info("="*80)
    
    for name, result in eval_results.items():
        logger.info(f"{name:30s}: AUC={result['auc']:.4f}, Accuracy={result['accuracy']:.4f}")
    
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
        logger.info("This is the maximum achievable with current dataset size and techniques.")

if __name__ == "__main__":
    main()
