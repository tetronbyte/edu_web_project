import os
import json
from typing import List, Dict, Optional
from datetime import datetime, timedelta

class EventService:
    def __init__(self):
        self.EVENTS_DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..', 'data', 'events'))
        self.EVENTS_FILE = os.path.join(self.EVENTS_DATA_PATH, 'events.json')
        self._ensure_events_data()

    def _ensure_events_data(self):
        """Ensure events directory and data file exist"""
        os.makedirs(self.EVENTS_DATA_PATH, exist_ok=True)
        
        if not os.path.exists(self.EVENTS_FILE):
            # Generate some sample events
            today = datetime.now()
            future_dates = [today + timedelta(days=i*7) for i in range(1, 13)]
            
            initial_data = {
                "events": [
                    {
                        "id": 1,
                        "title": "Art Exhibition Opening",
                        "description": "Showcase of student artwork and design projects from the semester",
                        "club_id": "art_design",
                        "club_name": "Art & Design Club",
                        "date": future_dates[0].strftime("%Y-%m-%d"),
                        "time": "18:00",
                        "end_time": "21:00",
                        "location": "Art Gallery",
                        "capacity": 50,
                        "registered": 23,
                        "type": "Exhibition",
                        "featured": True,
                        "registration_required": True,
                        "registration_deadline": (future_dates[0] - timedelta(days=2)).strftime("%Y-%m-%d"),
                        "tags": ["art", "exhibition", "creativity"]
                    },
                    {
                        "id": 2,
                        "title": "Photography Workshop",
                        "description": "Learn advanced photography techniques with professional equipment",
                        "club_id": "photography",
                        "club_name": "Photography Club",
                        "date": future_dates[1].strftime("%Y-%m-%d"),
                        "time": "14:00",
                        "end_time": "17:00",
                        "location": "Media Center",
                        "capacity": 20,
                        "registered": 15,
                        "type": "Workshop",
                        "featured": True,
                        "registration_required": True,
                        "registration_deadline": (future_dates[1] - timedelta(days=3)).strftime("%Y-%m-%d"),
                        "tags": ["photography", "workshop", "learning"]
                    },
                    {
                        "id": 3,
                        "title": "Dance Competition",
                        "description": "Annual inter-college dance competition with multiple categories",
                        "club_id": "dance",
                        "club_name": "Dance Club",
                        "date": future_dates[2].strftime("%Y-%m-%d"),
                        "time": "19:00",
                        "end_time": "22:00",
                        "location": "Main Auditorium",
                        "capacity": 200,
                        "registered": 145,
                        "type": "Competition",
                        "featured": True,
                        "registration_required": True,
                        "registration_deadline": (future_dates[2] - timedelta(days=5)).strftime("%Y-%m-%d"),
                        "tags": ["dance", "competition", "performance"]
                    },
                    {
                        "id": 4,
                        "title": "Drama Workshop: Acting Fundamentals",
                        "description": "Introduction to basic acting techniques and stage presence",
                        "club_id": "drama",
                        "club_name": "Drama Club",
                        "date": future_dates[3].strftime("%Y-%m-%d"),
                        "time": "16:00",
                        "end_time": "18:00",
                        "location": "Theater Hall",
                        "capacity": 25,
                        "registered": 18,
                        "type": "Workshop",
                        "featured": False,
                        "registration_required": True,
                        "registration_deadline": (future_dates[3] - timedelta(days=2)).strftime("%Y-%m-%d"),
                        "tags": ["drama", "acting", "workshop"]
                    },
                    {
                        "id": 5,
                        "title": "Chess Tournament",
                        "description": "Monthly chess tournament open to all skill levels",
                        "club_id": "chess",
                        "club_name": "Chess Club",
                        "date": future_dates[4].strftime("%Y-%m-%d"),
                        "time": "15:00",
                        "end_time": "19:00",
                        "location": "Library Hall",
                        "capacity": 32,
                        "registered": 28,
                        "type": "Tournament",
                        "featured": False,
                        "registration_required": True,
                        "registration_deadline": (future_dates[4] - timedelta(days=7)).strftime("%Y-%m-%d"),
                        "tags": ["chess", "tournament", "strategy"]
                    },
                    {
                        "id": 6,
                        "title": "Sports Day",
                        "description": "Annual sports day with multiple events and competitions",
                        "club_id": "sports",
                        "club_name": "Sports Club",
                        "date": future_dates[5].strftime("%Y-%m-%d"),
                        "time": "09:00",
                        "end_time": "17:00",
                        "location": "Sports Complex",
                        "capacity": 100,
                        "registered": 67,
                        "type": "Competition",
                        "featured": True,
                        "registration_required": True,
                        "registration_deadline": (future_dates[5] - timedelta(days=10)).strftime("%Y-%m-%d"),
                        "tags": ["sports", "competition", "athletics"]
                    }
                ]
            }
            self._save_events_data(initial_data)

    def _load_events_data(self) -> Dict:
        """Load events data from JSON file"""
        try:
            with open(self.EVENTS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            self._ensure_events_data()
            return self._load_events_data()

    def _save_events_data(self, data: Dict):
        """Save events data to JSON file"""
        with open(self.EVENTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def get_all_events(self) -> List[Dict]:
        """Get all events sorted by date"""
        data = self._load_events_data()
        events = data.get('events', [])
        # Sort by date
        events.sort(key=lambda x: x.get('date', ''))
        return events

    def get_events_by_club(self, club_id: str) -> List[Dict]:
        """Get events for a specific club"""
        events = self.get_all_events()
        return [event for event in events if event.get('club_id') == club_id]

    def get_upcoming_events(self, limit: int = 10) -> List[Dict]:
        """Get upcoming events within the limit"""
        events = self.get_all_events()
        today = datetime.now().date()
        
        upcoming = []
        for event in events:
            try:
                event_date = datetime.strptime(event['date'], '%Y-%m-%d').date()
                if event_date >= today:
                    upcoming.append(event)
            except (ValueError, KeyError):
                continue
                
        return upcoming[:limit]

    def get_featured_events(self) -> List[Dict]:
        """Get featured events"""
        events = self.get_all_events()
        return [event for event in events if event.get('featured', False)]

    def get_events_by_type(self, event_type: str) -> List[Dict]:
        """Get events by type (Workshop, Competition, Exhibition, etc.)"""
        events = self.get_all_events()
        return [event for event in events if event.get('type', '').lower() == event_type.lower()]

    def search_events(self, query: str) -> List[Dict]:
        """Search events by title, description, or tags"""
        events = self.get_all_events()
        query_lower = query.lower()
        
        matching_events = []
        for event in events:
            if (query_lower in event.get('title', '').lower() or 
                query_lower in event.get('description', '').lower() or
                any(query_lower in tag.lower() for tag in event.get('tags', []))):
                matching_events.append(event)
        
        return matching_events

    def get_event_by_id(self, event_id: int) -> Optional[Dict]:
        """Get event by ID"""
        events = self.get_all_events()
        for event in events:
            if event.get('id') == event_id:
                return event
        return None

    def get_events_stats(self) -> Dict:
        """Get events statistics"""
        events = self.get_all_events()
        upcoming = self.get_upcoming_events()
        
        total_capacity = sum(event.get('capacity', 0) for event in events)
        total_registered = sum(event.get('registered', 0) for event in events)
        
        return {
            'total_events': len(events),
            'upcoming_events': len(upcoming),
            'featured_events': len(self.get_featured_events()),
            'total_capacity': total_capacity,
            'total_registered': total_registered,
            'registration_rate': round((total_registered / total_capacity * 100), 2) if total_capacity > 0 else 0
        }
    def register_for_event(self, event_id: int, registration_data: Dict) -> Dict:
        """Register user for an event"""
        events_data = self._load_events_data()
        event = self.get_event_by_id(event_id)
        
        if not event:
            raise ValueError("Event not found")
        
        if event.get('registered', 0) >= event.get('capacity', 0):
            raise ValueError("Event is full")
        
        # Initialize registrations if not exists
        if 'registrations' not in events_data:
            events_data['registrations'] = {}
        
        if str(event_id) not in events_data['registrations']:
            events_data['registrations'][str(event_id)] = []
        
        # Add registration
        registration = {
            'id': len(events_data['registrations'][str(event_id)]) + 1,
            'name': registration_data.get('name'),
            'email': registration_data.get('email'),
            'phone': registration_data.get('phone', ''),
            'registration_date': datetime.now().isoformat(),
            'status': 'confirmed'
        }
        
        events_data['registrations'][str(event_id)].append(registration)
        
        # Update event registered count
        for event in events_data['events']:
            if event['id'] == event_id:
                event['registered'] = len(events_data['registrations'][str(event_id)])
                break
        
        self._save_events_data(events_data)
        return registration

    def get_event_registrations(self, event_id: int) -> List[Dict]:
        """Get all registrations for an event"""
        events_data = self._load_events_data()
        return events_data.get('registrations', {}).get(str(event_id), [])

    def create_announcement(self, announcement_data: Dict) -> Dict:
        """Create event announcement"""
        events_data = self._load_events_data()
        
        if 'announcements' not in events_data:
            events_data['announcements'] = []
        
        announcement = {
            'id': len(events_data['announcements']) + 1,
            'event_id': announcement_data.get('event_id'),
            'club_id': announcement_data.get('club_id'),
            'title': announcement_data.get('title'),
            'content': announcement_data.get('content'),
            'created_date': datetime.now().isoformat(),
            'send_email': announcement_data.get('send_email', False),
            'email_sent': False,
            'priority': announcement_data.get('priority', 'normal')
        }
        
        events_data['announcements'].append(announcement)
        self._save_events_data(events_data)
        
        # Send email if requested
        if announcement['send_email']:
            self._send_announcement_email(announcement)
        
        return announcement

    def _send_announcement_email(self, announcement: Dict):
        """Send announcement via email (placeholder - implement your email service)"""
        # Implement your email sending logic here
        # For now, just mark as sent
        events_data = self._load_events_data()
        for ann in events_data['announcements']:
            if ann['id'] == announcement['id']:
                ann['email_sent'] = True
                break
        self._save_events_data(events_data)

    def get_club_announcements(self, club_id: str) -> List[Dict]:
        """Get announcements for a specific club"""
        events_data = self._load_events_data()
        announcements = events_data.get('announcements', [])
        return [ann for ann in announcements if ann.get('club_id') == club_id]

    def archive_event(self, event_id: int) -> bool:
        """Archive an event"""
        events_data = self._load_events_data()
        
        for event in events_data['events']:
            if event['id'] == event_id:
                event['archived'] = True
                event['archived_date'] = datetime.now().isoformat()
                self._save_events_data(events_data)
                return True
        return False

    def get_archived_events(self, club_id: str = None) -> List[Dict]:
        """Get archived events"""
        events_data = self._load_events_data()
        events = events_data.get('events', [])
        archived = [event for event in events if event.get('archived', False)]
        
        if club_id:
            archived = [event for event in archived if event.get('club_id') == club_id]
        
        return archived

    def restore_event(self, event_id: int) -> bool:
        """Restore an archived event"""
        events_data = self._load_events_data()
        
        for event in events_data['events']:
            if event['id'] == event_id:
                event['archived'] = False
                if 'archived_date' in event:
                    del event['archived_date']
                self._save_events_data(events_data)
                return True
        return False
