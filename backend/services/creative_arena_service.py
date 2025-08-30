import os
import json
from typing import List, Dict
from datetime import datetime

class CreativeArenaService:
    def __init__(self):
        self.CREATIVE_DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..', 'data', 'creative_arena'))
        self.TOOLS_FILE = os.path.join(self.CREATIVE_DATA_PATH, 'tools.json')
        self.SUBSCRIBERS_FILE = os.path.join(self.CREATIVE_DATA_PATH, 'subscribers.json')
        self._ensure_creative_data()

    def _ensure_creative_data(self):
        """Ensure creative arena directory and data files exist"""
        os.makedirs(self.CREATIVE_DATA_PATH, exist_ok=True)
        
        if not os.path.exists(self.TOOLS_FILE):
            initial_tools_data = {
                "tools": [
                    {
                        "id": 1,
                        "name": "AI Image Generator",
                        "description": "Create stunning images from text descriptions using advanced AI technology",
                        "status": "coming_soon",
                        "category": "visual",
                        "features": ["Text-to-Image", "High Resolution", "Multiple Styles"],
                        "icon": "🎨",
                        "estimated_release": "2025-10-15",
                        "difficulty": "easy",
                        "popularity": 95
                    },
                    {
                        "id": 2,
                        "name": "Color Palette Generator",
                        "description": "Generate beautiful color palettes for your design projects",
                        "status": "coming_soon",
                        "category": "design",
                        "features": ["Random Generation", "Export Options", "Color Theory"],
                        "icon": "🎨",
                        "estimated_release": "2025-09-30",
                        "difficulty": "easy",
                        "popularity": 88
                    },
                    {
                        "id": 3,
                        "name": "AI Writing Assistant",
                        "description": "Get help with essays, creative writing, and academic papers",
                        "status": "coming_soon",
                        "category": "writing",
                        "features": ["Grammar Check", "Style Suggestions", "Plagiarism Detection"],
                        "icon": "✍️",
                        "estimated_release": "2025-11-01",
                        "difficulty": "medium",
                        "popularity": 92
                    },
                    {
                        "id": 4,
                        "name": "Music Composer",
                        "description": "Create melodies and beats for your creative projects",
                        "status": "coming_soon",
                        "category": "audio",
                        "features": ["AI Composition", "Multiple Genres", "Export to MIDI"],
                        "icon": "🎵",
                        "estimated_release": "2025-12-15",
                        "difficulty": "medium",
                        "popularity": 85
                    },
                    {
                        "id": 5,
                        "name": "Video Editor",
                        "description": "Edit videos with AI-powered features and effects",
                        "status": "coming_soon",
                        "category": "video",
                        "features": ["Auto-Edit", "Effects Library", "HD Export"],
                        "icon": "🎬",
                        "estimated_release": "2026-01-20",
                        "difficulty": "hard",
                        "popularity": 89
                    },
                    {
                        "id": 6,
                        "name": "Presentation Maker",
                        "description": "Create professional presentations with AI assistance",
                        "status": "coming_soon",
                        "category": "productivity",
                        "features": ["Smart Templates", "Auto-Design", "Export Options"],
                        "icon": "📊",
                        "estimated_release": "2025-10-30",
                        "difficulty": "easy",
                        "popularity": 91
                    }
                ]
            }
            self._save_tools_data(initial_tools_data)

        if not os.path.exists(self.SUBSCRIBERS_FILE):
            initial_subscribers_data = {
                "subscribers": [],
                "stats": {
                    "total_subscribers": 0,
                    "weekly_signups": 0,
                    "monthly_signups": 0
                }
            }
            self._save_subscribers_data(initial_subscribers_data)

    def _load_tools_data(self) -> Dict:
        """Load tools data from JSON file"""
        try:
            with open(self.TOOLS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            self._ensure_creative_data()
            return self._load_tools_data()

    def _save_tools_data(self, data: Dict):
        """Save tools data to JSON file"""
        with open(self.TOOLS_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def _load_subscribers_data(self) -> Dict:
        """Load subscribers data from JSON file"""
        try:
            with open(self.SUBSCRIBERS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            self._ensure_creative_data()
            return self._load_subscribers_data()

    def _save_subscribers_data(self, data: Dict):
        """Save subscribers data to JSON file"""
        with open(self.SUBSCRIBERS_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def get_available_tools(self) -> List[Dict]:
        """Get all available tools"""
        data = self._load_tools_data()
        tools = data.get('tools', [])
        # Sort by popularity
        tools.sort(key=lambda x: x.get('popularity', 0), reverse=True)
        return tools

    def get_tools_by_category(self, category: str) -> List[Dict]:
        """Get tools by category"""
        tools = self.get_available_tools()
        return [tool for tool in tools if tool.get('category', '').lower() == category.lower()]

    def get_tools_by_status(self, status: str) -> List[Dict]:
        """Get tools by status (available, coming_soon, beta)"""
        tools = self.get_available_tools()
        return [tool for tool in tools if tool.get('status', '').lower() == status.lower()]

    def get_popular_tools(self, limit: int = 6) -> List[Dict]:
        """Get most popular tools"""
        tools = self.get_available_tools()
        return tools[:limit]  # Already sorted by popularity

    def search_tools(self, query: str) -> List[Dict]:
        """Search tools by name, description, or features"""
        tools = self.get_available_tools()
        query_lower = query.lower()
        
        matching_tools = []
        for tool in tools:
            if (query_lower in tool.get('name', '').lower() or 
                query_lower in tool.get('description', '').lower() or
                any(query_lower in feature.lower() for feature in tool.get('features', []))):
                matching_tools.append(tool)
        
        return matching_tools

    def get_tool_by_id(self, tool_id: int) -> Dict:
        """Get tool by ID"""
        tools = self.get_available_tools()
        for tool in tools:
            if tool.get('id') == tool_id:
                return tool
        return None

    def subscribe_email(self, email: str) -> bool:
        """Subscribe email for notifications"""
        data = self._load_subscribers_data()
        
        # Check if email already exists
        existing_emails = [sub.get('email') for sub in data.get('subscribers', [])]
        if email in existing_emails:
            return False  # Already subscribed
        
        # Add new subscriber
        new_subscriber = {
            'email': email,
            'subscribed_date': datetime.now().isoformat(),
            'status': 'active'
        }
        
        data['subscribers'].append(new_subscriber)
        data['stats']['total_subscribers'] = len(data['subscribers'])
        
        self._save_subscribers_data(data)
        return True

    def get_subscribers_count(self) -> int:
        """Get total number of subscribers"""
        data = self._load_subscribers_data()
        return data.get('stats', {}).get('total_subscribers', 0)

    def get_tools_stats(self) -> Dict:
        """Get tools statistics"""
        tools = self.get_available_tools()
        categories = set(tool.get('category', '') for tool in tools)
        
        return {
            'total_tools': len(tools),
            'categories': len(categories),
            'coming_soon': len(self.get_tools_by_status('coming_soon')),
            'available': len(self.get_tools_by_status('available')),
            'beta': len(self.get_tools_by_status('beta')),
            'subscribers': self.get_subscribers_count()
        }

    def get_categories(self) -> List[str]:
        """Get all tool categories"""
        tools = self.get_available_tools()
        categories = set()
        for tool in tools:
            if tool.get('category'):
                categories.add(tool['category'])
        return sorted(list(categories))
