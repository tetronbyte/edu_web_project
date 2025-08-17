from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for, flash
from services.file_service import FileService
from services.blog_service import BlogService
from services.auth_service import AuthService

class AdminRoutes:
    def __init__(self, admin_username='anurag', admin_password='admin19'):
        self.auth_service = AuthService(admin_username, admin_password)
        self.blog_service = BlogService()
        self.bp = Blueprint('admin', __name__, url_prefix='/admin')
        self.register_routes()

    def register_routes(self):
        bp = self.bp

        # === Authentication Routes ===
        @bp.route('/login', methods=['GET', 'POST'])
        def admin_login():
            if request.method == 'POST':
                username = request.form.get('username')
                password = request.form.get('password')
                
                if self.auth_service.authenticate(username, password):
                    session['admin_logged_in'] = True
                    return redirect(url_for('admin.admin_dashboard'))
                
                flash('Invalid credentials', 'error')
                return redirect(url_for('admin.admin_login'))
            
            return render_template('login_admin.html')

        @bp.route('/logout')
        def admin_logout():
            self.auth_service.logout()
            return redirect(url_for('admin.admin_login'))

        # === Admin Dashboard ===
        @bp.route('/')
        def admin_dashboard():
            if not self.auth_service.is_authenticated():
                return redirect(url_for('admin.admin_login'))
            return render_template('dashboard_admin.html')

        # === Notes Management ===
        @bp.route('/upload')
        def admin_upload_page():
            if not self.auth_service.is_authenticated():
                return redirect(url_for('admin.admin_login'))
            return render_template('notes_upload_admin.html')

        @bp.route('/upload', methods=['POST'])
        def upload_notes():
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401

            try:
                files = request.files.getlist('files')  # Support multiple files
                subject = request.form.get('subject')
                date_string = request.form.get('date')
                course = request.form.get('course')
                semester = request.form.get('semester')

                if not files or all(f.filename == '' for f in files):
                    return jsonify({'error': 'No files selected'}), 400
                
                if not all([course, semester, subject]):
                    return jsonify({'error': 'Course, Semester, and Subject are required'}), 400

                uploaded_files = []
                for file in files:
                    if file and file.filename != '':
                        filename = FileService.save_uploaded_file(file, subject, date_string, course, semester)
                        uploaded_files.append(filename)

                return jsonify({
                    'message': f'{len(uploaded_files)} file(s) uploaded successfully!',
                    'files': uploaded_files
                }), 200

            except Exception as e:
                return jsonify({'error': str(e)}), 500

        # === Blog Management Routes ===
        @bp.route('/blog')
        def admin_blog_management():
            if not self.auth_service.is_authenticated():
                return redirect(url_for('admin.admin_login'))
            return render_template('blog_admin.html')

        @bp.route('/blog/new')
        def admin_new_blog_post():
            if not self.auth_service.is_authenticated():
                return redirect(url_for('admin.admin_login'))
            return render_template('blog_editor_admin.html')  # Fixed template name

        @bp.route('/blog/edit/<post_id>')
        def admin_edit_blog_post(post_id):
            if not self.auth_service.is_authenticated():
                return redirect(url_for('admin.admin_login'))
            return render_template('blog_editor_admin.html', post_id=post_id)  # Fixed template name


        # === Admin API Routes ===
        
        # Dashboard API
        @bp.route('/api/dashboard/stats')
        def get_dashboard_stats():
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401
            
            try:
                stats = {
                    'totalPosts': self.blog_service.get_post_count(),
                    'publishedPosts': self.blog_service.get_published_count(),
                    'draftPosts': self.blog_service.get_draft_count(),
                    'totalNotes': FileService.get_total_notes_count(),
                    'todayViews': 0,  # Implement analytics if needed
                    'monthlyViews': 0  # Implement analytics if needed
                }
                return jsonify(stats)
            except Exception as e:
                return jsonify({'error': str(e)}), 500

        @bp.route('/api/dashboard/activity')
        def get_recent_activity():
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401
            
            try:
                activity = self.blog_service.get_recent_activity()
                return jsonify(activity)
            except Exception as e:
                return jsonify({'error': str(e)}), 500

        # Blog API Routes
        @bp.route('/api/blog/posts')
        def admin_get_all_posts():
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401
            
            try:
                posts = self.blog_service.get_all_posts(include_unpublished=True)
                return jsonify({
                    'posts': posts,
                    'total': len(posts)
                })
            except Exception as e:
                return jsonify({'error': str(e)}), 500

        @bp.route('/api/blog/post/<post_id>')
        def admin_get_post(post_id):
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401
            
            try:
                post = self.blog_service.get_post_by_id(post_id)
                if not post:
                    return jsonify({'error': 'Post not found'}), 404
                return jsonify(post)
            except Exception as e:
                return jsonify({'error': str(e)}), 500

        @bp.route('/api/blog/post', methods=['POST'])
        def admin_create_post():
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401
            
            try:
                post_data = request.get_json()
                post = self.blog_service.create_post(post_data)
                return jsonify({
                    'message': 'Post created successfully',
                    'post': post
                }), 201
            except ValueError as e:
                return jsonify({'error': str(e)}), 400
            except Exception as e:
                return jsonify({'error': str(e)}), 500

        @bp.route('/api/blog/post/<post_id>', methods=['PUT'])
        def admin_update_post(post_id):
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401
            
            try:
                post_data = request.get_json()
                post = self.blog_service.update_post(post_id, post_data)
                if not post:
                    return jsonify({'error': 'Post not found'}), 404
                return jsonify({
                    'message': 'Post updated successfully',
                    'post': post
                })
            except Exception as e:
                return jsonify({'error': str(e)}), 500

        @bp.route('/api/blog/post/<post_id>', methods=['DELETE'])
        def admin_delete_post(post_id):
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401
            
            try:
                success = self.blog_service.delete_post(post_id)
                if not success:
                    return jsonify({'error': 'Post not found'}), 404
                return jsonify({'message': 'Post deleted successfully'})
            except Exception as e:
                return jsonify({'error': str(e)}), 500

        @bp.route('/api/blog/post/<post_id>/toggle', methods=['POST'])
        def admin_toggle_post_status(post_id):
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401
            
            try:
                post = self.blog_service.toggle_post_status(post_id)
                if not post:
                    return jsonify({'error': 'Post not found'}), 404
                return jsonify({
                    'message': f'Post {"published" if post["published"] else "unpublished"} successfully',
                    'post': post
                })
            except Exception as e:
                return jsonify({'error': str(e)}), 500

        # Notes API Routes
        @bp.route('/api/notes/<course>/<semester>/<subject>')
        def admin_list_notes(course, semester, subject):
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401
            
            try:
                files = FileService.list_subject_files(course, semester, subject)
                return jsonify(files)
            except Exception as e:
                return jsonify({'error': str(e)}), 500
