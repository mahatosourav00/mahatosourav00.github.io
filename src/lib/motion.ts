import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;
let ctx: gsap.Context | null = null;
let splits: SplitType[] = [];
let tick: ((t: number) => void) | null = null;
const pending = new Map<SplitType, gsap.core.Tween>();
let lastWidth = 0;

// If the viewport width changes before a split heading is revealed, its measured
// lines are stale: drop the animation and show the text normally.
function onResize() {
  if (Math.abs(window.innerWidth - lastWidth) < 40) return;
  lastWidth = window.innerWidth;
  pending.forEach((tween, split) => {
    tween.scrollTrigger?.kill();
    tween.kill();
    split.revert();
  });
  pending.clear();
}

export function getLenis() {
  return lenis;
}

function initLenis() {
  if (reducedMotion() || lenis) return;
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  tick = (t: number) => lenis?.raf(t * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
}

function splitLines(el: HTMLElement) {
  const s = new SplitType(el, { types: 'lines', lineClass: 'split-inner' });
  s.lines?.forEach((line) => {
    const wrap = document.createElement('span');
    wrap.className = 'split-line';
    line.parentNode?.insertBefore(wrap, line);
    wrap.appendChild(line);
    (line as HTMLElement).style.display = 'block';
  });
  splits.push(s);
  return s.lines ?? [];
}

function initReveals() {
  const reduce = reducedMotion();
  ctx = gsap.context(() => {
    // Line-by-line text reveal
    document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
      if (reduce) return;
      const lines = splitLines(el);
      const split = splits[splits.length - 1];
      const delay = parseFloat(el.dataset.delay || '0');
      const immediate = el.hasAttribute('data-immediate');
      const tween = gsap.from(lines, {
        yPercent: 110,
        duration: 1.2,
        ease: 'expo.out',
        stagger: 0.08,
        delay,
        scrollTrigger: immediate ? undefined : { trigger: el, start: 'top 88%' },
        // Restore natural text flow once revealed so later resizes re-wrap correctly
        onComplete: () => {
          split.revert();
          pending.delete(split);
        },
      });
      pending.set(split, tween);
    });

    // Fade-up reveal
    gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
      if (reduce) return gsap.set(el, { opacity: 1, y: 0 });
      gsap.to(el, {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: 'expo.out',
        delay: parseFloat(el.dataset.delay || '0'),
        scrollTrigger: el.hasAttribute('data-immediate') ? undefined : { trigger: el, start: 'top 90%' },
      });
    });

    // Image clip reveal
    gsap.utils.toArray<HTMLElement>('[data-reveal-img]').forEach((el) => {
      if (reduce) return gsap.set(el, { clipPath: 'inset(0% 0 0 0)' });
      gsap.to(el, {
        clipPath: 'inset(0% 0 0 0)',
        duration: 1.4,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: el, start: 'top 88%' },
      });
    });

    if (reduce) return;

    // Parallax
    gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
      const amt = parseFloat(el.dataset.parallax || '0.15');
      gsap.fromTo(
        el,
        { yPercent: -amt * 50 },
        {
          yPercent: amt * 50,
          ease: 'none',
          scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );
    });

    // Horizontal pinned scroll (desktop only)
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px)', () => {
      gsap.utils.toArray<HTMLElement>('[data-hscroll]').forEach((section) => {
        const track = section.querySelector<HTMLElement>('[data-hscroll-track]');
        if (!track) return;
        const dist = () => track.scrollWidth - window.innerWidth;
        gsap.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => '+=' + dist(),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      });
    });

    // Draw-on-scroll lines (timeline)
    gsap.utils.toArray<HTMLElement>('[data-draw]').forEach((el) => {
      gsap.fromTo(
        el,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          transformOrigin: 'top',
          scrollTrigger: { trigger: el.parentElement || el, start: 'top 70%', end: 'bottom 70%', scrub: true },
        },
      );
    });
  });
}

export function initMotion() {
  document.documentElement.classList.add('js');
  initLenis();
  lenis?.scrollTo(0, { immediate: true });
  lastWidth = window.innerWidth;
  window.removeEventListener('resize', onResize);
  window.addEventListener('resize', onResize);
  // Wait for fonts so line splits are measured correctly
  document.fonts.ready.then(() => {
    initReveals();
    ScrollTrigger.refresh();
  });
}

export function destroyMotion() {
  ctx?.revert();
  ctx = null;
  splits.forEach((s) => s.revert());
  splits = [];
  pending.clear();
  ScrollTrigger.getAll().forEach((t) => t.kill());
}

export { gsap, ScrollTrigger };
