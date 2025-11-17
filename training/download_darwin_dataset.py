#!/usr/bin/env python3
"""
DARWIN Dataset Downloader and Processor
Downloads and processes the DARWIN handwriting dataset for Alzheimer's detection
"""

import pandas as pd
import numpy as np
import requests
import zipfile
import os
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

class DarwinDatasetProcessor:
    def __init__(self, data_dir: str = "data/darwin"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
    def download_darwin_dataset(self):
        """Download DARWIN dataset from UCI ML Repository."""
        url = "https://archive.ics.uci.edu/ml/machine-learning-databases/00732/darwin.zip"
        
        logger.info("Downloading DARWIN dataset...")
        try:
            response = requests.get(url, stream=True)
            response.raise_for_status()
            
            zip_path = self.data_dir / "darwin.zip"
            with open(zip_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            logger.info(f"Downloaded dataset to {zip_path}")
            
            # Extract the zip file
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(self.data_dir)
            
            logger.info("Dataset extracted successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to download dataset: {e}")
            return False
    
    def load_darwin_data(self):
        """Load DARWIN dataset."""
        # Look for the main data file
        data_files = list(self.data_dir.glob("*.csv"))
        if not data_files:
            logger.error("No CSV files found in DARWIN dataset")
            return None
        
        # Load the main dataset
        df = pd.read_csv(data_files[0])
        logger.info(f"Loaded DARWIN dataset: {df.shape[0]} samples, {df.shape[1]} features")
        
        return df
    
    def preprocess_darwin_data(self, df: pd.DataFrame):
        """Preprocess DARWIN dataset for training."""
        logger.info("Preprocessing DARWIN dataset...")
        
        # Remove any rows with missing target labels
        if 'Diagnosis' in df.columns:
            df = df.dropna(subset=['Diagnosis'])
            logger.info(f"After removing missing labels: {df.shape[0]} samples")
        
        # Handle missing values in features
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
        
        # Create binary target (1 = Alzheimer's, 0 = Healthy)
        if 'Diagnosis' in df.columns:
            df['target'] = (df['Diagnosis'] == 'AD').astype(int)
            logger.info(f"Target distribution: {df['target'].value_counts().to_dict()}")
        
        return df
    
    def create_feature_groups(self, df: pd.DataFrame):
        """Group features by type for analysis."""
        feature_groups = {
            'temporal': [col for col in df.columns if any(x in col.lower() for x in ['time', 'duration', 'air', 'paper'])],
            'kinematic': [col for col in df.columns if any(x in col.lower() for x in ['speed', 'velocity', 'acceleration', 'jerk'])],
            'pressure': [col for col in df.columns if any(x in col.lower() for x in ['pressure', 'force'])],
            'spatial': [col for col in df.columns if any(x in col.lower() for x in ['distance', 'area', 'size', 'width', 'height'])],
            'tremor': [col for col in df.columns if any(x in col.lower() for x in ['tremor', 'frequency', 'oscillation'])]
        }
        
        logger.info("Feature groups:")
        for group, features in feature_groups.items():
            logger.info(f"  {group}: {len(features)} features")
        
        return feature_groups
    
    def save_processed_data(self, df: pd.DataFrame, output_file: str = "darwin_processed.csv"):
        """Save processed dataset."""
        output_path = self.data_dir / output_file
        df.to_csv(output_path, index=False)
        logger.info(f"Saved processed data to {output_path}")
        return output_path

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Download and process DARWIN dataset')
    parser.add_argument('--data_dir', default='data/darwin', help='Directory to save DARWIN data')
    parser.add_argument('--skip_download', action='store_true', help='Skip download if data already exists')
    
    args = parser.parse_args()
    
    # Initialize processor
    processor = DarwinDatasetProcessor(args.data_dir)
    
    # Download dataset if needed
    if not args.skip_download:
        if not processor.download_darwin_dataset():
            logger.error("Failed to download dataset")
            return 1
    
    # Load and process data
    df = processor.load_darwin_data()
    if df is None:
        logger.error("Failed to load dataset")
        return 1
    
    # Preprocess data
    df_processed = processor.preprocess_darwin_data(df)
    
    # Analyze feature groups
    feature_groups = processor.create_feature_groups(df_processed)
    
    # Save processed data
    processor.save_processed_data(df_processed)
    
    # Print summary
    print("\nDARWIN Dataset Summary:")
    print(f"Total samples: {len(df_processed)}")
    print(f"Total features: {len(df_processed.columns)}")
    if 'target' in df_processed.columns:
        print(f"Target distribution: {df_processed['target'].value_counts().to_dict()}")
    
    return 0

if __name__ == "__main__":
    main()
