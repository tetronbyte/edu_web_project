from flask import Blueprint, render_template, request, jsonify
from services.ai_service import AIService
from services.blog_service import BlogService
from services.file_service import FileService
from services.club_service import ClubService
from services.event_service import EventService
from services.artwork_service import ArtworkService
from services.workshop_service import WorkshopService
from services.creative_arena_service import CreativeArenaService
from services.gpa_service import GPAService
from datetime import datetime

# Keep a single service instance for reuse
ai_service = AIService()

class PublicRoutes:
    def __init__(self):
        self.blog_service = BlogService()
        self.club_service = ClubService()
        self.event_service = EventService()
        self.artwork_service = ArtworkService()
        self.workshop_service = WorkshopService()
        self.creative_arena_service = CreativeArenaService()
        self.gpa_service = GPAService()
        self.bp = Blueprint('public', __name__)
        self.register_routes()

    def register_routes(self):
        bp = self.bp

        # === Main Pages ===
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

        # === New Pages ===
        @bp.route('/clubs')
        def clubs_page():
            return render_template('clubs_template.html')

        @bp.route('/creative_arena')
        def creative_arena_page():
            return render_template('creative_arena_template.html')

        @bp.route('/gpa_calculator')
        def gpa_calculator():
            return render_template('gpa_calculator.html')

        @bp.route('/gpa_predictor')
        def gpa_predictor():
            return render_template('gpa_predictor.html')

        # === Club Pages ===
        @bp.route('/clubs/art_design')
        def art_design_club():
            return render_template('art_design_club_template.html')

        @bp.route('/clubs/dance')
        def dance_club():
            return render_template('dance_club_template.html')

        @bp.route('/clubs/drama')
        def drama_club():
            return render_template('drama_club_template.html')

        @bp.route('/clubs/photography')
        def photography_club():
            return render_template('photography_club_template.html')

        @bp.route('/clubs/sports')
        def sports_club():
            return render_template('sports_club_template.html')

        @bp.route('/clubs/chess')
        def chess_club():
            return render_template('chess_club_template.html')

        # === Clubs API ===
        @bp.route('/api/clubs/list', methods=['GET'])
        def get_clubs_list():
            try:
                clubs = self.club_service.get_all_clubs()
                return jsonify({
                    'success': True,
                    'clubs': clubs,
                    'total': len(clubs)
                })
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/clubs/<club_id>/info', methods=['GET'])
        def get_club_info(club_id):
            try:
                club = self.club_service.get_club_by_id(club_id)
                if not club:
                    return jsonify({'success': False, 'error': 'Club not found'}), 404
                return jsonify({
                    'success': True,
                    'club': club
                })
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        # === Events API ===
        @bp.route('/api/events/all', methods=['GET'])
        def get_all_events():
            try:
                events = self.event_service.get_all_events()
                return jsonify({
                    'success': True,
                    'events': events,
                    'total': len(events)
                })
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/events/club/<club_id>', methods=['GET'])
        def get_club_events(club_id):
            try:
                events = self.event_service.get_events_by_club(club_id)
                return jsonify({
                    'success': True,
                    'events': events,
                    'total': len(events)
                })
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/events/upcoming', methods=['GET'])
        def get_upcoming_events():
            try:
                limit = request.args.get('limit', 5, type=int)
                events = self.event_service.get_upcoming_events(limit)
                return jsonify({
                    'success': True,
                    'events': events,
                    'total': len(events)
                })
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        # === Artwork API ===
        @bp.route('/api/artworks/club/<club_id>', methods=['GET'])
        def get_club_artworks(club_id):
            try:
                artworks = self.artwork_service.get_artworks_by_club(club_id)
                return jsonify({
                    'success': True,
                    'artworks': artworks,
                    'total': len(artworks)
                })
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/artworks/featured', methods=['GET'])
        def get_featured_artworks():
            try:
                artworks = self.artwork_service.get_featured_artworks()
                return jsonify({
                    'success': True,
                    'artworks': artworks,
                    'total': len(artworks)
                })
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        # === Workshop API ===
        @bp.route('/api/workshops/club/<club_id>', methods=['GET'])
        def get_club_workshops(club_id):
            try:
                workshops = self.workshop_service.get_workshops_by_club(club_id)
                return jsonify({
                    'success': True,
                    'workshops': workshops,
                    'total': len(workshops)
                })
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/workshops/upcoming', methods=['GET'])
        def get_upcoming_workshops():
            try:
                limit = request.args.get('limit', 10, type=int)
                workshops = self.workshop_service.get_upcoming_workshops(limit)
                return jsonify({
                    'success': True,
                    'workshops': workshops,
                    'total': len(workshops)
                })
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        # === Creative Arena API ===
        @bp.route('/api/creative-arena/tools', methods=['GET'])
        def get_creative_tools():
            try:
                tools = self.creative_arena_service.get_available_tools()
                return jsonify({
                    'success': True,
                    'tools': tools,
                    'total': len(tools)
                })
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/creative-arena/subscribe', methods=['POST'])
        def subscribe_notifications():
            try:
                data = request.get_json() or {}
                email = data.get('email', '').strip()
                
                if not email:
                    return jsonify({'success': False, 'error': 'Email is required'}), 400
                
                result = self.creative_arena_service.subscribe_email(email)
                return jsonify({
                    'success': True,
                    'message': 'Successfully subscribed for notifications'
                })
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        # === GPA Calculator API ===
        @bp.route('/api/gpa/calculate', methods=['POST'])
        def calculate_gpa():
            try:
                data = request.get_json() or {}
                semesters = data.get('semesters', [])
                
                if not semesters:
                    return jsonify({'success': False, 'error': 'No semester data provided'}), 400
                
                result = self.gpa_service.calculate_gpa(semesters)
                return jsonify({
                    'success': True,
                    'gpa_data': result
                })
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/gpa/predict', methods=['POST'])
        def predict_gpa():
            try:
                data = request.get_json() or {}
                current_gpa = data.get('current_gpa')
                credit_hours = data.get('credit_hours')
                future_courses = data.get('future_courses', [])
                target_gpa = data.get('target_gpa')
                
                if not all([current_gpa is not None, credit_hours is not None]):
                    return jsonify({'success': False, 'error': 'Current GPA and credit hours are required'}), 400
                
                result = self.gpa_service.predict_gpa(current_gpa, credit_hours, future_courses, target_gpa)
                return jsonify({
                    'success': True,
                    'prediction': result
                })
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/gpa/grading-scale', methods=['GET'])
        def get_grading_scale():
            try:
                scale = self.gpa_service.get_grading_scale()
                return jsonify({
                    'success': True,
                    'grading_scale': scale
                })
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        # === Existing Blog API Routes ===
        @bp.route('/api/blog/posts', methods=['GET'])
        def get_blog_posts():
            try:
                category = request.args.get('category', '')
                search = request.args.get('search', '')
                limit = request.args.get('limit', type=int)
                posts = self.blog_service.get_published_posts(
                    category=category,
                    search=search,
                    limit=limit
                )
                return jsonify({
                    'success': True,
                    'posts': posts,
                    'total': len(posts)
                })
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/blog/post/<post_id>', methods=['GET'])
        def get_blog_post(post_id):
            try:
                post = self.blog_service.get_published_post_by_id(post_id)
                if not post:
                    return jsonify({'success': False, 'error': 'Post not found'}), 404
                return jsonify({
                    'success': True,
                    'post': post
                })
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/blog/search', methods=['GET'])
        def search_blog_posts():
            try:
                query = request.args.get('q', '')
                category = request.args.get('category', '')
                posts = self.blog_service.search_posts(query, category)
                return jsonify({
                    'success': True,
                    'posts': posts,
                    'total': len(posts)
                })
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        # === AI/GLLM API Routes ===
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
                    'blog_service': 'operational',
                    'club_service': 'operational',
                    'event_service': 'operational',
                    'artwork_service': 'operational',
                    'workshop_service': 'operational',
                    'creative_arena_service': 'operational',
                    'gpa_service': 'operational',
                    'perplexity_api': 'configured' if hasattr(ai_service, 'perplexity_api_key') and ai_service.perplexity_api_key else 'not_configured',
                    'langchain': 'available' if ('_HAVE_LANGCHAIN' in dir(ai_service) and hasattr(ai_service, 'openai_api_key') and ai_service.openai_api_key) else 'not_available',
                    'langgraph': 'available' if ('_HAVE_LANGGRAPH' in dir(ai_service)) else 'not_available'
                }
            })
        # === PUBLIC EVENT MANAGEMENT API ROUTES ===
        @bp.route('/api/events/<int:event_id>/register', methods=['POST'])
        def public_register_for_event(event_id):
            try:
                registration_data = request.get_json()
                # Add basic validation for public registration
                required_fields = ['name', 'email']
                for field in required_fields:
                    if not registration_data.get(field):
                        return jsonify({'success': False, 'error': f'{field} is required'}), 400
                
                registration = self.event_service.register_for_event(event_id, registration_data)
                return jsonify({
                    'success': True,
                    'message': 'Registration successful! You will receive a confirmation email.',
                    'registration': registration
                }), 201
            except ValueError as e:
                return jsonify({'success': False, 'error': str(e)}), 400
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/clubs/<club_id>/announcements', methods=['GET'])
        def get_public_club_announcements(club_id):
            try:
                announcements = self.event_service.get_club_announcements(club_id)
                # Only return recent public announcements
                recent_announcements = announcements[-5:] if announcements else []
                return jsonify({
                    'success': True,
                    'announcements': recent_announcements,
                    'total': len(recent_announcements)
                })
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/clubs/<club_id>/events/past', methods=['GET'])
        def get_public_club_past_events(club_id):
            try:
                past_events = self.event_service.get_archived_events(club_id)
                return jsonify({
                    'success': True,
                    'events': past_events,
                    'total': len(past_events)
                })
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/clubs/<club_id>/events/data', methods=['GET'])
        def get_public_club_event_data(club_id):
            try:
                # Get comprehensive event data for a club
                upcoming_events = [e for e in self.event_service.get_events_by_club(club_id) 
                                if not e.get('archived', False)]
                announcements = self.event_service.get_club_announcements(club_id)
                past_events = self.event_service.get_archived_events(club_id)
                
                return jsonify({
                    'success': True,
                    'data': {
                        'upcoming_events': upcoming_events,
                        'recent_announcements': announcements[-3:],  # Latest 3
                        'past_events': past_events[-5:]  # Latest 5 archived
                    }
                })
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500


# Create instance for app registration
public_routes = PublicRoutes()
bp = public_routes.bp
