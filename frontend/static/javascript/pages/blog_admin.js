/* ========= Admin Blog Management Page ========= */

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
            allPosts = data.posts || [];
            filteredPosts = [...allPosts];
            displayPosts();
            updatePagination();
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
    }

    // Create individual post item HTML
    function createPostItem(post) {
        const publishedDate = formatDate(post.date);
        const statusClass = post.published ? 'status-published' : 'status-unpublished';
        const featuredBadge = post.featured ? '<span class="badge badge-featured">Featured</span>' : '';

        return `
            <div class="post-item" data-post-id="${post.id}">
                <div class="status-indicator ${statusClass}"></div>
                <div class="post-info">
                    <h3 class="post-title" onclick="editPost('${post.id}')">${post.title}</h3>
                    <div class="post-meta">
                        <span>${publishedDate}</span>
                        <span class="badge badge-primary">${post.category}</span>
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

    // Edit post
    function editPost(postId) {
        window.location.href = `/admin/blog/edit/${postId}`;
    }

    // Toggle post status
    async function togglePostStatus(postId) {
        try {
            await Api.admin.toggleBlogPostStatus(postId);
            showNotification('Post status updated successfully!', 'success');
            loadAllPosts(); // Reload to get updated data
        } catch (error) {
            console.error('Error toggling post status:', error);
            showNotification('Failed to update post status. Please try again.', 'error');
        }
    }

    // Confirm delete post
    function confirmDeletePost(postId) {
        deletePostId = postId;
        showDeleteModal();
    }

    // Delete post
    async function deletePost() {
        if (!deletePostId) return;

        try {
            await Api.admin.deleteBlogPost(deletePostId);
            showNotification('Post deleted successfully!', 'success');
            hideDeleteModal();
            loadAllPosts(); // Reload to get updated data
        } catch (error) {
            console.error('Error deleting post:', error);
            showNotification('Failed to delete post. Please try again.', 'error');
        } finally {
            deletePostId = null;
        }
    }

    // Show delete confirmation modal
    function showDeleteModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'deleteModal';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Delete Post</h3>
                <p>Are you sure you want to delete this post? This action cannot be undone.</p>
                <div class="modal-actions">
                    <button class="btn-cancel" onclick="hideDeleteModal()">Cancel</button>
                    <button class="btn-delete" onclick="deletePost()">Delete</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'block';

        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideDeleteModal();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', function handleEscape(e) {
            if (e.key === 'Escape') {
                hideDeleteModal();
                document.removeEventListener('keydown', handleEscape);
            }
        });
    }

    // Hide delete modal
    function hideDeleteModal() {
        const modal = qs('#deleteModal');
        if (modal) {
            modal.style.display = 'none';
            document.body.removeChild(modal);
        }
        deletePostId = null;
    }

    // Update pagination
    function updatePagination() {
        if (!pagination) return;

        const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
        
        if (totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        }

        pagination.style.display = 'flex';
        pagination.innerHTML = `
            <button ${currentPage <= 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">
                Previous
            </button>
            <span>Page ${currentPage} of ${totalPages}</span>
            <button ${currentPage >= totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">
                Next
            </button>
        `;
    }

    // Change page
    function changePage(page) {
        const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
        
        if (page < 1 || page > totalPages) return;
        
        currentPage = page;
        displayPosts();
        updatePagination();
    }

    // Show loading state
    function showLoading() {
        if (postsList) {
            postsList.innerHTML = '<div class="loading">Loading posts...</div>';
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
        if (!postsList) return;

        const hasFilters = searchInput?.value || statusFilter?.value || categoryFilter?.value;
        const message = hasFilters ? 
            'No posts match your current filters. Try adjusting your search or create a new post.' :
            'No blog posts found. Create your first post to get started!';

        postsList.innerHTML = `
            <div class="empty-state">
                <h3>No Posts Found</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="window.location.href='/admin/blog/new'">
                    Create New Post
                </button>
            </div>
        `;

        if (pagination) {
            pagination.style.display = 'none';
        }
    }

    // Make functions globally available for onclick handlers
    window.editPost = editPost;
    window.togglePostStatus = togglePostStatus;
    window.confirmDeletePost = confirmDeletePost;
    window.deletePost = deletePost;
    window.hideDeleteModal = hideDeleteModal;
    window.changePage = changePage;

    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        if (event.altKey) {
            switch (event.key) {
                case 'n':
                    event.preventDefault();
                    window.location.href = '/admin/blog/new';
                    break;
                case 'r':
                    event.preventDefault();
                    loadAllPosts();
                    break;
            }
        }
    });
});
