document.addEventListener('DOMContentLoaded', () => {
  const { qs, qsa, showNotification, debounce, formatDate, formToJSON } = window.Utils;

  const eventsTable = qs('#eventsTableBody');
  const addEventBtn = qs('#addEventBtn');
  const refreshBtn = qs('#refreshBtn');
  const modal = qs('#eventModal');
  const eventForm = qs('#eventForm');
  const modalTitle = qs('#eventModalTitle');
  let editingEventId = null;

  // Filters
  const clubFilter = qs('#clubFilter');
  const typeFilter = qs('#typeFilter');
  const statusFilter = qs('#statusFilter');
  const searchInput = qs('#searchInput');

  // Load on page load
  loadClubsFilter();
  loadEvents();

  addEventBtn?.addEventListener('click', () => openModal());
  refreshBtn?.addEventListener('click', loadEvents);
  qs('.modal-close', modal)?.addEventListener('click', closeModal);

  clubFilter?.addEventListener('change', loadEvents);
  typeFilter?.addEventListener('change', loadEvents);
  statusFilter?.addEventListener('change', loadEvents);
  searchInput?.addEventListener('input', debounce(loadEvents, 250));

  // Form submit
  eventForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = formToJSON(eventForm);
    formData.tags = formData.tags?.split(',').map(s => s.trim()).filter(Boolean) || [];
    formData.featured = !!eventForm.featured.checked;
    formData.registration_required = !!eventForm.registration_required.checked;
    try {
      if (editingEventId) {
        await Api.admin.updateEvent(editingEventId, formData);
      } else {
        await Api.admin.createEvent(formData);
      }
      showNotification('Event saved!', 'success');
      closeModal();
      loadEvents();
    } catch {
      showNotification('Error saving event!', 'error');
    }
  });

  async function loadClubsFilter() {
    try {
      const { clubs } = await Api.admin.getClubs();
      clubFilter.innerHTML += clubs.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      qs('#eventClub').innerHTML += clubs.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    } catch {}
  }

  async function loadEvents() {
    eventsTable.innerHTML = `<tr><td colspan="7" class="loading">Loading...</td></tr>`;
    try {
      const params = {
        club: clubFilter.value || '',
        type: typeFilter.value || '',
        status: statusFilter.value || '',
        search: searchInput.value || ''
      };
      const { events } = await Api.admin.getEvents(params);
      if (!events || !events.length) {
        eventsTable.innerHTML = `<tr><td colspan="7">No events found.</td></tr>`;
        return;
      }
      eventsTable.innerHTML = events.map(ev => `
        <tr>
          <td>
            <div class="event-title">${ev.title}</div>
            <div class="event-description">${ev.description || ''}</div>
          </td>
          <td>${ev.club_name || '-'}</td>
          <td>${formatDate(ev.date)}<br>${ev.time} - ${ev.end_time || ''}</td>
          <td>${ev.location || '-'}</td>
          <td>${ev.registration_required ? 'Yes' : 'No'}<br>${ev.capacity ? (`${ev.registered || 0}/${ev.capacity}`) : '-'}</td>
          <td><span class="event-status status-${ev.status || 'upcoming'}">${(ev.status || 'Upcoming').toUpperCase()}</span></td>
          <td class="actions-cell">
            <button class="action-btn btn-edit" data-id="${ev.id}"><i class="fas fa-edit"></i></button>
            <button class="action-btn btn-delete" data-id="${ev.id}"><i class="fas fa-trash"></i></button>
          </td>
        </tr>
      `).join('');
      qsa('.btn-edit', eventsTable).forEach(btn => btn.addEventListener('click', e => openModal(e.target.closest('button').dataset.id)));
      qsa('.btn-delete', eventsTable).forEach(btn => btn.addEventListener('click', e => deleteEvent(e.target.closest('button').dataset.id)));
    } catch (err) {
      showNotification('Failed to load events', 'error');
      eventsTable.innerHTML = `<tr><td colspan="7">Error loading events</td></tr>`;
    }
  }

  async function openModal(eventId = null) {
    editingEventId = eventId;
    eventForm.reset();
    if (eventId) {
      modalTitle.textContent = 'Edit Event';
      try {
        const event = await Api.admin.getEvent(eventId);
        Object.entries(event).forEach(([k, v]) => {
          if (eventForm[k]) eventForm[k].value = v;
        });
        eventForm.featured.checked = !!event.featured;
        eventForm.registration_required.checked = !!event.registration_required;
      } catch {
        showNotification('Could not load event', 'error');
      }
    } else {
      modalTitle.textContent = 'Add New Event';
    }
    modal.classList.add('active');
  }

  function closeModal() {
    editingEventId = null;
    modal.classList.remove('active');
  }

  async function deleteEvent(eventId) {
    if (!confirm('Delete this event?')) return;
    try {
      await Api.admin.deleteEvent(eventId);
      showNotification('Event deleted.', 'success');
      loadEvents();
    } catch {
      showNotification('Delete failed', 'error');
    }
  }
});

