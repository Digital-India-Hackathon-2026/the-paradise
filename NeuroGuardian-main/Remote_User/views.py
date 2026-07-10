from django.db.models import Count
from django.db.models import Q
from django.shortcuts import render, redirect, get_object_or_404
import datetime
import openpyxl
import numpy as np
import pandas as pd

# ============================================
# ADVANCED MODEL IMPORTS
# ============================================
import sys
import os
from pathlib import Path

# Add project root to Python path to find advanced_features
sys.path.insert(0, str(Path(__file__).parent.parent))

try:
    from advanced_features.deep_learning.advanced_stroke_model import AdvancedStrokePredictor
    ADVANCED_MODEL_AVAILABLE = True
    print("✅ Advanced model loaded successfully")
except ImportError as e:
    ADVANCED_MODEL_AVAILABLE = False
    print(f"⚠️ Advanced model not available: {e}")
    from sklearn.ensemble import RandomForestClassifier  # fallback

# ============================================
# MACHINE LEARNING IMPORTS
# ============================================
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import VotingClassifier
from sklearn.metrics import confusion_matrix, accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import MultinomialNB
from sklearn import svm
from sklearn.linear_model import LogisticRegression

# ============================================
# MODELS IMPORTS
# ============================================
from Remote_User.models import ClientRegister_Model, stroke_risk_prediction_type, detection_ratio, detection_accuracy

# ============================================
# LOAD ADVANCED MODEL
# ============================================
advanced_model = None
if ADVANCED_MODEL_AVAILABLE:
    try:
        advanced_model = AdvancedStrokePredictor()
        model_path = Path(__file__).parent.parent / 'advanced_models'
        if model_path.exists():
            advanced_model.load_model(str(model_path))
            print(f"✅ Model loaded from {model_path}")
        else:
            print(f"⚠️ Model not found at {model_path}. Train it first with: python -m advanced_features.test_model")
            advanced_model = None
    except Exception as e:
        print(f"⚠️ Error loading model: {e}")
        advanced_model = None

# ============================================
# VIEW FUNCTIONS
# ============================================

def login(request):
    """User login view"""
    if request.method == "POST" and 'submit1' in request.POST:
        username = request.POST.get('username')
        password = request.POST.get('password')
        try:
            enter = ClientRegister_Model.objects.get(username=username, password=password)
            request.session["userid"] = enter.id
            return redirect('ViewYourProfile')
        except:
            pass
    return render(request, 'RUser/login.html')

def Add_DataSet_Details(request):
    """Add dataset details view"""
    return render(request, 'RUser/Add_DataSet_Details.html', {"excel_data": ''})

def Register1(request):
    """User registration view"""
    if request.method == "POST":
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        phoneno = request.POST.get('phoneno')
        country = request.POST.get('country')
        state = request.POST.get('state')
        city = request.POST.get('city')
        address = request.POST.get('address')
        gender = request.POST.get('gender')
        
        ClientRegister_Model.objects.create(
            username=username, 
            email=email, 
            password=password, 
            phoneno=phoneno,
            country=country, 
            state=state, 
            city=city, 
            address=address, 
            gender=gender
        )
        obj = "Registered Successfully"
        return render(request, 'RUser/Register1.html', {'object': obj})
    else:
        return render(request, 'RUser/Register1.html')

def ViewYourProfile(request):
    """View user profile"""
    userid = request.session['userid']
    obj = ClientRegister_Model.objects.get(id=userid)
    return render(request, 'RUser/ViewYourProfile.html', {'object': obj})

