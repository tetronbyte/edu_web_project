from flask import Blueprint, render_template, request, jsonify, session, redirect, url_for, flash, send_file
from werkzeug.utils import secure_filename
import os
from datetime import datetime

from services.file_service import FileService
from services.blog_service import BlogService
from services.auth_service import AuthService
from services.club_service import ClubService
from services.event_service import EventService
from services.artwork_service import ArtworkService
from services.workshop_service import WorkshopService
from services.creative_arena_service import CreativeArenaService
from services.gpa_service import GPAService

class AdminRoutes:
    def __init__(self, admin_username='anurag', admin_password='admin19'):
        self.auth_service = AuthService(admin_username, admin_password)
        self.blog_service = BlogService()
        self.club_service = ClubService()
        self.event_service = EventService()
        self.artwork_service = ArtworkService()
        self.workshop_service = WorkshopService()
        self.creative_arena_service = CreativeArenaService()
        self.gpa_service = GPAService()
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
                files = request.files.getlist('files')
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
            return render_template('blog_editor_admin.html')

        @bp.route('/blog/edit/<post_id>')
        def admin_edit_blog_post(post_id):
            if not self.auth_service.is_authenticated():
                return redirect(url_for('admin.admin_login'))
            return render_template('blog_editor_admin.html', post_id=post_id)

        # === NEW ADMIN PAGES ===
        
        # Club Management
        @bp.route('/clubs')
        def admin_clubs():
            if not self.auth_service.is_authenticated():
                return redirect(url_for('admin.admin_login'))
            return render_template('clubs_admin.html')

        # Events Management
        # === EVENT REGISTRATION API ROUTES ===
        @bp.route('/api/events/<int:event_id>/register', methods=['POST'])
        def admin_register_for_event(event_id):
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401
            
            try:
                registration_data = request.get_json()
                registration = self.event_service.register_for_event(event_id, registration_data)
                return jsonify({
                    'success': True,
                    'message': 'Registration successful',
                    'registration': registration
                }), 201
            except ValueError as e:
                return jsonify({'success': False, 'error': str(e)}), 400
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/events/<int:event_id>/registrations')
        def admin_get_event_registrations(event_id):
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401
            
            try:
                registrations = self.event_service.get_event_registrations(event_id)
                return jsonify({
                    'success': True,
                    'registrations': registrations,
                    'total': len(registrations)
                })
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        # === EVENT ANNOUNCEMENTS API ROUTES ===
        @bp.route('/api/events/announcements', methods=['POST'])
        def admin_create_announcement():
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401
            
            try:
                announcement_data = request.get_json()
                announcement = self.event_service.create_announcement(announcement_data)
                return jsonify({
                    'success': True,
                    'message': 'Announcement created successfully',
                    'announcement': announcement
                }), 201
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/clubs/<club_id>/announcements')
        def admin_get_club_announcements(club_id):
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401
            
            try:
                announcements = self.event_service.get_club_announcements(club_id)
                return jsonify({
                    'success': True,
                    'announcements': announcements,
                    'total': len(announcements)
                })
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        # === EVENT ARCHIVES API ROUTES ===
        @bp.route('/api/events/<int:event_id>/archive', methods=['POST'])
        def admin_archive_event(event_id):
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401
            
            try:
                success = self.event_service.archive_event(event_id)
                if not success:
                    return jsonify({'success': False, 'error': 'Event not found'}), 404
                
                return jsonify({
                    'success': True,
                    'message': 'Event archived successfully'
                })
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/events/archived')
        def admin_get_archived_events():
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401
            
            try:
                club_id = request.args.get('club_id', '')
                archived_events = self.event_service.get_archived_events(club_id if club_id else None)
                return jsonify({
                    'success': True,
                    'events': archived_events,
                    'total': len(archived_events)
                })
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/events/<int:event_id>/restore', methods=['POST'])
        def admin_restore_event(event_id):
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401
            
            try:
                success = self.event_service.restore_event(event_id)
                if not success:
                    return jsonify({'success': False, 'error': 'Event not found'}), 404
                
                return jsonify({
                    'success': True,
                    'message': 'Event restored successfully'
                })
            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/events')
        def admin_events():
            if not self.auth_service.is_authenticated():
                return redirect(url_for('admin.admin_login'))
            return render_template('events_admin.html')

        # Artworks Management
        @bp.route('/artworks')
        def admin_artworks():
            if not self.auth_service.is_authenticated():
                return redirect(url_for('admin.admin_login'))
            return render_template('artworks_admin.html')

        # Workshops Management
        @bp.route('/workshops')
        def admin_workshops():
            if not self.auth_service.is_authenticated():
                return redirect(url_for('admin.admin_login'))
            return render_template('workshops_admin.html')

        # Creative Arena Management
        @bp.route('/creative-arena')
        def admin_creative_arena():
            if not self.auth_service.is_authenticated():
                return redirect(url_for('admin.admin_login'))
            return render_template('creative_arena_admin.html')

        # Analytics & Reports
        @bp.route('/analytics')
        def admin_analytics():
            if not self.auth_service.is_authenticated():
                return redirect(url_for('admin.admin_login'))
            return render_template('analytics_admin.html')

        # === ADMIN API ROUTES ===

        # Dashboard API
        @bp.route('/api/dashboard/stats')
        def get_dashboard_stats():
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401

            try:
                # Blog stats
                blog_stats = self.blog_service.get_post_stats()
                
                # Club stats
                club_stats = self.club_service.get_clubs_stats()
                
                # Event stats
                event_stats = self.event_service.get_events_stats()
                
                # Artwork stats
                artwork_stats = self.artwork_service.get_artworks_stats()
                
                # Workshop stats
                workshop_stats = self.workshop_service.get_workshops_stats()
                
                # Creative Arena stats
                creative_stats = self.creative_arena_service.get_tools_stats()

                stats = {
                    'totalPosts': blog_stats.get('total_posts', 0),
                    'publishedPosts': blog_stats.get('published_posts', 0),
                    'draftPosts': blog_stats.get('draft_posts', 0),
                    'totalNotes': FileService.get_total_notes_count(),
                    'totalClubs': club_stats.get('total_clubs', 0),
                    'totalEvents': event_stats.get('total_events', 0),
                    'totalArtworks': artwork_stats.get('total_artworks', 0),
                    'totalWorkshops': workshop_stats.get('total_workshops', 0),
                    'totalMembers': club_stats.get('total_members', 0),
                    'upcomingEvents': event_stats.get('upcoming_events', 0),
                    'featuredArtworks': artwork_stats.get('featured_artworks', 0),
                    'activeSubscribers': creative_stats.get('subscribers', 0),
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
                activities = []
                
                # Get recent blog activity
                blog_activity = self.blog_service.get_recent_activity(5)
                activities.extend(blog_activity)
                
                # Sort by timestamp and limit
                activities.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
                
                return jsonify(activities[:10])

            except Exception as e:
                return jsonify({'error': str(e)}), 500

        # === CLUB API ROUTES ===
        @bp.route('/api/clubs')
        def admin_get_clubs():
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401

            try:
                search = request.args.get('search', '')
                clubs = self.club_service.get_all_clubs()
                
                if search:
                    clubs = self.club_service.search_clubs(search)

                return jsonify({
                    'success': True,
                    'clubs': clubs,
                    'total': len(clubs)
                })

            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/clubs/<club_id>')
        def admin_get_club(club_id):
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401

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

        @bp.route('/api/clubs', methods=['POST'])
        def admin_create_club():
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401

            try:
                club_data = request.get_json()
                
                # Validate required fields
                required_fields = ['id', 'name', 'description']
                for field in required_fields:
                    if not club_data.get(field):
                        return jsonify({'success': False, 'error': f'Missing required field: {field}'}), 400

                # Process tags
                if isinstance(club_data.get('tags'), str):
                    club_data['tags'] = [tag.strip() for tag in club_data['tags'].split(',') if tag.strip()]

                club = self.club_service.create_club(club_data)
                
                return jsonify({
                    'success': True,
                    'message': 'Club created successfully',
                    'club': club
                }), 201

            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/clubs/<club_id>', methods=['PUT'])
        def admin_update_club(club_id):
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401

            try:
                club_data = request.get_json()
                
                # Process tags
                if isinstance(club_data.get('tags'), str):
                    club_data['tags'] = [tag.strip() for tag in club_data['tags'].split(',') if tag.strip()]

                club = self.club_service.update_club(club_id, club_data)
                if not club:
                    return jsonify({'success': False, 'error': 'Club not found'}), 404

                return jsonify({
                    'success': True,
                    'message': 'Club updated successfully',
                    'club': club
                })

            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/clubs/<club_id>', methods=['DELETE'])
        def admin_delete_club(club_id):
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401

            try:
                success = self.club_service.delete_club(club_id)
                if not success:
                    return jsonify({'success': False, 'error': 'Club not found'}), 404

                return jsonify({
                    'success': True,
                    'message': 'Club deleted successfully'
                })

            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        # === EVENT API ROUTES ===
        @bp.route('/api/events')
        def admin_get_events():
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401

            try:
                club = request.args.get('club', '')
                event_type = request.args.get('type', '')
                status = request.args.get('status', '')
                search = request.args.get('search', '')

                events = self.event_service.get_all_events()
                
                # Apply filters
                if club:
                    events = [e for e in events if e.get('club_id') == club]
                if event_type:
                    events = [e for e in events if e.get('type', '').lower() == event_type.lower()]
                if search:
                    events = self.event_service.search_events(search)

                return jsonify({
                    'success': True,
                    'events': events,
                    'total': len(events)
                })

            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/events/<int:event_id>')
        def admin_get_event(event_id):
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401

            try:
                event = self.event_service.get_event_by_id(event_id)
                if not event:
                    return jsonify({'success': False, 'error': 'Event not found'}), 404

                return jsonify({
                    'success': True,
                    'event': event
                })

            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/events', methods=['POST'])
        def admin_create_event():
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401

            try:
                event_data = request.get_json()
                
                # Validate required fields
                required_fields = ['title', 'club_id', 'description', 'date', 'time', 'location']
                for field in required_fields:
                    if not event_data.get(field):
                        return jsonify({'success': False, 'error': f'Missing required field: {field}'}), 400

                # Process tags
                if isinstance(event_data.get('tags'), str):
                    event_data['tags'] = [tag.strip() for tag in event_data['tags'].split(',') if tag.strip()]

                event = self.event_service.create_event(event_data)
                
                return jsonify({
                    'success': True,
                    'message': 'Event created successfully',
                    'event': event
                }), 201

            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/events/<int:event_id>', methods=['PUT'])
        def admin_update_event(event_id):
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401

            try:
                event_data = request.get_json()
                
                # Process tags
                if isinstance(event_data.get('tags'), str):
                    event_data['tags'] = [tag.strip() for tag in event_data['tags'].split(',') if tag.strip()]

                event = self.event_service.update_event(event_id, event_data)
                if not event:
                    return jsonify({'success': False, 'error': 'Event not found'}), 404

                return jsonify({
                    'success': True,
                    'message': 'Event updated successfully',
                    'event': event
                })

            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/events/<int:event_id>', methods=['DELETE'])
        def admin_delete_event(event_id):
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401

            try:
                success = self.event_service.delete_event(event_id)
                if not success:
                    return jsonify({'success': False, 'error': 'Event not found'}), 404

                return jsonify({
                    'success': True,
                    'message': 'Event deleted successfully'
                })

            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        # === ARTWORK API ROUTES ===
        @bp.route('/api/artworks')
        def admin_get_artworks():
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401

            try:
                category = request.args.get('category', '')
                artist = request.args.get('artist', '')
                status = request.args.get('status', '')
                search = request.args.get('q', '')

                artworks = self.artwork_service.get_all_artworks()
                
                # Apply filters
                if category:
                    artworks = self.artwork_service.get_artworks_by_category(category)
                if artist:
                    artworks = self.artwork_service.get_artworks_by_artist(artist)
                if search:
                    artworks = self.artwork_service.search_artworks(search)

                return jsonify({
                    'success': True,
                    'artworks': artworks,
                    'total': len(artworks)
                })

            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/artworks/<int:artwork_id>')
        def admin_get_artwork(artwork_id):
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401

            try:
                artwork = self.artwork_service.get_artwork_by_id(artwork_id)
                if not artwork:
                    return jsonify({'success': False, 'error': 'Artwork not found'}), 404

                return jsonify({
                    'success': True,
                    'artwork': artwork
                })

            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/artworks', methods=['POST'])
        def admin_create_artwork():
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401

            try:
                # Handle both JSON and form data (for file uploads)
                if request.content_type.startswith('application/json'):
                    artwork_data = request.get_json()
                else:
                    artwork_data = request.form.to_dict()
                    
                    # Handle file upload
                    if 'image' in request.files:
                        file = request.files['image']
                        if file and file.filename:
                            filename = secure_filename(file.filename)
                            # Save file logic here
                            artwork_data['image_path'] = f'/static/images/artworks/{filename}'

                # Validate required fields
                required_fields = ['title', 'artist', 'description', 'category']
                for field in required_fields:
                    if not artwork_data.get(field):
                        return jsonify({'success': False, 'error': f'Missing required field: {field}'}), 400

                # Process tags
                if isinstance(artwork_data.get('tags'), str):
                    artwork_data['tags'] = [tag.strip() for tag in artwork_data['tags'].split(',') if tag.strip()]

                artwork = self.artwork_service.create_artwork(artwork_data)
                
                return jsonify({
                    'success': True,
                    'message': 'Artwork created successfully',
                    'artwork': artwork
                }), 201

            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/artworks/<int:artwork_id>', methods=['PUT'])
        def admin_update_artwork(artwork_id):
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401

            try:
                # Handle both JSON and form data
                if request.content_type.startswith('application/json'):
                    artwork_data = request.get_json()
                else:
                    artwork_data = request.form.to_dict()
                    
                    # Handle file upload
                    if 'image' in request.files:
                        file = request.files['image']
                        if file and file.filename:
                            filename = secure_filename(file.filename)
                            # Save file logic here
                            artwork_data['image_path'] = f'/static/images/artworks/{filename}'

                # Process tags
                if isinstance(artwork_data.get('tags'), str):
                    artwork_data['tags'] = [tag.strip() for tag in artwork_data['tags'].split(',') if tag.strip()]

                artwork = self.artwork_service.update_artwork(artwork_id, artwork_data)
                if not artwork:
                    return jsonify({'success': False, 'error': 'Artwork not found'}), 404

                return jsonify({
                    'success': True,
                    'message': 'Artwork updated successfully',
                    'artwork': artwork
                })

            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/artworks/<int:artwork_id>', methods=['DELETE'])
        def admin_delete_artwork(artwork_id):
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401

            try:
                success = self.artwork_service.delete_artwork(artwork_id)
                if not success:
                    return jsonify({'success': False, 'error': 'Artwork not found'}), 404

                return jsonify({
                    'success': True,
                    'message': 'Artwork deleted successfully'
                })

            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        # === WORKSHOP API ROUTES ===
        @bp.route('/api/workshops')
        def admin_get_workshops():
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401

            try:
                club = request.args.get('club', '')
                level = request.args.get('level', '')
                search = request.args.get('search', '')

                workshops = self.workshop_service.get_all_workshops()
                
                # Apply filters
                if club:
                    workshops = self.workshop_service.get_workshops_by_club(club)
                if level:
                    workshops = self.workshop_service.get_workshops_by_level(level)
                if search:
                    workshops = self.workshop_service.search_workshops(search)

                return jsonify({
                    'success': True,
                    'workshops': workshops,
                    'total': len(workshops)
                })

            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/workshops/<int:workshop_id>')
        def admin_get_workshop(workshop_id):
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401

            try:
                workshop = self.workshop_service.get_workshop_by_id(workshop_id)
                if not workshop:
                    return jsonify({'success': False, 'error': 'Workshop not found'}), 404

                return jsonify({
                    'success': True,
                    'workshop': workshop
                })

            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        # === CREATIVE ARENA API ROUTES ===
        @bp.route('/api/creative-arena/tools')
        def admin_get_tools():
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401

            try:
                tools = self.creative_arena_service.get_available_tools()
                stats = self.creative_arena_service.get_tools_stats()

                return jsonify({
                    'success': True,
                    'tools': tools,
                    'stats': stats
                })

            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        @bp.route('/api/creative-arena/subscribers')
        def admin_get_subscribers():
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401

            try:
                count = self.creative_arena_service.get_subscribers_count()
                
                return jsonify({
                    'success': True,
                    'subscribers_count': count
                })

            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        # === ANALYTICS API ROUTES ===
        @bp.route('/api/analytics/overview')
        def admin_get_analytics_overview():
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401

            try:
                # Aggregate stats from all services
                club_stats = self.club_service.get_clubs_stats()
                event_stats = self.event_service.get_events_stats()
                artwork_stats = self.artwork_service.get_artworks_stats()
                workshop_stats = self.workshop_service.get_workshops_stats()
                blog_stats = self.blog_service.get_post_stats()
                creative_stats = self.creative_arena_service.get_tools_stats()

                analytics = {
                    'total_views': 50000,  # Mock data - implement real analytics
                    'active_users': 1250,
                    'event_registrations': event_stats.get('total_registered', 0),
                    'notes_downloads': 2500,  # Mock data
                    'club_performance': {
                        'total_clubs': club_stats.get('total_clubs', 0),
                        'total_members': club_stats.get('total_members', 0),
                        'active_events': event_stats.get('upcoming_events', 0)
                    },
                    'content_performance': {
                        'total_posts': blog_stats.get('total_posts', 0),
                        'published_posts': blog_stats.get('published_posts', 0),
                        'total_artworks': artwork_stats.get('total_artworks', 0),
                        'featured_artworks': artwork_stats.get('featured_artworks', 0)
                    },
                    'engagement_metrics': {
                        'total_likes': artwork_stats.get('total_likes', 0),
                        'total_views': artwork_stats.get('total_views', 0),
                        'workshop_enrollments': workshop_stats.get('total_enrolled', 0),
                        'tool_subscribers': creative_stats.get('subscribers', 0)
                    }
                }

                return jsonify({
                    'success': True,
                    'analytics': analytics
                })

            except Exception as e:
                return jsonify({'success': False, 'error': str(e)}), 500

        # === BLOG API ROUTES (Existing) ===
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

        # === NOTES API ROUTES (Existing) ===
        @bp.route('/api/notes/<course>/<semester>/<subject>')
        def admin_list_notes(course, semester, subject):
            if not self.auth_service.is_authenticated():
                return jsonify({'error': 'Unauthorized'}), 401

            try:
                files = FileService.list_subject_files(course, semester, subject)
                return jsonify(files)
            except Exception as e:
                return jsonify({'error': str(e)}), 500
        @bp.route('/admin/clubs/<club_id>/manage')
        def admin_manage_club_events(club_id):
            if not self.auth_service.is_authenticated():
                return redirect(url_for('admin.admin_login'))
            
            # Verify club exists
            club = self.club_service.get_club_by_id(club_id)
            if not club:
                flash('Club not found', 'error')
                return redirect(url_for('admin.admin_clubs'))
            
            return render_template('club_event_management.html', club=club)

# Create instance for app registration
admin_routes = AdminRoutes()
bp = admin_routes.bp
