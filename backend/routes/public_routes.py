from flask import Blueprint, render_template, request, jsonify
from services.ai_service import AIService
from services.blog_service import BlogService
from services.file_service import FileService
from datetime import datetime

# Keep a single service instance for reuse
ai_service = AIService()

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

        @bp.route('/notes')
        def notes_page():
            return render_template('notes_template.html')

        @bp.route('/blog')
        def blog_page():
            return render_template('blog_template.html')

        @bp.route('/gllm')
        def gllm_page():
            return render_template('gllm_template.html')

        @bp.route('/gpa_calculator')
        def gpa_calculator():
            return render_template('gpa_calculator.html')

        @bp.route('/gpa_predictor')
        def gpa_predictor():
            return render_template('gpa_predictor.html')

        # === API Routes ===

        @bp.route('/api/session/create', methods=['POST'])
        def create_session():
            try:
                session_id = ai_service.create_session()
                return jsonify({'success': True, 'session_id': session_id, 'message': 'Session created successfully'})
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/generate-equations', methods=['POST'])
        def generate_equations():
            try:
                data = request.get_json() or {}
                user_input = (data.get('input') or '').strip()
                session_id = data.get('session_id')

                if not user_input:
                    return jsonify({'success': False, 'error': 'No input provided'}), 400

                result = ai_service.generate_equations_with_context(user_input, session_id)
                return jsonify(result)
            except Exception as e:
                return jsonify({'success': False, 'error': str(e), 'message': 'Error generating equations'}), 500

        @bp.route('/generate-equations', methods=['POST'])
        def generate_equations_legacy():
            try:
                payload = request.get_json(silent=True) or {}
                user_input = payload.get('input', '')
                if not user_input:
                    return jsonify({'success': False, 'error': 'No input provided'}), 400

                equations = ai_service._get_fallback_equations(user_input)
                if not equations:
                    return jsonify({'success': False, 'error': 'Could not generate valid equations'}), 500
                return jsonify({'success': True, 'equations': equations})
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/session/<session_id>/history', methods=['GET'])
        def get_session_history(session_id):
            try:
                history = ai_service.get_session_history(session_id)
                return jsonify(history)
            except Exception as e:
                return jsonify({'error': str(e)}), 500

        @bp.route('/api/chat', methods=['POST'])
        def chat_with_context():
            try:
                data = request.get_json() or {}
                message = (data.get('message') or '').strip()
                session_id = data.get('session_id')

                if not message:
                    return jsonify({'success': False, 'error': 'No message provided'}), 400

                result = ai_service.generate_equations_with_context(message, session_id)
                response = {
                    **result,
                    'response': f"I've generated {len(result.get('equations', []))} equations based on: '{message}'",
                    'timestamp': datetime.now().isoformat()
                }
                return jsonify(response)
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/health', methods=['GET'])
        def health_check():
            return jsonify({
                'status': 'healthy',
                'timestamp': datetime.now().isoformat(),
                'services': {
                    'ai_service': 'operational',
                    'perplexity_api': 'configured' if ai_service.perplexity_api_key else 'not_configured',
                    'langchain': 'available' if ('_HAVE_LANGCHAIN' in dir(ai_service) and ai_service.openai_api_key) else 'not_available',
                    'langgraph': 'available' if ('_HAVE_LANGGRAPH' in dir(ai_service)) else 'not_available'
                }
            })

# Create instance for app registration
public_routes = PublicRoutes()
bp = public_routes.bp
