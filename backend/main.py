import os
from flask import Flask
from jinja2 import ChoiceLoader, FileSystemLoader
from routes.public_routes import PublicRoutes
from routes.admin_routes import AdminRoutes

# Setup paths
base_dir = os.path.dirname(os.path.abspath(__file__))
frontend_dir = os.path.abspath(os.path.join(base_dir, '..', 'frontend'))
template_dir = os.path.join(frontend_dir, 'templates')
static_dir = os.path.join(frontend_dir, 'static')

# Create Flask app
app = Flask(__name__, static_folder=static_dir, template_folder=template_dir)

# Setup Jinja2 template loader
app.jinja_loader = ChoiceLoader([
    FileSystemLoader(os.path.join(template_dir, 'public')),
    FileSystemLoader(os.path.join(template_dir, 'admin'))
])

# Configuration
app.secret_key = os.getenv('SECRET_KEY', 'supersecretkey')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Initialize routes
public_routes = PublicRoutes()
admin_routes = AdminRoutes()

# Register blueprints
app.register_blueprint(public_routes.bp)
app.register_blueprint(admin_routes.bp)

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return {'error': 'Not found'}, 404

@app.errorhandler(500)
def internal_error(error):
    return {'error': 'Internal server error'}, 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=2025, debug=True)
