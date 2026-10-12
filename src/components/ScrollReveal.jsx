import React, { useEffect, useRef, useState } from 'react';

/**
 * Robust ScrollReveal component using IntersectionObserver.
 * Triggers entrance animations (fade-in, slide up/left/right/scale) when elements enter viewport.
 * Unobserves after entering to prevent layout reflows and flicker.
 * Respects prefers-reduced-motion.
 */
export default function ScrollReveal({
  children,
  from = 'up',
  delay = 0,
  className = '',
  as: Tag = 'div',
  threshold = 0.1,
  once = false,
}) {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            setHasAnimated(true);
            if (once) {
              observer.unobserve(entry.target);
            }
          } else {
            if (!once) {
              setIsVisible(false);
            }
          }
        });
      },
      {
        threshold,
        rootMargin: '0px 0px -20px 0px',
      }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [threshold, once]);

  const getTransformClass = () => {
    if (isVisible) return 'opacity-100 translate-x-0 translate-y-0 scale-100';

    switch (from) {
      case 'left':
        return 'opacity-0 -translate-x-10 translate-y-0';
      case 'right':
        return 'opacity-0 translate-x-10 translate-y-0';
      case 'down':
        return 'opacity-0 translate-x-0 -translate-y-10';
      case 'scale':
        return 'opacity-0 scale-95 translate-y-0';
      case 'up':
      default:
        return 'opacity-0 translate-x-0 translate-y-10';
    }
  };

  // Instant disappear when not visible, 1000ms (1s) transition & delay when appearing/reappearing
  const transitionStyle = isVisible
    ? {
        transitionProperty: 'all',
        transitionDuration: '1000ms',
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${delay + 1000}ms`,
      }
    : {
        transitionProperty: 'none',
        transitionDuration: '0ms',
        transitionDelay: '0ms',
      };

  return (
    <Tag
      ref={elementRef}
      className={`will-change-[opacity,transform] ${getTransformClass()} ${className}`}
      style={transitionStyle}
      data-reveal={from}
    >
      {children}
    </Tag>
  );
}
