document.addEventListener('DOMContentLoaded', () => {
  const { qs, qsa, showNotification, debounce, formToJSON } = window.Utils;
  const artworksGrid = qs('#artworksGrid');
  const addArtworkBtn = qs('#addArtworkBtn');
  const refreshBtn = qs('#refreshBtn');
  const searchInput = qs('#searchInput');
  const categoryFilter = qs('#categoryFilter');
  const artistFilter = qs('#artistFilter');
  const statusFilter = qs('#statusFilter');
  const modal = qs('#artworkModal');
  const artworkForm = qs('#artworkForm');
  const modalTitle = qs('#artworkModalTitle');
  const imageInput = qs('#artworkImage');
  const imageUploadArea = qs('.image-upload-area', modal);

  let editingArtworkId = null;

  loadArtworks();
  refreshBtn?.addEventListener('click', loadArtworks);
  addArtworkBtn?.addEventListener('click', () => openModal());
  searchInput?.addEventListener('input', debounce(loadArtworks, 250));
  categoryFilter?.addEventListener('change', loadArtworks);
  artistFilter?.addEventListener('change', loadArtworks);
  statusFilter?.addEventListener('change', loadArtworks);

  qs('.modal-close', modal)?.addEventListener('click', closeModal);

  // Image upload click
  imageUploadArea?.addEventListener('click', () => imageInput.click());

  artworkForm?.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = new FormData(artworkForm);
    // tags split, booleans
    if (formData.get('tags'))
      formData.set('tags', formData.get('tags').split(',').map(s => s.trim()).filter(Boolean).join(','));
    formData.set('featured', artworkForm.featured.checked ? 'true' : '');
    try {
      if (editingArtworkId) {
        await Api.admin.updateArtwork(editingArtworkId, formData);
      } else {
        await Api.admin.createArtwork(formData);
      }
      showNotification('Artwork saved!', 'success');
      closeModal();
      loadArtworks();
    } catch {
      showNotification('Failed to save artwork!', 'error');
    }
  });

  async function loadArtworks() {
    artworksGrid.innerHTML = '<div class="loading">Loading artworks...</div>';
    try {
      const params = {
        q: searchInput.value?.trim() || '',
        category: categoryFilter.value || '',
        artist: artistFilter.value || '',
        status: statusFilter.value || ''
      };
      const { artworks } = await Api.admin.getArtworks(params);
      if (!artworks || !artworks.length) {
        artworksGrid.innerHTML = '<div class="empty-state">No artworks found.</div>';
        return;
      }
      artworksGrid.innerHTML = artworks.map(a => `
        <div class="artwork-admin-card">
          <div class="artwork-preview" style="background-image:url('${a.thumbnail_path || a.image_path || ''}')">
            ${a.featured ? '<span class="artwork-badge">Featured</span>' : ''}
          </div>
          <div class="artwork-info">
            <div class="artwork-title">${a.title}</div>
            <div class="artwork-artist">${a.artist || ''}</div>
            <div class="stat-item">${a.likes || 0} <span class="stat-label">Likes</span></div>
            <div class="stat-item">${a.views || 0} <span class="stat-label">Views</span></div>
            <div class="stat-item">${a.category || ''}</div>
            <div class="artwork-meta">${(a.tags||[]).map(t => `<span class="meta-tag">${t}</span>`).join('')}</div>
            <div class="artwork-actions">
              <button class="action-btn btn-edit" data-id="${a.id}"><i class="fas fa-edit"></i> Edit</button>
              <button class="action-btn btn-delete" data-id="${a.id}"><i class="fas fa-trash"></i> Delete</button>
            </div>
          </div>
        </div>
      `).join('');
      qsa('.btn-edit', artworksGrid).forEach(btn => btn.addEventListener('click', e => openModal(e.target.closest('button').dataset.id)));
      qsa('.btn-delete', artworksGrid).forEach(btn => btn.addEventListener('click', e => deleteArtwork(e.target.closest('button').dataset.id)));
    } catch {
      artworksGrid.innerHTML = '<div class="empty-state">Failed to load artworks.</div>';
    }
  }

  async function openModal(artworkId = null) {
    editingArtworkId = artworkId;
    artworkForm.reset();
    if (artworkId) {
      modalTitle.textContent = 'Edit Artwork';
      try {
        const artwork = await Api.admin.getArtwork(artworkId);
        Object.entries(artwork).forEach(([k, v]) => {
          if (artworkForm[k]) artworkForm[k].value = typeof v === 'object' ? (v.join?.(', ') || '') : v;
        });
        artworkForm.featured.checked = !!artwork.featured;
      } catch {
        showNotification('Could not load artwork.', 'error');
      }
    } else {
      modalTitle.textContent = 'Add New Artwork';
    }
    modal.classList.add('active');
  }

  function closeModal() {
    editingArtworkId = null;
    modal.classList.remove('active');
  }

  async function deleteArtwork(artworkId) {
    if (!confirm('Delete this artwork?')) return;
    try {
      await Api.admin.deleteArtwork(artworkId);
      showNotification('Artwork deleted!', 'success');
      loadArtworks();
    } catch {
      showNotification('Failed to delete artwork!', 'error');
    }
  }
});
