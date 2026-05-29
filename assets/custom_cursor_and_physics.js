/**
 * Vanguard Portfolio Interactions Engine
 * Features: Fluid dual-cursor follower, magnetic CTA physics, parallax sections, text reveal observers, interactive text physics.
 * Architecture: Optimized requestAnimationFrame loops, GPU-accelerated transforms, zero layout thrashing.
 */

const initInteractions = () => {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ═══════════════════════════════════════════════════════════
  // 1. FLUID DUAL-CURSOR SYSTEM
  // ═══════════════════════════════════════════════════════════
  const dot = document.getElementById('customCursorDot');
  const ring = document.getElementById('customCursorRing');

  let mouse = { x: 0, y: 0 };
  let ringPos = { x: 0, y: 0 };
  let isMoving = false;

  if (isReducedMotion || !dot || !ring) {
    if (dot) dot.style.display = 'none';
    if (ring) ring.style.display = 'none';
    document.documentElement.classList.add('use-default-cursor');
  } else {
    document.documentElement.classList.add('use-custom-cursor');

    window.addEventListener('pointermove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      isMoving = true;

      // Position inner dot instantly
      dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0)`;
    });

    // Spring interpolation loop for cursor ring
    const updateCursorRing = () => {
      if (isMoving) {
        // Linear interpolation (lerp) as spring approximation
        ringPos.x += (mouse.x - ringPos.x) * 0.15;
        ringPos.y += (mouse.y - ringPos.y) * 0.15;
        ring.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      }
      requestAnimationFrame(updateCursorRing);
    };
    updateCursorRing();

    // Hover Morphing States
    const interactiveSelectors = 'a, button, .control-btn, .project-card, .logo, .mobile-link, .char-span';
    
    document.body.addEventListener('pointerover', (e) => {
      const target = e.target.closest(interactiveSelectors);
      if (target) {
        ring.classList.add('hovered');
        dot.classList.add('hovered');
      }
    });

    document.body.addEventListener('pointerout', (e) => {
      const target = e.target.closest(interactiveSelectors);
      if (target) {
        ring.classList.remove('hovered');
        dot.classList.remove('hovered');
      }
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 2. MAGNETIC BUTTON PHYSICS
  // ═══════════════════════════════════════════════════════════
  if (!isReducedMotion) {
    const magneticElements = document.querySelectorAll('.btn-primary, .control-btn, .hamburger, .logo');

    magneticElements.forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const rect = el.getBoundingClientRect();
        // Calculate center of element
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        // Distance from pointer to center
        const deltaX = e.clientX - centerX;
        const deltaY = e.clientY - centerY;

        // Pull strength (factor of proximity)
        const pull = 0.35; 
        const transX = deltaX * pull;
        const transY = deltaY * pull;

        el.style.transform = `translate3d(${transX}px, ${transY}px, 0)`;
        
        // Tilt inner icon if button-in-button
        const iconWrap = el.querySelector('.btn-icon-wrap, .control-icon');
        if (iconWrap) {
          iconWrap.style.transform = `translate3d(${transX * 0.4}px, ${transY * 0.4}px, 0) scale(1.05)`;
        }
      });

      el.addEventListener('pointerleave', () => {
        // Fluid return transition
        el.style.transition = 'transform 0.6s cubic-bezier(0.32, 0.72, 0, 1)';
        el.style.transform = 'translate3d(0, 0, 0)';

        const iconWrap = el.querySelector('.btn-icon-wrap, .control-icon');
        if (iconWrap) {
          iconWrap.style.transition = 'transform 0.6s cubic-bezier(0.32, 0.72, 0, 1)';
          iconWrap.style.transform = 'translate3d(0, 0, 0)';
        }

        // Clean up transition inline style after animation finished
        setTimeout(() => {
          el.style.transition = '';
          if (iconWrap) iconWrap.style.transition = '';
        }, 600);
      });
    });
  }

  // ═══════════════════════════════════════════════════════════
  // 3. BACKGROUND PARALLAX SCROLLING
  // ═══════════════════════════════════════════════════════════
  const scrollContainer = document.getElementById('scrollContainer');
  const parallaxSections = document.querySelectorAll('.page');

  if (!isReducedMotion && scrollContainer) {
    scrollContainer.addEventListener('scroll', () => {
      const scrollY = scrollContainer.scrollTop;
      const viewportHeight = window.innerHeight;

      parallaxSections.forEach((section) => {
        const bgImg = section.querySelector('.bg-img');
        const bgVideo = section.querySelector('.bg-video');
        const target = bgImg || bgVideo;

        if (target) {
          const sectionTop = section.offsetTop;
          const sectionHeight = section.offsetHeight;

          // Check if section is currently active/visible in scroll viewport
          if (scrollY + viewportHeight > sectionTop && scrollY < sectionTop + sectionHeight) {
            const relativeScroll = scrollY - sectionTop;
            // Translate background layers at 8% scroll rate
            const translateY = relativeScroll * 0.08;
            target.style.transform = `translate3d(0, ${translateY}px, 0) scale(1.03)`;
          }
        }
      });
    }, { passive: true });
  }

  // ═══════════════════════════════════════════════════════════
  // 4. TEXT MASK REVEALS
  // ═══════════════════════════════════════════════════════════
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // If container is still loading, skip
        if (scrollContainer && scrollContainer.classList.contains('loading')) {
          return;
        }

        const innerElements = entry.target.querySelectorAll('.reveal-inner');
        innerElements.forEach((inner) => {
          const delay = parseInt(inner.dataset.delay || 0);
          setTimeout(() => {
            inner.classList.add('revealed');
          }, delay);
        });
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.content').forEach((contentSection) => {
    // If section contains reveal-inner items, observe the section container
    if (contentSection.querySelector('.reveal-inner')) {
      revealObserver.observe(contentSection);
    }
  });

  // ═══════════════════════════════════════════════════════════
  // 5. INTERACTIVE NAME PHYSICS (VARUN SARAVANAN INTERACTIVE WORDS)
  // ═══════════════════════════════════════════════════════════
  const name1 = document.getElementById('heroName1');
  const name2 = document.getElementById('heroName2');
  const heroHeading = document.getElementById('heroHeading');

  if (heroHeading && name1 && name2 && !isReducedMotion) {
    const chars = [];
    let lastInteractionTime = Date.now();
    let isDraggingName = false;

    // Helper to split text of lines into interactive span chars
    const splitText = (el) => {
      const text = el.innerText.trim();
      el.innerHTML = '';
      
      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const span = document.createElement('span');
        span.className = 'char-span';
        span.innerText = char;
        span.dataset.index = i;
        
        el.appendChild(span);
        
        // Setup initial physics modeling
        const charObj = {
          element: span,
          dispX: 0,
          dispY: 0,
          vx: 0,
          vy: 0,
          angle: 0,
          rv: 0,
          state: 'idle', // idle, flying
          width: 0,
          height: 0
        };
        chars.push(charObj);
      }
    };

    splitText(name1);
    splitText(name2);

    // Initial positioning measurements
    const measureChars = () => {
      chars.forEach((c) => {
        const rect = c.element.getBoundingClientRect();
        c.width = rect.width;
        c.height = rect.height;
      });
    };
    
    setTimeout(measureChars, 500);
    window.addEventListener('resize', measureChars);

    // Pointer events on heading wrapper
    heroHeading.addEventListener('pointerdown', (e) => {
      isDraggingName = true;
      lastInteractionTime = Date.now();
      heroHeading.setPointerCapture(e.pointerId);
    });

    window.addEventListener('pointermove', (e) => {
      const pointerX = e.clientX;
      const pointerY = e.clientY;
      lastInteractionTime = Date.now();

      chars.forEach((c) => {
        const rect = c.element.getBoundingClientRect();
        const charCenterX = rect.left + rect.width / 2;
        const charCenterY = rect.top + rect.height / 2;

        const dx = charCenterX - pointerX;
        const dy = charCenterY - pointerY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (isDraggingName) {
          // Drag disperse: letters scatter and fly away on proximity
          if (dist < 70) {
            c.state = 'flying';
            const pushAngle = Math.random() * Math.PI * 2;
            const force = (1 - dist / 70) * 38;
            
            c.vx = Math.cos(pushAngle) * force + (Math.random() - 0.5) * 6;
            c.vy = Math.sin(pushAngle) * force - 8; // Pop upwards bias
            c.rv = (Math.random() - 0.5) * 30; // Rotation spin velocity
          }
        } else if (c.state === 'idle') {
          // Normal hover water drop refraction + bubble zoom effect
          const hoverRadius = 90;
          if (dist < hoverRadius) {
            const ratio = 1 - dist / hoverRadius;
            
            // Refraction vector offset
            const pushDist = ratio * 18;
            const angle = Math.atan2(charCenterY - pointerY, charCenterX - pointerX);
            const moveX = Math.cos(angle) * pushDist;
            const moveY = Math.sin(angle) * pushDist;

            // Zoom ratio
            const scale = 1 + ratio * 0.4;
            
            // Organic tilt
            const tilt = ratio * (parseInt(c.element.dataset.index) % 2 === 0 ? 6 : -6);

            c.element.style.transform = `translate3d(${moveX}px, ${moveY}px, 0) scale(${scale}) rotate(${tilt}deg)`;
            c.element.style.color = '#ffffff';
            c.element.style.textShadow = `0 4px 15px rgba(255, 255, 255, ${ratio * 0.45})`;
          } else {
            c.element.style.transform = '';
            c.element.style.color = '';
            c.element.style.textShadow = '';
          }
        }
      });
    });

    window.addEventListener('pointerup', (e) => {
      if (isDraggingName) {
        isDraggingName = false;
        try {
          heroHeading.releasePointerCapture(e.pointerId);
        } catch (err) {}
      }
    });

    // Physics ticks loop
    const updateTextPhysics = () => {
      const timeSinceActive = Date.now() - lastInteractionTime;
      const isReturning = timeSinceActive > 1800; // float back home after 1.8s idle

      chars.forEach((c) => {
        if (c.state === 'flying') {
          if (isReturning) {
            // Dampen coordinates back home
            c.dispX += (0 - c.dispX) * 0.08;
            c.dispY += (0 - c.dispY) * 0.08;
            c.angle += (0 - c.angle) * 0.08;
            
            c.vx = 0;
            c.vy = 0;
            c.rv = 0;

            if (Math.abs(c.dispX) < 0.1 && Math.abs(c.dispY) < 0.1 && Math.abs(c.angle) < 0.1) {
              c.dispX = 0;
              c.dispY = 0;
              c.angle = 0;
              c.state = 'idle';
              c.element.style.transform = '';
              c.element.style.color = '';
            } else {
              c.element.style.transform = `translate3d(${c.dispX}px, ${c.dispY}px, 0) rotate(${c.angle}deg) scale(1)`;
            }
          } else {
            // Model displacement + inertia
            c.dispX += c.vx;
            c.dispY += c.vy;
            c.angle += c.rv;

            c.vx *= 0.95;
            c.vy *= 0.95;
            c.rv *= 0.95;

            // Gravity simulation
            c.vy += 0.25;

            c.element.style.transform = `translate3d(${c.dispX}px, ${c.dispY}px, 0) rotate(${c.angle}deg) scale(1.15)`;
            c.element.style.color = '#ffffff';
          }
        }
      });
      requestAnimationFrame(updateTextPhysics);
    };

    updateTextPhysics();
  }
};

// Safe initialization gate
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initInteractions);
} else {
  initInteractions();
}
