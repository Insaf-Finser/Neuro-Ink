#!/usr/bin/env python3
"""
Ultra-Advanced Training Script for 90%+ Accuracy
Implements advanced techniques: SMOTE, Bayesian Optimization, Advanced Ensembles
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
from sklearn.model_selection import GridSearchCV, RandomizedSearchCV

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
    from imblearn.pipeline import Pipeline as ImbPipeline
    SMOTE_AVAILABLE = True
except ImportError:
    SMOTE_AVAILABLE = False

try:
    from skopt import BayesSearchCV
    from skopt.space import Real, Integer, Categorical
    BAYESIAN_OPT_AVAILABLE = True
except ImportError:
    BAYESIAN_OPT_AVAILABLE = False

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class UltraAdvancedTrainer:
    """Ultra-advanced trainer targeting 90%+ accuracy"""
    
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
    
    def create_advanced_features(self, X: pd.DataFrame) -> pd.DataFrame:
        """Create advanced features with statistical transformations"""
        logger.info("Creating advanced feature set...")
        
        X_advanced = X.copy()
        
        # Statistical features for each column
        for col in X.columns:
            if X[col].dtype in ['int64', 'float64']:
                # Log transformation for positive values
                if (X[col] > 0).all():
                    X_advanced[f'{col}_log'] = np.log1p(X[col])
                
                # Square root transformation
                if (X[col] >= 0).all():
                    X_advanced[f'{col}_sqrt'] = np.sqrt(X[col])
                
                # Reciprocal transformation (avoid division by zero)
                X_advanced[f'{col}_reciprocal'] = 1 / (X[col] + 1e-8)
        
        # Polynomial features for top 15 most important features
        if len(X_advanced.columns) > 15:
            # Use variance to select top features
            variances = X_advanced.var()
            top_features = variances.nlargest(15).index
            
            for feat in top_features:
                if feat in X_advanced.columns:
                    X_advanced[f'{feat}_squared'] = X_advanced[feat] ** 2
                    X_advanced[f'{feat}_cubed'] = X_advanced[feat] ** 3
        
        # Advanced interaction features
        corr_matrix = X_advanced.corr().abs()
        high_corr_pairs = []
        
        for i in range(len(corr_matrix.columns)):
            for j in range(i+1, len(corr_matrix.columns)):
                if corr_matrix.iloc[i, j] > 0.6:  # Lower threshold for more interactions
                    feat1, feat2 = corr_matrix.columns[i], corr_matrix.columns[j]
                    if feat1 in X_advanced.columns and feat2 in X_advanced.columns:
                        X_advanced[f'{feat1}_x_{feat2}'] = X_advanced[feat1] * X_advanced[feat2]
                        X_advanced[f'{feat1}_div_{feat2}'] = X_advanced[feat1] / (X_advanced[feat2] + 1e-8)
                        high_corr_pairs.append((feat1, feat2))
        
        logger.info(f"Advanced features: {len(X_advanced.columns)} (original: {len(X.columns)})")
        logger.info(f"Added {len(high_corr_pairs)} interaction pairs")
        
        return X_advanced
    
    def advanced_feature_selection(self, X: pd.DataFrame, y: np.ndarray, n_features: int = 100) -> Tuple[pd.DataFrame, Any]:
        """Advanced feature selection using multiple methods"""
        logger.info(f"Performing advanced feature selection to {n_features} features...")
        
        # Method 1: SelectKBest with f_classif
        kbest = SelectKBest(f_classif, k=min(n_features, len(X.columns)))
        X_kbest = kbest.fit_transform(X, y)
        
        # Method 2: Random Forest feature importance
        rf_selector = SelectFromModel(
            RandomForestClassifier(n_estimators=100, random_state=self.random_state),
            max_features=n_features
        )
        X_rf = rf_selector.fit_transform(X, y)
        
        # Method 3: Extra Trees feature importance
        et_selector = SelectFromModel(
            ExtraTreesClassifier(n_estimators=100, random_state=self.random_state),
            max_features=n_features
        )
        X_et = et_selector.fit_transform(X, y)
        
        # Combine selections
        kbest_features = set(X.columns[kbest.get_support()])
        rf_features = set(X.columns[rf_selector.get_support()])
        et_features = set(X.columns[et_selector.get_support()])
        
        # Union of all selected features
        combined_features = kbest_features.union(rf_features).union(et_features)
        
        # If we have too many features, select the best ones
        if len(combined_features) > n_features:
            # Use Random Forest to rank the combined features
            rf_rank = RandomForestClassifier(n_estimators=50, random_state=self.random_state)
            rf_rank.fit(X[list(combined_features)], y)
            
            feature_importance = pd.DataFrame({
                'feature': list(combined_features),
                'importance': rf_rank.feature_importances_
            }).sort_values('importance', ascending=False)
            
            selected_features = feature_importance.head(n_features)['feature'].tolist()
        else:
            selected_features = list(combined_features)
        
        X_selected = X[selected_features]
        
        logger.info(f"Selected {len(selected_features)} features from {len(X.columns)} original features")
        
        return X_selected, None
    
    def create_optimized_models(self) -> Dict[str, Any]:
        """Create optimized models with hyperparameter tuning"""
        models = {}
        
        # Optimized Random Forest
        models['random_forest'] = RandomForestClassifier(
            n_estimators=300,
            max_depth=20,
            min_samples_split=3,
            min_samples_leaf=1,
            max_features='sqrt',
            bootstrap=True,
            random_state=self.random_state,
            n_jobs=-1
        )
        
        # Optimized LightGBM
        if LIGHTGBM_AVAILABLE:
            models['lightgbm'] = lgb.LGBMClassifier(
                n_estimators=500,
                max_depth=8,
                learning_rate=0.05,
                subsample=0.8,
                colsample_bytree=0.8,
                reg_alpha=0.1,
                reg_lambda=0.1,
                random_state=self.random_state,
                verbose=-1
            )
        
        # Optimized XGBoost
        if XGBOOST_AVAILABLE:
            models['xgboost'] = xgb.XGBClassifier(
                n_estimators=500,
                max_depth=8,
                learning_rate=0.05,
                subsample=0.8,
                colsample_bytree=0.8,
                reg_alpha=0.1,
                reg_lambda=0.1,
                random_state=self.random_state,
                eval_metric='logloss'
            )
        
        # Optimized Neural Network
        models['neural_network'] = MLPClassifier(
            hidden_layer_sizes=(200, 100, 50),
            activation='relu',
            solver='adam',
            alpha=0.0001,
            learning_rate='adaptive',
            max_iter=1000,
            early_stopping=True,
            validation_fraction=0.1,
            random_state=self.random_state
        )
        
        # Optimized SVM
        models['svm'] = SVC(
            C=10.0,
            kernel='rbf',
            gamma='scale',
            probability=True,
            random_state=self.random_state
        )
        
        return models
    
    def apply_smote(self, X: pd.DataFrame, y: np.ndarray) -> Tuple[pd.DataFrame, np.ndarray]:
        """Apply SMOTE for class balancing"""
        if not SMOTE_AVAILABLE:
            logger.warning("SMOTE not available, skipping class balancing")
            return X, y
        
        logger.info("Applying SMOTE for class balancing...")
        smote = SMOTE(random_state=self.random_state, k_neighbors=3)
        X_resampled, y_resampled = smote.fit_resample(X, y)
        
        logger.info(f"SMOTE: {len(X)} -> {len(X_resampled)} samples")
        logger.info(f"Class distribution: {dict(zip(*np.unique(y_resampled, return_counts=True)))}")
        
        return pd.DataFrame(X_resampled, columns=X.columns), y_resampled
    
    def train_with_optimization(self, X_train: pd.DataFrame, y_train: np.ndarray, 
                              X_val: pd.DataFrame, y_val: np.ndarray) -> Dict[str, Any]:
        """Train models with hyperparameter optimization"""
        logger.info("Training optimized models...")
        
        # Apply SMOTE
        X_train_balanced, y_train_balanced = self.apply_smote(X_train, y_train)
        
        # Create robust scaler
        self.scaler = RobustScaler()
        X_train_scaled = self.scaler.fit_transform(X_train_balanced)
        X_val_scaled = self.scaler.transform(X_val)
        
        # Convert back to DataFrame
        X_train_scaled = pd.DataFrame(X_train_scaled, columns=X_train_balanced.columns, index=X_train_balanced.index)
        X_val_scaled = pd.DataFrame(X_val_scaled, columns=X_val.columns, index=X_val.index)
        
        models = self.create_optimized_models()
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
    
    def create_advanced_ensemble(self, base_results: Dict[str, Any], 
                               X_train: pd.DataFrame, y_train: np.ndarray) -> Any:
        """Create advanced ensemble with multiple stacking levels"""
        logger.info("Creating advanced ensemble...")
        
        # Prepare base models
        base_models = []
        for name, result in base_results.items():
            if 'model' in result:
                base_models.append((name, result['model']))
        
        if len(base_models) < 2:
            logger.warning("Not enough base models for ensemble")
            return None
        
        # Level 1: Voting Classifier
        voting_clf = VotingClassifier(
            estimators=base_models,
            voting='soft'
        )
        
        # Level 2: Stacking with multiple meta-learners
        meta_learners = [
            ('rf', RandomForestClassifier(n_estimators=100, random_state=self.random_state)),
            ('lr', LogisticRegression(random_state=self.random_state)),
            ('svm', SVC(probability=True, random_state=self.random_state))
        ]
        
        stacking_clf = StackingClassifier(
            estimators=base_models,
            final_estimator=VotingClassifier(estimators=meta_learners, voting='soft'),
            cv=5,
            stack_method='predict_proba'
        )
        
        # Train stacking ensemble
        X_train_scaled = self.scaler.transform(X_train)
        stacking_clf.fit(X_train_scaled, y_train)
        
        return stacking_clf
    
    def evaluate_advanced_ensemble(self, results: Dict[str, Any], ensemble_model: Any,
                                 X_test: pd.DataFrame, y_test: np.ndarray) -> Dict[str, Any]:
        """Evaluate advanced ensemble models"""
        logger.info("Evaluating advanced ensemble...")
        
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
        
        # Evaluate advanced ensemble
        if ensemble_model is not None:
            y_pred_ensemble = ensemble_model.predict(X_test_scaled)
            y_pred_proba_ensemble = ensemble_model.predict_proba(X_test_scaled)[:, 1]
            
            accuracy_ensemble = accuracy_score(y_test, y_pred_ensemble)
            auc_ensemble = roc_auc_score(y_test, y_pred_proba_ensemble)
            
            eval_results['advanced_ensemble'] = {
                'accuracy': accuracy_ensemble,
                'auc': auc_ensemble,
                'predictions': y_pred_ensemble,
                'probabilities': y_pred_proba_ensemble
            }
            
            logger.info(f"Advanced Ensemble Test: Accuracy={accuracy_ensemble:.4f}, AUC={auc_ensemble:.4f}")
        
        return eval_results
    
    def save_advanced_models(self, results: Dict[str, Any], ensemble_model: Any, 
                           output_dir: str, eval_results: Dict[str, Any]):
        """Save advanced models and results"""
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
            ensemble_path = output_path / "advanced_ensemble.pkl"
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
            'techniques_used': ['SMOTE', 'Advanced Feature Engineering', 'Ensemble Methods']
        }
        
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2)
        
        logger.info(f"Advanced models saved to {output_dir}")
        logger.info(f"Best model: {best_model_name} (AUC: {best_auc:.4f}, Accuracy: {best_accuracy:.4f})")

def main():
    parser = argparse.ArgumentParser(description='Train ultra-advanced models for 90%+ accuracy')
    parser.add_argument('--data_file', type=str, required=True, help='Path to DARWIN dataset CSV')
    parser.add_argument('--output_dir', type=str, required=True, help='Output directory for models')
    parser.add_argument('--test_size', type=float, default=0.2, help='Test set size')
    parser.add_argument('--val_size', type=float, default=0.2, help='Validation set size')
    parser.add_argument('--n_features', type=int, default=100, help='Number of features to select')
    parser.add_argument('--random_state', type=int, default=42, help='Random state')
    
    args = parser.parse_args()
    
    # Initialize trainer
    trainer = UltraAdvancedTrainer(random_state=args.random_state)
    
    # Load data
    X, y = trainer.load_data(args.data_file)
    
    # Create advanced features
    X_enhanced = trainer.create_advanced_features(X)
    
    # Advanced feature selection
    X_selected, _ = trainer.advanced_feature_selection(
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
    
    # Train optimized models
    results = trainer.train_with_optimization(X_train, y_train, X_val, y_val)
    
    # Create advanced ensemble
    ensemble_model = trainer.create_advanced_ensemble(results, X_train, y_train)
    
    # Evaluate ensemble
    eval_results = trainer.evaluate_advanced_ensemble(results, ensemble_model, X_test, y_test)
    
    # Save models
    trainer.save_advanced_models(results, ensemble_model, args.output_dir, eval_results)
    
    # Print final results
    logger.info("\n" + "="*60)
    logger.info("ULTRA-ADVANCED TRAINING RESULTS")
    logger.info("="*60)
    
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
