from rest_framework import serializers
from Remote_User.models import stroke_risk_prediction_type, ClientRegister_Model
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']

class PatientSerializer(serializers.ModelSerializer):
    # Remove the user field or add it to fields
    # user = UserSerializer(read_only=True)
    
    class Meta:
        model = ClientRegister_Model
        fields = ['id', 'username', 'email', 'phoneno', 'country', 'state', 'city', 'address', 'gender']
        # If you want to include user, uncomment the line below and add 'user' to fields
        # fields = ['id', 'username', 'email', 'phoneno', 'country', 'state', 'city', 'address', 'gender', 'user']

class PredictionSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)
    
    class Meta:
        model = stroke_risk_prediction_type
        fields = '__all__'

class PredictionHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = stroke_risk_prediction_type
        fields = ['idn', 'age', 'hypertension', 'heart_disease', 'Prediction', 'created_at']

class PredictRequestSerializer(serializers.Serializer):
    idn = serializers.CharField(required=False, allow_blank=True)
    gender = serializers.ChoiceField(choices=['Male', 'Female'])
    age = serializers.IntegerField(min_value=0, max_value=120)
    hypertension = serializers.ChoiceField(choices=[(0, 'No'), (1, 'Yes')])
    heart_disease = serializers.ChoiceField(choices=[(0, 'No'), (1, 'Yes')])
    ever_married = serializers.ChoiceField(choices=['Yes', 'No'])
    work_type = serializers.ChoiceField(choices=['Private', 'Self-employed', 'Govt_job', 'children'])
    residence_type = serializers.ChoiceField(choices=['Urban', 'Rural'], source='Residence_type', required=False)
    avg_glucose_level = serializers.FloatField(min_value=0, max_value=300)
    bmi = serializers.FloatField(min_value=10, max_value=60)
    smoking_status = serializers.ChoiceField(choices=['never smoked', 'formerly smoked', 'smokes'])
    
    def to_internal_value(self, data):
        # Handle both field names
        data_copy = data.copy() if hasattr(data, 'copy') else dict(data)
        
        # Map residence_type to Residence_type
        if 'residence_type' in data_copy and 'Residence_type' not in data_copy:
            data_copy['Residence_type'] = data_copy['residence_type']
        elif 'Residence_type' in data_copy and 'residence_type' not in data_copy:
            data_copy['residence_type'] = data_copy['Residence_type']
        
        return super().to_internal_value(data_copy)
    
    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Convert back if needed
        if 'Residence_type' in instance:
            ret['residence_type'] = instance['Residence_type']
        return ret
    
    def validate(self, attrs):
        # Ensure Residence_type is set
        if 'Residence_type' not in attrs and 'residence_type' in attrs:
            attrs['Residence_type'] = attrs['residence_type']
        elif 'Residence_type' not in attrs:
            raise serializers.ValidationError({"residence_type": "This field is required."})
        return attrs

class AlertSerializer(serializers.Serializer):
    patient_id = serializers.IntegerField()
    risk_level = serializers.CharField()
    message = serializers.CharField()
    timestamp = serializers.DateTimeField()