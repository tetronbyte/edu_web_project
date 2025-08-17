import os
import json
import uuid
import re
from datetime import datetime
from typing import List, Dict, Optional

class BlogService:
    def __init__(self):
        self.BLOG_DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '../..', 'data', 'blog'))
        self.BLOG_POSTS_FILE = os.path.join(self.BLOG_DATA_PATH, 'posts.json')
        self._ensure_blog_data()

    def _ensure_blog_data(self):
        """Ensure blog directory and data file exist"""
        os.makedirs(self.BLOG_DATA_PATH, exist_ok=True)
        
        if not os.path.exists(self.BLOG_POSTS_FILE):
            initial_data = {
                "posts": [
                    {
                        "id": str(uuid.uuid4()),
                        "title": "Welcome to Our Study Portal Blog",
                        "excerpt": "This is your first blog post! Start writing about academic topics, study tips, and more.",
                        "content": "<p>Welcome to the Study Portal Blog! This is where we'll share valuable insights, study tips, tutorials, and important announcements.</p><p>Stay tuned for more content!</p>",
                        "category": "announcements",
                        "date": datetime.now().isoformat(),
                        "readTime": 2,
                        "featured": True,
                        "image": None,
                        "author": "Admin",
                        "published": True
                    }
                ]
            }
            self._save_blog_data(initial_data)

    def _load_blog_data(self) -> Dict:
        """Load blog data from JSON file"""
        try:
            with open(self.BLOG_POSTS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            self._ensure_blog_data()
            return self._load_blog_data()

    def _save_blog_data(self, data: Dict):
        """Save blog data to JSON file"""
        with open(self.BLOG_POSTS_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def _calculate_read_time(self, content: str) -> int:
        """Calculate estimated reading time"""
        # Remove HTML tags and count words
        text = re.sub(r'<[^>]+>', '', content)
        word_count = len(text.split())
        # Average reading speed: 225 words per minute
        read_time = max(1, round(word_count / 225))
        return read_time

    def get_all_posts(self, include_unpublished: bool = False) -> List[Dict]:
        """Get all posts, optionally including unpublished ones"""
        data = self._load_blog_data()
        posts = data.get('posts', [])
        
        if not include_unpublished:
            posts = [post for post in posts if post.get('published', True)]
        
        # Sort by date (newest first)
        posts.sort(key=lambda x: x.get('date', ''), reverse=True)
        return posts

    def get_published_posts(self, category: str = '', search: str = '', limit: Optional[int] = None) -> List[Dict]:
        """Get published posts with optional filtering"""
        posts = self.get_all_posts(include_unpublished=False)
        
        # Filter by category
        if category:
            posts = [post for post in posts if post.get('category', '') == category]
        
        # Filter by search term
        if search:
            search_lower = search.lower()
            posts = [
                post for post in posts
                if search_lower in post.get('title', '').lower() or 
                   search_lower in post.get('excerpt', '').lower() or
                   search_lower in post.get('content', '').lower()
            ]
        
        # Apply limit
        if limit:
            posts = posts[:limit]
        
        return posts

    def get_post_by_id(self, post_id: str) -> Optional[Dict]:
        """Get a post by its ID"""
        data = self._load_blog_data()
        for post in data.get('posts', []):
            if post['id'] == post_id:
                return post
        return None

    def get_published_post_by_id(self, post_id: str) -> Optional[Dict]:
        """Get a published post by its ID"""
        post = self.get_post_by_id(post_id)
        if post and post.get('published', True):
            return post
        return None

    def create_post(self, post_data: Dict) -> Dict:
        """Create a new blog post"""
        # Validate required fields
        required_fields = ['title', 'content', 'category']
        for field in required_fields:
            if not post_data.get(field):
                raise ValueError(f'Missing required field: {field}')

        # Generate excerpt if not provided
        excerpt = post_data.get('excerpt', '')
        if not excerpt:
            # Generate excerpt from content
            content_text = re.sub(r'<[^>]+>', '', post_data['content'])
            excerpt = content_text[:150] + ('...' if len(content_text) > 150 else '')

        new_post = {
            'id': str(uuid.uuid4()),
            'title': post_data['title'].strip(),
            'excerpt': excerpt.strip(),
            'content': post_data['content'],
            'category': post_data['category'],
            'date': datetime.now().isoformat(),
            'readTime': post_data.get('readTime') or self._calculate_read_time(post_data['content']),
            'featured': post_data.get('featured', False),
            'image': post_data.get('image'),
            'author': 'Admin',
            'published': post_data.get('published', True)
        }

        # Add to data
        data = self._load_blog_data()
        data['posts'].append(new_post)
        self._save_blog_data(data)

        return new_post

    def update_post(self, post_id: str, post_data: Dict) -> Optional[Dict]:
        """Update an existing post"""
        data = self._load_blog_data()
        
        for post in data['posts']:
            if post['id'] == post_id:
                # Update fields
                post.update({
                    'title': post_data.get('title', post['title']).strip(),
                    'excerpt': post_data.get('excerpt', post['excerpt']).strip(),
                    'content': post_data.get('content', post['content']),
                    'category': post_data.get('category', post['category']),
                    'readTime': post_data.get('readTime') or self._calculate_read_time(post_data.get('content', post['content'])),
                    'featured': post_data.get('featured', post.get('featured', False)),
                    'image': post_data.get('image', post.get('image')),
                    'published': post_data.get('published', post.get('published', True)),
                    'lastModified': datetime.now().isoformat()
                })
                
                self._save_blog_data(data)
                return post
        
        return None

    def delete_post(self, post_id: str) -> bool:
        """Delete a post"""
        data = self._load_blog_data()
        
        for i, post in enumerate(data['posts']):
            if post['id'] == post_id:
                data['posts'].pop(i)
                self._save_blog_data(data)
                return True
        
        return False

    def toggle_post_status(self, post_id: str) -> Optional[Dict]:
        """Toggle the published status of a post"""
        data = self._load_blog_data()
        
        for post in data['posts']:
            if post['id'] == post_id:
                post['published'] = not post.get('published', True)
                post['lastModified'] = datetime.now().isoformat()
                self._save_blog_data(data)
                return post
        
        return None

    def search_posts(self, query: str, category: str = '') -> List[Dict]:
        """Search posts by query and category"""
        return self.get_published_posts(category=category, search=query)

    def get_post_count(self) -> int:
        """Get total number of posts"""
        data = self._load_blog_data()
        return len(data.get('posts', []))

    def get_published_count(self) -> int:
        """Get number of published posts"""
        posts = self.get_all_posts(include_unpublished=True)
        return len([post for post in posts if post.get('published', True)])

    def get_draft_count(self) -> int:
        """Get number of draft posts"""
        posts = self.get_all_posts(include_unpublished=True)
        return len([post for post in posts if not post.get('published', True)])

    def get_recent_activity(self, limit: int = 10) -> List[Dict]:
        """Get recent activity for dashboard"""
        posts = self.get_all_posts(include_unpublished=True)
        
        activities = []
        for post in posts[:limit]:
            activities.append({
                'description': f"Blog post '{post['title']}' {'published' if post.get('published') else 'drafted'}",
                'timestamp': post.get('lastModified', post.get('date', datetime.now().isoformat())),
                'type': 'blog'
            })
        
        return activities

    def get_featured_posts(self) -> List[Dict]:
        """Get featured posts"""
        posts = self.get_all_posts()
        return [post for post in posts if post.get('featured', False)]
