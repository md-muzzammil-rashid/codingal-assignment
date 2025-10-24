from django.urls import path
from .views import student_overview, student_recommendation, create_attempt, analyze_code, get_course, get_lesson

urlpatterns=[
    path('students/<int:pk>/overview/',student_overview),
    path('students/<int:pk>/recommendation/',student_recommendation),
    path('attempts/',create_attempt),
    path('analyze-code/',analyze_code),
    path('courses/<int:pk>/', get_course, name='get_course'),
    path('lesson/<int:pk>/', get_lesson, name='get_lesson'),
    path('attempts', create_attempt, name='create_attempt'),

]

