"""
Test script for AdvancedStrokePredictor
"""

import sys
import os

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

try:
    from advanced_features.deep_learning.advanced_stroke_model import AdvancedStrokePredictor
    print("✅ Successfully imported AdvancedStrokePredictor")
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Trying alternative import...")
    from deep_learning.advanced_stroke_model import AdvancedStrokePredictor

import pandas as pd
import numpy as np

# Create sample data
print("Creating sample data...")
np.random.seed(42)
n_samples = 1000

sample_data = pd.DataFrame({
    'gender': np.random.choice(['Male', 'Female'], n_samples),
    'age': np.random.randint(20, 90, n_samples),
    'hypertension': np.random.choice([0, 1], n_samples, p=[0.7, 0.3]),
    'heart_disease': np.random.choice([0, 1], n_samples, p=[0.8, 0.2]),
    'ever_married': np.random.choice(['Yes', 'No'], n_samples),
    'work_type': np.random.choice(['Private', 'Self-employed', 'Govt_job'], n_samples),
    'Residence_type': np.random.choice(['Urban', 'Rural'], n_samples),
    'avg_glucose_level': np.random.uniform(70, 250, n_samples),
    'bmi': np.random.uniform(15, 50, n_samples),
    'smoking_status': np.random.choice(['never smoked', 'formerly smoked', 'smokes'], n_samples)
})

# Create target (stroke) - more likely with age, hypertension, etc.
sample_data['stroke'] = (
    (sample_data['age'] > 60) & 
    (sample_data['hypertension'] == 1) & 
    (np.random.random(n_samples) > 0.5)
).astype(int)

print("Initializing model...")
model = AdvancedStrokePredictor()

print("Training model...")
X = sample_data.drop('stroke', axis=1)
y = sample_data['stroke']

try:
    history = model.train(X, y, epochs=10)  # Small epochs for testing
    print("\n" + "="*50)
    print("MODEL TRAINING COMPLETE")
    print("="*50)
except Exception as e:
    print(f"Training error: {e}")
    import traceback
    traceback.print_exc()

# Test prediction
print("\nTesting prediction on a sample patient...")
test_patient = {
    'gender': 'Male',
    'age': 65,
    'hypertension': 1,
    'heart_disease': 0,
    'ever_married': 'Yes',
    'work_type': 'Private',
    'Residence_type': 'Urban',
    'avg_glucose_level': 145.6,
    'bmi': 28.5,
    'smoking_status': 'formerly smoked'
}

try:
    result = model.predict(test_patient, explain=True)
    
    print(f"\nRisk Score: {result['risk_score']:.3f}")
    print(f"Risk Level: {result['risk_level']}")
    print(f"Probability: {result['probability']}")
    
    if 'explanation' in result:
        print("\n" + "="*50)
        print("EXPLANATION")
        print("="*50)
        print(result['explanation']['summary'])
        for factor in result['explanation']['factors']:
            print(f"- {factor['feature']}: {factor['direction']} risk (value: {factor['value']})")
except Exception as e:
    print(f"Prediction error: {e}")
    import traceback
    traceback.print_exc()

# Save model
print("\nSaving model...")
try:
    model.save_model()
    print("\n✅ Test complete!")
except Exception as e:
    print(f"Save error: {e}")