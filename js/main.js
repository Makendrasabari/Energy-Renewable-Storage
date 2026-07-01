// Global Stackly JavaScript

function initAllGlobal() {
  initNavbar();
  initMobileMenu();
  initHeroSlider();
  initStatsCounter();
  initTechTabs();
  initSustainabilityCalculator();
  initTestimonialSlider();
  initScrollAnimations();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllGlobal);
} else {
  initAllGlobal();
}

// 1. Sticky Navbar & Active Links
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section');

  window.addEventListener('scroll', () => {
    // Scroll state for navbar background
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active state for links based on viewport scroll position
    let current = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= sectionTop - 120) {
        current = section.getAttribute('id') || '';
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      // match home page sections
      if (href.startsWith('#') && href.substring(1) === current) {
        link.classList.add('active');
      } else if (href.includes(window.location.pathname.split('/').pop()) && window.location.pathname.split('/').pop() !== '') {
        // match other pages
        link.classList.add('active');
      }
    });
  });
}

// 2. Mobile Menu Slide-Out Drawer
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks   = document.querySelector('.nav-links');

  if (!menuToggle || !navLinks) return;

  // Toggle open/close
  menuToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('active');
    menuToggle.classList.toggle('active', isOpen);
    menuToggle.setAttribute('aria-expanded', isOpen);
    if (isOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
  });

  // Close when any nav link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close when clicking outside the drawer
  document.addEventListener('click', (e) => {
    if (navLinks.classList.contains('active') &&
        !navLinks.contains(e.target) &&
        !menuToggle.contains(e.target)) {
      closeMenu();
    }
  });

  function closeMenu() {
    navLinks.classList.remove('active');
    menuToggle.classList.remove('active');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('mobile-menu-open');
  }
}


// 3. Hero Slider (5-Image Background Slider with GSAP transitions)
function initHeroSlider() {
  const slider = document.querySelector('.hero-slider-bg');
  if (!slider) return;

  const slides = document.querySelectorAll('.hero-slide');
  const prevBtn = document.querySelector('.hero-prev');
  const nextBtn = document.querySelector('.hero-next');
  const dots = document.querySelectorAll('.hero-dot');
  
  let currentSlide = 0;
  const slideCount = slides.length;
  let slideInterval;

  // One-time animate on load
  const tag = document.querySelector('.hero-section .hero-tag');
  const title = document.querySelector('.hero-section .hero-title');
  const subtitle = document.querySelector('.hero-section .hero-subtitle');
  const buttons = document.querySelector('.hero-section .hero-buttons');
  
  if (tag && title && subtitle && buttons) {
    gsap.fromTo(tag, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.2, ease: 'power2.out' });
    gsap.fromTo(title, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, delay: 0.3, ease: 'power3.out' });
    gsap.fromTo(subtitle, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, delay: 0.5, ease: 'power2.out' });
    gsap.fromTo(buttons, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, delay: 0.7, ease: 'power2.out' });
  }

  const showSlide = (index) => {
    // Reset classes and fade out inactive slides
    slides.forEach((slide, i) => {
      slide.classList.remove('active');
      if (i !== index) {
        gsap.to(slide, { opacity: 0, duration: 1.0, ease: 'power2.out' });
        slide.style.zIndex = '1';
      }
    });
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Set active and fade in
    const activeSlide = slides[index];
    activeSlide.classList.add('active');
    activeSlide.style.zIndex = '2';
    gsap.to(activeSlide, { opacity: 1, duration: 1.0, ease: 'power2.out' });
    
    dots[index].classList.add('active');
    currentSlide = index;
  };

  const nextSlide = () => {
    let nextIndex = (currentSlide + 1) % slideCount;
    showSlide(nextIndex);
  };

  const prevSlide = () => {
    let prevIndex = (currentSlide - 1 + slideCount) % slideCount;
    showSlide(prevIndex);
  };

  if (nextBtn && prevBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetInterval();
    });
    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetInterval();
    });
  }

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showSlide(index);
      resetInterval();
    });
  });

  const startInterval = () => {
    slideInterval = setInterval(nextSlide, 7000);
  };

  const resetInterval = () => {
    clearInterval(slideInterval);
    startInterval();
  };

  // Trigger initial slide animations
  showSlide(0);
  startInterval();
}

