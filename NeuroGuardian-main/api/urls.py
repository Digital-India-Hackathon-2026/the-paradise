from django.urls import path
from . import views

urlpatterns = [
    # Health check
    path('health/', views.health_check, name='health_check'),

    # Authentication
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),

    # Prediction
    path('predict/', views.predict, name='predict'),
    path('history/', views.get_history, name='history'),
    path('stats/', views.get_stats, name='stats'),
    
    # Scan Upload and Hospitals
    path('upload-scan/', views.upload_scan, name='upload_scan'),
    path('hospitals/', views.get_hospitals, name='get_hospitals'),
]