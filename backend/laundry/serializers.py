from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User, Service, ClothingItem, SavedLocation


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['id','first_name','last_name','email','phone_number','bio','status','member_since','notifications_enabled']
        read_only_fields = ['id','status','member_since']


class RegisterSerializer(serializers.ModelSerializer):
    password         = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = ['first_name','last_name','email','phone_number','password','confirm_password']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        return User.objects.create_user(
            username  = validated_data['email'],
            email     = validated_data['email'],
            first_name= validated_data.get('first_name',''),
            last_name = validated_data.get('last_name',''),
            password  = validated_data['password'],
            phone_number = validated_data.get('phone_number',''),
        )


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
        fields = ['id','label','address','is_default']
