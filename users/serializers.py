from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user

        permissions = []
        role_name = None

        if user.role:
            role_name = user.role.name
            permissions = list(user.role.permissions.values_list('name', flat=True))

        data['user'] = {
            'id': user.id,
            'username': user.username,
            'role': role_name,
            'permissions': permissions
        }

        return data