/**
 * Illustrative (synthetic) reflectance spectra, 0.4–3.6 µm, for a lunar mare, lunar highland and Ceres.
 * Shows where diagnostic absorption bands sit and how thermal emission inflates the signal beyond ~2.5 µm.
 * Shapes are hand-built from Gaussians: they are for teaching, not real data.
 */

type Band = { c: number; w: number; d: number }; // centre µm, width µm, fractional depth
type Body = { key: string; label: string; base: (l: number) => number; bands: Band[]; thermal: number; color: string };

const gauss = (l: number, b: Band) => 1 - b.d * Math.exp(-0.5 * ((l - b.c) / b.w) ** 2);

const bodies: Body[] = [
  {
    key: 'highland', label: 'Lunar highland', color: '#ecebe6', thermal: 0.05,
    base: (l) => 0.13 + 0.09 * (l - 0.4) - 0.006 * (l - 0.4) ** 2,
    bands: [{ c: 0.93, w: 0.09, d: 0.05 }, { c: 2.0, w: 0.25, d: 0.04 }, { c: 2.9, w: 0.15, d: 0.05 }],
  },
  {
    key: 'mare', label: 'Lunar mare', color: '#f2a541', thermal: 0.14,
    base: (l) => 0.065 + 0.05 * (l - 0.4) - 0.003 * (l - 0.4) ** 2,
    bands: [{ c: 0.97, w: 0.1, d: 0.12 }, { c: 2.05, w: 0.3, d: 0.09 }, { c: 2.85, w: 0.15, d: 0.04 }],
  },
  {
    key: 'ceres', label: 'Ceres', color: '#7fb6e8', thermal: 0.06,
    base: (l) => 0.032 + 0.004 * (l - 0.4),
    bands: [{ c: 2.72, w: 0.035, d: 0.25 }, { c: 3.06, w: 0.08, d: 0.14 }, { c: 3.4, w: 0.07, d: 0.08 }, { c: 3.95, w: 0.08, d: 0.06 }],
  },
];

const labels = [
  { c: 0.95, t: 'Fe²⁺ · pyroxene / olivine (1 µm)' },
  { c: 2.0, t: 'Pyroxene (2 µm)' },
  { c: 2.72, t: 'OH · phyllosilicates' },
  { c: 3.06, t: 'NH₄ · ammoniated clays' },
  { c: 3.4, t: 'Carbonates' },
];

const L0 = 0.4, L1 = 3.6;

function value(b: Body, l: number, thermalOn: boolean) {
  let r = b.base(l);
  for (const band of b.bands) r *= gauss(l, band);
  if (thermalOn) r += b.thermal * r * Math.max(0, Math.exp((l - 2.4) * 2.2) - 1) * 0.35;
  return r;
}

