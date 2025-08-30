import os
import json
from typing import List, Dict, Optional
from datetime import datetime

class ArtworkService:
    def __init__(self):
        self.ARTWORKS_DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..', 'data', 'artworks'))
        self.ARTWORKS_FILE = os.path.join(self.ARTWORKS_DATA_PATH, 'artworks.json')
        self._ensure_artworks_data()

    def _ensure_artworks_data(self):
        """Ensure artworks directory and data file exist"""
        os.makedirs(self.ARTWORKS_DATA_PATH, exist_ok=True)
        
        if not os.path.exists(self.ARTWORKS_FILE):
            initial_data = {
                "artworks": [
                    {
                        "id": 1,
                        "title": "Digital Dreams",
                        "artist": "Sarah Johnson",
                        "club_id": "art_design",
                        "description": "A vibrant digital art piece exploring futuristic themes and technology",
                        "medium": "Digital Art",
                        "category": "Digital",
                        "created_date": "2025-07-15",
                        "featured": True,
                        "likes": 156,
                        "views": 1205,
                        "image_path": "/static/images/artworks/digital_dreams.jpg",
                        "thumbnail_path": "/static/images/artworks/thumbs/digital_dreams_thumb.jpg",
                        "dimensions": "3840x2160",
                        "tags": ["digital", "futuristic", "technology", "vibrant"],
                        "exhibition_status": "displayed",
                        "award": "Best Digital Art 2025"
                    },
                    {
                        "id": 2,
                        "title": "Nature's Canvas",
                        "artist": "Mike Chen",
                        "club_id": "art_design",
                        "description": "Traditional oil painting inspired by natural landscapes and seasonal changes",
                        "medium": "Oil on Canvas",
                        "category": "Painting",
                        "created_date": "2025-06-20",
                        "featured": True,
                        "likes": 203,
                        "views": 945,
                        "image_path": "/static/images/artworks/natures_canvas.jpg",
                        "thumbnail_path": "/static/images/artworks/thumbs/natures_canvas_thumb.jpg",
                        "dimensions": "60x40 cm",
                        "tags": ["nature", "landscape", "oil painting", "traditional"],
                        "exhibition_status": "displayed",
                        "award": None
                    },
                    {
                        "id": 3,
                        "title": "Urban Sketches",
                        "artist": "Emily Davis",
                        "club_id": "art_design",
                        "description": "Collection of architectural sketches from city exploration and urban adventures",
                        "medium": "Pencil and Charcoal",
                        "category": "Sketching",
                        "created_date": "2025-08-01",
                        "featured": False,
                        "likes": 89,
                        "views": 567,
                        "image_path": "/static/images/artworks/urban_sketches.jpg",
                        "thumbnail_path": "/static/images/artworks/thumbs/urban_sketches_thumb.jpg",
                        "dimensions": "A4 Series",
                        "tags": ["urban", "architecture", "sketching", "charcoal"],
                        "exhibition_status": "archived",
                        "award": None
                    },
                    {
                        "id": 4,
                        "title": "Abstract Emotions",
                        "artist": "David Wilson",
                        "club_id": "art_design",
                        "description": "Abstract acrylic painting exploring human emotions through color and form",
                        "medium": "Acrylic on Canvas",
                        "category": "Abstract",
                        "created_date": "2025-07-28",
                        "featured": True,
                        "likes": 134,
                        "views": 823,
                        "image_path": "/static/images/artworks/abstract_emotions.jpg",
                        "thumbnail_path": "/static/images/artworks/thumbs/abstract_emotions_thumb.jpg",
                        "dimensions": "80x60 cm",
                        "tags": ["abstract", "emotions", "acrylic", "colorful"],
                        "exhibition_status": "displayed",
                        "award": "People's Choice Award"
                    },
                    {
                        "id": 5,
                        "title": "Sculpture Series: Growth",
                        "artist": "Lisa Wang",
                        "club_id": "art_design",
                        "description": "3D sculpture representing growth and transformation in nature",
                        "medium": "Clay and Metal",
                        "category": "Sculpture",
                        "created_date": "2025-06-10",
                        "featured": False,
                        "likes": 78,
                        "views": 445,
                        "image_path": "/static/images/artworks/sculpture_growth.jpg",
                        "thumbnail_path": "/static/images/artworks/thumbs/sculpture_growth_thumb.jpg",
                        "dimensions": "30x25x15 cm",
                        "tags": ["sculpture", "3d", "nature", "transformation"],
                        "exhibition_status": "displayed",
                        "award": None
                    }
                ]
            }
            self._save_artworks_data(initial_data)

    def _load_artworks_data(self) -> Dict:
        """Load artworks data from JSON file"""
        try:
            with open(self.ARTWORKS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            self._ensure_artworks_data()
            return self._load_artworks_data()

    def _save_artworks_data(self, data: Dict):
        """Save artworks data to JSON file"""
        with open(self.ARTWORKS_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def get_all_artworks(self) -> List[Dict]:
        """Get all artworks"""
        data = self._load_artworks_data()
        artworks = data.get('artworks', [])
        # Sort by created_date (newest first)
        artworks.sort(key=lambda x: x.get('created_date', ''), reverse=True)
        return artworks

    def get_artworks_by_club(self, club_id: str) -> List[Dict]:
        """Get artworks for a specific club"""
        artworks = self.get_all_artworks()
        return [artwork for artwork in artworks if artwork.get('club_id') == club_id]

    def get_featured_artworks(self) -> List[Dict]:
        """Get featured artworks"""
        artworks = self.get_all_artworks()
        return [artwork for artwork in artworks if artwork.get('featured', False)]

    def get_artworks_by_category(self, category: str) -> List[Dict]:
        """Get artworks by category"""
        artworks = self.get_all_artworks()
        return [artwork for artwork in artworks if artwork.get('category', '').lower() == category.lower()]

    def get_artworks_by_artist(self, artist: str) -> List[Dict]:
        """Get artworks by artist"""
        artworks = self.get_all_artworks()
        return [artwork for artwork in artworks if artist.lower() in artwork.get('artist', '').lower()]

    def search_artworks(self, query: str) -> List[Dict]:
        """Search artworks by title, artist, description, or tags"""
        artworks = self.get_all_artworks()
        query_lower = query.lower()
        
        matching_artworks = []
        for artwork in artworks:
            if (query_lower in artwork.get('title', '').lower() or 
                query_lower in artwork.get('artist', '').lower() or
                query_lower in artwork.get('description', '').lower() or
                any(query_lower in tag.lower() for tag in artwork.get('tags', []))):
                matching_artworks.append(artwork)
        
        return matching_artworks

    def get_artwork_by_id(self, artwork_id: int) -> Optional[Dict]:
        """Get artwork by ID"""
        artworks = self.get_all_artworks()
        for artwork in artworks:
            if artwork.get('id') == artwork_id:
                return artwork
        return None

    def get_categories(self) -> List[str]:
        """Get all unique categories"""
        artworks = self.get_all_artworks()
        categories = set()
        for artwork in artworks:
            if artwork.get('category'):
                categories.add(artwork['category'])
        return sorted(list(categories))

    def get_artists(self) -> List[str]:
        """Get all unique artists"""
        artworks = self.get_all_artworks()
        artists = set()
        for artwork in artworks:
            if artwork.get('artist'):
                artists.add(artwork['artist'])
        return sorted(list(artists))

    def get_artworks_stats(self) -> Dict:
        """Get artworks statistics"""
        artworks = self.get_all_artworks()
        
        total_likes = sum(artwork.get('likes', 0) for artwork in artworks)
        total_views = sum(artwork.get('views', 0) for artwork in artworks)
        
        return {
            'total_artworks': len(artworks),
            'featured_artworks': len(self.get_featured_artworks()),
            'total_artists': len(self.get_artists()),
            'total_categories': len(self.get_categories()),
            'total_likes': total_likes,
            'total_views': total_views,
            'average_likes': round(total_likes / len(artworks), 2) if artworks else 0,
            'average_views': round(total_views / len(artworks), 2) if artworks else 0
        }
