"""stroke_risk_prediction URL Configuration"""
from django.urls import re_path, path, include  # Add 'include' here
from django.contrib import admin
from Remote_User import views as remoteuser
from stroke_risk_prediction import settings
from Service_Provider import views as serviceprovider
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    re_path(r'^$', remoteuser.login, name='login'),
    re_path(r'^Register1/$', remoteuser.Register1, name='Register1'),
    re_path(r'^Predict_Stroke_risk_Prediction_Type/$', remoteuser.Predict_Stroke_risk_Prediction_Type, name='Predict_Stroke_risk_Prediction_Type'),
    re_path(r'^ViewYourProfile/$', remoteuser.ViewYourProfile, name='ViewYourProfile'),
    re_path(r'^serviceproviderlogin/$', serviceprovider.serviceproviderlogin, name='serviceproviderlogin'),
    re_path(r'^View_Remote_Users/$', serviceprovider.View_Remote_Users, name='View_Remote_Users'),
    re_path(r'^charts/(?P<chart_type>\w+)', serviceprovider.charts, name='charts'),
    re_path(r'^charts1/(?P<chart_type>\w+)', serviceprovider.charts1, name='charts1'),
    re_path(r'^likeschart/(?P<like_chart>\w+)', serviceprovider.likeschart, name='likeschart'),
    re_path(r'^View_Stroke_Risk_Prediction_Type_Ratio/$', serviceprovider.View_Stroke_Risk_Prediction_Type_Ratio, name='View_Stroke_Risk_Prediction_Type_Ratio'),
    re_path(r'^train_model/$', serviceprovider.train_model, name='train_model'),
    re_path(r'^View_Stroke_Risk_Prediction_Type/$', serviceprovider.View_Stroke_Risk_Prediction_Type, name='View_Stroke_Risk_Prediction_Type'),
    re_path(r'^Download_Trained_DataSets/$', serviceprovider.Download_Trained_DataSets, name='Download_Trained_DataSets'),
    path('api/', include('api.urls')),

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