def Predict_Stroke_risk_Prediction_Type(request):
    """Predict stroke risk from form data"""
    if request.method == "POST":
        # Get form data
        idn = request.POST.get('idn', '')
        gender = request.POST.get('gender', '')
        age = request.POST.get('age', '0')
        hypertension = request.POST.get('hypertension', '0')
        heart_disease = request.POST.get('heart_disease', '0')
        ever_married = request.POST.get('ever_married', '')
        work_type = request.POST.get('work_type', '')
        residence_type = request.POST.get('Residence_type', '')
        avg_glucose_level = request.POST.get('avg_glucose_level', '0')
        bmi = request.POST.get('bmi', '0')
        smoking_status = request.POST.get('smoking_status', '')

        # Try using advanced model first
        global advanced_model
        if advanced_model is not None:
            try:
                # Prepare patient data for advanced model
                patient_data = {
                    'gender': gender,
                    'age': float(age) if age else 0,
                    'hypertension': int(hypertension) if hypertension else 0,
                    'heart_disease': int(heart_disease) if heart_disease else 0,
                    'ever_married': ever_married,
                    'work_type': work_type,
                    'Residence_type': residence_type,
                    'avg_glucose_level': float(avg_glucose_level) if avg_glucose_level else 0,
                    'bmi': float(bmi) if bmi else 0,
                    'smoking_status': smoking_status
                }
                
                # Get prediction with explanation
                result = advanced_model.predict(patient_data, explain=True)
                
                # Convert to your existing format
                if result['risk_score'] < 0.3:
                    val = 'No Risk'
                elif result['risk_score'] < 0.6:
                    val = 'Moderate Risk'
                elif result['risk_score'] < 0.8:
                    val = 'High Risk'
                else:
                    val = 'Critical Risk'
                
                # Save to database
                stroke_risk_prediction_type.objects.create(
                    idn=idn,
                    gender=gender,
                    age=age,
                    hypertension=hypertension,
                    heart_disease=heart_disease,
                    ever_married=ever_married,
                    work_type=work_type,
                    Residence_type=residence_type,
                    avg_glucose_level=avg_glucose_level,
                    bmi=bmi,
                    smoking_status=smoking_status,
                    Prediction=val
                )
                
                # Pass both prediction and explanation to template
                return render(request, 'RUser/result.html', {
                    'objs': val,
                    'advanced_result': result,
                    'from_tabular': True
                })
                
            except Exception as e:
                print(f"Advanced model error: {e}")
                # Fall back to basic model if advanced fails
                return use_basic_model(request, idn, gender, age, hypertension, heart_disease, 
                                      ever_married, work_type, residence_type, avg_glucose_level, 
                                      bmi, smoking_status)
        else:
            # Use basic model if advanced not available
            return use_basic_model(request, idn, gender, age, hypertension, heart_disease, 
                                  ever_married, work_type, residence_type, avg_glucose_level, 
                                  bmi, smoking_status)
    
    return render(request, 'RUser/Predict_Stroke_risk_Prediction_Type.html')

def use_basic_model(request, idn, gender, age, hypertension, heart_disease, ever_married, 
                   work_type, residence_type, avg_glucose_level, bmi, smoking_status):
    """Fallback function using basic ML model"""
    try:
        # Read dataset
        df = pd.read_csv('Dataset_Stroke_Data.csv', encoding='latin-1')
        
        def apply_results(label):
            if (label == 0):
                return 0  # No Risk
            elif (label == 1):
                return 1  # More Risk
        
        df['results'] = df['stroke'].apply(apply_results)
        
        x = df["id"]
        y = df["results"]
        
        # Vectorize
        cv = CountVectorizer(lowercase=False, strip_accents='unicode', ngram_range=(1, 1))
        x = cv.fit_transform(x)
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(x, y, test_size=0.20, random_state=42)
        
        # Train models
        models = []
        
        # Naive Bayes
        NB = MultinomialNB()
        NB.fit(X_train, y_train)
        models.append(('naive_bayes', NB))
        
        # SVM
        lin_clf = svm.LinearSVC()
        lin_clf.fit(X_train, y_train)
        models.append(('svm', lin_clf))
        
        # Logistic Regression
        reg = LogisticRegression(random_state=0, solver='lbfgs', max_iter=1000)
        reg.fit(X_train, y_train)
        models.append(('logistic', reg))
        
        # Decision Tree
        dtc = DecisionTreeClassifier()
        dtc.fit(X_train, y_train)
        models.append(('decision_tree', dtc))
        
        # Voting Classifier
        classifier = VotingClassifier(models)
        classifier.fit(X_train, y_train)
        
        # Predict for new data
        idn_list = [str(idn)]
        vector1 = cv.transform(idn_list).toarray()
        predict_text = classifier.predict(vector1)
        
        pred = str(predict_text).replace("[", "").replace("]", "")
        prediction = int(pred)
        
        if prediction == 0:
            val = 'No Risk'
        elif prediction == 1:
            val = 'More Risk'
        
        # Save to database
        stroke_risk_prediction_type.objects.create(
            idn=idn,
            gender=gender,
            age=age,
            hypertension=hypertension,
            heart_disease=heart_disease,
            ever_married=ever_married,
            work_type=work_type,
            Residence_type=residence_type,
            avg_glucose_level=avg_glucose_level,
            bmi=bmi,
            smoking_status=smoking_status,
            Prediction=val
        )
        
        return render(request, 'RUser/result.html', {
            'objs': val,
            'from_tabular': True
        })
        
    except Exception as e:
        print(f"Basic model error: {e}")
        return render(request, 'RUser/Predict_Stroke_risk_Prediction_Type.html', {'objs': 'Error in prediction'})