import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export { gsap, ScrollTrigger, useGSAP };

export function isMotionReduced(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('motion') === 'reduced';
}

/**
 * Staggers cards/boxes inside a view container cleanly on mount or tab switch.
 */
export function animateStaggerBoxes(
  container: Element | null | undefined,
  selector = '.shift-anim-card',
  options?: { y?: number; duration?: number; stagger?: number; delay?: number },
): void {
  if (!container || isMotionReduced()) return;
  const targets = Array.from(container.querySelectorAll(selector));
  if (!targets.length) return;

  gsap.fromTo(
    targets,
    {
      y: options?.y ?? 16,
      opacity: 0,
      scale: 0.98,
    },
    {
      y: 0,
      opacity: 1,
      scale: 1,
      duration: options?.duration ?? 0.44,
      stagger: options?.stagger ?? 0.055,
      delay: options?.delay ?? 0.03,
      ease: 'power3.out',
      clearProps: 'transform,opacity',
      overwrite: 'auto',
    },
  );
}
