/* ========= Main Clubs Page ========= */

document.addEventListener('DOMContentLoaded', () => {
    const { qs, showNotification, formatDate } = window.Utils;

    // DOM elements
    const eventsContainer = qs('#upcomingEvents');

    // Initialize page
    initializeClubsPage();


    function initializeClubsPage() {
        loadUpcomingEvents();
        setupClubCards();
        setupSearchFunctionality();
    }

    // Load upcoming events
    async function loadUpcomingEvents() {
        try {
            showLoading(eventsContainer);
            
            // Simulate API call - replace with actual API when backend is ready
            const events = await getMockEvents();
            displayEvents(events);
            
        } catch (error) {
            console.error('Error loading events:', error);
            showError(eventsContainer, 'Failed to load upcoming events');
        }
    }

    // Display events
    function displayEvents(events) {
        if (!eventsContainer) return;

        if (events.length === 0) {
            eventsContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No Upcoming Events</h3>
                    <p>Check back later for exciting club events!</p>
                </div>
            `;
            return;
        }

        eventsContainer.innerHTML = events.map(event => `
            <div class="event-card fade-in" data-event-id="${event.id}">
                <div class="event-date">
                    <span class="event-day">${new Date(event.date).getDate()}</span>
                    <span class="event-month">${new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                </div>
                <div class="event-details">
                    <h4 class="event-title">${event.title}</h4>
                    <p class="event-club">${event.club}</p>
                    <p class="event-description">${event.description}</p>
                    <div class="event-meta">
                        <span class="event-time">⏰ ${event.time}</span>
                        <span class="event-location">📍 ${event.location}</span>
                    </div>
                </div>
                <div class="event-actions">
                    <button class="btn btn-primary join-event-btn" data-event-id="${event.id}">
                        Join Event
                    </button>
                </div>
            </div>
        `).join('');

        // Attach event listeners
        attachEventListeners();
    }

    // Setup club cards with hover effects and navigation
    function setupClubCards() {
        const clubCards = document.querySelectorAll('.club-card');
        
        clubCards.forEach(card => {
            // Add click navigation
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn')) return; // Don't navigate if clicking button
                
                const clubName = card.querySelector('h3').textContent.toLowerCase().replace(/\s+/g, '_');
                window.location.href = `/clubs/${clubName}`;
            });

            // Add hover animations
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    // Setup search functionality
    function setupSearchFunctionality() {
        const searchInput = qs('#clubSearch');
        const clubCards = document.querySelectorAll('.club-card');

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                
                clubCards.forEach(card => {
                    const clubName = card.querySelector('h3').textContent.toLowerCase();
                    const clubDescription = card.querySelector('p').textContent.toLowerCase();
                    
                    if (clubName.includes(searchTerm) || clubDescription.includes(searchTerm)) {
                        card.style.display = 'block';
                        card.style.animation = 'fadeIn 0.3s ease';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        }
    }

    // Attach event listeners for dynamic elements
    function attachEventListeners() {
        const joinButtons = document.querySelectorAll('.join-event-btn');
        
        joinButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const eventId = btn.dataset.eventId;
                handleEventJoin(eventId);
            });
        });
    }

    // Handle event join
    function handleEventJoin(eventId) {
        // For now, just show a notification
        showNotification('Event join functionality will be implemented soon!', 'info');
        
        // TODO: Implement actual event registration when backend is ready
        // const registrationData = { eventId, userId: getCurrentUser() };
        // await Api.registerForEvent(eventId, registrationData);
    }

    // Mock data - replace with actual API calls
    async function getMockEvents() {
        return [
            {
                id: 1,
                title: "Art Exhibition Opening",
                club: "Art & Design Club",
                description: "Showcase of student artwork and design projects",
                date: "2025-09-15",
                time: "6:00 PM",
                location: "Art Gallery"
            },
            {
                id: 2,
                title: "Photography Workshop",
                club: "Photography Club",
                description: "Learn advanced photography techniques",
                date: "2025-09-20",
                time: "2:00 PM",
                location: "Media Center"
            },
            {
                id: 3,
                title: "Dance Competition",
                club: "Dance Club",
                description: "Annual inter-college dance competition",
                date: "2025-09-25",
                time: "7:00 PM",
                location: "Auditorium"
            }
        ];
    }

    // Utility functions
    function showLoading(container) {
        if (container) {
            container.innerHTML = '<div class="loading">Loading events...</div>';
        }
    }

    function showError(container, message) {
        if (container) {
            container.innerHTML = `<div class="empty-state text-error">${message}</div>`;
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.mobile-dropdown-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const submenu = btn.nextElementSibling;
      submenu.classList.toggle('active');
    });
  });
});

