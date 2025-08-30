/* ========= Public Blog Page ========= */
document.addEventListener('DOMContentLoaded', () => {
    const { qs, showNotification, debounce } = window.Utils;
    
    // State management
    let currentPage = 1;
    let postsPerPage = 6;
    let allPosts = [];
    let filteredPosts = [];
    let currentCategory = '';
    let searchTerm = '';
    
    // DOM elements
    const featuredSection = qs('#featuredPost');
    const blogContainer = qs('#blogContainer');
    const searchInput = qs('#searchInput');
    const categoryFilter = qs('#categoryFilter');
    const loadMoreBtn = qs('#loadMoreBtn');
    const loadMoreContainer = qs('.load-more-container');
    
    // Initialize
    loadBlogPosts();
    setupEventListeners();
    
    // Load blog posts from server
    async function loadBlogPosts() {
        try {
            showLoading();
            const data = await Api.getBlogPosts();
            allPosts = data.posts || [];
            filteredPosts = [...allPosts];
            displayFeaturedPost();
            displayBlogPosts();
            hideLoading();
        } catch (error) {
            console.error('Error loading blog posts:', error);
            showEmptyState();
            hideLoading();
        }
    }
    
    // Setup event listeners
    function setupEventListeners() {
        // Search functionality with debounce
        if (searchInput) {
            searchInput.addEventListener('input', debounce(() => {
                searchTerm = searchInput.value.toLowerCase().trim();
                filterAndDisplayPosts();
            }, 300));
        }
        
        // Category filter
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                currentCategory = categoryFilter.value;
                filterAndDisplayPosts();
            });
        }
        
        // Load more button
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', loadMorePosts);
        }
        
        // Modal close functionality
        setupModalEvents();
    }
    
    // Display featured post
    function displayFeaturedPost() {
        if (!featuredSection || allPosts.length === 0) {
            if (featuredSection) featuredSection.style.display = 'none';
            return;
        }
        
        // Get the most recent featured post or first post
        const featuredPost = allPosts.find(post => post.featured) || allPosts[0];
        
        featuredSection.innerHTML = `
            <div class="featured-post" onclick="openPostModal('${featuredPost.id}')">
                <div class="featured-post-content">
                    <div class="featured-post-text">
                        <h2>${escapeHtml(featuredPost.title)}</h2>
                        <p>${escapeHtml(featuredPost.excerpt)}</p>
                        <div class="featured-post-meta">
                            <span>${formatDate(featuredPost.date)}</span>
                            <span>${featuredPost.readTime} min read</span>
                            <span class="badge badge-featured">Featured</span>
                        </div>
                    </div>
                    <div class="featured-post-image">
                        ${featuredPost.image ? 
                            `<img src="${featuredPost.image}" alt="${escapeHtml(featuredPost.title)}" />` : 
                            '<div class="post-image no-image"></div>'
                        }
                    </div>
                </div>
            </div>
        `;
    }
    
    // Filter and display posts
    function filterAndDisplayPosts() {
        filteredPosts = allPosts.filter(post => {
            const matchesSearch = !searchTerm || 
                post.title.toLowerCase().includes(searchTerm) || 
                post.excerpt.toLowerCase().includes(searchTerm);
            const matchesCategory = !currentCategory || post.category === currentCategory;
            
            return matchesSearch && matchesCategory;
        });
        
        currentPage = 1;
        displayBlogPosts();
    }
    
    // Display blog posts
    function displayBlogPosts() {
        if (!blogContainer) return;
        
        if (filteredPosts.length === 0) {
            showEmptyState();
            return;
        }
        
        const postsToShow = filteredPosts.slice(0, currentPage * postsPerPage);
        
        blogContainer.innerHTML = postsToShow.map(post => createBlogPostHTML(post)).join('');
        
        // Update load more button
        updateLoadMoreButton();
        
        // Add click event listeners
        attachPostClickListeners();
    }
    
    // Create blog post HTML
    function createBlogPostHTML(post) {
        return `
            <div class="blog-post" data-post-id="${post.id}" onclick="openPostModal('${post.id}')">
                <div class="post-image ${post.image ? '' : 'no-image'}">
                    ${post.image ? 
                        `<img src="${post.image}" alt="${escapeHtml(post.title)}" />` : 
                        ''
                    }
                </div>
                <div class="post-content">
                    <h3 class="post-title">${escapeHtml(post.title)}</h3>
                    <p class="post-excerpt">${escapeHtml(post.excerpt)}</p>
                    <div class="post-meta">
                        <span class="post-date">${formatDate(post.date)}</span>
                        <span class="post-read-time">${post.readTime} min read</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Format date
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    // Attach click listeners to posts
    function attachPostClickListeners() {
        const posts = document.querySelectorAll('.blog-post');
        posts.forEach(post => {
            post.addEventListener('click', () => {
                const postId = post.dataset.postId;
                openPostModal(postId);
            });
        });
    }
    
    // Load more posts
    function loadMorePosts() {
        currentPage++;
        displayBlogPosts();
    }
    
    // Update load more button
    function updateLoadMoreButton() {
        if (!loadMoreBtn) return;
        
        const hasMorePosts = currentPage * postsPerPage < filteredPosts.length;
        
        if (hasMorePosts) {
            loadMoreBtn.style.display = 'inline-block';
            loadMoreBtn.disabled = false;
        } else {
            loadMoreBtn.style.display = 'none';
        }
    }
    
    // Open post modal
    window.openPostModal = async function(postId) {
        try {
            const response = await Api.getBlogPost(postId);
            const post = response.post;
            
            if (!post) {
                showNotification('Post not found', 'error');
                return;
            }
            
            showPostModal(post);
        } catch (error) {
            console.error('Error loading post:', error);
            showNotification('Failed to load post', 'error');
        }
    };
    
    // Show post modal
    function showPostModal(post) {
        const modal = qs('#postModal') || createPostModal();
        
        const modalBody = modal.querySelector('.modal-body');
        modalBody.innerHTML = `
            <h1>${escapeHtml(post.title)}</h1>
            <div class="post-meta" style="margin-bottom: 2rem; color: var(--text-muted);">
                <span>${formatDate(post.date)}</span> • 
                <span>${post.readTime} min read</span> • 
                <span style="text-transform: capitalize;">${escapeHtml(post.category)}</span>
            </div>
            <div class="post-content">${post.content}</div>
        `;
        
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
    
    // Create post modal if it doesn't exist
    function createPostModal() {
        const modal = document.createElement('div');
        modal.id = 'postModal';
        modal.className = 'post-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal" onclick="closePostModal()">&times;</span>
                <div class="modal-body"></div>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }
    
    // Close post modal
    window.closePostModal = function() {
        const modal = qs('#postModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };
    
    // Setup modal events
    function setupModalEvents() {
        // Close modal when clicking outside
        document.addEventListener('click', (event) => {
            const modal = qs('#postModal');
            if (modal && event.target === modal) {
                closePostModal();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closePostModal();
            }
        });
    }
    
    // Show loading state
    function showLoading() {
        if (blogContainer) {
            blogContainer.innerHTML = '<div class="loading">Loading posts...</div>';
        }
    }
    
    // Hide loading state
    function hideLoading() {
        // Loading is hidden when posts are displayed
    }
    
    // Show empty state
    function showEmptyState() {
        if (blogContainer) {
            blogContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No posts found</h3>
                    <p>No posts match your current search or filter criteria.</p>
                </div>
            `;
        }
        
        if (loadMoreBtn) {
            loadMoreBtn.style.display = 'none';
        }
    }
});
