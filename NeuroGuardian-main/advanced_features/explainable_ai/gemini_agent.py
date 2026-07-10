from google import genai
from google.genai import types
from django.conf import settings
from datetime import datetime
import json
import logging

logger = logging.getLogger('api')

class GeminiMedicalAgent:
    """
    Acts as an AI Neurologist utilizing Google's Gemini API to generate
    patient-friendly and clinical reports based on raw ML model outputs.
    """
    def __init__(self):
        self.api_key = getattr(settings, 'GEMINI_API_KEY', None)
        self.client = None
        if self.api_key and self.api_key != 'YOUR_GEMINI_API_KEY_HERE':
            try:
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.error(f"Failed to initialize Gemini Client: {e}")
        else:
            logger.warning("No valid GEMINI_API_KEY found in settings. Gemini features will run in fallback mode.")

    def _generate_report(self, prompt: str) -> str:
        """Internal helper to call Gemini"""
        if not self.client:
            return None
            
        try:
           # Using gemini-2.5-flash as it's the standard multimodal model
            response = self.client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.3, # Keep it clinical and deterministic
                    system_instruction="You are NeuroGuardian AI, an expert neuro-radiologist and stroke specialist. Generate patient-friendly yet clinically accurate reports."
                )
            )
            return response.text
        except Exception as e:
            logger.error(f"Error during Gemini generation: {e}")
            return None

    def generate_scan_report(self, classification: dict, emergency: dict) -> str:
        """
        Takes CV classification results and generates a highly detailed medical report in Markdown format.
        """
        if not self.client:
            # Fallback text format
            class_type = classification.get('type', 'Unknown')
            confidence = classification.get('confidence', 0)
            fallback_report = f"""
## 🏥 NEUROGUARDIAN CLINICAL ANALYSIS
**Date:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
**Stroke Type:** {class_type.upper()}
**Severity:** {classification.get('severity', 'UNKNOWN')}
**Confidence:** {confidence * 100:.1f}%
**Estimated Lesion Volume:** {classification.get('volume_ml', 0):.2f} mL

### ⚡ Emergency Action
**{emergency.get('action', 'Immediate Medical Attention Required')}**

### 📋 Clinical Instructions
"""
            for inst in emergency.get('instructions', []):
                fallback_report += f"- {inst}\n"
            return fallback_report

        prompt = f"""
        Analyze the following NeuroGuardian ML model imaging results for a patient brain scan.
        
        [Analysis Data]
        - Detected Stroke Type: {classification.get('type')}
        - Severity Level: {classification.get('severity')}
        - Estimated Lesion Volume: {classification.get('volume_ml')} mL
        - Model Confidence: {classification.get('confidence', 0)*100:.2f}%
        - Recommended Action: {classification.get('recommendation')}
        
        [Emergency Priority]
        - {emergency.get('action', 'Routine')}
        
        Write a beautifully formatted Markdown medical report. It must include:
        1. A `# 🏥 NeuroGuardian AI Clinical Report` header.
        2. A `## 👨‍⚕️ Clinical Summary` section for the doctor.
        3. A `## 🧑‍🤝‍🧑 Patient Explanation` section explaining the results calmly and clearly to the patient.
        4. A `## ⚡ Action Plan` based on the severity.
        
        Make it sound highly professional, empathetic, and urgent if necessary. Return ONLY the Markdown text.
        """
        
        response_text = self._generate_report(prompt)
        
        if not response_text:
            return self.generate_scan_report(classification, emergency)
            
        return response_text
