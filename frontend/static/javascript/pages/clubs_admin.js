document.addEventListener('DOMContentLoaded', () => {
  const { qs, qsa, showNotification, debounce, formToJSON } = window.Utils;

  const clubsGrid = qs('#clubsGrid');
  const addClubBtn = qs('#addClubBtn');
  const refreshBtn = qs('#refreshBtn');
  const modal = qs('#clubModal');
  const clubForm = qs('#clubForm');
  const modalTitle = qs('#modalTitle');
  let editingClubId = null;

  // Load clubs on page load
  loadClubs();

  // Event: Add New
  addClubBtn?.addEventListener('click', () => openModal());
  refreshBtn?.addEventListener('click', loadClubs);

  // Modal close (button & ESC)
  qs('.modal-close', modal)?.addEventListener('click', closeModal);
  window.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // Form submit
  clubForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = formToJSON(clubForm);
    formData.tags = formData.tags?.split(',').map(t => t.trim()).filter(Boolean) || [];
    formData.featured = !!clubForm.featured.checked;

    try {
      let resp;
      if (editingClubId) {
        resp = await Api.admin.updateClub(editingClubId, formData);
      } else {
        resp = await Api.admin.createClub(formData);
      }
      showNotification(resp.message || 'Club saved!', 'success');
      closeModal();
      loadClubs();
    } catch (err) {
      showNotification('Error saving club', 'error');
    }
  });

  // Fetch, render, and attach actions
  async function loadClubs() {
    clubsGrid.innerHTML = '<div class="loading">Loading clubs...</div>';
    try {
      const { clubs } = await Api.admin.getClubs();
      renderClubs(clubs);
    } catch {
      clubsGrid.innerHTML = '<div class="empty-state">Failed to load clubs.</div>';
    }
  }

  function renderClubs(clubs) {
    if (!clubs || !clubs.length) {
      clubsGrid.innerHTML = '<div class="empty-state">No clubs found.</div>';
      return;
    }
    clubsGrid.innerHTML = clubs.map(club => `
      <div class="club-admin-card">
        <div class="club-header">
          <h3>${club.name}</h3>
          ${club.featured ? '<span class="featured-badge">Featured</span>' : ''}
        </div>
        <div class="club-stats">
          <div class="stat-item">
            <span class="stat-number">${club.members || 0}</span>
            <span class="stat-label">Members</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">${club.meeting_day || '-'}</span>
            <span class="stat-label">Meeting</span>
          </div>
          <div class="stat-item">
            <span class="stat-number">${club.location || '-'}</span>
            <span class="stat-label">Location</span>
          </div>
        </div>
        <p>${club.description || ''}</p>
        <div class="club-actions">
          <button class="action-btn btn-edit" data-id="${club.id}"><i class="fas fa-edit"></i> Edit</button>
          <button class="action-btn btn-delete" data-id="${club.id}"><i class="fas fa-trash"></i> Delete</button>
        </div>
      </div>
    `).join('');

    // Attach edit/delete
    qsa('.btn-edit', clubsGrid).forEach(btn => btn.addEventListener('click', e => openModal(e.target.closest('button').dataset.id)));
    qsa('.btn-delete', clubsGrid).forEach(btn => btn.addEventListener('click', e => deleteClub(e.target.closest('button').dataset.id)));
  }

  // Modal open (add or edit)
  async function openModal(clubId = null) {
    editingClubId = clubId;
    clubForm.reset();
    if (clubId) {
      modalTitle.textContent = 'Edit Club';
      try {
        const club = await Api.admin.getClub(clubId);
        Object.entries(club).forEach(([key, val]) => {
          if (clubForm[key]) clubForm[key].value = typeof val === 'object' ? (val.join?.(', ') || '') : val;
        });
        clubForm.featured.checked = !!club.featured;
      } catch {
        showNotification('Could not load club data', 'error');
      }
    } else {
      modalTitle.textContent = 'Add New Club';
    }
    modal.classList.add('active');
  }

  function closeModal() {
    editingClubId = null;
    modal.classList.remove('active');
  }

  async function deleteClub(clubId) {
    if (!confirm('Delete this club?')) return;
    try {
      await Api.admin.deleteClub(clubId);
      showNotification('Club deleted.', 'success');
      loadClubs();
    } catch {
      showNotification('Failed to delete club', 'error');
    }
  }
});