function wavelengthColor(nm: number) {
  // approx visible colour for 380–750 nm
  let r = 0, g = 0, b = 0;
  if (nm < 440) { r = -(nm - 440) / 60; b = 1; }
  else if (nm < 490) { g = (nm - 440) / 50; b = 1; }
  else if (nm < 510) { g = 1; b = -(nm - 510) / 20; }
  else if (nm < 580) { r = (nm - 510) / 70; g = 1; }
  else if (nm < 645) { r = 1; g = -(nm - 645) / 65; }
  else if (nm <= 750) { r = 1; }
  return `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
}

export function initSpectrum(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-spec-canvas]')!;
  const slider = root.querySelector<HTMLInputElement>('[data-spec-slider]')!;
  const thermal = root.querySelector<HTMLInputElement>('[data-spec-thermal]')!;
  const toggles = root.querySelectorAll<HTMLInputElement>('[data-spec-body]');
  const readout = root.querySelector<HTMLElement>('[data-spec-readout]')!;
  const swatch = root.querySelector<HTMLElement>('[data-spec-swatch]')!;

  const draw = () => {
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(devicePixelRatio, 2);
    const W = canvas.clientWidth, H = canvas.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(document.documentElement);
    const muted = css.getPropertyValue('--muted').trim();
    const line = css.getPropertyValue('--line-strong').trim();
    const pad = { l: 46, r: 14, t: 34, b: 34 };
    const x = (l: number) => pad.l + ((l - L0) / (L1 - L0)) * (W - pad.l - pad.r);
    const active = bodies.filter((b) => root.querySelector<HTMLInputElement>(`[data-spec-body="${b.key}"]`)?.checked);
    const tOn = thermal.checked;
    const fg = css.getPropertyValue('--text').trim();
    const col = (b: Body) => (b.key === 'highland' ? fg : b.color);
    const max = 0.34;
    const y = (r: number) => H - pad.b - (r / max) * (H - pad.t - pad.b);

    ctx.clearRect(0, 0, W, H);
    // visible band
    const grad = ctx.createLinearGradient(x(0.4), 0, x(0.75), 0);
    for (let nm = 400; nm <= 750; nm += 25) grad.addColorStop((nm - 400) / 350, wavelengthColor(nm));
    ctx.globalAlpha = 0.12; ctx.fillStyle = grad; ctx.fillRect(x(0.4), pad.t, x(0.75) - x(0.4), H - pad.t - pad.b); ctx.globalAlpha = 1;

    // thermal region
    ctx.fillStyle = 'rgba(242,165,65,0.06)';
    ctx.fillRect(x(2.5), pad.t, x(L1) - x(2.5), H - pad.t - pad.b);

    ctx.font = '10px "JetBrains Mono Variable", monospace';
    ctx.strokeStyle = line; ctx.fillStyle = muted; ctx.lineWidth = 1;
    for (let l = 0.5; l <= 3.5; l += 0.5) {
      ctx.beginPath(); ctx.moveTo(x(l), pad.t); ctx.lineTo(x(l), H - pad.b); ctx.stroke();
      ctx.fillText(l.toFixed(1), x(l) - 9, H - 12);
    }
    ctx.fillText('µm', W - pad.r - 16, H - 12);
    for (let r = 0; r <= 0.3; r += 0.1) ctx.fillText(r.toFixed(1), 8, y(r) + 3);
    ctx.fillText('Reflectance', 8, 16);
    ctx.fillText('VIS', x(0.5), pad.t + 14);
    ctx.fillText(tOn ? 'thermal emission ↑' : 'thermally corrected', x(2.55), pad.t + 14);

    // band markers
    ctx.setLineDash([3, 4]);
    labels.forEach((lb) => { ctx.beginPath(); ctx.moveTo(x(lb.c), pad.t + 22); ctx.lineTo(x(lb.c), H - pad.b); ctx.stroke(); });
    ctx.setLineDash([]);

    active.forEach((b) => {
      ctx.strokeStyle = col(b); ctx.lineWidth = 1.8; ctx.beginPath();
      for (let i = 0; i <= 600; i++) {
        const l = L0 + ((L1 - L0) * i) / 600;
        const v = value(b, l, tOn);
        i ? ctx.lineTo(x(l), y(v)) : ctx.moveTo(x(l), y(v));
      }
      ctx.stroke();
    });

    // cursor
    const lc = parseFloat(slider.value);
    ctx.strokeStyle = css.getPropertyValue('--text').trim(); ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x(lc), pad.t); ctx.lineTo(x(lc), H - pad.b); ctx.stroke();
    active.forEach((b) => {
      ctx.fillStyle = col(b); ctx.beginPath(); ctx.arc(x(lc), y(value(b, lc, tOn)), 4, 0, Math.PI * 2); ctx.fill();
    });

    const nm = Math.round(lc * 1000);
    const near = labels.find((lb) => Math.abs(lb.c - lc) < 0.08);
    const vals = active.map((b) => `${b.label}: ${value(b, lc, tOn).toFixed(3)}`).join('  ·  ');
    readout.textContent = `λ = ${nm} nm${near ? '  ·  ' + near.t : ''}${vals ? '\n' + vals : ''}`;
    swatch.style.background = nm <= 750 ? wavelengthColor(nm) : 'repeating-linear-gradient(45deg, #3a2a1a 0 4px, #1a1a1a 4px 8px)';
    swatch.title = nm <= 750 ? 'Visible light' : 'Infrared (invisible to the eye)';
  };

  [slider, thermal, ...toggles].forEach((el) => el.addEventListener('input', draw));
  const ro = new ResizeObserver(draw);
  ro.observe(canvas);
  window.addEventListener('themechange', draw);
  return () => { ro.disconnect(); window.removeEventListener('themechange', draw); };
}
