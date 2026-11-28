import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
type SplitType = { lines: HTMLElement[]; revert: () => void };

gsap.registerPlugin(ScrollTrigger);

export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let lenis: Lenis | null = null;
let smoothOff = false; // set once a slow device is detected, for the rest of the session
let ctx: gsap.Context | null = null;
let splits: SplitType[] = [];
let tick: ((t: number) => void) | null = null;
const pending = new Map<SplitType, gsap.core.Tween>();
let lastWidth = 0;

// If the viewport width changes, the measured lines are stale: drop any running animation and
// restore natural text flow for every split text, so it re-wraps for the new width.
function onResize() {
  if (Math.abs(window.innerWidth - lastWidth) < 40) return;
  lastWidth = window.innerWidth;
  pending.forEach((tween, split) => {
    tween.scrollTrigger?.kill();
    tween.kill();
    split.revert();
  });
  pending.clear();
  splits.forEach((s) => s.revert());
  splits = [];
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

// Split an element into its visual lines. Line breaks are measured on the element's real, natural text flow
// (SplitType measured words as inline-blocks, which wrapped differently and pushed yellow italic phrases to a new line),
// then each line is cut out with a Range so nested elements (<em>, .accent, links) stay intact and inline.
function splitLines(el: HTMLElement): HTMLElement[] {
  const original = el.innerHTML;
  const range = document.createRange();
  const words: { node: Text; start: number; end: number; top: number }[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode() as Text | null; n; n = walker.nextNode() as Text | null) {
    for (const m of n.data.matchAll(/\S+/g)) {
      range.setStart(n, m.index!);
      range.setEnd(n, m.index! + m[0].length);
      const rects = range.getClientRects();
      if (rects.length) words.push({ node: n, start: m.index!, end: m.index! + m[0].length, top: rects[0].top });
    }
  }
  if (!words.length) return [];
  const groups: (typeof words)[] = [];
  for (const w of words) {
    const g = groups[groups.length - 1];
    if (g && Math.abs(g[0].top - w.top) < 4) g.push(w);
    else groups.push([w]);
  }
  const lines = groups.map((g) => {
    range.setStart(g[0].node, g[0].start);
    const last = g[g.length - 1];
    range.setEnd(last.node, last.end);
    const inner = document.createElement('div');
    inner.className = 'split-inner';
    inner.style.display = 'block';
    inner.style.whiteSpace = 'nowrap';
    let content: Node = range.cloneContents();
    // cloneContents drops ancestors shared by the whole range: when a line sits entirely inside <em>/.accent,
    // re-wrap it in shallow clones of those ancestors so the styling carries over to every line.
    for (let p: Node | null = range.commonAncestorContainer; p && p !== el; p = p.parentNode) {
      if (p.nodeType !== Node.ELEMENT_NODE) continue;
      const clone = (p as Element).cloneNode(false);
      clone.appendChild(content);
      content = clone;
    }
    inner.appendChild(content);
    const wrap = document.createElement('span');
    wrap.className = 'split-line';
    wrap.appendChild(inner);
    return { wrap, inner };
  });
  el.replaceChildren(...lines.map((l) => l.wrap));
  splits.push({ lines: lines.map((l) => l.inner), revert: () => { el.innerHTML = original; } });
  return lines.map((l) => l.inner);
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
        // Keep the split lines after the reveal. Reverting to natural flow here made some lines re-wrap
        // (a yellow italic phrase jumped up a line) because split and natural layouts can wrap differently.
        // A width change reverts them instead (see onResize).
        onComplete: () => {
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

    // Image clip reveal: every photo tile wipes in from the bottom up as it scrolls into view.
    // Tiles inside the pinned horizontal strip are handled below, timed to when they slide in from the side.
    const pinnedStrip = window.matchMedia('(min-width: 700px)').matches;
    gsap.utils.toArray<HTMLElement>('[data-reveal-img]').forEach((el) => {
      if (reduce) return gsap.set(el, { clipPath: 'inset(0% 0 0 0)' });
      if (pinnedStrip && el.closest('[data-hscroll-track]')) return;
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
        // A short hold before and after the slide: the strip sits still while you read the intro, and the
        // last card stays on screen for a moment before the page scrolls on, instead of being flicked past.
        const hold = () => window.innerHeight * 0.35;
        const pin = ScrollTrigger.create({
          trigger: section,
          start: 'top top',
          end: () => '+=' + (dist() + 2 * hold()),
          pin: true,
          invalidateOnRefresh: true,
        });
        // The slide itself: linear (needed for the card reveals below), with scrub smoothing the motion.
        const slide = gsap.to(track, {
          x: () => -dist(),
          ease: 'none',
          scrollTrigger: {
            // Measured from the pin's own start: a position relative to the pinned section itself gets pushed past the pin.
            start: () => pin.start + hold(),
            end: () => pin.start + hold() + dist(),
            scrub: 1.2,
            invalidateOnRefresh: true,
          },
        });
        // Same bottom-up wipe as everywhere else. Cards already on screen when the strip arrives wipe in as the
        // section scrolls up into view; the rest wipe in as soon as their edge slides in from the right.
        track.querySelectorAll<HTMLElement>('[data-reveal-img]').forEach((el) => {
          const onScreen = el.getBoundingClientRect().left - (gsap.getProperty(track, 'x') as number) < window.innerWidth;
          gsap.to(el, {
            clipPath: 'inset(0% 0 0 0)',
            duration: 1.1,
            ease: 'expo.out',
            scrollTrigger: onScreen
              ? { trigger: el, start: 'top 85%' }
              : { trigger: el, containerAnimation: slide, start: 'left 100%' },
          });
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