// Add after your existing code
let currentTab = 'events';
let selectedClubForManagement = '';

// Add tab switching functionality
function setupEventManagementTabs() {
    const tabButtons = qsa('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchTab(tab);
        });
    });
}

function switchTab(tab) {
    currentTab = tab;
    
    // Update tab buttons
    qsa('.tab-button').forEach(btn => btn.classList.remove('active'));
    qs(`[data-tab="${tab}"]`).classList.add('active');
    
    // Show/hide sections
    qs('#eventsSection').style.display = tab === 'events' ? 'block' : 'none';
    qs('#registrationsSection').style.display = tab === 'registrations' ? 'block' : 'none';
    qs('#announcementsSection').style.display = tab === 'announcements' ? 'block' : 'none';
    qs('#archivesSection').style.display = tab === 'archives' ? 'block' : 'none';
    
    // Load appropriate data
    switch(tab) {
        case 'registrations':
            loadEventRegistrations();
            break;
        case 'announcements':
            loadAnnouncements();
            break;
        case 'archives':
            loadArchivedEvents();
            break;
        default:
            loadEvents();
    }
}

// Event Registration Functions
async function loadEventRegistrations() {
    const container = qs('#registrationsContainer');
    if (!selectedClubForManagement) {
        container.innerHTML = '<p>Please select a club first.</p>';
        return;
    }
    
    try {
        const { events } = await Api.admin.getEvents({ club: selectedClubForManagement });
        let html = '';
        
        for (const event of events) {
            if (event.registration_required) {
                const { registrations } = await Api.admin.getEventRegistrations(event.id);
                html += `
                    <div class="registration-event-card">
                        <h4>${event.title}</h4>
                        <p>Capacity: ${event.registered}/${event.capacity}</p>
                        <div class="registrations-list">
                            ${registrations.map(reg => `
                                <div class="registration-item">
                                    <div class="registration-info">
                                        <span class="registration-name">${reg.name}</span>
                                        <span class="registration-details">${reg.email} • ${reg.phone || 'No phone'}</span>
                                    </div>
                                    <span class="badge badge-success">${reg.status}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        }
        
        container.innerHTML = html || '<p>No registrations found.</p>';
    } catch (error) {
        container.innerHTML = '<p>Error loading registrations.</p>';
        console.error('Error loading registrations:', error);
    }
}

// Announcement Functions
async function loadAnnouncements() {
    const container = qs('#announcementsContainer');
    if (!selectedClubForManagement) {
        container.innerHTML = '<p>Please select a club first.</p>';
        return;
    }
    
    try {
        const { announcements } = await Api.admin.getClubAnnouncements(selectedClubForManagement);
        const html = announcements.map(ann => `
            <div class="announcement-item">
                <div class="announcement-header">
                    <span class="announcement-title">${ann.title}</span>
                    <span class="announcement-date">${formatDate(ann.created_date)}</span>
                </div>
                <p>${ann.content}</p>
                <div class="flex-between">
                    <span class="badge ${ann.email_sent ? 'badge-success' : 'badge-warning'}">
                        ${ann.send_email ? (ann.email_sent ? 'Email Sent' : 'Email Pending') : 'No Email'}
                    </span>
                    <span class="badge badge-info">${ann.priority}</span>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html || '<p>No announcements found.</p>';
    } catch (error) {
        container.innerHTML = '<p>Error loading announcements.</p>';
        console.error('Error loading announcements:', error);
    }
}

// Archive Functions
async function loadArchivedEvents() {
    const container = qs('#archivesContainer');
    if (!selectedClubForManagement) {
        container.innerHTML = '<p>Please select a club first.</p>';
        return;
    }
    
    try {
        const { events } = await Api.admin.getArchivedEvents({ club_id: selectedClubForManagement });
        const html = events.map(event => `
            <div class="archived-event">
                <div class="flex-between">
                    <div>
                        <h4 class="event-title">${event.title}</h4>
                        <p>${event.description}</p>
                        <small>Archived: ${formatDate(event.archived_date)}</small>
                    </div>
                    <div>
                        <button class="btn btn-secondary btn-sm" onclick="restoreEvent(${event.id})">
                            Restore
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html || '<p>No archived events found.</p>';
    } catch (error) {
        container.innerHTML = '<p>Error loading archived events.</p>';
        console.error('Error loading archived events:', error);
    }
}

// Action Functions
async function archiveEvent(eventId) {
    if (!confirm('Are you sure you want to archive this event?')) return;
    
    try {
        await Api.admin.archiveEvent(eventId);
        showNotification('Event archived successfully!', 'success');
        loadEvents();
    } catch (error) {
        showNotification('Error archiving event!', 'error');
    }
}

async function restoreEvent(eventId) {
    try {
        await Api.admin.restoreEvent(eventId);
        showNotification('Event restored successfully!', 'success');
        loadArchivedEvents();
    } catch (error) {
        showNotification('Error restoring event!', 'error');
    }
}

// Add announcement form handling
qs('#announcementForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = formToJSON(e.target);
    formData.club_id = selectedClubForManagement;
    formData.send_email = !!qs('#sendEmailOption').checked;
    
    try {
        await Api.admin.createAnnouncement(formData);
        showNotification('Announcement created!', 'success');
        e.target.reset();
        loadAnnouncements();
    } catch (error) {
        showNotification('Error creating announcement!', 'error');
    }
});

// Update existing event actions to include archive option
function updateEventTableRow(event, actions) {
    return actions + `<button class="action-btn btn-warning btn-xs" onclick="archiveEvent(${event.id})">Archive</button>`;
}

// Initialize tabs when page loads
document.addEventListener('DOMContentLoaded', () => {
    setupEventManagementTabs();
});

// Add to your Api object
window.Api = {
    ...window.Api,
    admin: {
        ...window.Api.admin,
        getEventRegistrations: (eventId) => 
            fetch(`/admin/api/events/${eventId}/registrations`).then(r => r.json()),
        getClubAnnouncements: (clubId) => 
            fetch(`/admin/api/clubs/${clubId}/announcements`).then(r => r.json()),
        createAnnouncement: (data) => 
            fetch('/admin/api/events/announcements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            }).then(r => r.json()),
        archiveEvent: (eventId) => 
            fetch(`/admin/api/events/${eventId}/archive`, { method: 'POST' }).then(r => r.json()),
        restoreEvent: (eventId) => 
            fetch(`/admin/api/events/${eventId}/restore`, { method: 'POST' }).then(r => r.json()),
        getArchivedEvents: (params = {}) => 
            fetch(`/admin/api/events/archived?${new URLSearchParams(params)}`).then(r => r.json())
    }
};
