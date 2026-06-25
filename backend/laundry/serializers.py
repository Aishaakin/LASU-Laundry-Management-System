from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, Service, ClothingItem, SavedLocation


class RegisterSerializer(serializers.ModelSerializer):
    password         = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)
    matric_number    = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    department       = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    class Meta:
        model  = User
        fields = [
            'first_name', 'last_name', 'email', 'phone_number',
            'matric_number', 'department',
            'password', 'confirm_password',
        ]

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})

        # Clean optional student fields
        matric = data.get('matric_number', '')
        data['matric_number'] = matric.strip() if matric else None

        dept = data.get('department', '')
        data['department'] = dept.strip() if dept else None

        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        matric_number = validated_data.pop('matric_number', None)
        department    = validated_data.pop('department', None)

        user = User.objects.create_user(
            username     = validated_data['email'],
            email        = validated_data['email'],
            first_name   = validated_data.get('first_name', ''),
            last_name    = validated_data.get('last_name', ''),
            password     = validated_data['password'],
            phone_number = validated_data.get('phone_number', ''),
        )

        # Save student fields if provided
        if matric_number:
            user.matric_number = matric_number
        if department:
            user.department = department
        user.save()

        return user


class LoginSerializer(serializers.Serializer):
    email    = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(username=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Invalid email or password.')
        if not user.is_active:
            raise serializers.ValidationError('Account is disabled.')
        data['user'] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    """Single UserSerializer — used for profile, login response, dashboard."""

    is_student = serializers.SerializerMethodField()

    class Meta:
        model  = User
        fields = [
            'id', 'first_name', 'last_name', 'email',
            'phone_number', 'bio', 'status',
            'member_since', 'notifications_enabled',
            'matric_number', 'department', 'is_student',
            'is_staff', 'is_superuser',
        ]
        read_only_fields = [
            'id', 'status', 'member_since',
            'is_staff', 'is_superuser', 'is_student',
        ]

    def get_is_student(self, obj):
        return bool(obj.matric_number)


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField()
    new_password     = serializers.CharField(validators=[validate_password])

    def validate_current_password(self, value):
        if not self.context['request'].user.check_password(value):
            raise serializers.ValidationError('Current password is incorrect.')
        return value


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Service
        fields = '__all__'


class ClothingItemSerializer(serializers.ModelSerializer):
    class Meta:
        model  = ClothingItem
        fields = '__all__'


class SavedLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = SavedLocation
        fields = ['id', 'label', 'address', 'is_default']
