"""
ML Models Package
Contains simple working models for API integration
"""

from .simple_winner import SimpleWinnerModel
from .demo_classifier import DemoClassifier

__all__ = [
    'SimpleWinnerModel',
    'DemoClassifier'
]

__version__ = '3.0.0'
__author__ = 'Stroke AI Team'
__description__ = 'Production stroke detection models'

def get_recommended_model():
    """Returns the recommended model for most use cases"""
    print("✅ Using SimpleWinnerModel (pre-trained ResNet34 + U-Net)")
    return SimpleWinnerModel

def get_recommended_classifier():
    """Returns the recommended classifier"""
    print("✅ Using DemoClassifier")
    return DemoClassifier