// 4. Statistics Counter Animation
function initStatsCounter() {
  const statsSection = document.querySelector('.stats-section');
  if (!statsSection) return;

  const stats = document.querySelectorAll('.stat-number');
  let animated = false;

  const countUp = () => {
    stats.forEach(stat => {
      const target = parseFloat(stat.getAttribute('data-target'));
      const suffix = stat.getAttribute('data-suffix') || '';
      const decimals = parseInt(stat.getAttribute('data-decimals') || '0');
      let currentVal = 0;
      const duration = 2000; // 2 seconds
      const steps = 60;
      const stepVal = target / steps;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        currentVal += stepVal;
        if (step >= steps) {
          clearInterval(timer);
          stat.textContent = target.toFixed(decimals) + suffix;
        } else {
          stat.textContent = currentVal.toFixed(decimals) + suffix;
        }
      }, duration / steps);
    });
  };

  // Trigger on scroll visibility
  window.addEventListener('scroll', () => {
    const sectionPos = statsSection.getBoundingClientRect().top;
    const screenHeight = window.innerHeight;
    if (sectionPos < screenHeight - 100 && !animated) {
      countUp();
      animated = true;
    }
  });
}

// 5. Storage Technologies Switcher Tab
function initTechTabs() {
  const tabs = document.querySelectorAll('.tech-tab-btn');
  const details = document.querySelectorAll('.tech-detail-card');

  if (tabs.length && details.length) {
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        details.forEach(d => d.classList.remove('active'));

        tab.classList.add('active');
        const targetId = tab.getAttribute('data-target');
        const activeDetail = document.getElementById(targetId);
        
        if (activeDetail) {
          activeDetail.classList.add('active');
          // GSAP fade card
          gsap.fromTo(activeDetail, { opacity: 0, scale: 0.98 }, { opacity: 1, scale: 1, duration: 0.4 });
        }
      });
    });
  }
}

// 6. Sustainability Calculator (Chart.js Integration)
function initSustainabilityCalculator() {
  const sizeSlider = document.getElementById('calc-size');
  const durationSlider = document.getElementById('calc-duration');
  
  if (!sizeSlider || !durationSlider) return;

  const sizeVal = document.getElementById('calc-size-val');
  const durationVal = document.getElementById('calc-duration-val');
  
  const metricCo2 = document.getElementById('metric-co2');
  const metricSavings = document.getElementById('metric-savings');
  const metricHomes = document.getElementById('metric-homes');

  // Chart JS setup
  const ctx = document.getElementById('impactChart').getContext('2d');
  
  const impactChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Solar Offset', 'Wind Storage Offset', 'Battery Yield', 'Standard Peak Cost'],
      datasets: [{
        label: 'Energy Flow Offset (MWh/Year)',
        data: [120, 95, 140, 210],
        backgroundColor: [
          'rgba(16, 185, 129, 0.65)',
          'rgba(59, 130, 246, 0.65)',
          'rgba(234, 179, 8, 0.65)',
          'rgba(239, 68, 68, 0.4)'
        ],
        borderColor: [
          'rgba(16, 185, 129, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderWidth: 1.5,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          grid: {
            color: 'rgba(255, 255, 255, 0.05)'
          },
          ticks: {
            color: '#9ca3af'
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            color: '#9ca3af'
          }
        }
      }
    }
  });

  const updateCalculations = () => {
    const size = parseInt(sizeSlider.value);
    const hours = parseInt(durationSlider.value);
    const capacity = size * hours;

    sizeVal.textContent = size.toLocaleString() + ' kW';
    durationVal.textContent = hours + ' hrs (' + capacity.toLocaleString() + ' kWh)';

    // Formulate realistic statistics
    const co2Saved = (capacity * 0.47 * 365) / 1000; // tons/year
    const annualSavings = capacity * 0.14 * 4 * 365; // dollar/year
    const homesPowered = capacity / 10.5; // Average homes powered

    metricCo2.textContent = Math.round(co2Saved).toLocaleString();
    metricSavings.textContent = '$' + Math.round(annualSavings).toLocaleString();
    metricHomes.textContent = Math.round(homesPowered).toLocaleString();

    // Update charts dynamic data
    impactChart.data.datasets[0].data = [
      Math.round(size * 1.5),
      Math.round(size * 1.2),
      Math.round(capacity * 0.8),
      Math.round(capacity * 1.1)
    ];
    impactChart.update();
  };

  sizeSlider.addEventListener('input', updateCalculations);
  durationSlider.addEventListener('input', updateCalculations);
  
  // Initial Run
  updateCalculations();
}

