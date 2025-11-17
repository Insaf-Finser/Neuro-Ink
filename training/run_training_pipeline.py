#!/usr/bin/env python3
"""
Alzheimer's Handwriting Analysis - Complete Training Pipeline
Runs the entire training pipeline from data preparation to model export.
"""

import subprocess
import sys
from pathlib import Path
import logging
import argparse

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def run_script(script_path: str, args: list = None):
    """Run a Python script with given arguments."""
    cmd = [sys.executable, script_path]
    if args:
        cmd.extend(args)
    
    logger.info(f"Running: {' '.join(cmd)}")
    result = subprocess.run(cmd, capture_output=True, text=True)
    
    if result.returncode != 0:
        logger.error(f"Script {script_path} failed:")
        logger.error(f"STDOUT: {result.stdout}")
        logger.error(f"STDERR: {result.stderr}")
        return False
    
    logger.info(f"Script {script_path} completed successfully")
    if result.stdout:
        logger.info(f"Output: {result.stdout}")
    
    return True

def main():
    parser = argparse.ArgumentParser(description='Run complete training pipeline')
    parser.add_argument('--data_dir', default='data/raw', help='Directory containing exported JSON files')
    parser.add_argument('--output_dir', default='models/', help='Output directory for trained models')
    parser.add_argument('--skip_data_prep', action='store_true', help='Skip data preparation step')
    parser.add_argument('--skip_feature_eng', action='store_true', help='Skip feature engineering step')
    parser.add_argument('--skip_training', action='store_true', help='Skip model training step')
    parser.add_argument('--skip_evaluation', action='store_true', help='Skip model evaluation step')
    parser.add_argument('--skip_export', action='store_true', help='Skip model export step')
    
    args = parser.parse_args()
    
    # Create necessary directories
    Path('data/processed').mkdir(parents=True, exist_ok=True)
    Path('results').mkdir(parents=True, exist_ok=True)
    Path(args.output_dir).mkdir(parents=True, exist_ok=True)
    
    logger.info("Starting Alzheimer's Handwriting Analysis Training Pipeline")
    logger.info("=" * 60)
    
    # Step 1: Data Preparation
    if not args.skip_data_prep:
        logger.info("Step 1: Data Preparation")
        logger.info("-" * 30)
        if not run_script('01_data_preparation.py', ['--data_dir', args.data_dir]):
            logger.error("Data preparation failed. Stopping pipeline.")
            return 1
    else:
        logger.info("Skipping data preparation")
    
    # Step 2: Feature Engineering
    if not args.skip_feature_eng:
        logger.info("\nStep 2: Feature Engineering")
        logger.info("-" * 30)
        if not run_script('02_feature_engineering.py'):
            logger.error("Feature engineering failed. Stopping pipeline.")
            return 1
    else:
        logger.info("Skipping feature engineering")
    
    # Step 3: Model Training
    if not args.skip_training:
        logger.info("\nStep 3: Model Training")
        logger.info("-" * 30)
        if not run_script('03_model_training.py', ['--output_dir', args.output_dir]):
            logger.error("Model training failed. Stopping pipeline.")
            return 1
    else:
        logger.info("Skipping model training")
    
    # Step 4: Model Evaluation
    if not args.skip_evaluation:
        logger.info("\nStep 4: Model Evaluation")
        logger.info("-" * 30)
        if not run_script('04_model_evaluation.py', ['--models_dir', args.output_dir]):
            logger.error("Model evaluation failed. Stopping pipeline.")
            return 1
    else:
        logger.info("Skipping model evaluation")
    
    # Step 5: Model Export
    if not args.skip_export:
        logger.info("\nStep 5: Model Export")
        logger.info("-" * 30)
        if not run_script('05_model_export.py', ['--models_dir', args.output_dir]):
            logger.error("Model export failed. Stopping pipeline.")
            return 1
    else:
        logger.info("Skipping model export")
    
    logger.info("\n" + "=" * 60)
    logger.info("Training pipeline completed successfully!")
    logger.info(f"Models saved to: {args.output_dir}")
    logger.info("Web deployment files saved to: web_models/")
    logger.info("Evaluation results saved to: results/")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())
