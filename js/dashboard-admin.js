// Energy Administrator Dashboard Scripts

function initAllAdmin() {
  initDashboardNavigation();
  initAdminChart();
  initLiveTelemetrySimulation();
  initControlInteractivity();
  initResponsiveSidebar();
  initProfileDropdown();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllAdmin);
} else {
  initAllAdmin();
}

// 1. Sidebar Navigation (Panel Switcher)
function initDashboardNavigation() {
  const menuItems = document.querySelectorAll('.sidebar-item');
  const panels = document.querySelectorAll('.dashboard-content-panel');
  const titleHeader = document.getElementById('current-panel-title');

  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();

      // Deactivate others
      menuItems.forEach(i => i.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      // Activate current
      item.classList.add('active');
      const targetId = item.getAttribute('data-target');
      const targetPanel = document.getElementById(targetId);
      
      if (targetPanel) {
        targetPanel.classList.add('active');
        
        // Update Title Header
        const targetTitle = item.querySelector('a').textContent.trim();
        titleHeader.textContent = targetTitle;
        
        // GSAP animate panel transition
        gsap.fromTo(targetPanel, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 });
      }

      // Close mobile drawer if active
      const sidebar = document.getElementById('sidebar');
      if (sidebar && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
      }
    });
  });
}

// 2. Chart.js Live Grid Dispatch trend line chart
let trendChart;
function initAdminChart() {
  const ctx = document.getElementById('adminTrendChart');
  if (!ctx) return;

  trendChart = new Chart(ctx.getContext('2d'), {
    type: 'line',
    data: {
      labels: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '17:50'],
      datasets: [{
        label: 'Grid Charging Rate (MW)',
        data: [2.5, 2.1, 1.8, 1.2, 0.8, -0.5, -1.2], // negative means discharging to grid
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: { color: '#475569' }
        }
      },
      scales: {
        y: {
          grid: { color: 'rgba(15, 23, 42, 0.06)' },
          ticks: { color: '#475569' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#475569' }
        }
      }
    }
  });
}

// 3. Simulated Live Telemetry Fluctuation
function initLiveTelemetrySimulation() {
  const socVal = document.getElementById('live-soc');
  const alertTableBody = document.getElementById('alert-table-body');
  
  if (!socVal) return;

  let soc = 78.5;
  
  setInterval(() => {
    // Fluctuate SOC upwards
    soc += 0.02;
    if (soc >= 100) soc = 50; // loop
    socVal.textContent = soc.toFixed(2) + '%';

    // Random dispatch data push in chart
    if (trendChart && Math.random() > 0.7) {
      trendChart.data.datasets[0].data.shift();
      // add dynamic value
      const newVal = (Math.random() * 4 - 2).toFixed(1);
      trendChart.data.datasets[0].data.push(newVal);
      trendChart.update();
    }

    // Occasional simulated security/system info alerts in feed
    if (Math.random() > 0.9) {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const newRow = document.createElement('tr');
      newRow.innerHTML = `
        <td>${timeStr}</td>
        <td>EMS Gateway</td>
        <td><span class="status-badge status-online">Info</span></td>
        <td>Telemetry parameters pushed to Salem Cloud Backup. Success status code 200.</td>
      `;
      // insert at top of table body
      if (alertTableBody) {
        alertTableBody.insertBefore(newRow, alertTableBody.firstChild);
        if (alertTableBody.children.length > 5) {
          alertTableBody.lastChild.remove();
        }
      }
    }
  }, 3000);
}

