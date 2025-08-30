/* ========= Admin Blog Management Page - FIXED ========= */
document.addEventListener('DOMContentLoaded', () => {
    const { qs, showNotification, formatDate, debounce } = window.Utils;
    
    // State management
    let currentPage = 1;
    let postsPerPage = 10;
    let allPosts = [];
    let filteredPosts = [];
    let deletePostId = null;
    
    // DOM elements
    const postsList = qs('#postsList');
    const searchInput = qs('#postSearch');
    const statusFilter = qs('#statusFilter');
    const categoryFilter = qs('#categoryFilter');
    const newPostBtn = qs('#newPostBtn');
    const pagination = qs('#pagination');
    
    // Initialize
    loadAllPosts();
    setupEventListeners();
    
    // Setup event listeners
    function setupEventListeners() {
        // Real-time search with debounce
        if (searchInput) {
            searchInput.addEventListener('input', debounce(() => {
                filterPosts();
            }, 300));
        }
        
        // Filter by status and category
        if (statusFilter) {
            statusFilter.addEventListener('change', filterPosts);
        }
        if (categoryFilter) {
            categoryFilter.addEventListener('change', filterPosts);
        }
        
        // New post button
        if (newPostBtn) {
            newPostBtn.addEventListener('click', () => {
                window.location.href = '/admin/blog/new';
            });
        }
    }
    
    // Load all posts from server
    async function loadAllPosts() {
        try {
            showLoading();
            const data = await Api.admin.getBlogPosts();
            console.log('Loaded posts:', data); // Debug log
            
            allPosts = data.posts || [];
            filteredPosts = [...allPosts];
            
            if (allPosts.length === 0) {
                showEmptyState();
            } else {
                displayPosts();
                updatePagination();
            }
            hideLoading();
        } catch (error) {
            console.error('Error loading posts:', error);
            showNotification('Failed to load posts. Please try again.', 'error');
            showEmptyState();
            hideLoading();
        }
    }
    
    // Filter posts based on search and filters
    function filterPosts() {
        const searchTerm = searchInput?.value.toLowerCase() || '';
        const statusValue = statusFilter?.value || '';
        const categoryValue = categoryFilter?.value || '';
        
        filteredPosts = allPosts.filter(post => {
            const matchesSearch = !searchTerm || 
                post.title.toLowerCase().includes(searchTerm) || 
                post.excerpt.toLowerCase().includes(searchTerm);
            const matchesStatus = !statusValue || 
                (statusValue === 'published' && post.published) || 
                (statusValue === 'unpublished' && !post.published);
            const matchesCategory = !categoryValue || post.category === categoryValue;
            
            return matchesSearch && matchesStatus && matchesCategory;
        });
        
        currentPage = 1;
        displayPosts();
        updatePagination();
    }
    
    // Display posts in the list
    function displayPosts() {
        if (!postsList) return;
        
        if (filteredPosts.length === 0) {
            showEmptyState();
            return;
        }
        
        const startIndex = (currentPage - 1) * postsPerPage;
        const endIndex = startIndex + postsPerPage;
        const postsToShow = filteredPosts.slice(startIndex, endIndex);
        
        postsList.innerHTML = postsToShow.map(post => createPostItem(post)).join('');
        
        // Add event listeners to action buttons
        attachPostEventListeners();
    }
    
    // Create individual post item HTML
    function createPostItem(post) {
        const publishedDate = formatDate(post.date);
        const statusClass = post.published ? 'status-published' : 'status-unpublished';
        const featuredBadge = post.featured ? '<span class="badge badge-featured">Featured</span>' : '';
        
        return `
            <div class="post-item" data-post-id="${post.id}">
                <div class="post-status ${statusClass}"></div>
                <div class="post-info">
                    <h3 class="post-title" onclick="editPost('${post.id}')">${escapeHtml(post.title)}</h3>
                    <div class="post-meta">
                        <span class="post-category">${escapeHtml(post.category)}</span>
                        <span>${publishedDate}</span>
                        <span>${post.readTime} min read</span>
                        ${featuredBadge}
                    </div>
                </div>
                <div class="post-actions">
                    <button class="action-btn btn-edit" onclick="editPost('${post.id}')" title="Edit">
                        Edit
                    </button>
                    <button class="action-btn btn-toggle" onclick="togglePostStatus('${post.id}')" title="Toggle Status">
                        ${post.published ? 'Unpublish' : 'Publish'}
                    </button>
                    <button class="action-btn btn-delete" onclick="confirmDeletePost('${post.id}')" title="Delete">
                        Delete
                    </button>
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
    
    // Attach event listeners to post action buttons
    function attachPostEventListeners() {
        // Event delegation for dynamically created elements
        if (postsList) {
            postsList.addEventListener('click', handlePostAction);
        }
    }
    
    // Handle post actions through event delegation
    function handlePostAction(event) {
        const target = event.target;
        const postId = target.closest('.post-item')?.dataset.postId;
        
        if (!postId) return;
        
        if (target.classList.contains('btn-edit')) {
            editPost(postId);
        } else if (target.classList.contains('btn-toggle')) {
            togglePostStatus(postId);
        } else if (target.classList.contains('btn-delete')) {
            confirmDeletePost(postId);
        }
    }
    
    // Global functions
    window.editPost = function(postId) {
        window.location.href = `/admin/blog/edit/${postId}`;
    };
    
    window.togglePostStatus = async function(postId) {
        try {
            const response = await Api.admin.toggleBlogPostStatus(postId);
            if (response.message) {
                showNotification(response.message, 'success');
                loadAllPosts(); // Reload to update display
            }
        } catch (error) {
            console.error('Error toggling post status:', error);
            showNotification('Failed to update post status', 'error');
        }
    };
    
    window.confirmDeletePost = function(postId) {
        deletePostId = postId;
        const post = allPosts.find(p => p.id === postId);
        if (post) {
            showDeleteModal(post.title);
        }
    };
    
    // Show loading state
    function showLoading() {
        if (postsList) {
            postsList.innerHTML = '<div class="loading">Loading posts...</div>';
        }
    }
    
    // Hide loading state
    function hideLoading() {
        // Loading is hidden when posts are displayed
    }
    
    // Show empty state
    function showEmptyState() {
        if (postsList) {
            postsList.innerHTML = `
                <div class="empty-state">
                    <h3>No posts found</h3>
                    <p>No posts match your current filters. Try creating a new post or adjusting your search criteria.</p>
                </div>
            `;
        }
    }
    
    // Update pagination
    function updatePagination() {
        if (!pagination) return;
        
        const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
                Previous
            </button>
        `;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            paginationHTML += `
                <button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
                    ${i}
                </button>
            `;
        }
        
        // Next button
        paginationHTML += `
            <button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
                Next
            </button>
        `;
        
        pagination.innerHTML = paginationHTML;
    }
    
    // Change page function
    window.changePage = function(page) {
        const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
        if (page < 1 || page > totalPages) return;
        
        currentPage = page;
        displayPosts();
        updatePagination();
    };
});
