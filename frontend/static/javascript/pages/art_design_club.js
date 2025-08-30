/* ========= Art & Design Club Page ========= */

document.addEventListener('DOMContentLoaded', () => {
    const { qs, showNotification, formatDate } = window.Utils;

    // DOM elements
    const artworkContainer = qs('#featuredArtwork');
    const workshopsContainer = qs('#upcomingWorkshops');
    const eventsContainer = qs('#clubEvents');
    const blogContainer = qs('#clubBlog');

    // Initialize page
    initializeArtClub();

    function initializeArtClub() {
        loadFeaturedArtwork();
        loadWorkshops();
        loadEvents();
        loadBlogPosts();
        setupInteractions();
    }

    // Load featured artwork
    async function loadFeaturedArtwork() {
        try {
            showLoading(artworkContainer);
            const artwork = await getMockArtwork();
            displayArtwork(artwork);
        } catch (error) {
            console.error('Error loading artwork:', error);
            showError(artworkContainer, 'Failed to load artwork');
        }
    }

    // Display artwork gallery
    function displayArtwork(artwork) {
        if (!artworkContainer) return;

        artworkContainer.innerHTML = `
            <div class="artwork-gallery">
                ${artwork.map(art => `
                    <div class="artwork-card" data-artwork-id="${art.id}">
                        <div class="artwork-image">
                            <div class="artwork-overlay">
                                <div class="artwork-overlay-content">
                                    <h5>${art.title}</h5>
                                    <button class="view-artwork-btn" data-artwork-id="${art.id}">
                                        View Full Size
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="artwork-info">
                            <h4>${art.title}</h4>
                            <p class="artwork-artist">By ${art.artist}</p>
                            <p class="artwork-description">${art.description}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add click handlers for artwork viewing
        document.querySelectorAll('.view-artwork-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const artworkId = e.target.dataset.artworkId;
                viewArtwork(artworkId);
            });
        });
    }

    // Load workshops
    async function loadWorkshops() {
        try {
            showLoading(workshopsContainer);
            const workshops = await getMockWorkshops();
            displayWorkshops(workshops);
        } catch (error) {
            console.error('Error loading workshops:', error);
            showError(workshopsContainer, 'Failed to load workshops');
        }
    }

    // Display workshops
    function displayWorkshops(workshops) {
        if (!workshopsContainer) return;

        workshopsContainer.innerHTML = `
            <div class="workshops-grid">
                ${workshops.map(workshop => `
                    <div class="workshop-card">
                        <div class="workshop-header">
                            <div class="workshop-icon">🎨</div>
                            <div class="workshop-details">
                                <h4 class="workshop-title">${workshop.title}</h4>
                                <p class="workshop-instructor">Instructor: ${workshop.instructor}</p>
                            </div>
                        </div>
                        <p class="workshop-description">${workshop.description}</p>
                        <div class="workshop-meta">
                            <div class="meta-item">
                                <div class="meta-label">Date</div>
                                <div class="meta-value">${formatDate(workshop.date)}</div>
                            </div>
                            <div class="meta-item">
                                <div class="meta-label">Duration</div>
                                <div class="meta-value">${workshop.duration}</div>
                            </div>
                            <div class="meta-item">
                                <div class="meta-label">Level</div>
                                <div class="meta-value">${workshop.level}</div>
                            </div>
                        </div>
                        <div class="workshop-actions">
                            <button class="register-btn" data-workshop-id="${workshop.id}">Register</button>
                            <button class="learn-more-btn" data-workshop-id="${workshop.id}">Learn More</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add workshop registration handlers
        document.querySelectorAll('.register-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const workshopId = e.target.dataset.workshopId;
                registerForWorkshop(workshopId);
            });
        });

        document.querySelectorAll('.learn-more-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const workshopId = e.target.dataset.workshopId;
                showWorkshopDetails(workshopId);
            });
        });
    }

    // Setup interactions
    function setupInteractions() {
        // Add smooth scroll for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Add parallax effect to hero section
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const hero = qs('.club-hero');
            if (hero) {
                hero.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
        });
    }

    // Handle artwork viewing
    function viewArtwork(artworkId) {
        showNotification('Artwork viewer will be implemented soon!', 'info');
        // TODO: Implement artwork modal/viewer
    }

    // Handle workshop registration
    function registerForWorkshop(workshopId) {
        showNotification('Workshop registration will be implemented soon!', 'info');
        // TODO: Implement workshop registration
    }

    // Show workshop details
    function showWorkshopDetails(workshopId) {
        showNotification('Workshop details will be shown soon!', 'info');
        // TODO: Implement workshop details modal
    }

    // Load events and blog posts (similar pattern)
    async function loadEvents() {
        if (eventsContainer) {
            showLoading(eventsContainer);
            setTimeout(() => {
                eventsContainer.innerHTML = '<p class="text-muted">Art & Design events coming soon!</p>';
            }, 1000);
        }
    }

    async function loadBlogPosts() {
        if (blogContainer) {
            showLoading(blogContainer);
            setTimeout(() => {
                blogContainer.innerHTML = '<p class="text-muted">Club blog posts coming soon!</p>';
            }, 1500);
        }
    }

    // Mock data functions
    async function getMockArtwork() {
        return [
            {
                id: 1,
                title: "Digital Dreams",
                artist: "Sarah Johnson",
                description: "A vibrant digital art piece exploring futuristic themes",
                category: "Digital Art"
            },
            {
                id: 2,
                title: "Nature's Canvas",
                artist: "Mike Chen",
                description: "Traditional painting inspired by natural landscapes",
                category: "Painting"
            },
            {
                id: 3,
                title: "Urban Sketches",
                artist: "Emily Davis",
                description: "Collection of architectural sketches from city exploration",
                category: "Sketching"
            }
        ];
    }

    async function getMockWorkshops() {
        return [
            {
                id: 1,
                title: "Digital Art Fundamentals",
                instructor: "Prof. Anderson",
                description: "Learn the basics of digital art creation using modern tools",
                date: "2025-09-20",
                duration: "2 hours",
                level: "Beginner"
            },
            {
                id: 2,
                title: "Advanced Painting Techniques",
                instructor: "Artist Maria",
                description: "Master advanced painting techniques and color theory",
                date: "2025-09-25",
                duration: "3 hours",
                level: "Advanced"
            }
        ];
    }

    // Utility functions
    function showLoading(container) {
        if (container) {
            container.innerHTML = '<div class="loading">Loading content...</div>';
        }
    }

    function showError(container, message) {
        if (container) {
            container.innerHTML = `<div class="empty-state text-error">${message}</div>`;
        }
    }
});
