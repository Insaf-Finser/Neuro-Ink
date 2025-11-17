#!/usr/bin/env python3
"""
Alzheimer's Handwriting Analysis - Data Preparation
Loads exported assessment data and prepares it for training.
"""

import json
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Any
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DataLoader:
    def __init__(self, data_dir: str):
        self.data_dir = Path(data_dir)
        self.sessions = []
        
    def load_sessions(self) -> List[Dict[str, Any]]:
        """Load all exported session files."""
        json_files = list(self.data_dir.glob("*.json"))
        logger.info(f"Found {len(json_files)} JSON files")
        
        for file_path in json_files:
            try:
                with open(file_path, 'r') as f:
                    data = json.load(f)
                    if isinstance(data, list):
                        self.sessions.extend(data)
                    else:
                        self.sessions.append(data)
                logger.info(f"Loaded {file_path.name}")
            except Exception as e:
                logger.error(f"Failed to load {file_path}: {e}")
                
        logger.info(f"Total sessions loaded: {len(self.sessions)}")
        return self.sessions
    
    def extract_features(self, session: Dict[str, Any]) -> Dict[str, Any]:
        """Extract features from a single session."""
        features = {
            'session_id': session.get('id', 'unknown'),
            'test_type': session.get('testType', 'unknown'),
            'created_at': session.get('createdAt', 0),
        }
        
        # Extract handwriting data if available
        data = session.get('data', {})
        if 'strokes' in data:
            strokes = data['strokes']
            features.update(self._compute_stroke_features(strokes))
            
        return features
    
    def _compute_stroke_features(self, strokes: List[Dict]) -> Dict[str, float]:
        """Compute basic stroke features."""
        if not strokes:
            return {}
            
        features = {}
        
        # Basic counts
        features['stroke_count'] = len(strokes)
        features['total_points'] = sum(len(stroke.get('points', [])) for stroke in strokes)
        
        # Timing features
        durations = []
        for stroke in strokes:
            if 'startTime' in stroke and 'endTime' in stroke:
                durations.append(stroke['endTime'] - stroke['startTime'])
        
        if durations:
            features['stroke_duration_mean'] = np.mean(durations)
            features['stroke_duration_std'] = np.std(durations)
            features['total_drawing_time'] = sum(durations)
        
        # Pressure features (if available)
        pressures = []
        for stroke in strokes:
            points = stroke.get('points', [])
            for point in points:
                if 'pressure' in point:
                    pressures.append(point['pressure'])
        
        if pressures:
            features['pressure_mean'] = np.mean(pressures)
            features['pressure_std'] = np.std(pressures)
            features['pressure_min'] = np.min(pressures)
            features['pressure_max'] = np.max(pressures)
        
        return features
    
    def create_dataset(self) -> pd.DataFrame:
        """Create a pandas DataFrame from all sessions."""
        if not self.sessions:
            self.load_sessions()
            
        rows = []
        for session in self.sessions:
            features = self.extract_features(session)
            rows.append(features)
            
        df = pd.DataFrame(rows)
        logger.info(f"Created dataset with {len(df)} rows and {len(df.columns)} columns")
        return df

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Prepare assessment data for training')
    parser.add_argument('--data_dir', default='data/raw', help='Directory containing exported JSON files')
    parser.add_argument('--output_dir', default='data/processed', help='Output directory for processed data')
    
    args = parser.parse_args()
    
    # Create output directory
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Load and process data
    loader = DataLoader(args.data_dir)
    df = loader.create_dataset()
    
    # Save processed data
    output_file = output_dir / 'processed_sessions.csv'
    df.to_csv(output_file, index=False)
    logger.info(f"Saved processed data to {output_file}")
    
    # Print basic statistics
    print("\nDataset Statistics:")
    print(f"Total sessions: {len(df)}")
    print(f"Test types: {df['test_type'].value_counts().to_dict()}")
    print(f"Features: {list(df.columns)}")

if __name__ == "__main__":
    main()
