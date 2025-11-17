# Alzheimer's Handwriting Analysis - Training Notebook

This Jupyter notebook demonstrates the complete training pipeline for the Alzheimer's handwriting analysis model.

## Setup

First, install the required dependencies:

```bash
pip install -r requirements.txt
```

## Overview

The training pipeline consists of 5 main steps:

1. **Data Preparation**: Load exported assessment data and extract basic features
2. **Feature Engineering**: Compute advanced handwriting features (kinematics, spatial, temporal, pressure)
3. **Model Training**: Train baseline models (Logistic Regression, XGBoost, LightGBM)
4. **Model Evaluation**: Evaluate model performance and generate metrics
5. **Model Export**: Export models for web deployment

## Usage

### Option 1: Run Complete Pipeline

```bash
python run_training_pipeline.py --data_dir data/raw --output_dir models/
```

### Option 2: Run Individual Steps

```bash
# Step 1: Data preparation
python 01_data_preparation.py --data_dir data/raw

# Step 2: Feature engineering
python 02_feature_engineering.py

# Step 3: Model training
python 03_model_training.py --output_dir models/

# Step 4: Model evaluation
python 04_model_evaluation.py --models_dir models/

# Step 5: Model export
python 05_model_export.py --models_dir models/
```

### Option 3: Interactive Notebook

Open `training_notebook.ipynb` in Jupyter for interactive exploration.

## Data Requirements

The training pipeline expects exported assessment data in JSON format. To export data:

1. Run the web interface
2. Complete some assessments (or use synthetic data)
3. Go to Dashboard → Export Data
4. Place the exported JSON file in `data/raw/`

## Output Files

- `models/`: Trained model artifacts (`.pkl`, `.json`)
- `web_models/`: Web deployment files
- `results/`: Evaluation metrics and plots
- `data/processed/`: Processed datasets

## Model Performance

The pipeline trains and compares multiple models:

- **Logistic Regression**: Linear baseline with interpretable coefficients
- **XGBoost**: Gradient boosting with high performance
- **LightGBM**: Fast gradient boosting alternative

Performance is evaluated using:
- ROC-AUC (Area Under ROC Curve)
- Average Precision
- Calibration curves
- Feature importance analysis

## Deployment

The exported models can be integrated into the web interface:

1. Copy `web_models/` files to `public/models/` in the web app
2. Update `aiAnalysisService.ts` to load the trained model
3. Replace heuristic scoring with ML predictions

## Next Steps

1. Collect real assessment data with ground truth labels
2. Implement more sophisticated feature engineering
3. Experiment with deep learning models
4. Add cross-validation and hyperparameter tuning
5. Implement model versioning and A/B testing
