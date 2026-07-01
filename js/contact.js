// Contact Form, Accordion & Solutions Sizing Configurator

function initAll() {
  initContactForm();
  initFaqAccordion();
  initSolutionsConfigurator();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAll);
} else {
  initAll();
}

// 1. Contact Form Handler with Gmail validation and Toasts
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('form-name').value.trim();
    const email = document.getElementById('form-email').value.trim();
    const subject = document.getElementById('form-subject').value;
    const message = document.getElementById('form-message').value.trim();

    // Check blank fields
    if (!name || !email || !subject || !message) {
      if (window.showToast) {
        window.showToast('Please fill out all fields.', 'error');
      }
      return;
    }

    // Gmail format validation: only validate @gmail.com
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(email)) {
      if (window.showToast) {
        window.showToast('Authentication error: Only @gmail.com email addresses are accepted.', 'error');
      }
      return;
    }

    // Success Simulation redirect
    window.location.href = '404.html';
  });
}

// 2. FAQ Accordion Toggle
function initFaqAccordion() {
  const accordionHeaders = document.querySelectorAll('.faq-header');
  
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const content = header.nextElementSibling;
      const icon = header.querySelector('i');
      
      // Close other accordion items
      document.querySelectorAll('.faq-item').forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          const otherContent = otherItem.querySelector('.faq-content');
          const otherIcon = otherItem.querySelector('.faq-header i');
          otherContent.style.maxHeight = '0px';
          if (otherIcon) {
            otherIcon.style.transform = 'rotate(0deg)';
          }
        }
      });

      // Toggle current item
      item.classList.toggle('active');
      
      if (item.classList.contains('active')) {
        content.style.maxHeight = content.scrollHeight + 'px';
        icon.style.transform = 'rotate(180deg)';
      } else {
        content.style.maxHeight = '0px';
        icon.style.transform = 'rotate(0deg)';
      }
    });
  });
}

// 3. Solutions Sizing Configurator Calculator
function initSolutionsConfigurator() {
  const dailyLoad = document.getElementById('config-load');
  const autonomy = document.getElementById('config-autonomy');
  const source = document.getElementById('config-source');

  if (!dailyLoad || !autonomy || !source) return;

  const loadVal = document.getElementById('config-load-val');
  const autonomyVal = document.getElementById('config-autonomy-val');

  // Outputs
  const outBattery = document.getElementById('out-battery-capacity');
  const outInverter = document.getElementById('out-inverter-rating');
  const outSolar = document.getElementById('out-solar-needed');
  const outCost = document.getElementById('out-est-cost');
  const outCarbon = document.getElementById('out-annual-carbon');

  const calculateConfigurator = () => {
    const load = parseFloat(dailyLoad.value);
    const hours = parseFloat(autonomy.value);
    const energySource = source.value;

    loadVal.textContent = load.toLocaleString() + ' kWh';
    autonomyVal.textContent = hours + ' hrs';

    // Battery Capacity needed (kWh) assuming 85% depth of discharge (DoD) and 90% system efficiency
    const batteryCapacity = (load / 24) * hours / 0.85;

    // Recommended Inverter Rating (kW) assuming peak load is 2.5x the average load
    const inverterRating = (load / 24) * 2.5;

    // Solar panels needed (kW) assuming average of 4.5 peak sun hours per day
    let solarMultiplier = 1.3; // hybrid / battery overhead
    if (energySource === 'wind') solarMultiplier = 0.5; // less solar needed
    if (energySource === 'grid') solarMultiplier = 0.1; // only emergency solar backup
    const solarCapacity = (load * solarMultiplier) / 4.5;

    // Estimate total price
    const batteryCost = batteryCapacity * 380; // $380 per kWh lithium BESS
    const solarCost = solarCapacity * 950; // $950 per kW solar installer
    const inverterCost = inverterRating * 450; // $450 per kW utility inverter
    let installMarkup = 6500;
    if (load > 2000) installMarkup = 25000;
    const totalCost = batteryCost + solarCost + inverterCost + installMarkup;

    // Annual CO2 saved (tons)
    let co2OffsetRatio = 0.47;
    if (energySource === 'grid') co2OffsetRatio = 0.15; // lower offset if grid-tied
    const annualCo2 = (load * 365 * co2OffsetRatio) / 1000;

    // Set text outputs
    outBattery.textContent = Math.round(batteryCapacity).toLocaleString() + ' kWh';
    outInverter.textContent = inverterRating.toFixed(1) + ' kW';
    outSolar.textContent = solarCapacity.toFixed(1) + ' kW';
    outCost.textContent = '$' + Math.round(totalCost).toLocaleString();
    outCarbon.textContent = annualCo2.toFixed(1) + ' Tons';
  };

  dailyLoad.addEventListener('input', calculateConfigurator);
  autonomy.addEventListener('input', calculateConfigurator);
  source.addEventListener('change', calculateConfigurator);

  // Run calculation initially
  calculateConfigurator();
}
