import { useEffect, useRef, useState } from 'react';

/**
 * Triggers visibility when the element enters the viewport.
 * Once visible, stays visible (fire-once behaviour).
 *
 * @param {IntersectionObserverInit} [options]
 * @returns {[React.RefObject, boolean]}
 */
export function useScrollReveal(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
        ...options,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
}
