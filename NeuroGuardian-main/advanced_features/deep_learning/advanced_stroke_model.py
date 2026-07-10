"""
Advanced Stroke Prediction Model
Combines Deep Learning with Explainable AI
"""

import numpy as np
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers, models
import joblib
import shap
import matplotlib.pyplot as plt
import io
import base64
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
import os

class AdvancedStrokePredictor:
    """
    Hybrid model for stroke prediction with explainability
    """
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoders = {}
        self.explainer = None
        self.feature_names = [
            'gender', 'age', 'hypertension', 'heart_disease',
            'ever_married', 'work_type', 'Residence_type',
            'avg_glucose_level', 'bmi', 'smoking_status'
        ]
        
    def preprocess_data(self, df):
        """
        Preprocess the input data
        """
        df_processed = df.copy()
        
        # Handle categorical variables
        categorical_cols = ['gender', 'ever_married', 'work_type', 
                           'Residence_type', 'smoking_status']
        
        for col in categorical_cols:
            if col in df_processed.columns:
                if col not in self.label_encoders:
                    self.label_encoders[col] = LabelEncoder()
                    df_processed[col] = self.label_encoders[col].fit_transform(
                        df_processed[col].astype(str)
                    )
                else:
                    df_processed[col] = self.label_encoders[col].transform(
                        df_processed[col].astype(str)
                    )
        
        # Handle numerical columns
        numerical_cols = ['age', 'hypertension', 'heart_disease', 
                         'avg_glucose_level', 'bmi']
        
        # Fill missing values
        for col in numerical_cols:
            if col in df_processed.columns:
                df_processed[col] = pd.to_numeric(df_processed[col], errors='coerce')
                df_processed[col] = df_processed[col].fillna(df_processed[col].median())
        
        return df_processed
    
    def build_deep_model(self, input_dim):
        """
        Build a deep neural network for stroke prediction
        """
        model = models.Sequential([
            # Input layer with batch normalization
            layers.Input(shape=(input_dim,)),
            layers.BatchNormalization(),
            
            # Hidden layer 1
            layers.Dense(256, activation='relu'),
            layers.Dropout(0.3),
            layers.BatchNormalization(),
            
            # Hidden layer 2
            layers.Dense(128, activation='relu'),
            layers.Dropout(0.2),
            layers.BatchNormalization(),
            
            # Hidden layer 3
            layers.Dense(64, activation='relu'),
            layers.Dropout(0.2),
            layers.BatchNormalization(),
            
            # Hidden layer 4
            layers.Dense(32, activation='relu'),
            layers.Dropout(0.1),
            
            # Output layer
            layers.Dense(1, activation='sigmoid')
        ])
        
        # Compile model
        model.compile(
            optimizer=keras.optimizers.Adam(learning_rate=0.001),
            loss='binary_crossentropy',
            metrics=['accuracy', tf.keras.metrics.AUC(), tf.keras.metrics.Precision(), tf.keras.metrics.Recall()]
        )
        
        return model
    
    def train(self, X, y, epochs=50, validation_split=0.2):
        """
        Train the model with advanced features
        """
        # Preprocess data
        if isinstance(X, pd.DataFrame):
            self.feature_names = X.columns.tolist()
            X_processed = self.preprocess_data(X)
        else:
            X_processed = X
        
        # Split data
        X_train, X_val, y_train, y_val = train_test_split(
            X_processed, y, test_size=validation_split, random_state=42, stratify=y
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_val_scaled = self.scaler.transform(X_val)
        
        # Build model
        self.model = self.build_deep_model(X_train_scaled.shape[1])
        
        # Callbacks
        callbacks = [
            keras.callbacks.EarlyStopping(
                monitor='val_loss',
                patience=10,
                restore_best_weights=True
            ),
            keras.callbacks.ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=0.00001
            ),
            keras.callbacks.ModelCheckpoint(
                'best_stroke_model.h5',
                monitor='val_accuracy',
                save_best_only=True
            )
        ]
        
        # Train
        history = self.model.fit(
            X_train_scaled, y_train,
            validation_data=(X_val_scaled, y_val),
            epochs=epochs,
            batch_size=32,
            callbacks=callbacks,
            verbose=1
        )
        
        # Load best model
        self.model = keras.models.load_model('best_stroke_model.h5')
        
        # Create explainer
        self.explainer = shap.KernelExplainer(
            self.model.predict, 
            X_train_scaled[:100]  # Use subset for efficiency
        )
        
        return history
    
    def predict(self, patient_data, explain=False):
        """
        Predict stroke risk with optional explanation
        """
        # Preprocess
        if isinstance(patient_data, dict):
            patient_df = pd.DataFrame([patient_data])
        else:
            patient_df = patient_data.copy()
        
        # Preprocess
        patient_processed = self.preprocess_data(patient_df)
        patient_scaled = self.scaler.transform(patient_processed)
        
        # Predict
        risk_score = self.model.predict(patient_scaled, verbose=0)[0][0]
        
        result = {
            'risk_score': float(risk_score),
            'risk_level': self._get_risk_level(risk_score),
            'probability': f"{risk_score * 100:.2f}%"
        }
        
        # Add explanation if requested
        if explain and self.explainer:
            shap_values = self.explainer.shap_values(patient_scaled)
            # Pass both patient data and shap values
            result['explanation'] = self._generate_explanation(
                shap_values, patient_df.iloc[0]
            )
            result['shap_plot'] = self._get_shap_plot(shap_values, patient_df.iloc[0])
        
        return result
    
    def _get_risk_level(self, score):
        """Convert score to risk level"""
        if score < 0.3:
            return "LOW RISK"
        elif score < 0.6:
            return "MODERATE RISK"
        elif score < 0.8:
            return "HIGH RISK"
        else:
            return "CRITICAL RISK"
    
    def _generate_explanation(self, shap_values, patient_data):
        """Generate human-readable explanation"""
        # Handle different SHAP output formats
        if isinstance(shap_values, list):
            # For binary classification, shap_values is a list of two arrays
            # We want the values for class 1 (stroke)
            shap_vals = shap_values[1][0] if len(shap_values) > 1 else shap_values[0][0]
        else:
            shap_vals = shap_values[0]
        
        # Ensure we have a 1D array
        if hasattr(shap_vals, 'shape') and len(shap_vals.shape) > 1:
            shap_vals = shap_vals.flatten()
        
        feature_impacts = list(zip(self.feature_names, shap_vals))
        feature_impacts.sort(key=lambda x: abs(x[1]), reverse=True)
        
        top_factors = feature_impacts[:3]
        
        explanation = {
            'summary': "Based on the analysis, here are the top factors:",
            'factors': []
        }
        
        for feature, impact in top_factors:
            # Convert impact to scalar
            if hasattr(impact, 'item'):
                impact_value = impact.item()
            else:
                impact_value = float(impact) if np.isscalar(impact) else float(np.array(impact).flatten()[0])
            
            direction = "increases" if impact_value > 0 else "decreases"
            explanation['factors'].append({
                'feature': feature,
                'impact': impact_value,
                'direction': direction,
                'value': str(patient_data[feature]) if feature in patient_data else 'N/A'
            })
        
        return explanation
    
    def _get_shap_plot(self, shap_values, patient_data):
        """Generate SHAP plot as base64 image"""
        try:
            # Handle different SHAP output formats
            if isinstance(shap_values, list):
                # For binary classification, take the values for class 1 (stroke)
                shap_vals = shap_values[1] if len(shap_values) > 1 else shap_values[0]
            else:
                shap_vals = shap_values
            
            # Extract the first sample if we have multiple
            if hasattr(shap_vals, 'shape') and len(shap_vals.shape) > 1:
                if shap_vals.shape[0] > 1:
                    shap_vals = shap_vals[0]
                if len(shap_vals.shape) > 1 and shap_vals.shape[-1] > 1:
                    shap_vals = shap_vals[..., 0]  # Take first output for binary
            
            # Create explanation object
            explanation = shap.Explanation(
                values=shap_vals,
                base_values=self.explainer.expected_value if not isinstance(self.explainer.expected_value, list) 
                          else self.explainer.expected_value[1],
                data=patient_data.values,
                feature_names=self.feature_names
            )
            
            # Create plot
            plt.figure(figsize=(10, 6))
            shap.waterfall_plot(explanation, show=False, max_display=10)
            
            # Convert plot to base64
            buf = io.BytesIO()
            plt.savefig(buf, format='png', bbox_inches='tight', dpi=100)
            buf.seek(0)
            image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
            plt.close()
            
            return f"data:image/png;base64,{image_base64}"
        
        except Exception as e:
            print(f"SHAP plot error: {e}")
            # Return None if plot fails
            return None
    
    def save_model(self, path='advanced_models'):
        """Save model and preprocessors"""
        os.makedirs(path, exist_ok=True)
        
        # Save Keras model
        self.model.save(f'{path}/stroke_model.keras')
        
        # Save scaler and encoders
        joblib.dump(self.scaler, f'{path}/scaler.pkl')
        joblib.dump(self.label_encoders, f'{path}/label_encoders.pkl')
        
        print(f"Model saved to {path}/")
    
    def load_model(self, path='advanced_models'):
        """Load saved model"""
        self.model = keras.models.load_model(f'{path}/stroke_model.keras')
        self.scaler = joblib.load(f'{path}/scaler.pkl')
        self.label_encoders = joblib.load(f'{path}/label_encoders.pkl')
        print("Model loaded successfully")