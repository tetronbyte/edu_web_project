import os
from flask import Flask
from jinja2 import ChoiceLoader, FileSystemLoader
from routes.admin_routes import admin_bp
from routes.admin_routes import admin_bp
from config import Config

# === Paths ===
base_dir = os.path.dirname(os.path.abspath(__file__))
frontend_dir = os.path.abspath(os.path.join(base_dir, '..', 'frontend'))
template_dir = os.path.join(frontend_dir, 'templates')
static_dir = os.path.join(frontend_dir, 'static')

# === Flask App Setup ===
app = Flask(__name__, static_folder=static_dir, template_folder=template_dir)
app.jinja_loader = ChoiceLoader([
    FileSystemLoader(os.path.join(template_dir, 'public')),
    FileSystemLoader(os.path.join(template_dir, 'admin'))
])

app.secret_key = 'supersecretkey'  # Change this to something secure in production

# === Register Blueprints ===
app.register_blueprint(admin_bp)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=2025, debug=True)