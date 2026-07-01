// Energy Analyst Dashboard Scripts

function initAllAnalyst() {
  initDashboardNavigation();
  initAnalystCharts();
  initLiveTelemetrySimulation();
  initArbitrageEstimator();
  initForecastModelRecalc();
  initExporterInteractivity();
  initResponsiveSidebar();
  initProfileDropdown();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllAnalyst);
} else {
  initAllAnalyst();
}

// 1. Sidebar Navigation (Panel Switcher)
function initDashboardNavigation() {
  const menuItems = document.querySelectorAll('.sidebar-item');
  const panels = document.querySelectorAll('.dashboard-content-panel');
  const titleHeader = document.getElementById('current-panel-title');

  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();

      menuItems.forEach(i => i.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

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

// 2. Initialize Chart.js objects (5 charts)
let charts = {};
function initAnalystCharts() {
  const chartConfigs = {
    // A. Generation Chart
    generationChart: {
      type: 'line',
      data: {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'],
        datasets: [
          {
            label: 'Solar + Wind Yield (kW)',
            data: [420, 310, 1100, 1850, 1400, 520, 290],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            tension: 0.4,
            fill: true
          },
          {
            label: 'Battery Dispatch (kW)',
            data: [-150, -100, 120, 480, -320, 850, 150],
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.05)',
            tension: 0.4,
            fill: true
          }
        ]
      }
    },
    // B. Energy Mix Doughnut Chart
    mixChart: {
      type: 'doughnut',
      data: {
        labels: ['Solar PV', 'Wind Generation', 'BESS Discharge', 'Grid Feed-in'],
        datasets: [{
          data: [45, 30, 18, 7],
          backgroundColor: [
            'rgba(16, 185, 129, 0.75)',
            'rgba(59, 130, 246, 0.75)',
            'rgba(234, 179, 8, 0.75)',
            'rgba(239, 68, 68, 0.5)'
          ],
          borderColor: 'transparent'
        }]
      },
      options: {
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#9ca3af', boxWidth: 12 }
          }
        }
      }
    },
    // C. Diurnal Grid Spread Bar Chart
    marketSpreadChart: {
      type: 'bar',
      data: {
        labels: ['Off-Peak (02:00)', 'Mid-Peak (09:00)', 'On-Peak (18:00)', 'Shoulder (22:00)'],
        datasets: [{
          label: 'Grid Electricity cost ($/MWh)',
          data: [42, 115, 284, 98],
          backgroundColor: 'rgba(59, 130, 246, 0.65)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 1.5,
          borderRadius: 6
        }]
      }
    },
    // D. Forecast Load Curve Chart
    forecastChart: {
      type: 'line',
      data: {
        labels: ['12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
        datasets: [
          {
            label: 'ML Predicted Load (MW)',
            data: [3.2, 3.6, 4.1, 4.82, 4.5, 3.8],
            borderColor: '#ef4444',
            borderDash: [5, 5],
            tension: 0.3
          },
          {
            label: 'Actual Active Load (MW)',
            data: [3.1, 3.7, 4.0, 4.78, 4.6, 3.6],
            borderColor: '#3b82f6',
            tension: 0.3
          }
        ]
      }
    },
    // E. Monthly ESG CO2 Savings Bar Chart
    esgChart: {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'CO2 Offset (Tons)',
          data: [102, 115, 142, 185, 210, 248],
          backgroundColor: 'rgba(16, 185, 129, 0.65)',
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1.5,
          borderRadius: 6
        }]
      }
    }
  };

  // Base options for scales, fonts
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#475569' } }
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
  };

  // Compile
  Object.keys(chartConfigs).forEach(id => {
    const canvas = document.getElementById(id);
    if (!canvas) return;

    const conf = chartConfigs[id];
    // inject baseOptions if not provided
    if (!conf.options) {
      conf.options = JSON.parse(JSON.stringify(baseOptions));
    }
    
    charts[id] = new Chart(canvas.getContext('2d'), conf);
  });
}

// 3. Fluctuate Live metrics values
function initLiveTelemetrySimulation() {
  const yieldVal = document.getElementById('live-yield');
  const solarVal = document.getElementById('live-solar');
  
  if (!yieldVal || !solarVal) return;

  let currentYield = 48240;
  let currentSolar = 842;

  setInterval(() => {
    // Increment yields slightly
    currentYield += Math.round(Math.random() * 8 + 2);
    yieldVal.textContent = '$' + currentYield.toLocaleString();

    // Fluctuate solar kW
    currentSolar += Math.round(Math.random() * 20 - 10);
    if (currentSolar < 100) currentSolar = 600;
    solarVal.textContent = currentSolar.toLocaleString() + ' kW';
  }, 4000);
}

// 4. Interactive Arbitrage Calculator Sizing Formula
function initArbitrageEstimator() {
  const sizeInput = document.getElementById('arb-size');
  const spreadInput = document.getElementById('arb-spread');
  const profitVal = document.getElementById('arb-est-profit');

  if (!sizeInput || !spreadInput || !profitVal) return;

  const calculateArbitrage = () => {
    const size = parseFloat(sizeInput.value) || 0;
    const spread = parseFloat(spreadInput.value) || 0;
    
    // Formula: Size * Spread * 0.90 efficiency
    const estimatedProfit = size * spread * 0.90;
    profitVal.textContent = '$' + Math.round(estimatedProfit).toLocaleString();
  };

  sizeInput.addEventListener('input', calculateArbitrage);
  spreadInput.addEventListener('input', calculateArbitrage);
}

// 5. ML Weather forecasting recalculate trigger
function initForecastModelRecalc() {
  const recalcBtn = document.getElementById('btn-recalc-forecast');
  if (recalcBtn) {
    recalcBtn.addEventListener('click', () => {
      window.location.href = '404.html';
    });
  }
}

// 6. Developer Key toggles, Excel exporter triggers
function initExporterInteractivity() {
  // Key reveal toggle
  const revealBtn = document.getElementById('btn-reveal-key');
  const keyField = document.getElementById('api-key-field');
  
  if (revealBtn && keyField) {
    revealBtn.addEventListener('click', () => {
      const isPassword = keyField.type === 'password';
      keyField.type = isPassword ? 'text' : 'password';
      
      const icon = revealBtn.querySelector('i');
      if (icon) {
        icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
      }
    });
  }

  // Data download action
  const executeExportBtn = document.getElementById('btn-execute-export');
  if (executeExportBtn) {
    executeExportBtn.addEventListener('click', () => {
      window.location.href = '404.html';
    });
  }

  // Environmental ESG report
  const exportEsgBtn = document.getElementById('btn-export-esg');
  if (exportEsgBtn) {
    exportEsgBtn.addEventListener('click', () => {
      window.location.href = '404.html';
    });
  }
}

// 7. Responsive Mobile Sidebar Menu
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

// 8. Profile Dropdown & Dynamic User Info
function initProfileDropdown() {
  const trigger = document.getElementById('user-profile-trigger');
  const dropdown = document.getElementById('profile-dropdown');
  
  if (!trigger || !dropdown) return;

  // Retrieve details from localStorage
  const email = localStorage.getItem('loggedInUserEmail') || 'analyst@gmail.com';
  const name = localStorage.getItem('loggedInUserName') || 'Energy Analyst';
  
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
