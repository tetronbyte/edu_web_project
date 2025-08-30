import os
import json
from typing import List, Dict, Optional
from datetime import datetime, timedelta

class WorkshopService:
    def __init__(self):
        self.WORKSHOPS_DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..', 'data', 'workshops'))
        self.WORKSHOPS_FILE = os.path.join(self.WORKSHOPS_DATA_PATH, 'workshops.json')
        self._ensure_workshops_data()

    def _ensure_workshops_data(self):
        """Ensure workshops directory and data file exist"""
        os.makedirs(self.WORKSHOPS_DATA_PATH, exist_ok=True)
        
        if not os.path.exists(self.WORKSHOPS_FILE):
            # Generate future dates for workshops
            today = datetime.now()
            future_dates = [today + timedelta(days=i*5) for i in range(1, 20)]
            
            initial_data = {
                "workshops": [
                    {
                        "id": 1,
                        "title": "Digital Art Fundamentals",
                        "club_id": "art_design",
                        "club_name": "Art & Design Club",
                        "instructor": "Prof. Anderson",
                        "description": "Learn the basics of digital art creation using modern tools and software",
                        "date": future_dates[0].strftime("%Y-%m-%d"),
                        "time": "14:00",
                        "end_time": "16:00",
                        "duration": "2 hours",
                        "location": "Computer Lab 1",
                        "capacity": 15,
                        "enrolled": 12,
                        "level": "Beginner",
                        "price": "Free",
                        "materials_provided": True,
                        "prerequisites": [],
                        "topics": [
                            "Digital art software introduction",
                            "Basic drawing techniques",
                            "Color theory in digital art",
                            "Layer management"
                        ],
                        "tags": ["digital art", "beginner", "software"],
                        "featured": True
                    },
                    {
                        "id": 2,
                        "title": "Advanced Painting Techniques",
                        "club_id": "art_design",
                        "club_name": "Art & Design Club",
                        "instructor": "Artist Maria Rodriguez",
                        "description": "Master advanced painting techniques and color theory for professional results",
                        "date": future_dates[2].strftime("%Y-%m-%d"),
                        "time": "15:00",
                        "end_time": "18:00",
                        "duration": "3 hours",
                        "location": "Art Studio",
                        "capacity": 10,
                        "enrolled": 8,
                        "level": "Advanced",
                        "price": "$25",
                        "materials_provided": False,
                        "prerequisites": ["Basic painting experience"],
                        "topics": [
                            "Advanced color mixing",
                            "Texture techniques",
                            "Composition principles",
                            "Professional finishing"
                        ],
                        "tags": ["painting", "advanced", "techniques"],
                        "featured": True
                    },
                    {
                        "id": 3,
                        "title": "Hip-Hop Dance Basics",
                        "club_id": "dance",
                        "club_name": "Dance Club",
                        "instructor": "Coach Mike Thompson",
                        "description": "Learn fundamental hip-hop moves and develop your street dance style",
                        "date": future_dates[1].strftime("%Y-%m-%d"),
                        "time": "18:00",
                        "end_time": "20:00",
                        "duration": "2 hours",
                        "location": "Dance Studio A",
                        "capacity": 20,
                        "enrolled": 18,
                        "level": "Beginner",
                        "price": "Free",
                        "materials_provided": True,
                        "prerequisites": [],
                        "topics": [
                            "Basic hip-hop foundations",
                            "Rhythm and timing",
                            "Freestyle techniques",
                            "Performance skills"
                        ],
                        "tags": ["hip-hop", "dance", "beginner"],
                        "featured": True
                    },
                    {
                        "id": 4,
                        "title": "Contemporary Dance Workshop",
                        "club_id": "dance",
                        "club_name": "Dance Club",
                        "instructor": "Sarah Liu",
                        "description": "Explore expressive contemporary dance movements and storytelling",
                        "date": future_dates[3].strftime("%Y-%m-%d"),
                        "time": "16:00",
                        "end_time": "18:30",
                        "duration": "2.5 hours",
                        "location": "Dance Studio B",
                        "capacity": 15,
                        "enrolled": 11,
                        "level": "Intermediate",
                        "price": "$15",
                        "materials_provided": True,
                        "prerequisites": ["Basic dance experience"],
                        "topics": [
                            "Contemporary movement principles",
                            "Emotional expression through dance",
                            "Floor work techniques",
                            "Choreography basics"
                        ],
                        "tags": ["contemporary", "dance", "intermediate"],
                        "featured": False
                    },
                    {
                        "id": 5,
                        "title": "Photography Basics",
                        "club_id": "photography",
                        "club_name": "Photography Club",
                        "instructor": "Prof. Alex Kim",
                        "description": "Learn fundamental photography techniques including composition and lighting",
                        "date": future_dates[4].strftime("%Y-%m-%d"),
                        "time": "13:00",
                        "end_time": "16:00",
                        "duration": "3 hours",
                        "location": "Media Center",
                        "capacity": 12,
                        "enrolled": 10,
                        "level": "Beginner",
                        "price": "Free",
                        "materials_provided": True,
                        "prerequisites": [],
                        "topics": [
                            "Camera basics and settings",
                            "Composition techniques",
                            "Understanding light",
                            "Basic photo editing"
                        ],
                        "tags": ["photography", "beginner", "basics"],
                        "featured": True
                    },
                    {
                        "id": 6,
                        "title": "Portrait Photography Masterclass",
                        "club_id": "photography",
                        "club_name": "Photography Club",
                        "instructor": "Maria Santos",
                        "description": "Master portrait photography with professional lighting and posing techniques",
                        "date": future_dates[6].strftime("%Y-%m-%d"),
                        "time": "14:00",
                        "end_time": "18:00",
                        "duration": "4 hours",
                        "location": "Photography Studio",
                        "capacity": 8,
                        "enrolled": 7,
                        "level": "Advanced",
                        "price": "$40",
                        "materials_provided": True,
                        "prerequisites": ["Photography basics", "Own camera"],
                        "topics": [
                            "Studio lighting setup",
                            "Posing direction",
                            "Background selection",
                            "Post-processing portraits"
                        ],
                        "tags": ["portrait", "photography", "advanced"],
                        "featured": True
                    },
                    {
                        "id": 7,
                        "title": "Acting Fundamentals",
                        "club_id": "drama",
                        "club_name": "Drama Club",
                        "instructor": "Director James Wilson",
                        "description": "Learn basic acting techniques and stage presence for theater",
                        "date": future_dates[5].strftime("%Y-%m-%d"),
                        "time": "17:00",
                        "end_time": "19:00",
                        "duration": "2 hours",
                        "location": "Theater Hall",
                        "capacity": 20,
                        "enrolled": 16,
                        "level": "Beginner",
                        "price": "Free",
                        "materials_provided": True,
                        "prerequisites": [],
                        "topics": [
                            "Voice projection",
                            "Body language and movement",
                            "Character development",
                            "Scene study basics"
                        ],
                        "tags": ["acting", "theater", "beginner"],
                        "featured": True
                    },
                    {
                        "id": 8,
                        "title": "Advanced Scene Work",
                        "club_id": "drama",
                        "club_name": "Drama Club",
                        "instructor": "Prof. Emily Chen",
                        "description": "Advanced scene work and character development for experienced actors",
                        "date": future_dates[8].strftime("%Y-%m-%d"),
                        "time": "19:00",
                        "end_time": "21:30",
                        "duration": "2.5 hours",
                        "location": "Studio Theater",
                        "capacity": 12,
                        "enrolled": 9,
                        "level": "Advanced",
                        "price": "$20",
                        "materials_provided": False,
                        "prerequisites": ["Acting fundamentals", "Audition required"],
                        "topics": [
                            "Method acting techniques",
                            "Emotional memory work",
                            "Partner scene work",
                            "Character analysis"
                        ],
                        "tags": ["acting", "advanced", "scene work"],
                        "featured": False
                    }
                ]
            }
            self._save_workshops_data(initial_data)

    def _load_workshops_data(self) -> Dict:
        """Load workshops data from JSON file"""
        try:
            with open(self.WORKSHOPS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            self._ensure_workshops_data()
            return self._load_workshops_data()

    def _save_workshops_data(self, data: Dict):
        """Save workshops data to JSON file"""
        with open(self.WORKSHOPS_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def get_all_workshops(self) -> List[Dict]:
        """Get all workshops sorted by date"""
        data = self._load_workshops_data()
        workshops = data.get('workshops', [])
        # Sort by date
        workshops.sort(key=lambda x: x.get('date', ''))
        return workshops

    def get_workshops_by_club(self, club_id: str) -> List[Dict]:
        """Get workshops for a specific club"""
        workshops = self.get_all_workshops()
        return [workshop for workshop in workshops if workshop.get('club_id') == club_id]

    def get_upcoming_workshops(self, limit: int = 10) -> List[Dict]:
        """Get upcoming workshops within the limit"""
        workshops = self.get_all_workshops()
        today = datetime.now().date()
        
        upcoming = []
        for workshop in workshops:
            try:
                workshop_date = datetime.strptime(workshop['date'], '%Y-%m-%d').date()
                if workshop_date >= today:
                    upcoming.append(workshop)
            except (ValueError, KeyError):
                continue
                
        return upcoming[:limit]

    def get_featured_workshops(self) -> List[Dict]:
        """Get featured workshops"""
        workshops = self.get_all_workshops()
        return [workshop for workshop in workshops if workshop.get('featured', False)]

    def get_workshops_by_level(self, level: str) -> List[Dict]:
        """Get workshops by difficulty level"""
        workshops = self.get_all_workshops()
        return [workshop for workshop in workshops if workshop.get('level', '').lower() == level.lower()]

    def get_workshops_by_instructor(self, instructor: str) -> List[Dict]:
        """Get workshops by instructor"""
        workshops = self.get_all_workshops()
        return [workshop for workshop in workshops if instructor.lower() in workshop.get('instructor', '').lower()]

    def search_workshops(self, query: str) -> List[Dict]:
        """Search workshops by title, description, instructor, or tags"""
        workshops = self.get_all_workshops()
        query_lower = query.lower()
        
        matching_workshops = []
        for workshop in workshops:
            if (query_lower in workshop.get('title', '').lower() or 
                query_lower in workshop.get('description', '').lower() or
                query_lower in workshop.get('instructor', '').lower() or
                any(query_lower in tag.lower() for tag in workshop.get('tags', []))):
                matching_workshops.append(workshop)
        
        return matching_workshops

    def get_workshop_by_id(self, workshop_id: int) -> Optional[Dict]:
        """Get workshop by ID"""
        workshops = self.get_all_workshops()
        for workshop in workshops:
            if workshop.get('id') == workshop_id:
                return workshop
        return None

    def get_instructors(self) -> List[str]:
        """Get all unique instructors"""
        workshops = self.get_all_workshops()
        instructors = set()
        for workshop in workshops:
            if workshop.get('instructor'):
                instructors.add(workshop['instructor'])
        return sorted(list(instructors))

    def get_workshops_stats(self) -> Dict:
        """Get workshops statistics"""
        workshops = self.get_all_workshops()
        upcoming = self.get_upcoming_workshops()
        
        total_capacity = sum(workshop.get('capacity', 0) for workshop in workshops)
        total_enrolled = sum(workshop.get('enrolled', 0) for workshop in workshops)
        
        return {
            'total_workshops': len(workshops),
            'upcoming_workshops': len(upcoming),
            'featured_workshops': len(self.get_featured_workshops()),
            'total_instructors': len(self.get_instructors()),
            'total_capacity': total_capacity,
            'total_enrolled': total_enrolled,
            'enrollment_rate': round((total_enrolled / total_capacity * 100), 2) if total_capacity > 0 else 0
        }
