#!/usr/bin/env python3
"""
Generate synthetic assessment data for training pipeline demonstration
"""

import json
import random
import time
from datetime import datetime, timedelta

def generate_synthetic_session(session_id: str, test_type: str, risk_level: float = 0.3) -> dict:
    """Generate synthetic session data."""
    
    # Base timestamp
    base_time = int(time.time() * 1000) - random.randint(0, 86400000)  # Within last day
    
    # Generate strokes based on risk level
    num_strokes = random.randint(5, 15)
    strokes = []
    
    for i in range(num_strokes):
        # Risk affects stroke quality
        stroke_points = random.randint(10, 50)
        points = []
        
        start_time = base_time + i * 1000
        end_time = start_time + random.randint(500, 2000)
        
        # Generate points
        for j in range(stroke_points):
            timestamp = start_time + (j / stroke_points) * (end_time - start_time)
            
            # Add some noise based on risk level
            noise_factor = risk_level * 0.1
            
            point = {
                'x': random.uniform(100, 400) + random.gauss(0, noise_factor * 20),
                'y': random.uniform(100, 400) + random.gauss(0, noise_factor * 20),
                'pressure': random.uniform(0.3, 1.0) + random.gauss(0, noise_factor * 0.2),
                'timestamp': timestamp,
                'tiltX': random.uniform(-30, 30) if random.random() > 0.5 else None,
                'tiltY': random.uniform(-30, 30) if random.random() > 0.5 else None,
                'rotation': random.uniform(0, 360) if random.random() > 0.5 else None
            }
            points.append(point)
        
        stroke = {
            'points': points,
            'startTime': start_time,
            'endTime': end_time
        }
        strokes.append(stroke)
    
    # Session data
    session_data = {
        'strokes': strokes,
        'totalTime': sum(s['endTime'] - s['startTime'] for s in strokes),
        'canvasSize': {'width': 500, 'height': 500}
    }
    
    return {
        'id': session_id,
        'testType': test_type,
        'createdAt': base_time,
        'data': session_data
    }

def main():
    """Generate synthetic dataset."""
    sessions = []
    
    # Generate sessions for different test types
    test_types = ['clockDrawing', 'wordRecall', 'imageAssociation', 'selectionMemory']
    
    for i in range(50):  # 50 sessions total
        test_type = random.choice(test_types)
        
        # Vary risk levels (0.1 = low risk, 0.9 = high risk)
        risk_level = random.uniform(0.1, 0.9)
        
        session_id = f"session_{i:03d}_{test_type}"
        session = generate_synthetic_session(session_id, test_type, risk_level)
        sessions.append(session)
    
    # Save to file
    output_file = 'data/raw/synthetic_sessions.json'
    with open(output_file, 'w') as f:
        json.dump(sessions, f, indent=2)
    
    print(f"Generated {len(sessions)} synthetic sessions")
    print(f"Saved to {output_file}")
    
    # Print summary
    test_counts = {}
    for session in sessions:
        test_type = session['testType']
        test_counts[test_type] = test_counts.get(test_type, 0) + 1
    
    print("\nTest type distribution:")
    for test_type, count in test_counts.items():
        print(f"  {test_type}: {count} sessions")

if __name__ == "__main__":
    main()
