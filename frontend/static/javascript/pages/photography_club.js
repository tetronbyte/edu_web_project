/* ========= Photography Club Page ========= */

document.addEventListener('DOMContentLoaded', () => {
    const { qs, showNotification, formatDate } = window.Utils;

    // DOM elements
    const photoOfWeekContainer = qs('#photoOfWeek');
    const galleryContainer = qs('#photoGallery');
    const workshopsContainer = qs('#photoWorkshops');

    // State
    let currentFilter = 'all';
    let photoGallery = [];

    // Initialize page
    initializePhotographyClub();

    function initializePhotographyClub() {
        loadPhotoOfWeek();
        loadPhotoGallery();
        loadWorkshops();
        setupCameraAnimation();
        setupGalleryFilters();
        setupPhotoModal();
    }

    // Setup camera flash animation
    function setupCameraAnimation() {
        const cameraIcon = qs('.camera-animation');
        if (cameraIcon) {
            setInterval(() => {
                cameraIcon.style.animation = 'none';
                setTimeout(() => {
                    cameraIcon.style.animation = 'camera-flash 3s ease-in-out infinite';
                }, 100);
            }, 10000); // Flash every 10 seconds
        }
    }

    // Load photo of the week
    async function loadPhotoOfWeek() {
        try {
            showLoading(photoOfWeekContainer);
            const photoOfWeek = await getMockPhotoOfWeek();
            displayPhotoOfWeek(photoOfWeek);
        } catch (error) {
            console.error('Error loading photo of week:', error);
            showError(photoOfWeekContainer, 'Failed to load photo of the week');
        }
    }

    // Display photo of the week
    function displayPhotoOfWeek(photo) {
        if (!photoOfWeekContainer) return;

        photoOfWeekContainer.innerHTML = `
            <div class="photo-showcase">
                <div class="featured-photo" data-photo-id="${photo.id}">
                    <div class="photo-image"></div>
                    <div class="photo-overlay">
                        <h3 class="photo-title">${photo.title}</h3>
                        <p class="photo-photographer">📸 ${photo.photographer}</p>
                        <p class="photo-description">${photo.description}</p>
                        <div class="photo-stats">
                            <div class="stat-item">
                                <i class="fas fa-heart"></i>
                                <span>${photo.likes} likes</span>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-eye"></i>
                                <span>${photo.views} views</span>
                            </div>
                            <div class="stat-item">
                                <i class="fas fa-camera"></i>
                                <span>${photo.camera}</span>
                            </div>
                        </div>
                        <button class="view-full-btn" data-photo-id="${photo.id}">
                            View Full Size
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add click handler
        document.querySelector('.view-full-btn').addEventListener('click', (e) => {
            const photoId = e.target.dataset.photoId;
            viewFullPhoto(photoId);
        });
    }

    // Setup gallery filters
    function setupGalleryFilters() {
        const filterBtns = document.querySelectorAll('.filter-btn');
        
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active class from all buttons
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                e.target.classList.add('active');
                
                // Update current filter
                currentFilter = e.target.dataset.filter || 'all';
                
                // Filter and display photos
                filterGallery();
            });
        });
    }

    // Load photo gallery
    async function loadPhotoGallery() {
        try {
            showLoading(galleryContainer);
            photoGallery = await getMockPhotoGallery();
            displayPhotoGallery(photoGallery);
        } catch (error) {
            console.error('Error loading photo gallery:', error);
            showError(galleryContainer, 'Failed to load photo gallery');
        }
    }

    // Display photo gallery
    function displayPhotoGallery(photos) {
        if (!galleryContainer) return;

        galleryContainer.innerHTML = `
            <div class="photo-grid">
                ${photos.map(photo => `
                    <div class="photo-card" data-category="${photo.category}" data-photo-id="${photo.id}">
                        <div class="photo-card-image">
                            <div class="photo-card-overlay">
                                <button class="zoom-btn" data-photo-id="${photo.id}">
                                    <i class="fas fa-search-plus"></i>
                                </button>
                            </div>
                        </div>
                        <div class="photo-info">
                            <span class="photo-category">${photo.category}</span>
                            <h4 class="photo-card-title">${photo.title}</h4>
                            <p class="photo-card-photographer">📸 ${photo.photographer}</p>
                            <div class="photo-card-stats">
                                <div class="photo-actions">
                                    <button class="action-btn" data-action="like" data-photo-id="${photo.id}">
                                        <i class="fas fa-heart"></i> ${photo.likes}
                                    </button>
                                    <button class="action-btn" data-action="share" data-photo-id="${photo.id}">
                                        <i class="fas fa-share"></i>
                                    </button>
                                </div>
                                <span class="upload-date">${formatDate(photo.date)}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add photo interaction handlers
        document.querySelectorAll('.zoom-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const photoId = btn.dataset.photoId;
                viewFullPhoto(photoId);
            });
        });

        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                const photoId = btn.dataset.photoId;
                handlePhotoAction(action, photoId);
            });
        });
    }

    // Filter gallery based on category
    function filterGallery() {
        const photoCards = document.querySelectorAll('.photo-card');
        
        photoCards.forEach(card => {
            const category = card.dataset.category.toLowerCase();
            
            if (currentFilter === 'all' || category === currentFilter) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.3s ease';
            } else {
                card.style.display = 'none';
            }
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
                        <div class="workshop-icon">📷</div>
                        <h4 class="workshop-title">${workshop.title}</h4>
                        <span class="workshop-level">${workshop.level}</span>
                        <p class="workshop-description">${workshop.description}</p>
                        
                        <div class="workshop-details">
                            <h5>What You'll Learn:</h5>
                            <ul class="workshop-curriculum">
                                ${workshop.topics.map(topic => `<li>${topic}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <button class="join-workshop-btn" data-workshop-id="${workshop.id}">
                            Join Workshop
                        </button>
                    </div>
                `).join('')}
            </div>
        `;

        // Add workshop join handlers
        document.querySelectorAll('.join-workshop-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const workshopId = btn.dataset.workshopId;
                joinWorkshop(workshopId);
            });
        });
    }

    // Setup photo modal for full-size viewing
    function setupPhotoModal() {
        // Create modal if it doesn't exist
        if (!qs('#photoModal')) {
            const modal = document.createElement('div');
            modal.id = 'photoModal';
            modal.className = 'photo-modal hidden';
            modal.innerHTML = `
                <div class="modal-backdrop">
                    <div class="modal-content">
                        <button class="modal-close">&times;</button>
                        <div class="modal-photo">
                            <div class="modal-image"></div>
                            <div class="modal-info">
                                <h3 class="modal-title"></h3>
                                <p class="modal-photographer"></p>
                                <p class="modal-description"></p>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);

            // Add close handler
            modal.querySelector('.modal-close').addEventListener('click', closePhotoModal);
            modal.querySelector('.modal-backdrop').addEventListener('click', (e) => {
                if (e.target === e.currentTarget) closePhotoModal();
            });
        }
    }

    // Handler functions
    function viewFullPhoto(photoId) {
        const modal = qs('#photoModal');
        if (modal) {
            // Find photo data (mock for now)
            showNotification('Full-size photo viewer will be implemented soon!', 'info');
            // TODO: Implement full photo modal with actual data
        }
    }

    function closePhotoModal() {
        const modal = qs('#photoModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    function handlePhotoAction(action, photoId) {
        switch (action) {
            case 'like':
                showNotification('Photo liked!', 'success');
                // TODO: Implement actual like functionality
                break;
            case 'share':
                showNotification('Share functionality coming soon!', 'info');
                // TODO: Implement share functionality
                break;
        }
    }

    function joinWorkshop(workshopId) {
        showNotification('Workshop registration will be implemented soon!', 'info');
        // TODO: Implement workshop registration
    }

    // Mock data functions
    async function getMockPhotoOfWeek() {
        return {
            id: 1,
            title: "Golden Hour Landscape",
            photographer: "Alex Chen",
            description: "A breathtaking landscape captured during the golden hour, showcasing the beauty of natural lighting.",
            likes: 156,
            views: 1205,
            camera: "Canon EOS R5",
            date: "2025-08-20"
        };
    }

    async function getMockPhotoGallery() {
        return [
            {
                id: 1,
                title: "City Streets",
                photographer: "Sarah Kim",
                category: "street",
                likes: 89,
                date: "2025-08-15"
            },
            {
                id: 2,
                title: "Mountain Peak",
                photographer: "Mike Johnson",
                category: "landscape",
                likes: 142,
                date: "2025-08-18"
            },
            {
                id: 3,
                title: "Portrait Study",
                photographer: "Emma Davis",
                category: "portrait",
                likes: 67,
                date: "2025-08-20"
            },
            {
                id: 4,
                title: "Abstract Shadows",
                photographer: "David Lee",
                category: "abstract",
                likes: 98,
                date: "2025-08-22"
            },
            {
                id: 5,
                title: "Wildlife Close-up",
                photographer: "Lisa Wang",
                category: "nature",
                likes: 203,
                date: "2025-08-25"
            }
        ];
    }

    async function getMockWorkshops() {
        return [
            {
                id: 1,
                title: "Photography Basics",
                level: "Beginner",
                description: "Learn the fundamentals of photography including composition, lighting, and camera settings.",
                topics: [
                    "Camera operation and settings",
                    "Composition techniques",
                    "Understanding light",
                    "Basic photo editing"
                ]
            },
            {
                id: 2,
                title: "Portrait Photography",
                level: "Intermediate",
                description: "Master the art of portrait photography with lighting techniques and posing.",
                topics: [
                    "Portrait lighting setups",
                    "Directing and posing subjects",
                    "Background selection",
                    "Post-processing portraits"
                ]
            },
            {
                id: 3,
                title: "Street Photography",
                level: "Advanced",
                description: "Capture compelling street photography with advanced techniques.",
                topics: [
                    "Candid photography techniques",
                    "Working with available light",
                    "Street photography ethics",
                    "Storytelling through images"
                ]
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

// Add after your existing imports
let clubEventData = {
    upcoming: [],
    announcements: [],
    pastEvents: []
};

// Update your initializePhotographyClub function
function initializePhotographyClub() {
    loadPhotoOfWeek();
    loadPhotoGallery();
    loadWorkshops();
    loadClubEventData(); // Add this new function
    setupCameraAnimation();
    setupGalleryFilters();
    setupPhotoModal();
    setupEventRegistration(); // Add this new function
}

// Add these new functions for event management
async function loadClubEventData() {
    try {
        const response = await fetch('/api/clubs/photography/events/data');
        const data = await response.json();
        
        if (data.success) {
            clubEventData = data.data;
            displayUpcomingEvents();
            displayAnnouncements();
            displayPastEvents();
        }
    } catch (error) {
        console.error('Error loading club event data:', error);
    }
}

function displayUpcomingEvents() {
    const container = qs('#upcomingEvents');
    if (!container || !clubEventData.upcoming.length) {
        if (container) {
            container.innerHTML = `
                <div class="no-events">
                    <p>No upcoming photography events at the moment.</p>
                    <p>Check back soon for exciting workshops and exhibitions!</p>
                </div>
            `;
        }
        return;
    }

    const eventsHtml = clubEventData.upcoming.map(event => `
        <div class="event-card" data-event-id="${event.id}">
            <div class="event-header">
                <h4 class="event-title">${event.title}</h4>
                <span class="event-type badge">${event.type}</span>
                ${event.featured ? '<span class="badge badge-featured">Featured</span>' : ''}
            </div>
            <p class="event-description">${event.description}</p>
            <div class="event-details">
                <div class="event-info">
                    <span class="event-date">📅 ${formatEventDate(event.date, event.time)}</span>
                    <span class="event-location">📍 ${event.location}</span>
                </div>
                ${event.registration_required ? `
                    <div class="event-registration">
                        <span class="capacity-info">${event.registered}/${event.capacity} registered</span>
                        <div class="capacity-bar">
                            <div class="capacity-fill" style="width: ${(event.registered/event.capacity)*100}%"></div>
                        </div>
                        ${event.registered < event.capacity ? 
                            `<button class="register-btn btn btn-primary" onclick="openRegistrationModal(${event.id})">
                                Register Now
                            </button>` : 
                            `<button class="btn btn-secondary" disabled>Event Full</button>`
                        }
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');

    container.innerHTML = eventsHtml;
}

function displayAnnouncements() {
    const container = qs('#clubAnnouncements');
    if (!container) return;

    if (!clubEventData.announcements.length) {
        container.innerHTML = '<p class="no-announcements">No recent announcements.</p>';
        return;
    }

    const announcementsHtml = clubEventData.announcements.map(announcement => `
        <div class="announcement-card">
            <div class="announcement-header">
                <h5>${announcement.title}</h5>
                <span class="announcement-date">${formatDate(announcement.created_date)}</span>
            </div>
            <p>${announcement.content}</p>
            <div class="announcement-footer">
                <span class="priority-badge priority-${announcement.priority}">${announcement.priority}</span>
                ${announcement.email_sent ? '<span class="email-badge">📧 Sent via Email</span>' : ''}
            </div>
        </div>
    `).join('');

    container.innerHTML = announcementsHtml;
}

function displayPastEvents() {
    const container = qs('#pastEvents');
    if (!container) return;

    if (!clubEventData.pastEvents.length) {
        container.innerHTML = '<p class="no-past-events">No past events to display.</p>';
        return;
    }

    const pastEventsHtml = clubEventData.pastEvents.map(event => `
        <div class="past-event-card">
            <div class="past-event-header">
                <h5>${event.title}</h5>
                <span class="event-date">${formatEventDate(event.date, event.time)}</span>
            </div>
            <p>${event.description}</p>
            <div class="past-event-stats">
                <span>👥 ${event.registered} participants</span>
                <span>📍 ${event.location}</span>
            </div>
        </div>
    `).join('');

    container.innerHTML = pastEventsHtml;
}

// Event registration functionality
function setupEventRegistration() {
    // Create registration modal HTML if it doesn't exist
    if (!qs('#registrationModal')) {
        const modalHtml = `
            <div id="registrationModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Register for Event</h3>
                        <button class="modal-close" onclick="closeRegistrationModal()">&times;</button>
                    </div>
                    <form id="registrationForm">
                        <div class="form-group">
                            <label for="regName">Full Name *</label>
                            <input type="text" id="regName" name="name" required class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="regEmail">Email *</label>
                            <input type="email" id="regEmail" name="email" required class="form-control">
                        </div>
                        <div class="form-group">
                            <label for="regPhone">Phone Number</label>
                            <input type="tel" id="regPhone" name="phone" class="form-control">
                        </div>
                        <div class="form-actions">
                            <button type="button" onclick="closeRegistrationModal()" class="btn btn-secondary">Cancel</button>
                            <button type="submit" class="btn btn-primary">Register</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }

    // Setup form submission
    qs('#registrationForm').addEventListener('submit', handleRegistrationSubmit);
}

let currentEventId = null;

function openRegistrationModal(eventId) {
    currentEventId = eventId;
    const event = clubEventData.upcoming.find(e => e.id === eventId);
    if (event) {
        qs('#registrationModal h3').textContent = `Register for ${event.title}`;
    }
    qs('#registrationModal').classList.add('active');
}

function closeRegistrationModal() {
    qs('#registrationModal').classList.remove('active');
    qs('#registrationForm').reset();
    currentEventId = null;
}

async function handleRegistrationSubmit(e) {
    e.preventDefault();
    if (!currentEventId) return;

    const formData = new FormData(e.target);
    const registrationData = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone') || ''
    };

    try {
        const response = await fetch(`/api/events/${currentEventId}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registrationData)
        });

        const result = await response.json();

        if (result.success) {
            showNotification('Registration successful! Check your email for confirmation.', 'success');
            closeRegistrationModal();
            loadClubEventData(); // Refresh the data
        } else {
            showNotification(result.error || 'Registration failed', 'error');
        }
    } catch (error) {
        showNotification('Registration failed. Please try again.', 'error');
    }
}

// Utility functions
function formatEventDate(date, time) {
    const eventDate = new Date(date + 'T' + time);
    return eventDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

// Add to your photography_club.js
function setupEventTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show corresponding content
            tabContents.forEach(content => {
                content.style.display = 'none';
                content.classList.remove('active');
            });
            
            const activeContent = document.getElementById(`${tabName}-tab`);
            if (activeContent) {
                activeContent.style.display = 'block';
                activeContent.classList.add('active');
            }
        });
    });
}

// Add this to your initializePhotographyClub function
setupEventTabs();

