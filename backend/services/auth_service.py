from flask import session

class AuthService:
    def __init__(self, admin_username: str = 'anurag', admin_password: str = 'admin19'):
        self.admin_username = admin_username
        self.admin_password = admin_password

    def authenticate(self, username: str, password: str) -> bool:
        """Authenticate admin credentials"""
        return username == self.admin_username and password == self.admin_password

    def is_authenticated(self) -> bool:
        """Check if admin is currently authenticated"""
        return session.get('admin_logged_in', False)

    def logout(self):
        """Logout admin"""
        session.pop('admin_logged_in', None)

    def require_auth(self):
        """Decorator to require authentication"""
        def decorator(func):
            def wrapper(*args, **kwargs):
                if not self.is_authenticated():
                    return {'error': 'Unauthorized'}, 401
                return func(*args, **kwargs)
            wrapper.__name__ = func.__name__
            return wrapper
        return decorator
