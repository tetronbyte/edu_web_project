document.addEventListener('DOMContentLoaded', () => {
  const { qs, showNotification } = window.Utils;

  // DOM
  const viewsChart = qs('#viewsChart');
  const clubActivityChart = qs('#clubActivityChart');
  const contentChart = qs('#contentChart');
  const engagementChart = qs('#engagementChart');
  const topContentList = qs('#topContentList');
  const popularEventsList = qs('#popularEventsList');
  const clubPerformanceList = qs('#clubPerformanceList');
  const systemHealthList = qs('#systemHealthList');
  const systemStatus = qs('#systemStatus');
  const exportPDFBtn = qs('#exportPDF');
  const exportCSVBtn = qs('#exportCSV');
  const exportExcelBtn = qs('#exportExcel');
  const dateRange = qs('#dateRange');
  const refreshAnalytics = qs('#refreshAnalytics');

  // Load all analytics on load/refresh
  loadAnalytics();
  refreshAnalytics?.addEventListener('click', loadAnalytics);
  dateRange?.addEventListener('change', loadAnalytics);

  async function loadAnalytics() {
    try {
      // Demo: Replace with real API calls!
      renderStats({ views: 34567, users: 815, registrations: 289, downloads: 1024 });
      renderCharts();
      renderLists();
      renderSystemHealth();
    } catch {
      showNotification('Failed to load analytics', 'error');
    }
  }

  function renderStats(stats) {
    qs('#totalViews').textContent = stats.views;
    qs('#activeUsers').textContent = stats.users;
    qs('#eventRegistrations').textContent = stats.registrations;
    qs('#notesDownloads').textContent = stats.downloads;
  }

  function renderCharts() {
    // Use Chart.js or any charting tool
    // Placeholder: Remove and replace with actual chart rendering
    [viewsChart, clubActivityChart, contentChart, engagementChart].forEach(canvas => {
      if (!canvas) return;
      canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
      // ...initialize and render dummy data (or real once API is ready)
    });
  }

  function renderLists() {
    topContentList.innerHTML = `<li class="report-item"><span class="report-name">Welcome to the Analytics Demo</span><span class="report-value">-</span></li>`;
    popularEventsList.innerHTML = `<li class="report-item"><span class="report-name">Demo Event</span><span class="report-value">-</span></li>`;
    clubPerformanceList.innerHTML = `<li class="report-item"><span class="report-name">No data</span><span class="report-value">-</span></li>`;
  }

  function renderSystemHealth() {
    systemStatus.className = 'status-indicator status-published';
    systemHealthList.innerHTML = `<li class="report-item"><span class="report-name">System Healthy</span><span class="report-value">OK</span></li>`;
  }

  // Exports
  exportPDFBtn?.addEventListener('click', () => showNotification('Export to PDF coming soon!', 'info'));
  exportCSVBtn?.addEventListener('click', () => showNotification('Export to CSV coming soon!', 'info'));
  exportExcelBtn?.addEventListener('click', () => showNotification('Export to Excel coming soon!', 'info'));
});
