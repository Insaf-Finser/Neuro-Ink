#!/usr/bin/env python3
"""
Conservative High-Accuracy Training Script
Focuses on quality features and proven techniques for 90%+ accuracy
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
from sklearn.preprocessing import StandardScaler, RobustScaler, LabelEncoder
from sklearn.feature_selection import SelectKBest, f_classif, RFE, SelectFromModel
from sklearn.ensemble import RandomForestClassifier, VotingClassifier, StackingClassifier, ExtraTreesClassifier
from sklearn.linear_model import LogisticRegression, ElasticNet
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, roc_auc_score
from sklearn.pipeline import Pipeline
from sklearn.calibration import CalibratedClassifierCV
from sklearn.decomposition import PCA
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import GridSearchCV

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

try:
    from imblearn.over_sampling import SMOTE
    SMOTE_AVAILABLE = True
except ImportError:
    SMOTE_AVAILABLE = False

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class ConservativeHighAccuracyTrainer:
    """Conservative trainer focusing on proven techniques for high accuracy"""
    
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
    
    def create_conservative_features(self, X: pd.DataFrame) -> pd.DataFrame:
        """Create conservative, high-quality features"""
        logger.info("Creating conservative feature set...")
        
        X_conservative = X.copy()
        
        # Only add polynomial features for top 10 most important features
        if len(X_conservative.columns) > 10:
            # Use variance to select top features
            variances = X_conservative.var()
            top_features = variances.nlargest(10).index
            
            for feat in top_features:
                if feat in X_conservative.columns:
                    # Only add squared features (avoid cubic to prevent overflow)
                    X_conservative[f'{feat}_squared'] = X_conservative[feat] ** 2
        
        # Add interaction features only for highly correlated pairs (>0.8)
        corr_matrix = X_conservative.corr().abs()
        interaction_count = 0
        
        for i in range(len(corr_matrix.columns)):
            for j in range(i+1, len(corr_matrix.columns)):
                if corr_matrix.iloc[i, j] > 0.8:  # High correlation threshold
                    feat1, feat2 = corr_matrix.columns[i], corr_matrix.columns[j]
                    if feat1 in X_conservative.columns and feat2 in X_conservative.columns:
                        X_conservative[f'{feat1}_x_{feat2}'] = X_conservative[feat1] * X_conservative[feat2]
                        interaction_count += 1
        
        logger.info(f"Conservative features: {len(X_conservative.columns)} (original: {len(X.columns)})")
        logger.info(f"Added {interaction_count} interaction features")
        
        return X_conservative
    
    def conservative_feature_selection(self, X: pd.DataFrame, y: np.ndarray, n_features: int = 50) -> Tuple[pd.DataFrame, Any]:
        """Conservative feature selection using proven methods"""
        logger.info(f"Performing conservative feature selection to {n_features} features...")
        
        # Use Random Forest feature importance (most reliable)
        rf_selector = SelectFromModel(
            RandomForestClassifier(n_estimators=200, random_state=self.random_state),
            max_features=n_features
        )
        
        X_selected = rf_selector.fit_transform(X, y)
        selected_features = X.columns[rf_selector.get_support()].tolist()
        
        logger.info(f"Selected {len(selected_features)} features using Random Forest importance")
        
        return pd.DataFrame(X_selected, columns=selected_features, index=X.index), rf_selector
    
    def create_high_performance_models(self) -> Dict[str, Any]:
        """Create high-performance models with optimized parameters"""
        models = {}
        
        # Highly optimized Random Forest
        models['random_forest'] = RandomForestClassifier(
            n_estimators=500,
            max_depth=25,
            min_samples_split=2,
            min_samples_leaf=1,
            max_features='sqrt',
            bootstrap=True,
            oob_score=True,
            random_state=self.random_state,
            n_jobs=-1
        )
        
        # Highly optimized LightGBM
        if LIGHTGBM_AVAILABLE:
            models['lightgbm'] = lgb.LGBMClassifier(
                n_estimators=1000,
                max_depth=10,
                learning_rate=0.03,
                subsample=0.8,
                colsample_bytree=0.8,
                reg_alpha=0.1,
                reg_lambda=0.1,
                boosting_type='gbdt',
                objective='binary',
                random_state=self.random_state,
                verbose=-1
            )
        
        # Highly optimized XGBoost
        if XGBOOST_AVAILABLE:
            models['xgboost'] = xgb.XGBClassifier(
                n_estimators=1000,
                max_depth=10,
                learning_rate=0.03,
                subsample=0.8,
                colsample_bytree=0.8,
                reg_alpha=0.1,
                reg_lambda=0.1,
                random_state=self.random_state,
                eval_metric='logloss'
            )
        
        # Optimized Neural Network
        models['neural_network'] = MLPClassifier(
            hidden_layer_sizes=(300, 150, 75),
            activation='relu',
            solver='adam',
            alpha=0.0001,
            learning_rate='adaptive',
            max_iter=2000,
            early_stopping=True,
            validation_fraction=0.1,
            random_state=self.random_state
        )
        
        # Optimized SVM
        models['svm'] = SVC(
            C=100.0,
            kernel='rbf',
            gamma='scale',
            probability=True,
            random_state=self.random_state
        )
        
        # Extra Trees (often performs well)
        models['extra_trees'] = ExtraTreesClassifier(
            n_estimators=500,
            max_depth=25,
            min_samples_split=2,
            min_samples_leaf=1,
            max_features='sqrt',
            bootstrap=True,
            random_state=self.random_state,
            n_jobs=-1
        )
        
        return models
    
    def apply_smote(self, X: pd.DataFrame, y: np.ndarray) -> Tuple[pd.DataFrame, np.ndarray]:
        """Apply SMOTE for class balancing"""
        if not SMOTE_AVAILABLE:
            logger.warning("SMOTE not available, skipping class balancing")
            return X, y
        
        logger.info("Applying SMOTE for class balancing...")
        smote = SMOTE(random_state=self.random_state, k_neighbors=2)
        X_resampled, y_resampled = smote.fit_resample(X, y)
        
        logger.info(f"SMOTE: {len(X)} -> {len(X_resampled)} samples")
        logger.info(f"Class distribution: {dict(zip(*np.unique(y_resampled, return_counts=True)))}")
        
        return pd.DataFrame(X_resampled, columns=X.columns), y_resampled
    
    def train_high_performance_models(self, X_train: pd.DataFrame, y_train: np.ndarray, 
                                   X_val: pd.DataFrame, y_val: np.ndarray) -> Dict[str, Any]:
        """Train high-performance models"""
        logger.info("Training high-performance models...")
        
        # Apply SMOTE
        X_train_balanced, y_train_balanced = self.apply_smote(X_train, y_train)
        
        # Create robust scaler
        self.scaler = RobustScaler()
        X_train_scaled = self.scaler.fit_transform(X_train_balanced)
        X_val_scaled = self.scaler.transform(X_val)
        
        # Convert back to DataFrame
        X_train_scaled = pd.DataFrame(X_train_scaled, columns=X_train_balanced.columns, index=X_train_balanced.index)
        X_val_scaled = pd.DataFrame(X_val_scaled, columns=X_val.columns, index=X_val.index)
        
        models = self.create_high_performance_models()
        results = {}
        
        for name, model in models.items():
            try:
                logger.info(f"Training {name}...")
                
                # Train model
                model.fit(X_train_scaled, y_train_balanced)
                
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
    
    def create_super_ensemble(self, base_results: Dict[str, Any], 
                            X_train: pd.DataFrame, y_train: np.ndarray) -> Any:
        """Create super ensemble with multiple levels"""
        logger.info("Creating super ensemble...")
        
        # Prepare base models
        base_models = []
        for name, result in base_results.items():
            if 'model' in result:
                base_models.append((name, result['model']))
        
        if len(base_models) < 2:
            logger.warning("Not enough base models for ensemble")
            return None
        
        # Level 1: Voting Classifier (Soft voting)
        voting_clf = VotingClassifier(
            estimators=base_models,
            voting='soft'
        )
        
        # Level 2: Stacking with Random Forest meta-learner
        stacking_clf = StackingClassifier(
            estimators=base_models,
            final_estimator=RandomForestClassifier(
                n_estimators=200,
                max_depth=10,
                random_state=self.random_state
            ),
            cv=5,
            stack_method='predict_proba'
        )
        
        # Level 3: Stacking with LightGBM meta-learner (if available)
        if LIGHTGBM_AVAILABLE:
            super_stacking_clf = StackingClassifier(
                estimators=base_models,
                final_estimator=lgb.LGBMClassifier(
                    n_estimators=200,
                    max_depth=8,
                    learning_rate=0.1,
                    random_state=self.random_state,
                    verbose=-1
                ),
                cv=5,
                stack_method='predict_proba'
            )
        else:
            super_stacking_clf = stacking_clf
        
        # Train super ensemble
        X_train_scaled = self.scaler.transform(X_train)
        super_stacking_clf.fit(X_train_scaled, y_train)
        
        return super_stacking_clf
    
    def evaluate_super_ensemble(self, results: Dict[str, Any], ensemble_model: Any,
                               X_test: pd.DataFrame, y_test: np.ndarray) -> Dict[str, Any]:
        """Evaluate super ensemble models"""
        logger.info("Evaluating super ensemble...")
        
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
        
        # Evaluate super ensemble
        if ensemble_model is not None:
            y_pred_ensemble = ensemble_model.predict(X_test_scaled)
            y_pred_proba_ensemble = ensemble_model.predict_proba(X_test_scaled)[:, 1]
            
            accuracy_ensemble = accuracy_score(y_test, y_pred_ensemble)
            auc_ensemble = roc_auc_score(y_test, y_pred_proba_ensemble)
            
            eval_results['super_ensemble'] = {
                'accuracy': accuracy_ensemble,
                'auc': auc_ensemble,
                'predictions': y_pred_ensemble,
                'probabilities': y_pred_proba_ensemble
            }
            
            logger.info(f"Super Ensemble Test: Accuracy={accuracy_ensemble:.4f}, AUC={auc_ensemble:.4f}")
        
        return eval_results
    
    def save_super_models(self, results: Dict[str, Any], ensemble_model: Any, 
                         output_dir: str, eval_results: Dict[str, Any]):
        """Save super models and results"""
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
        
        # Save individual models
        for name, result in results.items():
            if 'model' in result:
                model_path = output_path / f"{name}_model.pkl"
                import pickle
                with open(model_path, 'wb') as f:
                    pickle.dump(result['model'], f)
        
        # Save ensemble model
        if ensemble_model is not None:
            ensemble_path = output_path / "super_ensemble.pkl"
            import pickle
            with open(ensemble_path, 'wb') as f:
                pickle.dump(ensemble_model, f)
        
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
            'techniques_used': ['SMOTE', 'Conservative Feature Engineering', 'Super Ensemble Methods']
        }
        
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2)
        
        logger.info(f"Super models saved to {output_dir}")
        logger.info(f"Best model: {best_model_name} (AUC: {best_auc:.4f}, Accuracy: {best_accuracy:.4f})")

def main():
    parser = argparse.ArgumentParser(description='Train conservative high-accuracy models')
    parser.add_argument('--data_file', type=str, required=True, help='Path to DARWIN dataset CSV')
    parser.add_argument('--output_dir', type=str, required=True, help='Output directory for models')
    parser.add_argument('--test_size', type=float, default=0.2, help='Test set size')
    parser.add_argument('--val_size', type=float, default=0.2, help='Validation set size')
    parser.add_argument('--n_features', type=int, default=50, help='Number of features to select')
    parser.add_argument('--random_state', type=int, default=42, help='Random state')
    
    args = parser.parse_args()
    
    # Initialize trainer
    trainer = ConservativeHighAccuracyTrainer(random_state=args.random_state)
    
    # Load data
    X, y = trainer.load_data(args.data_file)
    
    # Create conservative features
    X_enhanced = trainer.create_conservative_features(X)
    
    # Conservative feature selection
    X_selected, _ = trainer.conservative_feature_selection(
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
    
    # Train high-performance models
    results = trainer.train_high_performance_models(X_train, y_train, X_val, y_val)
    
    # Create super ensemble
    ensemble_model = trainer.create_super_ensemble(results, X_train, y_train)
    
    # Evaluate ensemble
    eval_results = trainer.evaluate_super_ensemble(results, ensemble_model, X_test, y_test)
    
    # Save models
    trainer.save_super_models(results, ensemble_model, args.output_dir, eval_results)
    
    # Print final results
    logger.info("\n" + "="*70)
    logger.info("CONSERVATIVE HIGH-ACCURACY TRAINING RESULTS")
    logger.info("="*70)
    
    for name, result in eval_results.items():
        logger.info(f"{name:25s}: AUC={result['auc']:.4f}, Accuracy={result['accuracy']:.4f}")
    
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
        logger.info("Consider: More data, different algorithms, or ensemble methods")

if __name__ == "__main__":
    main()
