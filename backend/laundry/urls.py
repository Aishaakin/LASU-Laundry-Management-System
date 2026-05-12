from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('auth/register/',               views.RegisterView.as_view()),
    path('auth/login/',                  views.LoginView.as_view()),
    path('auth/logout/',                 views.LogoutView.as_view()),
    path('auth/token/refresh/',          TokenRefreshView.as_view()),
    path('auth/password/reset/',         views.PasswordResetRequestView.as_view()),
    path('auth/password/reset/confirm/', views.PasswordResetConfirmView.as_view()),
    path('auth/password/change/',        views.ChangePasswordView.as_view()),
    path('auth/profile/',                views.ProfileView.as_view()),
    path('profile/locations/',           views.SavedLocationListCreateView.as_view()),
    path('profile/locations/<int:pk>/',  views.SavedLocationDetailView.as_view()),
    path('services/',                    views.ServiceListView.as_view()),
    path('items/',                       views.ClothingItemListView.as_view()),
    path('dashboard/',                   views.dashboard_stats),
]
