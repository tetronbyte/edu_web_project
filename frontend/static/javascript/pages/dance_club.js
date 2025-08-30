/* ========= Dance Club Page ========= */

document.addEventListener('DOMContentLoaded', () => {
    const { qs, showNotification, formatDate } = window.Utils;

    // DOM elements
    const performancesContainer = qs('#featuredPerformances');
    const eventsContainer = qs('#danceEvents');

    // Initialize page
    initializeDanceClub();

    function initializeDanceClub() {
        loadFeaturedPerformances();
        loadEvents();
        setupDanceStyleCards();
        setupPerformanceVideos();
    }

    // Load featured performances
    async function loadFeaturedPerformances() {
        try {
            showLoading(performancesContainer);
            const performances = await getMockPerformances();
            displayPerformances(performances);
        } catch (error) {
            console.error('Error loading performances:', error);
            showError(performancesContainer, 'Failed to load performances');
        }
    }

    // Display performances
    function displayPerformances(performances) {
        if (!performancesContainer) return;

        performancesContainer.innerHTML = `
            <div class="performances-grid">
                ${performances.map(performance => `
                    <div class="performance-card">
                        <div class="performance-video" data-performance-id="${performance.id}">
                            <div class="play-button">
                                <i class="fas fa-play"></i>
                            </div>
                        </div>
                        <div class="performance-info">
                            <span class="performance-style">${performance.style}</span>
                            <h4 class="performance-title">${performance.title}</h4>
                            <p class="performance-description">${performance.description}</p>
                            <div class="performance-meta">
                                <div class="performance-dancers">
                                    <span>👥</span>
                                    <span class="dancer-count">${performance.dancers} dancers</span>
                                </div>
                                <span class="performance-date">${formatDate(performance.date)}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add performance video handlers
        document.querySelectorAll('.performance-video').forEach(video => {
            video.addEventListener('click', (e) => {
                const performanceId = video.dataset.performanceId;
                playPerformance(performanceId);
            });
        });
    }

    // Setup dance style cards with animations
    function setupDanceStyleCards() {
        const styleCards = document.querySelectorAll('.style-card');
        
        styleCards.forEach((card, index) => {
            // Stagger animation entrance
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 200);

            // Add hover dance animation
            card.addEventListener('mouseenter', () => {
                const icon = card.querySelector('.style-icon');
                if (icon) {
                    icon.style.animation = 'dance 1s ease-in-out';
                }
            });

            // Learn style button
            const learnBtn = card.querySelector('.learn-style-btn');
            if (learnBtn) {
                learnBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const styleName = card.querySelector('.style-title').textContent;
                    learnDanceStyle(styleName);
                });
            }
        });
    }

    // Setup performance video interactions
    function setupPerformanceVideos() {
        // Add hover effects to play buttons
        document.querySelectorAll('.play-button').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'scale(1.1)';
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'scale(1)';
            });
        });
    }

    // Load events
    async function loadEvents() {
        try {
            showLoading(eventsContainer);
            const events = await getMockEvents();
            displayEvents(events);
        } catch (error) {
            console.error('Error loading events:', error);
            showError(eventsContainer, 'Failed to load events');
        }
    }

    // Display events
    function displayEvents(events) {
        if (!eventsContainer) return;

        eventsContainer.innerHTML = `
            <div class="events-grid">
                ${events.map(event => `
                    <div class="event-card">
                        <div class="event-header">
                            <div class="event-date">
                                <div class="event-day">${new Date(event.date).getDate()}</div>
                                <div class="event-month">${new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                            </div>
                            <div class="event-details">
                                <h4 class="event-title">${event.title}</h4>
                                <p class="event-type">${event.type}</p>
                            </div>
                        </div>
                        <p class="event-description">${event.description}</p>
                        <div class="event-info">
                            <div class="info-item">
                                <div class="info-label">Time</div>
                                <div class="info-value">${event.time}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Location</div>
                                <div class="info-value">${event.location}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Style</div>
                                <div class="info-value">${event.style}</div>
                            </div>
                        </div>
                        <div class="event-actions">
                            <button class="join-btn" data-event-id="${event.id}">Join Event</button>
                            <button class="details-btn" data-event-id="${event.id}">View Details</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add event handlers
        document.querySelectorAll('.join-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const eventId = e.target.dataset.eventId;
                joinEvent(eventId);
            });
        });

        document.querySelectorAll('.details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const eventId = e.target.dataset.eventId;
                showEventDetails(eventId);
            });
        });
    }

    // Handler functions
    function playPerformance(performanceId) {
        showNotification('Performance video player will be implemented soon!', 'info');
        // TODO: Implement video player modal
    }

    function learnDanceStyle(styleName) {
        showNotification(`${styleName} classes will be available soon!`, 'info');
        // TODO: Implement style learning/registration
    }

    function joinEvent(eventId) {
        showNotification('Event registration will be implemented soon!', 'info');
        // TODO: Implement event registration
    }

    function showEventDetails(eventId) {
        showNotification('Event details will be shown soon!', 'info');
        // TODO: Implement event details modal
    }

    // Mock data functions
    async function getMockPerformances() {
        return [
            {
                id: 1,
                title: "Hip-Hop Fusion",
                style: "Hip-Hop",
                description: "An energetic blend of street dance and contemporary moves",
                dancers: 8,
                date: "2025-08-15"
            },
            {
                id: 2,
                title: "Bollywood Spectacular",
                style: "Bollywood",
                description: "Colorful and vibrant Bollywood dance performance",
                dancers: 12,
                date: "2025-08-20"
            },
            {
                id: 3,
                title: "Contemporary Dreams",
                style: "Contemporary",
                description: "Expressive contemporary dance telling a story of dreams",
                dancers: 6,
                date: "2025-08-25"
            }
        ];
    }

    async function getMockEvents() {
        return [
            {
                id: 1,
                title: "Dance Battle Championship",
                type: "Competition",
                description: "Annual dance battle competition between colleges",
                date: "2025-09-15",
                time: "7:00 PM",
                location: "Main Auditorium",
                style: "All Styles"
            },
            {
                id: 2,
                title: "Latin Dance Workshop",
                type: "Workshop",
                description: "Learn salsa and bachata with professional instructors",
                date: "2025-09-20",
                time: "2:00 PM",
                location: "Dance Studio",
                style: "Latin"
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
