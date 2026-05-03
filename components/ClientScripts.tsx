'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ClientScripts() {
  const pathname = usePathname();

  useEffect(() => {
    // Port of app.js
    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const row = target.closest('.click-row') as HTMLElement;
      if (row && row.dataset.href) window.location.href = row.dataset.href;
    };
    document.addEventListener('click', clickHandler);

    // Give the DOM a tiny bit of time to paint the new route's elements
    const initAnimations = setTimeout(() => {
      document.querySelectorAll('[data-due]').forEach(el => {
        const dueStr = (el as HTMLElement).dataset.due;
        if (!dueStr) return;
        const due = new Date(dueStr + 'T23:59:59');
        if (new Date() > due && !el.classList.contains('late')) {
          el.textContent += ' · Late completion = 0 pts';
          el.classList.add('late');
        }
      });

      const observerOptions = { root: null, rootMargin: "0px", threshold: 0.1 };
      let staggerDelay = 0;
      let staggerTimeout: any;

      const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (entry.target.classList.contains('stagger-in')) {
              (entry.target as HTMLElement).style.transitionDelay = `${staggerDelay}ms`;
              staggerDelay += 120;
              clearTimeout(staggerTimeout);
              staggerTimeout = setTimeout(() => { staggerDelay = 0; }, 300);
            }
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      document.querySelectorAll('.reveal-up, .stagger-in').forEach(el => observer.observe(el));

      const parallaxImages = document.querySelectorAll('.parallax-img img');
      const updateParallax = () => {
        if(parallaxImages.length > 0) {
          parallaxImages.forEach(img => {
            const rect = img.parentElement!.getBoundingClientRect();
            const windowCenter = window.innerHeight / 2;
            const elementCenter = rect.top + rect.height / 2;
            const offset = elementCenter - windowCenter;
            const speed = 0.15;
            (img as HTMLElement).style.transform = `translateY(${offset * speed}px) scale(1.15)`;
          });
        }
      };
      
      if (parallaxImages.length > 0) {
        window.addEventListener('scroll', updateParallax);
        updateParallax();
      }

      // Cleanup for this specific route's observers
      return () => {
        observer.disconnect();
        window.removeEventListener('scroll', updateParallax);
      };
    }, 50);

    return () => {
      clearTimeout(initAnimations);
      document.removeEventListener('click', clickHandler);
    };
  }, [pathname]);

  return null;
}
