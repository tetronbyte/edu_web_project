/* ========= Admin Dashboard Page ========= */

document.addEventListener('DOMContentLoaded', () => {
    const { qs, showNotification, formatDate } = window.Utils;

    // DOM elements
    const statsGrid = qs('#statsGrid');
    const recentActivityList = qs('#recentActivityList');
    const quickActionsGrid = qs('#quickActionsGrid');

    // Initialize dashboard
    initializeDashboard();
    setupEventListeners();

    // Initialize dashboard data
    async function initializeDashboard() {
        try {
            await Promise.all([
                loadDashboardStats(),
                loadRecentActivity()
            ]);
        } catch (error) {
            console.error('Error initializing dashboard:', error);
            showNotification('Failed to load dashboard data', 'error');
        }
    }

    // Load dashboard statistics
    async function loadDashboardStats() {
        try {
            const stats = await Api.admin.getDashboardStats();
            displayStats(stats);
        } catch (error) {
            console.error('Error loading stats:', error);
            displayStatsError();
        }
    }

    // Display statistics
    function displayStats(stats) {
        if (!statsGrid) return;

        const defaultStats = {
            totalPosts: 0,
            publishedPosts: 0,
            draftPosts: 0,
            totalNotes: 0,
            todayViews: 0,
            monthlyViews: 0,
            ...stats
        };

        statsGrid.innerHTML = `
            <div class="stat-card">
                <span class="stat-number">${defaultStats.totalPosts}</span>
                <span class="stat-label">Total Posts</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${defaultStats.publishedPosts}</span>
                <span class="stat-label">Published</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${defaultStats.draftPosts}</span>
                <span class="stat-label">Drafts</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${defaultStats.totalNotes}</span>
                <span class="stat-label">Total Notes</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${defaultStats.todayViews}</span>
                <span class="stat-label">Today's Views</span>
            </div>
            <div class="stat-card">
                <span class="stat-number">${defaultStats.monthlyViews}</span>
                <span class="stat-label">Monthly Views</span>
            </div>
        `;
    }

    // Display stats error
    function displayStatsError() {
        if (!statsGrid) return;
        
        statsGrid.innerHTML = `
            <div class="error-state">
                <h3>Unable to load statistics</h3>
                <p>Please refresh the page to try again.</p>
            </div>
        `;
    }

    // Load recent activity
    async function loadRecentActivity() {
        try {
            const activities = await Api.admin.getRecentActivity();
            displayRecentActivity(activities);
        } catch (error) {
            console.error('Error loading recent activity:', error);
            displayActivityError();
        }
    }

    // Display recent activity
    function displayRecentActivity(activities) {
        if (!recentActivityList) return;

        if (!activities || activities.length === 0) {
            recentActivityList.innerHTML = `
                <div class="empty-state">
                    <p>No recent activity to display.</p>
                </div>
            `;
            return;
        }

        recentActivityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-text">${activity.description}</div>
                <div class="activity-time">${formatDate(activity.timestamp)}</div>
            </div>
        `).join('');
    }

    // Display activity error
    function displayActivityError() {
        if (!recentActivityList) return;
        
        recentActivityList.innerHTML = `
            <div class="error-state">
                <p>Unable to load recent activity.</p>
            </div>
        `;
    }

    // Setup event listeners
    function setupEventListeners() {
        // Quick action buttons
        const quickActions = document.querySelectorAll('.quick-action');
        quickActions.forEach(action => {
            action.addEventListener('click', handleQuickAction);
        });

        // Refresh button
        const refreshBtn = qs('#refreshDashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                showNotification('Refreshing dashboard...', 'info');
                initializeDashboard();
            });
        }
    }

    // Handle quick action clicks
    function handleQuickAction(event) {
        const action = event.currentTarget.dataset.action;
        
        switch (action) {
            case 'new-post':
                window.location.href = '/admin/blog/new';
                break;
            case 'manage-posts':
                window.location.href = '/admin/blog';
                break;
            case 'upload-notes':
                window.location.href = '/admin/upload';
                break;
            case 'view-site':
                window.open('/', '_blank');
                break;
            default:
                console.warn('Unknown quick action:', action);
        }
    }

    // Auto-refresh dashboard every 5 minutes
    setInterval(() => {
        loadDashboardStats();
        loadRecentActivity();
    }, 5 * 60 * 1000);

    // Keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        if (event.altKey) {
            switch (event.key) {
                case 'n':
                    event.preventDefault();
                    window.location.href = '/admin/blog/new';
                    break;
                case 'b':
                    event.preventDefault();
                    window.location.href = '/admin/blog';
                    break;
                case 'u':
                    event.preventDefault();
                    window.location.href = '/admin/upload';
                    break;
                case 'r':
                    event.preventDefault();
                    initializeDashboard();
                    break;
            }
        }
    });
});
