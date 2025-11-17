# Alzheimer's Handwriting Analysis - Model Training Pipeline

This directory contains scripts and notebooks for training machine learning models on exported handwriting assessment data.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Export assessment data from the web interface (Dashboard → Export Data)

3. Place exported JSON files in `data/raw/` directory

## Training Pipeline

1. **Data Loading & Preprocessing** (`01_data_preparation.py`)
   - Load exported JSON sessions
   - Extract engineered features from handwriting data
   - Handle missing values and outliers
   - Create train/validation/test splits

2. **Feature Engineering** (`02_feature_engineering.py`)
   - Compute kinematic features (velocity, acceleration, jerk)
   - Calculate spatial features (curvature, symmetry, proportions)
   - Extract temporal patterns (pauses, hesitations)
   - Normalize features by device type and user demographics

3. **Model Training** (`03_model_training.py`)
   - Train baseline models (Logistic Regression, XGBoost, LightGBM)
   - Cross-validation and hyperparameter tuning
   - Model comparison and selection
   - Calibration of probability outputs

4. **Evaluation & Validation** (`04_model_evaluation.py`)
   - Performance metrics (ROC-AUC, PR-AUC, calibration curves)
   - Feature importance analysis
   - Fairness evaluation across demographics
   - Threshold selection for risk categories

5. **Model Deployment** (`05_model_export.py`)
   - Export trained model artifacts
   - Generate model metadata and version info
   - Create deployment package for web interface

## Usage

Run the complete pipeline:
```bash
python run_training_pipeline.py --data_dir data/raw --output_dir models/
```

Or run individual steps:
```bash
python 01_data_preparation.py
python 02_feature_engineering.py
python 03_model_training.py
python 04_model_evaluation.py
python 05_model_export.py
```

## Output

- `models/`: Trained model artifacts (`.pkl`, `.json`)
- `results/`: Evaluation metrics and plots
- `logs/`: Training logs and experiment tracking