// 4. Relay Controls & Setup Interactivity
function initControlInteractivity() {
  // Toast notifications for relay check toggles
  const setupToggleToast = (id, label) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('change', () => {
      const active = el.checked;
      const statusText = active ? 'ACTIVATED' : 'DEACTIVATED';
      const toastType = active ? 'success' : 'info';
      if (window.showToast) {
        window.showToast(`${label} relay has been ${statusText} successfully.`, toastType);
      }
    });
  };

  setupToggleToast('control-inverter', 'Main Inverter Power');
  setupToggleToast('control-isolation', 'Grid Isolation Safety');
  setupToggleToast('control-thermal', 'Glycol Thermal Pump');

  // Emergency System Shutoff button
  const emergencyBtn = document.getElementById('emergency-shutoff');
  if (emergencyBtn) {
    emergencyBtn.addEventListener('click', () => {
      if (window.showToast) {
        window.showToast('CRITICAL ACTION: EMERGENCY SYSTEM SHUTOFF TRIGGERED. Disconnecting inverters...', 'error');
        // Simulate disabling everything
        document.querySelectorAll('.switch input').forEach(input => {
          input.checked = false;
        });
      }
    });
  }

  // Cell balance range slider
  const balanceSlider = document.getElementById('balance-rate');
  const balanceVal = document.getElementById('balance-rate-val');
  if (balanceSlider && balanceVal) {
    balanceSlider.addEventListener('input', () => {
      balanceVal.textContent = balanceSlider.value + ' mA';
    });
  }

  // Access Logs saving role config simulation
  const saveRoleBtn = document.getElementById('btn-save-role');
  if (saveRoleBtn) {
    saveRoleBtn.addEventListener('click', () => {
      const email = document.getElementById('role-email').value;
      if (!email) {
        if (window.showToast) window.showToast('Please type a valid email.', 'error');
        return;
      }
      // Redirect to 404.html
      window.location.href = '404.html';
    });
  }

  // Threshold controls range slider configs
  const maxSlider = document.getElementById('limit-max-soc');
  const maxVal = document.getElementById('limit-max-val');
  if (maxSlider && maxVal) {
    maxSlider.addEventListener('input', () => {
      maxVal.textContent = maxSlider.value + '%';
    });
  }

  const minSlider = document.getElementById('limit-min-soc');
  const minVal = document.getElementById('limit-min-val');
  if (minSlider && minVal) {
    minSlider.addEventListener('input', () => {
      minVal.textContent = minSlider.value + '%';
    });
  }

  // Configuration updates save toasts
  const saveRoutingBtn = document.getElementById('btn-save-routing');
  if (saveRoutingBtn) {
    saveRoutingBtn.addEventListener('click', () => {
      window.location.href = '404.html';
    });
  }

  const saveBackupBtn = document.getElementById('btn-save-backup');
  if (saveBackupBtn) {
    saveBackupBtn.addEventListener('click', () => {
      window.location.href = '404.html';
    });
  }

  // Export report
  const exportBtn = document.getElementById('btn-export-audit');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      window.location.href = '404.html';
    });
  }
}

// 5. Responsive Mobile Sidebar Menu
function initResponsiveSidebar() {
  const toggleBtn = document.getElementById('sidebar-toggle');
  const closeBtn = document.getElementById('sidebar-close');
  const sidebar = document.getElementById('sidebar');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.add('active');
    });
  }

  if (closeBtn && sidebar) {
    closeBtn.addEventListener('click', () => {
      sidebar.classList.remove('active');
    });
  }

  // Auto layout check on load
  const checkWidth = () => {
    if (window.innerWidth <= 1024) {
      if (toggleBtn) toggleBtn.style.display = 'block';
      if (closeBtn) closeBtn.style.display = 'block';
    } else {
      if (toggleBtn) toggleBtn.style.display = 'none';
      if (closeBtn) closeBtn.style.display = 'none';
      if (sidebar) sidebar.classList.remove('active');
    }
  };

  window.addEventListener('resize', checkWidth);
  checkWidth();
}

// 6. Profile Dropdown & Dynamic User Info
function initProfileDropdown() {
  const trigger = document.getElementById('user-profile-trigger');
  const dropdown = document.getElementById('profile-dropdown');
  
  if (!trigger || !dropdown) return;

  // Retrieve details from localStorage
  const email = localStorage.getItem('loggedInUserEmail') || 'admin@gmail.com';
  const name = localStorage.getItem('loggedInUserName') || 'Administrator';
  
  // Set elements
  const nameDisplay = document.getElementById('name-display');
  const emailDisplay = document.getElementById('email-display');
  const avatarDisplay = document.getElementById('avatar-display');
  const dropdownName = document.getElementById('dropdown-name');
  const dropdownEmail = document.getElementById('dropdown-email');

  if (nameDisplay) nameDisplay.textContent = name;
  if (emailDisplay) emailDisplay.textContent = email;
  if (avatarDisplay) avatarDisplay.textContent = name.charAt(0).toUpperCase();
  if (dropdownName) dropdownName.textContent = name;
  if (dropdownEmail) dropdownEmail.textContent = email;

  // Click to toggle
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = dropdown.style.display === 'block';
    if (isVisible) {
      gsap.to(dropdown, { opacity: 0, y: -10, duration: 0.2, onComplete: () => { dropdown.style.display = 'none'; } });
    } else {
      dropdown.style.display = 'block';
      gsap.fromTo(dropdown, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.25 });
    }
  });

  // Close when clicking outside
  document.addEventListener('click', () => {
    if (dropdown.style.display === 'block') {
      gsap.to(dropdown, { opacity: 0, y: -10, duration: 0.2, onComplete: () => { dropdown.style.display = 'none'; } });
    }
  });
}
