import os
import json
from typing import List, Dict, Optional
from datetime import datetime

class ClubService:
    def __init__(self):
        self.CLUBS_DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..', 'data', 'clubs'))
        self.CLUBS_FILE = os.path.join(self.CLUBS_DATA_PATH, 'clubs.json')
        self._ensure_clubs_data()

    def _ensure_clubs_data(self):
        """Ensure clubs directory and data file exist"""
        os.makedirs(self.CLUBS_DATA_PATH, exist_ok=True)
        
        if not os.path.exists(self.CLUBS_FILE):
            initial_data = {
                "clubs": [
                    {
                        "id": "art_design",
                        "name": "Art & Design Club",
                        "description": "Express your creativity through various art forms and design projects.",
                        "short_description": "Creativity through art and design",
                        "members": 30,
                        "workshops": 8,
                        "projects": 12,
                        "established": "2020-01-15",
                        "meeting_day": "Friday",
                        "meeting_time": "16:00",
                        "location": "Art Studio",
                        "contact_email": "artclub@university.edu",
                        "social_links": {
                            "instagram": "@artdesignclub",
                            "facebook": "ArtDesignClub"
                        },
                        "tags": ["creative", "art", "design", "visual"],
                        "featured": True
                    },
                    {
                        "id": "dance",
                        "name": "Dance Club", 
                        "description": "Move to the rhythm and learn various dance styles in a fun environment.",
                        "short_description": "Learn various dance styles",
                        "members": 40,
                        "dance_styles": 6,
                        "performances": 10,
                        "established": "2019-08-20",
                        "meeting_day": "Wednesday",
                        "meeting_time": "18:00",
                        "location": "Dance Studio",
                        "contact_email": "danceclub@university.edu",
                        "social_links": {
                            "instagram": "@danceclub",
                            "youtube": "DanceClubVideos"
                        },
                        "tags": ["dance", "performance", "fitness", "cultural"],
                        "featured": True
                    },
                    {
                        "id": "photography",
                        "name": "Photography Club",
                        "description": "Capture moments and develop your photography skills with fellow enthusiasts.",
                        "short_description": "Develop photography skills",
                        "members": 25,
                        "equipment": "Available",
                        "photo_walks": 15,
                        "established": "2020-03-10",
                        "meeting_day": "Saturday",
                        "meeting_time": "14:00",
                        "location": "Media Center",
                        "contact_email": "photoclub@university.edu",
                        "social_links": {
                            "instagram": "@photoclub",
                            "flickr": "UniversityPhotoClub"
                        },
                        "tags": ["photography", "visual", "nature", "portraits"],
                        "featured": True
                    },
                    {
                        "id": "drama",
                        "name": "Drama Club",
                        "description": "Unleash your acting potential and participate in theatrical productions.",
                        "short_description": "Acting and theater productions",
                        "members": 35,
                        "productions": 4,
                        "workshops": 12,
                        "established": "2018-09-05",
                        "meeting_day": "Tuesday",
                        "meeting_time": "17:00",
                        "location": "Theater Hall",
                        "contact_email": "dramaclub@university.edu",
                        "social_links": {
                            "instagram": "@dramaclub",
                            "facebook": "DramaClub"
                        },
                        "tags": ["theater", "acting", "performance", "literature"],
                        "featured": False
                    },
                    {
                        "id": "sports",
                        "name": "Sports Club",
                        "description": "Stay active and competitive with various sports activities and tournaments.",
                        "short_description": "Various sports activities",
                        "members": 60,
                        "sports": 8,
                        "tournaments": 20,
                        "established": "2017-01-12",
                        "meeting_day": "Multiple",
                        "meeting_time": "Variable",
                        "location": "Sports Complex",
                        "contact_email": "sportsclub@university.edu",
                        "social_links": {
                            "instagram": "@sportsclub",
                            "facebook": "SportsClub"
                        },
                        "tags": ["sports", "fitness", "competition", "teamwork"],
                        "featured": False
                    },
                    {
                        "id": "chess",
                        "name": "Chess Club",
                        "description": "Strategic thinking and competitive chess matches.",
                        "short_description": "Strategic chess matches",
                        "members": 20,
                        "tournaments": 8,
                        "rating_sessions": 24,
                        "established": "2019-02-28",
                        "meeting_day": "Thursday",
                        "meeting_time": "15:30",
                        "location": "Library Hall",
                        "contact_email": "chessclub@university.edu",
                        "social_links": {
                            "facebook": "ChessClub"
                        },
                        "tags": ["chess", "strategy", "competition", "mental"],
                        "featured": False
                    }
                ]
            }
            self._save_clubs_data(initial_data)

    def _load_clubs_data(self) -> Dict:
        """Load clubs data from JSON file"""
        try:
            with open(self.CLUBS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            self._ensure_clubs_data()
            return self._load_clubs_data()

    def _save_clubs_data(self, data: Dict):
        """Save clubs data to JSON file"""
        with open(self.CLUBS_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def get_all_clubs(self) -> List[Dict]:
        """Get all clubs"""
        data = self._load_clubs_data()
        return data.get('clubs', [])

    def get_club_by_id(self, club_id: str) -> Optional[Dict]:
        """Get a club by its ID"""
        clubs = self.get_all_clubs()
        for club in clubs:
            if club['id'] == club_id:
                return club
        return None

    def get_featured_clubs(self) -> List[Dict]:
        """Get featured clubs"""
        clubs = self.get_all_clubs()
        return [club for club in clubs if club.get('featured', False)]

    def search_clubs(self, query: str) -> List[Dict]:
        """Search clubs by name, description, or tags"""
        clubs = self.get_all_clubs()
        query_lower = query.lower()
        
        matching_clubs = []
        for club in clubs:
            if (query_lower in club['name'].lower() or 
                query_lower in club['description'].lower() or
                any(query_lower in tag.lower() for tag in club.get('tags', []))):
                matching_clubs.append(club)
        
        return matching_clubs

    def get_clubs_stats(self) -> Dict:
        """Get overall clubs statistics"""
        clubs = self.get_all_clubs()
        total_members = sum(club.get('members', 0) for club in clubs)
        
        return {
            'total_clubs': len(clubs),
            'total_members': total_members,
            'featured_clubs': len(self.get_featured_clubs()),
            'established_clubs': len([c for c in clubs if c.get('established')])
        }
