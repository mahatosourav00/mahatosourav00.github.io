import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import SplitType from 'split-type';

gsap.registerPlugin(ScrollTrigger);

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;
let smoothOff = false; // set once a slow device is detected, for the rest of the session
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
  if (reducedMotion() || lenis || smoothOff) return;
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  tick = (t: number) => lenis?.raf(t * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
}

// On devices that cannot keep up (software WebGL etc.), drop the JS smooth-scroll layer: native scrolling stays smooth
export function disableSmoothScroll() {
  smoothOff = true;
  if (!lenis) return;
  if (tick) gsap.ticker.remove(tick);
  tick = null;
  lenis.destroy();
  lenis = null;
  ScrollTrigger.refresh();
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
    mm.add('(min-width: 700px)', () => {
      gsap.utils.toArray<HTMLElement>('[data-hscroll]').forEach((section) => {
        const track = section.querySelector<HTMLElement>('[data-hscroll-track]');
        if (!track) return;
        const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
        // Re-measure whenever the strip changes size (fonts, images, late layout), so the pin never uses a stale width
        if (typeof ResizeObserver !== 'undefined') {
          let last = track.scrollWidth;
          const ro = new ResizeObserver(() => {
            if (track.scrollWidth !== last) { last = track.scrollWidth; ScrollTrigger.refresh(); }
          });
          ro.observe(track);
          observers.push(ro);
        }
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

let observers: ResizeObserver[] = [];

export function initMotion() {
  document.documentElement.classList.add('js');
  initLenis();
  lenis?.scrollTo(0, { immediate: true });
  lastWidth = window.innerWidth;
  window.removeEventListener('portfolio:slow', disableSmoothScroll);
  window.addEventListener('portfolio:slow', disableSmoothScroll, { once: true });
  window.removeEventListener('resize', onResize);
  window.addEventListener('resize', onResize);
  // Wait for fonts so line splits are measured correctly
  const wanted = Promise.all([
    document.fonts.load('400 1em "Instrument Serif"'),
    document.fonts.load('italic 400 1em "Instrument Serif"'),
    document.fonts.load('1em "Inter Tight Variable"'),
  ]);
  Promise.race([wanted, new Promise((r) => setTimeout(r, 2500))])
    .catch(() => {})
    .then(() => document.fonts.ready)
    .then(() => {
      document.documentElement.classList.add('fonts-ready');
      initReveals();
      ScrollTrigger.refresh();
      // Layout can still shift after the first paint (images, late fonts): measure once more when everything has loaded
      if (document.readyState !== 'complete') window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
    });
}

export function destroyMotion() {
  observers.forEach((o) => o.disconnect());
  observers = [];
  ctx?.revert();
  ctx = null;
  splits.forEach((s) => s.revert());
  splits = [];
  pending.clear();
  ScrollTrigger.getAll().forEach((t) => t.kill());
}

export { gsap, ScrollTrigger };
