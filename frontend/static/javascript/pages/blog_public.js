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

        // Post click handlers will be added dynamically
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
            <div class="featured-post" onclick="openPost('${featuredPost.id}')">
                <div class="featured-post-content">
                    <div class="featured-post-text">
                        <h2>${featuredPost.title}</h2>
                        <p>${featuredPost.excerpt}</p>
                        <div class="featured-post-meta">
                            <span class="badge badge-featured">Featured</span>
                            <span>${Utils.formatDate(featuredPost.date)}</span>
                            <span>${featuredPost.readTime} min read</span>
                        </div>
                    </div>
                    <div class="featured-post-image">
                        ${featuredPost.image ? 
                            `<img src="${featuredPost.image}" alt="${featuredPost.title}">` :
                            `<div class="post-image no-image"></div>`
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

        const startIndex = 0;
        const endIndex = currentPage * postsPerPage;
        const postsToShow = filteredPosts.slice(startIndex, endIndex);

        blogContainer.innerHTML = postsToShow.map(post => createPostHTML(post)).join('');

        // Update load more button
        updateLoadMoreButton();
    }

    // Create post HTML
    function createPostHTML(post) {
        return `
            <article class="blog-post fade-in" onclick="openPost('${post.id}')">
                <div class="post-image ${!post.image ? 'no-image' : ''}">
                    ${post.image ? 
                        `<img src="${post.image}" alt="${post.title}" loading="lazy">` :
                        ''
                    }
                </div>
                <div class="post-content">
                    <h3 class="post-title">${post.title}</h3>
                    <p class="post-excerpt">${post.excerpt}</p>
                    <div class="post-meta">
                        <div>
                            <span class="post-date">${Utils.formatDate(post.date)}</span>
                            <span class="post-read-time">${post.readTime} min read</span>
                        </div>
                        <span class="badge badge-primary">${post.category}</span>
                    </div>
                </div>
            </article>
        `;
    }

    // Load more posts
    function loadMorePosts() {
        currentPage++;
        displayBlogPosts();
    }

    // Update load more button
    function updateLoadMoreButton() {
        if (!loadMoreContainer || !loadMoreBtn) return;

        const totalShown = currentPage * postsPerPage;
        const hasMore = totalShown < filteredPosts.length;

        if (hasMore) {
            loadMoreContainer.style.display = 'block';
            loadMoreBtn.disabled = false;
            loadMoreBtn.textContent = 'Load More Posts';
        } else {
            if (filteredPosts.length > postsPerPage) {
                loadMoreBtn.textContent = 'All posts loaded';
                loadMoreBtn.disabled = true;
            } else {
                loadMoreContainer.style.display = 'none';
            }
        }
    }

    // Open post in modal or new page
    function openPost(postId) {
        // For now, we'll show a modal. In a real app, this might navigate to a dedicated post page
        showPostModal(postId);
    }

    // Show post modal
    async function showPostModal(postId) {
        try {
            const post = await Api.getBlogPost(postId);
            
            const modal = document.createElement('div');
            modal.className = 'post-modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-modal">&times;</span>
                    <div class="modal-body">
                        <h1>${post.title}</h1>
                        <div class="post-meta">
                            <span>${Utils.formatDate(post.date)}</span>
                            <span class="badge badge-primary">${post.category}</span>
                            <span>${post.readTime} min read</span>
                        </div>
                        <div class="post-content">
                            ${post.content}
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            modal.style.display = 'block';

            // Close modal events
            const closeBtn = modal.querySelector('.close-modal');
            closeBtn.onclick = () => {
                modal.style.display = 'none';
                document.body.removeChild(modal);
            };

            modal.onclick = (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                    document.body.removeChild(modal);
                }
            };

            // Escape key to close
            document.addEventListener('keydown', function handleEscape(e) {
                if (e.key === 'Escape') {
                    modal.style.display = 'none';
                    document.body.removeChild(modal);
                    document.removeEventListener('keydown', handleEscape);
                }
            });

        } catch (error) {
            console.error('Error loading post:', error);
            showNotification('Failed to load post. Please try again.', 'error');
        }
    }

    // Show loading state
    function showLoading() {
        if (blogContainer) {
            blogContainer.innerHTML = '<div class="loading">Loading posts...</div>';
        }
    }

    // Hide loading state
    function hideLoading() {
        const loading = qs('.loading');
        if (loading) {
            loading.remove();
        }
    }

    // Show empty state
    function showEmptyState() {
        if (!blogContainer) return;

        const message = searchTerm || currentCategory ? 
            'No posts match your current filters. Try adjusting your search or category filter.' :
            'No blog posts available at this time. Please check back later.';

        blogContainer.innerHTML = `
            <div class="empty-state">
                <h3>No Posts Found</h3>
                <p>${message}</p>
            </div>
        `;

        if (loadMoreContainer) {
            loadMoreContainer.style.display = 'none';
        }
    }

    // Make openPost available globally for onclick handlers
    window.openPost = openPost;
});
