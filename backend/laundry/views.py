import threading
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.conf import settings

from .models import User, Service, ClothingItem, SavedLocation
from .serializers import (
    UserSerializer, RegisterSerializer, LoginSerializer,
    ChangePasswordSerializer, ServiceSerializer,
    ClothingItemSerializer, SavedLocationSerializer,
)


def send_email_async(func, *args):
    """Run an email function in a background thread so it never blocks the response."""
    t = threading.Thread(target=func, args=args)
    t.daemon = True
    t.start()


def get_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {'access': str(refresh.access_token), 'refresh': str(refresh)}


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        s = RegisterSerializer(data=request.data)
        if s.is_valid():
            user = s.save()
            try:
                from notifications.emails import send_welcome_email
                send_email_async(send_welcome_email, user)   # ← non-blocking now
            except Exception:
                pass
            return Response(
                {'message': 'Account created.', 'user': UserSerializer(user).data, 'tokens': get_tokens(user)},
                status=201
            )
        return Response(s.errors, status=400)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        s = LoginSerializer(data=request.data)
        if s.is_valid():
            user = s.validated_data['user']
            return Response({'user': UserSerializer(user).data, 'tokens': get_tokens(user)})
        return Response(s.errors, status=400)


class LogoutView(APIView):
    def post(self, request):
        try:
            RefreshToken(request.data['refresh']).blacklist()
            return Response({'message': 'Logged out.'})
        except Exception:
            return Response({'error': 'Invalid token.'}, status=400)


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').lower()
        try:
            user  = User.objects.get(email=email)
            uid   = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = f"{settings.FRONTEND_URL}/auth/reset-password/{uid}/{token}"
            from notifications.emails import send_password_reset_email
            send_email_async(send_password_reset_email, user, reset_url)   # ← non-blocking now
        except User.DoesNotExist:
            pass
        return Response({'message': 'Reset link sent if email exists.'})


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        uid, token   = request.data.get('uid'), request.data.get('token')
        new_pwd, confirm = request.data.get('new_password'), request.data.get('confirm_password')
        if new_pwd != confirm:
            return Response({'error': 'Passwords do not match.'}, status=400)
        try:
            pk   = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=pk)
        except Exception:
            return Response({'error': 'Invalid link.'}, status=400)
        if not default_token_generator.check_token(user, token):
            return Response({'error': 'Link expired.'}, status=400)
        user.set_password(new_pwd)
        user.save()
        return Response({'message': 'Password reset successfully.'})


class ChangePasswordView(APIView):
    def post(self, request):
        s = ChangePasswordSerializer(data=request.data, context={'request': request})
        if s.is_valid():
            request.user.set_password(s.validated_data['new_password'])
            request.user.save()
            return Response({'message': 'Password changed.'})
        return Response(s.errors, status=400)


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class SavedLocationListCreateView(generics.ListCreateAPIView):
    serializer_class = SavedLocationSerializer

    def get_queryset(self):
        return SavedLocation.objects.filter(user=self.request.user)

    def perform_create(self, s):
        s.save(user=self.request.user)


class SavedLocationDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SavedLocationSerializer

    def get_queryset(self):
        return SavedLocation.objects.filter(user=self.request.user)


class ServiceListView(generics.ListAPIView):
    queryset           = Service.objects.filter(is_active=True)
    serializer_class   = ServiceSerializer
    permission_classes = [permissions.AllowAny]


class ClothingItemListView(generics.ListAPIView):
    queryset           = ClothingItem.objects.filter(is_available=True)
    serializer_class   = ClothingItemSerializer
    permission_classes = [permissions.AllowAny]
    filterset_fields   = ['category']


@api_view(['GET'])
def dashboard_stats(request):
    from booking.models import Booking
    qs = Booking.objects.filter(user=request.user)
    return Response({
        'total_orders':           qs.count(),
        'upcoming_bookings':      qs.filter(status__in=['pending', 'confirmed', 'received', 'processing', 'ready']).count(),
        'completed_orders':       qs.filter(status='completed').count(),
        'status':                 request.user.status,
        'notifications_enabled':  request.user.notifications_enabled,
    })