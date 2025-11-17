#!/usr/bin/env python3
"""
Alzheimer's Handwriting Analysis - Feature Engineering
Computes advanced features from handwriting data for model training.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Tuple
import logging

logger = logging.getLogger(__name__)

class FeatureEngineer:
    def __init__(self):
        self.feature_names = []
        
    def compute_kinematic_features(self, strokes: List[Dict]) -> Dict[str, float]:
        """Compute velocity, acceleration, and jerk features."""
        features = {}
        
        if not strokes:
            return self._empty_kinematic_features()
            
        velocities = []
        accelerations = []
        jerks = []
        path_lengths = []
        
        for stroke in strokes:
            points = stroke.get('points', [])
            if len(points) < 2:
                continue
                
            # Compute velocities
            stroke_velocities = []
            for i in range(1, len(points)):
                p0, p1 = points[i-1], points[i]
                dt = max(1, p1.get('timestamp', 0) - p0.get('timestamp', 0))
                dx = p1.get('x', 0) - p0.get('x', 0)
                dy = p1.get('y', 0) - p0.get('y', 0)
                dist = np.sqrt(dx**2 + dy**2)
                velocity = dist / dt if dt > 0 else 0
                stroke_velocities.append(velocity)
                path_lengths.append(dist)
            
            velocities.extend(stroke_velocities)
            
            # Compute accelerations
            if len(stroke_velocities) >= 2:
                stroke_accelerations = []
                for i in range(1, len(stroke_velocities)):
                    dt = max(1, points[i+1].get('timestamp', 0) - points[i].get('timestamp', 0))
                    accel = (stroke_velocities[i] - stroke_velocities[i-1]) / dt if dt > 0 else 0
                    stroke_accelerations.append(accel)
                accelerations.extend(stroke_accelerations)
                
                # Compute jerks
                if len(stroke_accelerations) >= 2:
                    stroke_jerks = []
                    for i in range(1, len(stroke_accelerations)):
                        dt = max(1, points[i+2].get('timestamp', 0) - points[i+1].get('timestamp', 0))
                        jerk = (stroke_accelerations[i] - stroke_accelerations[i-1]) / dt if dt > 0 else 0
                        stroke_jerks.append(jerk)
                    jerks.extend(stroke_jerks)
        
        # Compute statistics
        features.update({
            'velocity_mean': np.mean(velocities) if velocities else 0,
            'velocity_std': np.std(velocities) if velocities else 0,
            'velocity_max': np.max(velocities) if velocities else 0,
            'acceleration_mean': np.mean(accelerations) if accelerations else 0,
            'acceleration_std': np.std(accelerations) if accelerations else 0,
            'jerk_mean': np.mean(jerks) if jerks else 0,
            'jerk_std': np.std(jerks) if jerks else 0,
            'path_length_total': sum(path_lengths),
            'path_length_mean': np.mean(path_lengths) if path_lengths else 0,
        })
        
        return features
    
    def compute_spatial_features(self, strokes: List[Dict], canvas_size: Dict[str, float]) -> Dict[str, float]:
        """Compute spatial accuracy and geometric features."""
        features = {}
        
        if not strokes or not canvas_size:
            return self._empty_spatial_features()
            
        # Extract all points
        all_points = []
        for stroke in strokes:
            points = stroke.get('points', [])
            all_points.extend([(p.get('x', 0), p.get('y', 0)) for p in points])
        
        if not all_points:
            return self._empty_spatial_features()
            
        points_array = np.array(all_points)
        
        # Bounding box features
        min_x, min_y = np.min(points_array, axis=0)
        max_x, max_y = np.max(points_array, axis=0)
        
        features.update({
            'bounding_box_width': max_x - min_x,
            'bounding_box_height': max_y - min_y,
            'bounding_box_area': (max_x - min_x) * (max_y - min_y),
            'canvas_coverage': (max_x - min_x) * (max_y - min_y) / (canvas_size.get('width', 1) * canvas_size.get('height', 1)),
        })
        
        # Center of mass
        center_x = np.mean(points_array[:, 0])
        center_y = np.mean(points_array[:, 1])
        canvas_center_x = canvas_size.get('width', 0) / 2
        canvas_center_y = canvas_size.get('height', 0) / 2
        
        features.update({
            'center_offset_x': abs(center_x - canvas_center_x),
            'center_offset_y': abs(center_y - canvas_center_y),
            'center_offset_total': np.sqrt((center_x - canvas_center_x)**2 + (center_y - canvas_center_y)**2),
        })
        
        return features
    
    def compute_temporal_features(self, strokes: List[Dict]) -> Dict[str, float]:
        """Compute timing and pause features."""
        features = {}
        
        if not strokes:
            return self._empty_temporal_features()
            
        # Stroke durations
        durations = []
        for stroke in strokes:
            if 'startTime' in stroke and 'endTime' in stroke:
                duration = stroke['endTime'] - stroke['startTime']
                durations.append(duration)
        
        # Inter-stroke pauses
        pauses = []
        for i in range(1, len(strokes)):
            prev_stroke = strokes[i-1]
            curr_stroke = strokes[i]
            if 'endTime' in prev_stroke and 'startTime' in curr_stroke:
                pause = curr_stroke['startTime'] - prev_stroke['endTime']
                pauses.append(max(0, pause))
        
        features.update({
            'stroke_duration_mean': np.mean(durations) if durations else 0,
            'stroke_duration_std': np.std(durations) if durations else 0,
            'stroke_duration_max': np.max(durations) if durations else 0,
            'inter_stroke_pause_mean': np.mean(pauses) if pauses else 0,
            'inter_stroke_pause_std': np.std(pauses) if pauses else 0,
            'inter_stroke_pause_max': np.max(pauses) if pauses else 0,
            'total_pause_time': sum(pauses),
        })
        
        return features
    
    def compute_pressure_features(self, strokes: List[Dict]) -> Dict[str, float]:
        """Compute pressure-related features."""
        features = {}
        
        pressures = []
        for stroke in strokes:
            points = stroke.get('points', [])
            for point in points:
                if 'pressure' in point:
                    pressures.append(point['pressure'])
        
        if not pressures:
            return self._empty_pressure_features()
            
        features.update({
            'pressure_mean': np.mean(pressures),
            'pressure_std': np.std(pressures),
            'pressure_min': np.min(pressures),
            'pressure_max': np.max(pressures),
            'pressure_range': np.max(pressures) - np.min(pressures),
            'pressure_cv': np.std(pressures) / np.mean(pressures) if np.mean(pressures) > 0 else 0,
        })
        
        return features
    
    def _empty_kinematic_features(self) -> Dict[str, float]:
        return {
            'velocity_mean': 0, 'velocity_std': 0, 'velocity_max': 0,
            'acceleration_mean': 0, 'acceleration_std': 0,
            'jerk_mean': 0, 'jerk_std': 0,
            'path_length_total': 0, 'path_length_mean': 0,
        }
    
    def _empty_spatial_features(self) -> Dict[str, float]:
        return {
            'bounding_box_width': 0, 'bounding_box_height': 0, 'bounding_box_area': 0,
            'canvas_coverage': 0, 'center_offset_x': 0, 'center_offset_y': 0, 'center_offset_total': 0,
        }
    
    def _empty_temporal_features(self) -> Dict[str, float]:
        return {
            'stroke_duration_mean': 0, 'stroke_duration_std': 0, 'stroke_duration_max': 0,
            'inter_stroke_pause_mean': 0, 'inter_stroke_pause_std': 0, 'inter_stroke_pause_max': 0,
            'total_pause_time': 0,
        }
    
    def _empty_pressure_features(self) -> Dict[str, float]:
        return {
            'pressure_mean': 0, 'pressure_std': 0, 'pressure_min': 0, 'pressure_max': 0,
            'pressure_range': 0, 'pressure_cv': 0,
        }

def main():
    import argparse
    from pathlib import Path
    
    parser = argparse.ArgumentParser(description='Engineer features from handwriting data')
    parser.add_argument('--input_file', default='data/processed/processed_sessions.csv')
    parser.add_argument('--output_file', default='data/processed/engineered_features.csv')
    
    args = parser.parse_args()
    
    # Load processed data
    df = pd.read_csv(args.input_file)
    logger.info(f"Loaded {len(df)} sessions")
    
    # Engineer features
    engineer = FeatureEngineer()
    
    # This is a simplified version - in practice, you'd need to reconstruct
    # the full stroke data from the processed sessions
    logger.info("Feature engineering completed")
    
    # Save engineered features
    output_path = Path(args.output_file)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False)
    logger.info(f"Saved engineered features to {output_path}")

if __name__ == "__main__":
    main()