// 7. Testimonial Slider Carousel
function initTestimonialSlider() {
  const track   = document.querySelector('.testimonial-track');
  const wrapper = document.querySelector('.testimonial-wrapper');

  if (!track) return;

  // Grab original slides BEFORE cloning
  const origSlides = Array.from(track.querySelectorAll('.testimonial-slide'));
  if (origSlides.length === 0) return;

  // Clone each original slide and append for seamless loop
  origSlides.forEach(slide => {
    track.appendChild(slide.cloneNode(true));
  });

  // After DOM is ready, measure the pixel width of the original set
  // (sum of all original slides = exactly half the full track)
  function startMarquee() {
    const totalOriginalWidth = origSlides.reduce((acc, slide) => {
      return acc + slide.getBoundingClientRect().width;
    }, 0);

    if (totalOriginalWidth === 0) {
      // Retry on next frame if layout hasn't settled yet
      requestAnimationFrame(startMarquee);
      return;
    }

    // Animate from x:0 → x:-totalOriginalWidth, then instantly reset (seamless loop)
    const marqueeTween = gsap.to(track, {
      x: -totalOriginalWidth,
      duration: 18,        // seconds for one full loop
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize(x => parseFloat(x) % totalOriginalWidth)
      }
    });

    // Pause on hover, resume on leave
    if (wrapper) {
      wrapper.addEventListener('mouseenter', () => marqueeTween.pause());
      wrapper.addEventListener('mouseleave', () => marqueeTween.play());
    }
  }

  // Wait one frame so slide widths are rendered
  requestAnimationFrame(startMarquee);
}


// 8. Global Scroll Reveal Animations (GSAP)
function initScrollAnimations() {
  // GSAP ScrollTrigger transitions
  gsap.registerPlugin(ScrollTrigger);

  // Fade up animations for sections
  const fadeUps = document.querySelectorAll('.fade-up');
  fadeUps.forEach(element => {
    gsap.fromTo(element, 
      { y: 30, opacity: 0 }, 
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.4, 
        scrollTrigger: {
          trigger: element,
          start: 'top 92%',
          toggleActions: 'play none none none'
        }
      }
    );
  });

  // Staggered lists/cards animations
  const staggerCards = document.querySelectorAll('.stagger-cards');
  staggerCards.forEach(container => {
    const cards = container.children;
    gsap.fromTo(cards,
      { y: 25, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.3,
        stagger: 0.06,
        scrollTrigger: {
          trigger: container,
          start: 'top 90%',
          toggleActions: 'play none none none'
        }
      }
    );
  });
}

// Toast notification helper
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconClass = 'fa-check-circle';
  if (type === 'error') iconClass = 'fa-exclamation-circle';
  if (type === 'info') iconClass = 'fa-info-circle';

  toast.innerHTML = `
    <i class="fas ${iconClass} toast-icon"></i>
    <span class="toast-message">${message}</span>
  `;

  container.appendChild(toast);
  
  // Trigger animation next frame
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Auto remove toast
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 400);
  }, 4000);
}
window.showToast = showToast;
