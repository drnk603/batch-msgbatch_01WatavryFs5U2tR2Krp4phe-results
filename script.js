(function() {
  'use strict';

  const App = {
    state: {
      menuOpen: false,
      modalOpen: false,
      filterActive: 'all',
      observers: []
    },

    init() {
      this.initLazyLoad();
      this.initBurgerMenu();
      this.initSmoothScroll();
      this.initScrollSpy();
      this.initAnimations();
      this.initForms();
      this.initPortfolio();
      this.initModal();
      this.initMicroInteractions();
      this.initScrollToTop();
      this.initPrivacyLinks();
      this.initCountUp();
    },

    initLazyLoad() {
      document.querySelectorAll('img:not([loading]), video:not([loading])').forEach(el => {
        if (!el.classList.contains('c-logo__img') && !el.hasAttribute('data-critical')) {
          el.setAttribute('loading', 'lazy');
        }
      });
    },

    initBurgerMenu() {
      const nav = document.querySelector('.c-nav#main-nav');
      const toggle = document.querySelector('.c-nav__toggle');
      const navList = document.querySelector('.c-nav__list');
      const body = document.body;

      if (!nav || !toggle || !navList) return;

      const closeMenu = () => {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        body.classList.remove('u-no-scroll');
        this.state.menuOpen = false;
      };

      const openMenu = () => {
        nav.classList.add('is-open');
        toggle.setAttribute('aria-expanded', 'true');
        body.classList.add('u-no-scroll');
        this.state.menuOpen = true;
        
        setTimeout(() => {
          const firstLink = navList.querySelector('a');
          if (firstLink) firstLink.focus();
        }, 100);
      };

      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.state.menuOpen ? closeMenu() : openMenu();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.state.menuOpen) closeMenu();
      });

      document.addEventListener('click', (e) => {
        if (this.state.menuOpen && !nav.contains(e.target)) closeMenu();
      });

      navList.querySelectorAll('.c-nav__link').forEach(link => {
        link.addEventListener('click', closeMenu);
      });

      window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024 && this.state.menuOpen) closeMenu();
      });
    },

    initSmoothScroll() {
      const headerHeight = document.querySelector('.l-header')?.offsetHeight || 64;

      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          const href = anchor.getAttribute('href');
          if (href === '#' || href === '#!') {
            e.preventDefault();
            return;
          }

          const targetId = href.substring(1);
          const target = document.getElementById(targetId);

          if (target) {
            e.preventDefault();
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            
            window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
            });

            history.pushState(null, null, href);
          }
        });
      });
    },

    initScrollSpy() {
      const sections = document.querySelectorAll('section[id]');
      const navLinks = document.querySelectorAll('.c-nav__link[href^="#"]');

      if (!sections.length || !navLinks.length) return;

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            navLinks.forEach(link => {
              link.classList.remove('active');
              link.removeAttribute('aria-current');
              
              if (link.getAttribute('href') === `#${entry.target.id}`) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
              }
            });
          }
        });
      }, {
        rootMargin: '-20% 0px -70% 0px',
        threshold: 0
      });

      sections.forEach(section => observer.observe(section));
      this.state.observers.push(observer);
    },

    initAnimations() {
      const animateOnScroll = (entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      };

      const observer = new IntersectionObserver(animateOnScroll, {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      });

      const elements = document.querySelectorAll('.c-card, .c-service-card, .c-portfolio-card, .c-value-card, .c-benefit-item, .c-team-card, .c-testimonial-card, .c-pricing-card, .c-case-study, .c-cert-card, .c-location-card');

      elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        observer.observe(el);
      });

      this.state.observers.push(observer);

      document.querySelectorAll('img').forEach(img => {
        if (!img.classList.contains('c-logo__img')) {
          img.style.opacity = '0';
          img.style.transition = 'opacity 0.6s ease-out';
          
          if (img.complete) {
            img.style.opacity = '1';
          } else {
            img.addEventListener('load', () => {
              img.style.opacity = '1';
            });
          }
        }
      });
    },

    initForms() {
      const forms = document.querySelectorAll('form');

      forms.forEach(form => {
        const inputs = form.querySelectorAll('input:not([type="submit"]), textarea, select');
        
        inputs.forEach(input => {
          input.addEventListener('blur', () => this.validateField(input));
          input.addEventListener('input', () => {
            if (input.classList.contains('has-error')) {
              this.validateField(input);
            }
          });
        });

        form.addEventListener('submit', (e) => this.handleFormSubmit(e, form));
      });
    },

    validateField(field) {
      const value = field.value.trim();
      const type = field.type;
      const name = field.name.toLowerCase();
      let isValid = true;
      let errorMessage = '';

      this.clearFieldError(field);

      if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Dieses Feld ist erforderlich.';
      } else if (value) {
        if (type === 'email' || name.includes('email') || name.includes('e-mail')) {
          const emailRegex = /^[^s@]+@[^s@]+.[^s@]+$/;
          if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
          }
        } else if (type === 'tel' || name.includes('phone') || name.includes('telefon')) {
          const phoneRegex = /^[ds+-()]{10,20}$/;
          if (!phoneRegex.test(value)) {
            isValid = false;
            errorMessage = 'Bitte geben Sie eine gültige Telefonnummer ein (10-20 Zeichen).';
          }
        } else if (name.includes('name') || name.includes('vorname') || name.includes('nachname')) {
          const nameRegex = /^[a-zA-ZÀ-ÿs-']{2,50}$/;
          if (!nameRegex.test(value)) {
            isValid = false;
            errorMessage = 'Name sollte 2-50 Buchstaben enthalten.';
          }
        } else if (field.tagName === 'TEXTAREA' || name.includes('message') || name.includes('nachricht')) {
          if (value.length < 10) {
            isValid = false;
            errorMessage = 'Nachricht muss mindestens 10 Zeichen lang sein.';
          }
        }
      }

      if (!isValid) {
        this.showFieldError(field, errorMessage);
      }

      return isValid;
    },

    showFieldError(field, message) {
      field.classList.add('has-error');
      
      let errorEl = field.parentElement.querySelector('.c-form__error');
      if (!errorEl) {
        errorEl = document.createElement('span');
        errorEl.className = 'c-form__error';
        errorEl.setAttribute('role', 'alert');
        field.parentElement.appendChild(errorEl);
      }
      errorEl.textContent = message;
    },

    clearFieldError(field) {
      field.classList.remove('has-error');
      const errorEl = field.parentElement.querySelector('.c-form__error');
      if (errorEl) errorEl.remove();
    },

    handleFormSubmit(e, form) {
      e.preventDefault();

      const inputs = form.querySelectorAll('input:not([type="submit"]):not([type="checkbox"]), textarea, select');
      let isValid = true;

      inputs.forEach(input => {
        if (!this.validateField(input)) {
          isValid = false;
        }
      });

      if (!isValid) {
        const firstError = form.querySelector('.has-error');
        if (firstError) {
          firstError.focus();
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      const submitBtn = form.querySelector('[type="submit"]');
      const originalText = submitBtn?.textContent || '';

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:spin 0.6s linear infinite;margin-right:8px;"></span>Wird gesendet...';
      }

      const style = document.createElement('style');
      style.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
      document.head.appendChild(style);

      setTimeout(() => {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        console.log('Form data:', data);

        setTimeout(() => {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          }

          this.showNotification('Vielen Dank! Ihre Anfrage wurde erfolgreich gesendet.', 'success');
          form.reset();

          setTimeout(() => {
            window.location.href = 'thank_you.html';
          }, 1500);
        }, 1000);
      }, 500);
    },

    showNotification(message, type = 'info') {
      let container = document.getElementById('notification-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = 'position:fixed;top:80px;right:20px;z-index:10000;display:flex;flex-direction:column;gap:10px;max-width:400px;';
        document.body.appendChild(container);
      }

      const colors = {
        success: '#28a745',
        error: '#cc0000',
        info: '#17a2b8',
        warning: '#ffc107'
      };

      const notification = document.createElement('div');
      notification.style.cssText = `background:${colors[type]};color:#fff;padding:16px 20px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:flex;align-items:center;justify-content:space-between;gap:12px;animation:slideIn 0.3s ease-out;min-width:300px;`;
      notification.innerHTML = `
        <span style="flex:1;">${message}</span>
        <button style="background:none;border:none;color:#fff;font-size:20px;cursor:pointer;padding:0;line-height:1;width:24px;height:24px;display:flex;align-items:center;justify-content:center;border-radius:4px;transition:background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='none'">×</button>
      `;

      const style = document.createElement('style');
      style.textContent = '@keyframes slideIn{from{transform:translateX(400px);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes slideOut{to{transform:translateX(400px);opacity:0}}';
      document.head.appendChild(style);

      const closeBtn = notification.querySelector('button');
      closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
      });

      container.appendChild(notification);

      setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
      }, 5000);
    },

    initPortfolio() {
      const filterBtns = document.querySelectorAll('.c-filter__btn');
      const portfolioItems = document.querySelectorAll('.c-portfolio-card');

      if (!filterBtns.length || !portfolioItems.length) return;

      filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const filter = btn.getAttribute('data-filter');

          filterBtns.forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');

          portfolioItems.forEach(item => {
            const category = item.getAttribute('data-category');
            
            if (filter === 'all' || category === filter) {
              item.style.display = 'flex';
              setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
              }, 10);
            } else {
              item.style.opacity = '0';
              item.style.transform = 'scale(0.9)';
              setTimeout(() => {
                item.style.display = 'none';
              }, 300);
            }
          });
        });
      });

      portfolioItems.forEach(item => {
        item.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
      });
    },

    initModal() {
      const modal = document.getElementById('project-modal');
      if (!modal) return;

      const modalBody = document.getElementById('modal-body');
      const closeBtn = modal.querySelector('.c-modal__close');
      const overlay = modal.querySelector('.c-modal__overlay');
      const openBtns = document.querySelectorAll('[data-project]');

      const openModal = (projectId) => {
        modal.classList.add('is-open');
        document.body.classList.add('u-no-scroll');
        this.state.modalOpen = true;
        
        modalBody.innerHTML = `<h2>Projekt: ${projectId}</h2><p>Detaillierte Informationen über das Projekt werden hier angezeigt.</p>`;
        
        setTimeout(() => closeBtn.focus(), 100);
      };

      const closeModal = () => {
        modal.classList.remove('is-open');
        document.body.classList.remove('u-no-scroll');
        this.state.modalOpen = false;
      };

      openBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const projectId = btn.getAttribute('data-project');
          openModal(projectId);
        });
      });

      closeBtn?.addEventListener('click', closeModal);
      overlay?.addEventListener('click', closeModal);

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.state.modalOpen) closeModal();
      });
    },

    initMicroInteractions() {
      const addRipple = (e, element) => {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `position:absolute;width:${size}px;height:${size}px;border-radius:50%;background:rgba(255,255,255,0.6);transform:scale(0);animation:ripple 0.6s ease-out;pointer-events:none;left:${x}px;top:${y}px;`;

        const style = document.createElement('style');
        style.textContent = '@keyframes ripple{to{transform:scale(4);opacity:0}}';
        document.head.appendChild(style);

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
      };

      document.querySelectorAll('.c-button, .c-nav__link, .c-filter__btn, .c-portfolio-card__btn').forEach(el => {
        el.addEventListener('mouseenter', function() {
          this.style.transition = 'all 0.3s ease-out';
          this.style.transform = 'translateY(-2px)';
        });

        el.addEventListener('mouseleave', function() {
          this.style.transform = 'translateY(0)';
        });

        el.addEventListener('click', function(e) {
          if (this.classList.contains('c-button') || this.classList.contains('c-filter__btn')) {
            addRipple(e, this);
          }
        });
      });

      document.querySelectorAll('.c-card, .c-service-card, .c-portfolio-card, .c-pricing-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
          this.style.transition = 'transform 0.3s ease-out, box-shadow 0.3s ease-out';
        });
      });
    },

    initScrollToTop() {
      let scrollBtn = document.getElementById('scroll-to-top');
      
      if (!scrollBtn) {
        scrollBtn = document.createElement('button');
        scrollBtn.id = 'scroll-to-top';
        scrollBtn.setAttribute('aria-label', 'Nach oben scrollen');
        scrollBtn.style.cssText = 'position:fixed;bottom:30px;right:30px;width:50px;height:50px;border-radius:50%;background:#1a1a1a;color:#fff;border:none;cursor:pointer;display:none;align-items:center;justify-content:center;font-size:24px;box-shadow:0 4px 12px rgba(0,0,0,0.2);z-index:999;transition:all 0.3s ease-out;';
        scrollBtn.innerHTML = '↑';
        document.body.appendChild(scrollBtn);

        scrollBtn.addEventListener('mouseenter', function() {
          this.style.background = '#b87333';
          this.style.transform = 'translateY(-4px)';
        });

        scrollBtn.addEventListener('mouseleave', function() {
          this.style.background = '#1a1a1a';
          this.style.transform = 'translateY(0)';
        });

        scrollBtn.addEventListener('click', () => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }

      window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
          scrollBtn.style.display = 'flex';
        } else {
          scrollBtn.style.display = 'none';
        }
      });
    },

    initPrivacyLinks() {
      document.querySelectorAll('a[href*="privacy"]').forEach(link => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (href.includes('#')) {
            e.preventDefault();
            const targetId = href.split('#')[1];
            window.location.href = 'privacy.html#' + targetId;
          }
        });
      });
    },

    initCountUp() {
      const counters = document.querySelectorAll('[data-count]');
      if (!counters.length) return;

      const animateCounter = (el) => {
        const target = parseInt(el.getAttribute('data-count'));
        const duration = 2000;
        const steps = 60;
        const increment = target / steps;
        let current = 0;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            el.textContent = target;
            clearInterval(timer);
          } else {
            el.textContent = Math.floor(current);
          }
        }, duration / steps);
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      counters.forEach(counter => observer.observe(counter));
      this.state.observers.push(observer);
    },

    destroy() {
      this.state.observers.forEach(observer => observer.disconnect());
      this.state.observers = [];
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => App.init());
  } else {
    App.init();
  }

  window.App = App;
})();
