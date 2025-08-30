/* ========= Drama Club Page ========= */

document.addEventListener('DOMContentLoaded', () => {
    const { qs, showNotification, formatDate } = window.Utils;

    // DOM elements
    const productionsContainer = qs('#featuredProductions');
    const workshopsContainer = qs('#dramaWorkshops');
    const eventsContainer = qs('#dramaEvents');

    // Initialize page
    initializeDramaClub();

    function initializeDramaClub() {
        loadFeaturedProductions();
        loadWorkshops();
        loadEvents();
        setupTheaterMasks();
        setupSpotlightEffect();
    }

    // Setup theater masks animation
    function setupTheaterMasks() {
        const masks = document.querySelectorAll('.mask');
        masks.forEach((mask, index) => {
            mask.addEventListener('click', () => {
                mask.style.animation = 'none';
                setTimeout(() => {
                    mask.style.animation = `float 3s ease-in-out infinite`;
                    mask.style.animationDelay = `${index * 1.5}s`;
                }, 100);
            });
        });
    }

    // Setup spotlight animation effect
    function setupSpotlightEffect() {
        const spotlightElements = document.querySelectorAll('.spotlight-animation');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-spotlight');
                }
            });
        });

        spotlightElements.forEach(el => observer.observe(el));
    }

    // Load featured productions
    async function loadFeaturedProductions() {
        try {
            showLoading(productionsContainer);
            const productions = await getMockProductions();
            displayProductions(productions);
        } catch (error) {
            console.error('Error loading productions:', error);
            showError(productionsContainer, 'Failed to load productions');
        }
    }

    // Display productions
    function displayProductions(productions) {
        if (!productionsContainer) return;

        productionsContainer.innerHTML = `
            <div class="productions-grid">
                ${productions.map(production => `
                    <div class="production-card spotlight-animation">
                        <div class="production-poster">
                            <div class="poster-overlay">
                                <button class="view-trailer-btn" data-production-id="${production.id}">
                                    <i class="fas fa-play"></i>
                                    Watch Trailer
                                </button>
                            </div>
                        </div>
                        <div class="production-info">
                            <span class="production-genre">${production.genre}</span>
                            <h3 class="production-title">${production.title}</h3>
                            <p class="production-description">${production.description}</p>
                            
                            <div class="production-cast">
                                <div class="cast-title">Cast Members</div>
                                <div class="cast-list">
                                    ${production.cast.map(member => `
                                        <span class="cast-member">${member}</span>
                                    `).join('')}
                                </div>
                            </div>

                            <div class="production-schedule">
                                <div class="schedule-title">Show Times</div>
                                <div class="show-times">
                                    ${production.showTimes.map(show => `
                                        <div class="show-time">
                                            <div class="show-date">${formatDate(show.date)}</div>
                                            <div class="show-time-slot">${show.time}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add trailer viewing handlers
        document.querySelectorAll('.view-trailer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productionId = btn.dataset.productionId;
                viewTrailer(productionId);
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
                        <div class="workshop-icon">🎭</div>
                        <h4 class="workshop-title">${workshop.title}</h4>
                        <span class="workshop-level">${workshop.level}</span>
                        <p class="workshop-description">${workshop.description}</p>
                        
                        <div class="workshop-details">
                            <div class="workshop-meta">
                                <div class="meta-item">
                                    <div class="meta-label">Duration</div>
                                    <div class="meta-value">${workshop.duration}</div>
                                </div>
                                <div class="meta-item">
                                    <div class="meta-label">Sessions</div>
                                    <div class="meta-value">${workshop.sessions}</div>
                                </div>
                            </div>
                            <ul class="workshop-curriculum">
                                ${workshop.topics.map(topic => `<li>${topic}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <button class="enroll-btn" data-workshop-id="${workshop.id}">
                            Enroll Now
                        </button>
                    </div>
                `).join('')}
            </div>
        `;

        // Add workshop enrollment handlers
        document.querySelectorAll('.enroll-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const workshopId = btn.dataset.workshopId;
                enrollInWorkshop(workshopId);
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

    // Display events in timeline
    function displayEvents(events) {
        if (!eventsContainer) return;

        eventsContainer.innerHTML = `
            <div class="events-timeline">
                ${events.map(event => `
                    <div class="event-item">
                        <div class="event-date">${formatDate(event.date)}</div>
                        <h4 class="event-title">${event.title}</h4>
                        <p class="event-description">${event.description}</p>
                        <div class="event-details">
                            <div class="event-detail">
                                <i class="fas fa-clock event-icon"></i>
                                <span>${event.time}</span>
                            </div>
                            <div class="event-detail">
                                <i class="fas fa-map-marker-alt event-icon"></i>
                                <span>${event.location}</span>
                            </div>
                            <div class="event-detail">
                                <i class="fas fa-users event-icon"></i>
                                <span>${event.capacity} seats</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Handler functions
    function viewTrailer(productionId) {
        showNotification('Production trailer will be available soon!', 'info');
        // TODO: Implement trailer modal/player
    }

    function enrollInWorkshop(workshopId) {
        showNotification('Workshop enrollment will be implemented soon!', 'info');
        // TODO: Implement workshop enrollment
    }

    // Mock data functions
    async function getMockProductions() {
        return [
            {
                id: 1,
                title: "Romeo and Juliet",
                genre: "Classic Drama",
                description: "Shakespeare's timeless tale of star-crossed lovers",
                cast: ["Emma Stone", "Ryan Gosling", "John Smith", "Jane Doe"],
                showTimes: [
                    { date: "2025-09-15", time: "7:00 PM" },
                    { date: "2025-09-16", time: "7:00 PM" },
                    { date: "2025-09-17", time: "2:00 PM" }
                ]
            },
            {
                id: 2,
                title: "Modern Monologues",
                genre: "Contemporary",
                description: "Collection of powerful contemporary monologues",
                cast: ["Sarah Johnson", "Mike Chen", "Lisa Wang"],
                showTimes: [
                    { date: "2025-09-22", time: "8:00 PM" },
                    { date: "2025-09-23", time: "8:00 PM" }
                ]
            }
        ];
    }

    async function getMockWorkshops() {
        return [
            {
                id: 1,
                title: "Acting Fundamentals",
                level: "Beginner",
                description: "Learn the basics of stage acting and character development",
                duration: "4 weeks",
                sessions: "8 sessions",
                topics: [
                    "Voice projection and diction",
                    "Body language and movement",
                    "Character development",
                    "Scene study and analysis"
                ]
            },
            {
                id: 2,
                title: "Advanced Scene Work",
                level: "Advanced",
                description: "Master complex scenes and character interactions",
                duration: "6 weeks",
                sessions: "12 sessions",
                topics: [
                    "Method acting techniques",
                    "Emotional memory work",
                    "Partner scene work",
                    "Stage combat basics"
                ]
            }
        ];
    }

    async function getMockEvents() {
        return [
            {
                id: 1,
                title: "Annual Drama Showcase",
                description: "Student performances and talent showcase",
                date: "2025-09-30",
                time: "6:00 PM",
                location: "Main Theater",
                capacity: 200
            },
            {
                id: 2,
                title: "Improvisation Night",
                description: "Fun evening of improvisational comedy and drama",
                date: "2025-10-15",
                time: "7:30 PM",
                location: "Studio Theater",
                capacity: 50
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
