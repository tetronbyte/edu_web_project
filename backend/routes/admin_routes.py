from flask import Blueprint, render_template, request, jsonify, send_from_directory, redirect, flash, url_for, session
from datetime import date
import os

admin_bp = Blueprint('admin', __name__)

# === Path to Store PDFs ===
UPLOAD_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..', 'data', 'notes'))

# === Dummy Admin Credentials ===
ADMIN_USERNAME = 'anurag'
ADMIN_PASSWORD = 'admin19'  # Replace with a secure method in production

# === Subject Shortcut Map ===
shortcut_dict = {
    "DM": "DiscreteMath",
    "ITP": "IntroToProbability",
    "ITEP": "IntroToEnggPrinciples",
    "CFDS": "ChemistryForDS",
    "WS": "WritingSeminar",
    "STFE": "StatisticalTheoryForEngineers",
    "PADS": "ProgrammingAndDataStructures",
    "ITO": "IntroductionToOptimization",
    "PFE": "ProgrammingForEngineers",
    "DOA": "DesignOfAlgorithms",
    "DMS": "DatabaseManagementSystems",
    "FOML": "FoundationsOfMachineLearning",
    "MLL": "MachineLearningLab",
    "BFE": "BiologyForEngineers"
}

# === File Renamer ===
def rename_file(subject_shortcut):
    today = date.today().strftime("%d%m%Y")
    full_name = shortcut_dict.get(subject_shortcut.upper(), "UnknownSubject")
    return f"{full_name}_{today}.pdf"

# === Public Routes ===

@admin_bp.route('/')
def notes_page():
    return render_template('notes_template.html')

@admin_bp.route('/home')
def home_page():
    return render_template('home_template.html')

@admin_bp.route('/gpa_calculator')
def gpa_calculator():
    return render_template('gpa_calculator.html')  # Create if needed

@admin_bp.route('/gpa_predictor')
def gpa_predictor():
    return render_template('gpa_predictor.html')  # Create if needed

# === Admin Login ===

@admin_bp.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']

        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session['admin_logged_in'] = True
            return redirect(url_for('admin.admin_upload_page'))
        else:
            flash('Invalid credentials', 'error')
            return redirect(url_for('admin.admin_login'))

    return render_template('admin_login.html')


# === Admin Logout ===

@admin_bp.route('/admin/logout')
def admin_logout():
    session.pop('admin_logged_in', None)  # Clear the session
    return redirect(url_for('admin.admin_login'))  # Redirect to login page

# === Admin Upload Page ===

@admin_bp.route('/admin')
def admin_upload_page():
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin.admin_login'))
    return render_template('notes_upload_admin.html')

# === Upload Endpoint (Protected) ===

@admin_bp.route('/upload', methods=['POST'])
def upload_notes():
    if not session.get('admin_logged_in'):
        return redirect(url_for('admin.admin_login'))

    uploaded_file = request.files.get('file')
    subject_shortcut = request.form.get('subject')
    course = request.form.get('course')
    semester = request.form.get('semester')

    # Validate inputs
    if not uploaded_file or uploaded_file.filename == '':
        return 'No selected file', 400
    if not subject_shortcut or subject_shortcut.upper() not in shortcut_dict:
        return 'Invalid or missing subject shortcut', 400
    if not course or not semester:
        return 'Course and Semester are required', 400

    filename = rename_file(subject_shortcut)
    full_subject = shortcut_dict[subject_shortcut.upper()]
    save_dir = os.path.join(UPLOAD_ROOT, course, semester, full_subject)
    os.makedirs(save_dir, exist_ok=True)

    uploaded_file.save(os.path.join(save_dir, filename))

    return jsonify({'message': 'File uploaded successfully!'}), 200

# === API: List Notes ===

@admin_bp.route('/notes/<course>/<semester>/<subject>')
def list_notes(course, semester, subject):
    subject_folder = os.path.join(UPLOAD_ROOT, course, semester, subject)
    if not os.path.exists(subject_folder):
        return jsonify([])
    files = [f for f in os.listdir(subject_folder) if f.endswith('.pdf')]
    return jsonify(files)

# === Serve PDFs ===

@admin_bp.route('/notes/<course>/<semester>/<subject>/<filename>')
def serve_note(course, semester, subject, filename):
    file_path = os.path.join(UPLOAD_ROOT, course, semester, subject)
    return send_from_directory(file_path, filename)
