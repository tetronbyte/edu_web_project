/* ========= API Layer ========= */

window.Api = (() => {
    const BASE_URL = '';
    const jsonHeaders = { 'Content-Type': 'application/json' };

    // Generic request handler
    const request = async (url, options = {}) => {
        try {
            const response = await fetch(url, {
                credentials: 'same-origin',
                ...options
            });

            if (!response.ok) {
                throw new Error(`Request failed: ${response.status} ${response.statusText}`);
            }

            // Check if response is JSON
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }

            return response;
        } catch (error) {
            console.error(`API Error (${url}):`, error);
            throw error;
        }
    };

    // HTTP methods
    const get = (url) => request(url);
    
    const post = (url, data) => request(url, {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify(data)
    });

    const put = (url, data) => request(url, {
        method: 'PUT',
        headers: jsonHeaders,
        body: JSON.stringify(data)
    });

    const del = (url) => request(url, { method: 'DELETE' });

    const postForm = (url, formData) => request(url, {
        method: 'POST',
        body: formData
    });

    // Public endpoints
    const publicApi = {
        // Notes
        listNotes: (course, semester, subject) => 
            get(`/notes/${encodeURIComponent(course)}/${encodeURIComponent(semester)}/${encodeURIComponent(subject)}`),
        
        getNoteFile: (course, semester, subject, filename) =>
            `/notes/${encodeURIComponent(course)}/${encodeURIComponent(semester)}/${encodeURIComponent(subject)}/${encodeURIComponent(filename)}`,

        // Blog
        getBlogPosts: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return get(`/api/blog/posts${query ? '?' + query : ''}`);
        },

        getBlogPost: (id) => get(`/api/blog/post/${id}`),

        searchBlogPosts: (query, category = '') => 
            get(`/api/blog/search?q=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`),

        // GLLM
        generateEquations: (input) => post('/generate-equations', { input })
    };

    // Admin endpoints
    const adminApi = {
        // Authentication
        login: (credentials) => postForm('/admin/login', credentials),
        logout: () => get('/admin/logout'),

        // Notes management
        uploadNotes: (formData) => postForm('/admin/upload', formData),
        
        listNotes: (course, semester, subject) => 
            get(`/admin/notes/${encodeURIComponent(course)}/${encodeURIComponent(semester)}/${encodeURIComponent(subject)}`),
        
        deleteNote: (course, semester, subject, filename) =>
            del(`/admin/notes/${encodeURIComponent(course)}/${encodeURIComponent(semester)}/${encodeURIComponent(subject)}/${encodeURIComponent(filename)}`),

        // Blog management
        // New (correct match to Flask admin_routes.py)
        getBlogPosts: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return get(`/admin/api/blog/posts${query ? '?' + query : ''}`);
        },
        getBlogPost: (id) => get(`/admin/api/blog/post/${id}`),
        createBlogPost: (postData) => post('/admin/api/blog/post', postData),
        updateBlogPost: (id, postData) => put(`/admin/api/blog/post/${id}`, postData),
        deleteBlogPost: (id) => del(`/admin/api/blog/post/${id}`),
        toggleBlogPostStatus: (id) => post(`/admin/api/blog/post/${id}/toggle`, {}),

        // Dashboard
        getDashboardStats: () => get('/api/admin/dashboard/stats'),

        getRecentActivity: () => get('/api/admin/dashboard/activity')
    };

    // Export public and admin APIs
    return {
        ...publicApi,
        admin: adminApi,
        // Legacy aliases for backward compatibility
        adminUpload: adminApi.uploadNotes,
        adminListNotes: adminApi.listNotes,
        publicListNotes: publicApi.listNotes,
        publicNoteFile: publicApi.getNoteFile
    };
})();
