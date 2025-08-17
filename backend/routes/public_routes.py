from flask import Blueprint, render_template, request, jsonify, send_from_directory
from services.ai_service import AIService
from services.blog_service import BlogService
from services.file_service import FileService

class PublicRoutes:
    def __init__(self):
        self.blog_service = BlogService()
        self.bp = Blueprint('public', __name__)
        self.register_routes()

    def register_routes(self):
        bp = self.bp

        # === Public Pages ===
        @bp.route('/')
        def home_page():
            return render_template('home_template.html')

        @bp.route('/blog')
        def blog_page():
            return render_template('blog_template.html')

        @bp.route('/gllm')
        def gllm_page():
            return render_template('gllm_template.html')

        @bp.route('/gpa-calculator')
        def gpa_calculator():
            return render_template('gpa_calculator.html')

        @bp.route('/gpa-predictor')
        def gpa_predictor():
            return render_template('gpa_predictor.html')

        # === API Routes ===
        
        # GLLM API
        @bp.route('/generate-equations', methods=['POST'])
        def generate_equations():
            try:
                payload = request.get_json(silent=True) or {}
                user_input = payload.get('input', '')
                
                if not user_input:
                    return jsonify({'success': False, 'error': 'No input provided'}), 400

                equations = AIService.generate_math_expressions(user_input)
                
                if not equations:
                    return jsonify({'success': False, 'error': 'Could not generate valid equations'}), 500

                return jsonify({'success': True, 'equations': equations})
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        # Blog API
        @bp.route('/api/blog/posts')
        def get_blog_posts():
            try:
                category = request.args.get('category', '')
                search = request.args.get('search', '')
                limit = request.args.get('limit', type=int)
                
                posts = self.blog_service.get_published_posts(category=category, search=search, limit=limit)
                
                return jsonify({
                    'posts': posts,
                    'total': len(posts)
                })
            except Exception as e:
                return jsonify({'error': str(e)}), 500

        @bp.route('/api/blog/post/<post_id>')
        def get_blog_post(post_id):
            try:
                post = self.blog_service.get_published_post_by_id(post_id)
                if not post:
                    return jsonify({'error': 'Post not found'}), 404
                return jsonify(post)
            except Exception as e:
                return jsonify({'error': str(e)}), 500

        @bp.route('/api/blog/search')
        def search_blog_posts():
            try:
                query = request.args.get('q', '')
                category = request.args.get('category', '')
                
                posts = self.blog_service.search_posts(query, category)
                
                return jsonify({
                    'posts': posts,
                    'total': len(posts)
                })
            except Exception as e:
                return jsonify({'error': str(e)}), 500

        # Notes API
        @bp.route('/notes/<course>/<semester>/<subject>')
        def list_notes(course, semester, subject):
            try:
                files = FileService.list_subject_files(course, semester, subject)
                return jsonify(files)
            except Exception as e:
                return jsonify({'error': str(e)}), 500

        @bp.route('/notes/<course>/<semester>/<subject>/<filename>')
        def serve_note(course, semester, subject, filename):
            try:
                file_path = FileService.get_subject_folder_path(course, semester, subject)
                return send_from_directory(file_path, filename)
            except Exception as e:
                return jsonify({'error': str(e)}), 404
