/**
 * Simplified Hapke bidirectional reflectance, rendered on a sphere (WebGL) and as a phase curve (2D canvas).
 * r = w/4π · μ0/(μ0+μ) · [(1+B(g))·P(g) + H(μ0)H(μ) − 1] · K(θ̄, g)
 * H: Chandrasekhar approximation; P: one-term Henyey-Greenstein; B: shadow-hiding opposition effect;
 * K: Hapke's approximate shadowing term for macroscopic roughness. Good for intuition, not for fitting data.
 */

export interface HapkeParams {
  w: number; // single-scattering albedo
  b: number; // HG asymmetry (>0 back-scattering)
  B0: number; // opposition surge amplitude
  h: number; // opposition surge width
  theta: number; // roughness, degrees
  g: number; // phase angle, degrees
  az: number; // light azimuth, radians
  relief: number; // DEM vertical exaggeration multiplier
  lon: number; // central longitude of the visible disc, degrees
  lat: number; // macro patch latitude, degrees
  plon: number; // macro patch longitude offset from the centre, degrees
  zoom: number; // macro patch width, degrees of arc
  detail: number; // synthetic sub-DEM detail amplitude
}

type BodyKey = 'moon' | 'ceres';
// Illustrative presets (not fitted values). reliefBase converts the 8-bit DEM into a visible slope.
const BODIES: Record<BodyKey, { alb: string; dem: string; reliefBase: number; exposure: number; preset: Partial<HapkeParams> }> = {
  moon: { alb: 'moon-2k.jpg', dem: 'moon-dem-2k.jpg', reliefBase: 8, exposure: 3.4, preset: { w: 0.32, b: 0.25, B0: 1.0, h: 0.07, theta: 20 } },
  ceres: { alb: 'ceres-2k.jpg', dem: 'ceres-dem-2k.jpg', reliefBase: 16, exposure: 8, preset: { w: 0.12, b: 0.35, B0: 1.1, h: 0.05, theta: 28 } },
};
const Z_PER_UNIT = 0.00614 * 0.3; // unit-sphere height per (relief * DEM value): matches the hero-globe slope convention
const SHADOW_STEPS = 12;
const SHADOW_STEP = 0.0075; // radians

const D2R = Math.PI / 180;

export function hapkeIF(p: HapkeParams, mu0: number, mu: number, gRad: number) {
  if (mu0 <= 0 || mu <= 0) return 0;
  const gamma = Math.sqrt(1 - p.w);
  const H = (x: number) => (1 + 2 * x) / (1 + 2 * gamma * x);
  const cg = Math.cos(gRad);
  const P = (1 - p.b * p.b) / Math.pow(1 - 2 * p.b * cg + p.b * p.b, 1.5);
  const t = Math.tan(gRad / 2);
  const B = p.B0 / (1 + t / Math.max(p.h, 1e-3));
  const th = p.theta * D2R;
  const tt = Math.tan(th);
  const K = Math.exp(-0.32 * th * Math.sqrt(Math.max(tt * t, 0)) - 0.52 * th * tt * t);
  const r = (p.w / (4 * Math.PI)) * (mu0 / (mu0 + mu)) * ((1 + B) * P + H(mu0) * H(mu) - 1) * K;
  return Math.PI * r; // I/F
}

const vert = `attribute vec2 a; varying vec2 v; void main(){ v=a; gl_Position=vec4(a,0.,1.); }`;
const frag = `
precision highp float;
varying vec2 v;
uniform sampler2D uAlb; uniform sampler2D uDem;
uniform vec3 L; uniform float g; uniform float w; uniform float b; uniform float B0; uniform float h; uniform float th;
uniform float exposure; uniform vec3 bg; uniform float aspect;
uniform float lon; uniform float relief; uniform float albMean; uniform float albAmt;
uniform float demOn; uniform float shadowOn; uniform float texOn;
const float PI = 3.14159265;
vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c*p.x + s*p.z, p.y, -s*p.x + c*p.z); }
vec2 eqUV(vec3 p) { return vec2(atan(p.x, p.z) / (2.0*PI) + 0.5, asin(clamp(p.y, -1.0, 1.0)) / PI + 0.5); }
float H(vec3 q) { return texture2D(uDem, eqUV(q)).r; }
void main(){
  vec2 p = v; p.x *= aspect;
  float r2 = dot(p,p) / 0.72;
  if (r2 > 1.0) { gl_FragColor = vec4(bg, 0.0); return; }
  vec3 n = vec3(p / sqrt(0.72), sqrt(1.0 - r2));
  vec3 po = rotY(n, lon);
  vec3 nl = n;
  float shade = 1.0;
  if (demOn > 0.5 && texOn > 0.5) {
    float texel = 1.0 / 2048.0;
    vec2 uv = eqUV(po);
    float hl = texture2D(uDem, uv - vec2(texel, 0.0)).r;
    float hr = texture2D(uDem, uv + vec2(texel, 0.0)).r;
    float hd = texture2D(uDem, uv - vec2(0.0, texel*2.0)).r;
    float hu = texture2D(uDem, uv + vec2(0.0, texel*2.0)).r;
    vec3 east = normalize(vec3(po.z, 0.0, -po.x) + vec3(1e-5, 0.0, 0.0));
    vec3 north = normalize(vec3(0.0, 1.0, 0.0) - po * po.y);
    float cosLat = max(sqrt(1.0 - po.y*po.y), 0.15);
    vec3 no = normalize(po - relief * ((hr - hl) / cosLat * east + (hu - hd) * north));
    nl = rotY(no, -lon);
    if (shadowOn > 0.5) {
      vec3 Lo = rotY(L, lon);
      float sinE = dot(Lo, po);
      vec3 sv = Lo - po * sinE;
      float sl = length(sv);
      if (sl > 1e-4) {
        vec3 sd = sv / sl;
        float tanE = sinE / sl;
        float K = relief * ${Z_PER_UNIT};
        float Zp = H(po) * K;
        for (int i = 1; i <= ${SHADOW_STEPS}; i++) {
          float d = float(i) * ${SHADOW_STEP};
          vec3 q = normalize(po + sd * d);
          if (H(q) * K > Zp + d * tanE + 0.0004) { shade = 0.0; }
        }
      }
    }
  }
  float wl = w;
  if (texOn > 0.5) {
    vec3 c3 = texture2D(uAlb, eqUV(po)).rgb;
    float lum = dot(c3, vec3(0.299, 0.587, 0.114));
    wl = clamp(w * mix(1.0, lum / albMean, albAmt), 0.01, 0.98);
  }
  float mu0 = dot(nl, L); float mu = max(nl.z, 0.04 * n.z);
  float I = 0.0;
  if (mu0 > 0.0 && mu > 0.0 && shade > 0.0) {
    float gamma = sqrt(1.0 - wl);
    float H0 = (1.0 + 2.0*mu0)/(1.0 + 2.0*gamma*mu0);
    float H1 = (1.0 + 2.0*mu)/(1.0 + 2.0*gamma*mu);
    float cg = cos(g);
    float P = (1.0 - b*b) / pow(1.0 - 2.0*b*cg + b*b, 1.5);
    float t = tan(g*0.5);
    float B = B0 / (1.0 + t / max(h, 0.001));
    float tt = tan(th);
    float K2 = exp(-0.32*th*sqrt(max(tt*t,0.0)) - 0.52*th*tt*t);
    I = 3.14159265 * (wl/12.5663706) * (mu0/(mu0+mu)) * ((1.0+B)*P + H0*H1 - 1.0) * K2;
  }
  float c = pow(clamp(I * exposure, 0.0, 1.0), 1.0/2.2);
  gl_FragColor = vec4(vec3(c) * vec3(1.0, 0.98, 0.95), 1.0);
}`;

// Macro view: a nadir look at a patch of the body. Real DEM plus synthetic craters/roughness below DEM resolution.
// Heights and ground distances share one unit (unit-sphere radians), so slopes and shadow lengths are consistent.
const macroFrag = `
precision highp float;
varying vec2 v;
uniform sampler2D uAlb; uniform sampler2D uDem;
uniform vec3 c; uniform vec3 E; uniform vec3 N;
uniform float span; uniform float K; uniform float detail; uniform vec2 origin;
uniform float g; uniform float az;
uniform float w; uniform float b; uniform float B0; uniform float h; uniform float th;
uniform float exposure; uniform float albMean; uniform float albAmt;
uniform float demOn; uniform float shadowOn; uniform float texOn;
const float PI = 3.14159265;
vec2 eqUV(vec3 p) { return vec2(atan(p.x, p.z) / (2.0*PI) + 0.5, asin(clamp(p.y, -1.0, 1.0)) / PI + 0.5); }
float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float vnoise(vec2 x) {
  vec2 i = floor(x), f = fract(x); f = f*f*(3.0 - 2.0*f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 x) { float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { s += a * vnoise(x); x = x * 2.03 + 17.0; a *= 0.5; } return s; }
// One layer of bowl craters with raised rims, one crater per grid cell at most.
float craterLayer(vec2 st, float cell, float seed) {
  float ca = seed * 0.9, sa = sin(ca), co = cos(ca);
  vec2 rs = vec2(co * st.x - sa * st.y, sa * st.x + co * st.y);
  vec2 q = rs / cell + 0.45 * (vec2(vnoise(rs / cell * 0.6 + seed), vnoise(rs / cell * 0.6 + seed + 9.0)) - 0.5);
  vec2 id = floor(q);
  float hh = hash(id + seed);
  if (hh < 0.5) return 0.0;
  vec2 ctr = id + 0.5 + (vec2(hash(id + seed + 3.1), hash(id + seed + 7.7)) - 0.5) * 0.35;
  float R = (0.18 + 0.12 * hash(id + seed + 1.3));
  float r = length(q - ctr) / R;
  float depth = 0.22 * R * cell;
  float bowl = r < 1.0 ? -depth * (1.0 - r*r) : 0.0;
  float rim = 0.28 * depth * exp(-pow((r - 1.05) / 0.14, 2.0));
  return bowl + rim;
}
float Zf(vec2 st) {
  if (demOn < 0.5) return 0.0;
  vec2 wp = st + origin; // world-anchored coordinates: synthetic detail stays fixed to the surface
  vec3 q = normalize(c + st.x * E + st.y * N);
  float z = texOn > 0.5 ? texture2D(uDem, eqUV(q)).r * K : 0.0;
  float d = craterLayer(wp, 0.06, 1.0) + craterLayer(wp, 0.024, 5.0) + craterLayer(wp, 0.01, 9.0) + 0.0016 * fbm(wp / 0.012);
  return z + detail * d;
}
void main() {
  vec2 st = v * span;
  float e = 0.0012;
  float zc = Zf(st);
  float dzx = (Zf(st + vec2(e, 0.0)) - Zf(st - vec2(e, 0.0))) / (2.0 * e);
  float dzy = (Zf(st + vec2(0.0, e)) - Zf(st - vec2(0.0, e))) / (2.0 * e);
  vec3 nl = normalize(vec3(-dzx, -dzy, 1.0));
  vec3 L = vec3(sin(g) * cos(az), sin(g) * sin(az), cos(g));
  float shade = 1.0;
  if (demOn > 0.5 && shadowOn > 0.5 && sin(g) > 0.002) {
    vec2 sd = vec2(cos(az), sin(az));
    float cot = cos(g) / sin(g);
    for (int i = 1; i <= 24; i++) {
      float t = float(i) / 24.0;
      float d = 0.14 * t * t;
      if (Zf(st + sd * d) > zc + d * cot + 0.00004) { shade = 0.0; }
    }
  }
  float wl = w;
  if (texOn > 0.5) {
    vec3 q = normalize(c + st.x * E + st.y * N);
    vec3 c3 = texture2D(uAlb, eqUV(q)).rgb;
    float lum = dot(c3, vec3(0.299, 0.587, 0.114));
    wl = clamp(w * mix(1.0, lum / albMean, albAmt), 0.01, 0.98);
  }
  float mu0 = dot(nl, L); float mu = nl.z;
  float I = 0.0;
  if (mu0 > 0.0 && shade > 0.0) {
    float gamma = sqrt(1.0 - wl);
    float H0 = (1.0 + 2.0*mu0)/(1.0 + 2.0*gamma*mu0);
    float H1 = (1.0 + 2.0*mu)/(1.0 + 2.0*gamma*mu);
    float cg = cos(g);
    float P = (1.0 - b*b) / pow(1.0 - 2.0*b*cg + b*b, 1.5);
    float t2 = tan(g*0.5);
    float B = B0 / (1.0 + t2 / max(h, 0.001));
    float tt = tan(th);
    float K2 = exp(-0.32*th*sqrt(max(tt*t2,0.0)) - 0.52*th*tt*t2);
    I = 3.14159265 * (wl/12.5663706) * (mu0/(mu0+mu)) * ((1.0+B)*P + H0*H1 - 1.0) * K2;
  }
  float cc = pow(clamp(I * exposure, 0.0, 1.0), 1.0/2.2);
  gl_FragColor = vec4(vec3(cc) * vec3(1.0, 0.98, 0.95), 1.0);
}`;

const BODY_RADIUS_KM: Record<string, number> = { moon: 1737.4, ceres: 469.7 };

// Grain view: a nadir look at a packed bed of grains (~100 um each). B(g) and the roughness term are NOT applied here:
// the opposition surge comes out of the explicit self-shadowing, and porosity (tied to h) controls how deep the voids are.
const grainFrag = `
precision highp float;
varying vec2 v;
uniform float g; uniform float az; uniform float w; uniform float b; uniform float por; uniform float exposure; uniform float cells;
float hash21(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
vec2 hash22(vec2 p) { return vec2(hash21(p), hash21(p + 17.13)); }
float field(vec2 p, out vec3 nrm, out float gid) {
  vec2 i = floor(p);
  float best = 0.0;
  nrm = vec3(0.0, 0.0, 1.0);
  gid = 0.0;
  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 c = i + vec2(float(x), float(y));
      vec2 ctr = c + 0.5 + (hash22(c) - 0.5) * 0.45;
      float r = (0.5 + 0.26 * hash21(c + 4.7)) * (1.0 - 0.4 * por);
      float lift = 0.18 * hash21(c + 9.1);
      vec2 d = p - ctr;
      float d2 = dot(d, d);
      if (d2 < r * r) {
        float zz = sqrt(r * r - d2);
        float top = zz + lift;
        if (top > best) { best = top; nrm = normalize(vec3(d, zz)); gid = hash21(c); }
      }
    }
  }
  return best;
}
void main() {
  vec2 p = v * cells * 0.5 + vec2(40.3, 17.7);
  vec3 n; float gid;
  float z0 = field(p, n, gid);
  float shade = 1.0;
  if (sin(g) > 0.002) {
    vec2 sd = vec2(cos(az), sin(az));
    float cot = cos(g) / sin(g);
    for (int k = 1; k <= 20; k++) {
      float d = 6.0 * pow(float(k) / 20.0, 1.6);
      vec3 n2; float g2;
      if (field(p + sd * d, n2, g2) > z0 + d * cot + 0.003) { shade = 0.0; }
    }
  }
  vec3 L = vec3(sin(g) * cos(az), sin(g) * sin(az), cos(g));
  float wl = clamp(w * (0.8 + 0.4 * gid), 0.01, 0.98);
  float mu0 = dot(n, L); float mu = n.z;
  float I = 0.0;
  if (mu0 > 0.0 && shade > 0.0) {
    float gamma = sqrt(1.0 - wl);
    float H0 = (1.0 + 2.0*mu0)/(1.0 + 2.0*gamma*mu0);
    float H1 = (1.0 + 2.0*mu)/(1.0 + 2.0*gamma*mu);
    float cg = cos(g);
    float P = (1.0 - b*b) / pow(1.0 - 2.0*b*cg + b*b, 1.5);
    I = 3.14159265 * (wl/12.5663706) * (mu0/(mu0+mu)) * (P + H0*H1 - 1.0);
  }
  I += 0.04 * wl; // light scattered into shadows (multiple scattering)
  if (z0 < 0.001) { I *= 0.55; }
  float cc = pow(clamp(I * exposure, 0.0, 1.0), 1.0/2.2);
  gl_FragColor = vec4(vec3(cc) * vec3(1.0, 0.98, 0.95), 1.0);
}`;

interface BodyData { alb: HTMLImageElement; dem: HTMLImageElement; heights: Uint8Array; hw: number; hh: number; albMean: number }

function loadImg(src: string) {
  return new Promise<HTMLImageElement>((res, rej) => {
    const im = new Image();
    im.onload = () => res(im);
    im.onerror = rej;
    im.src = src;
  });
}

async function loadBody(key: BodyKey): Promise<BodyData> {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') + '/textures/';
  const [alb, dem] = await Promise.all([loadImg(base + BODIES[key].alb), loadImg(base + BODIES[key].dem)]);
  // CPU copies: DEM heights (for the phase-curve integration) and mean albedo (to normalise w)
  const cv = document.createElement('canvas');
  cv.width = dem.naturalWidth; cv.height = dem.naturalHeight;
  const cx = cv.getContext('2d', { willReadFrequently: true })!;
  cx.drawImage(dem, 0, 0);
  const d = cx.getImageData(0, 0, cv.width, cv.height).data;
  const heights = new Uint8Array(cv.width * cv.height);
  for (let i = 0; i < heights.length; i++) heights[i] = d[i * 4];
  const sm = document.createElement('canvas'); sm.width = 64; sm.height = 32;
  const sx = sm.getContext('2d', { willReadFrequently: true })!;
  sx.drawImage(alb, 0, 0, 64, 32);
  const a = sx.getImageData(0, 0, 64, 32).data;
  let sum = 0, cnt = 0;
  for (let y = 0; y < 32; y++) {
    const wgt = Math.cos(((y + 0.5) / 32 - 0.5) * Math.PI); // area weight
    for (let x = 0; x < 64; x++) { const o = (y * 64 + x) * 4; sum += wgt * (0.299 * a[o] + 0.587 * a[o + 1] + 0.114 * a[o + 2]) / 255; cnt += wgt; }
  }
  return { alb, dem, heights, hw: cv.width, hh: cv.height, albMean: Math.max(sum / cnt, 0.02) };
}

export function initHapke(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-hapke-canvas]')!;
  const plot = root.querySelector<HTMLCanvasElement>('[data-hapke-plot]')!;
  const inputs = root.querySelectorAll<HTMLInputElement>('input[type=range]');
  const readout = root.querySelector<HTMLElement>('[data-hapke-readout]');
  const bodyBtns = root.querySelectorAll<HTMLButtonElement>('[data-body]');
  const terrBtns = root.querySelectorAll<HTMLButtonElement>('[data-terrain]');
  const optShadow = root.querySelector<HTMLInputElement>('[data-opt=shadow]');
  const optAlb = root.querySelector<HTMLInputElement>('[data-opt=albedo]');

  const p: HapkeParams = { w: 0.32, b: 0.25, B0: 1.0, h: 0.07, theta: 20, g: 50, az: Math.PI, relief: 1, lon: 0, lat: 15, plon: 0, zoom: 12, detail: 0.7 };
  let body: BodyKey = 'moon';
  let demOn = true;
  let data: BodyData | null = null;
  let dead = false;

  const gl = canvas.getContext('webgl', { premultipliedAlpha: false, alpha: true });
  let draw3d = () => {};
  let uploadTextures = (_d: BodyData) => {};
  if (gl) {
    const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);
    const mkTex = (unit: number) => {
      const t = gl.createTexture()!;
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };
    const tAlb = mkTex(0), tDem = mkTex(1);
    gl.uniform1i(u('uAlb'), 0);
    gl.uniform1i(u('uDem'), 1);
    uploadTextures = (d) => {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tAlb);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, d.alb);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tDem);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, d.dem);
    };
    draw3d = () => {
      const dpr = Math.min(devicePixelRatio, 2);
      const W = canvas.clientWidth * dpr, Hh = canvas.clientHeight * dpr;
      if (canvas.width !== W || canvas.height !== Hh) { canvas.width = W; canvas.height = Hh; }
      gl.viewport(0, 0, W, Hh);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      const g = p.g * D2R;
      gl.uniform3f(u('L'), Math.sin(g) * Math.cos(p.az), Math.sin(g) * Math.sin(p.az), Math.cos(g));
      gl.uniform1f(u('g'), g);
      gl.uniform1f(u('w'), p.w);
      gl.uniform1f(u('b'), p.b);
      gl.uniform1f(u('B0'), p.B0);
      gl.uniform1f(u('h'), p.h);
      gl.uniform1f(u('th'), p.theta * D2R);
      gl.uniform1f(u('exposure'), BODIES[body].exposure);
      gl.uniform1f(u('aspect'), W / Hh);
      gl.uniform3f(u('bg'), 0, 0, 0);
      gl.uniform1f(u('lon'), p.lon * D2R);
      gl.uniform1f(u('relief'), p.relief * BODIES[body].reliefBase);
      gl.uniform1f(u('albMean'), data?.albMean ?? 0.3);
      gl.uniform1f(u('albAmt'), optAlb?.checked ? 1 : 0);
      gl.uniform1f(u('demOn'), demOn ? 1 : 0);
      gl.uniform1f(u('shadowOn'), optShadow?.checked === false ? 0 : 1);
      gl.uniform1f(u('texOn'), data ? 1 : 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
  }

  // ---- CPU mirror of the shader, used to integrate the whole disc into a phase curve ----
  const heightAt = (d: BodyData, u: number, v: number) => {
    const ix = Math.min(d.hw - 1, Math.floor((((u % 1) + 1) % 1) * d.hw));
    const iy = Math.min(d.hh - 1, Math.max(0, Math.floor((1 - Math.min(1, Math.max(0, v))) * (d.hh - 1))));
    return d.heights[iy * d.hw + ix] / 255;
  };
  const uvOf = (q: number[]) => [Math.atan2(q[0], q[2]) / (2 * Math.PI) + 0.5, Math.asin(Math.max(-1, Math.min(1, q[1]))) / Math.PI + 0.5];
  const rotY = (v: number[], a: number) => { const c = Math.cos(a), s = Math.sin(a); return [c * v[0] + s * v[2], v[1], -s * v[0] + c * v[2]]; };
  const norm = (v: number[]) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };

  const discMean = (gDeg: number, useDem: boolean) => {
    const g = gDeg * D2R;
    const L = [Math.sin(g) * Math.cos(p.az), Math.sin(g) * Math.sin(p.az), Math.cos(g)];
    const lon = p.lon * D2R;
    const rel = p.relief * BODIES[body].reliefBase;
    const K = rel * Z_PER_UNIT;
    const N = 44;
    const texel = 1 / 2048;
    const Lo = rotY(L, lon);
    const shadows = optShadow?.checked !== false;
    let sum = 0, cnt = 0;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const x = ((i + 0.5) / N) * 2 - 1, y = ((j + 0.5) / N) * 2 - 1;
      const r2 = x * x + y * y;
      if (r2 > 1) continue;
      cnt++;
      let nl = [x, y, Math.sqrt(1 - r2)];
      let dark = false;
      if (useDem && data) {
        const po = rotY(nl, lon);
        const [uu, vv] = uvOf(po);
        const hl = heightAt(data, uu - texel, vv), hr = heightAt(data, uu + texel, vv);
        const hd = heightAt(data, uu, vv - texel * 2), hu = heightAt(data, uu, vv + texel * 2);
        const e = norm([po[2], 0, -po[0] + 1e-5]);
        const nn = norm([-po[0] * po[1], 1 - po[1] * po[1], -po[2] * po[1]]);
        const cosLat = Math.max(Math.sqrt(1 - po[1] * po[1]), 0.15);
        const vec = [0, 1, 2].map((k) => po[k] - rel * (((hr - hl) / cosLat) * e[k] + (hu - hd) * nn[k]));
        nl = rotY(norm(vec), -lon);
        if (shadows) {
          const sinE = po[0] * Lo[0] + po[1] * Lo[1] + po[2] * Lo[2];
          const sv = [Lo[0] - po[0] * sinE, Lo[1] - po[1] * sinE, Lo[2] - po[2] * sinE];
          const sl = Math.hypot(sv[0], sv[1], sv[2]);
          if (sl > 1e-4) {
            const sd = [sv[0] / sl, sv[1] / sl, sv[2] / sl];
            const tanE = sinE / sl;
            const Zp = heightAt(data, uu, vv) * K;
            for (let k = 1; k <= SHADOW_STEPS && !dark; k++) {
              const d = k * SHADOW_STEP;
              const q = norm([po[0] + sd[0] * d, po[1] + sd[1] * d, po[2] + sd[2] * d]);
              const [qu, qv] = uvOf(q);
              if (heightAt(data, qu, qv) * K > Zp + d * tanE + 0.0004) dark = true;
            }
          }
        }
      }
      if (dark) continue;
      const mu0 = nl[0] * L[0] + nl[1] * L[1] + nl[2] * L[2];
      const mu = Math.max(nl[2], 0.04 * Math.sqrt(1 - r2));
      if (mu0 <= 0 || mu <= 0) continue;
      sum += hapkeIF(p, mu0, mu, g);
    }
    return sum / cnt;
  };

  let curves: { smooth: number[]; dem: number[] } | null = null;
  let curveDirty = true;
  const gridG: number[] = [];
  for (let gg = 0; gg <= 150; gg += 5) gridG.push(gg);
  const computeCurves = () => {
    curveDirty = false;
    curves = {
      smooth: gridG.map((gg) => discMean(gg, false)),
      dem: demOn && data ? gridG.map((gg) => discMean(gg, true)) : [],
    };
  };
  const interp = (arr: number[], g: number) => {
    const f = g / 5, i = Math.min(arr.length - 2, Math.floor(f)), t = f - i;
    return arr[i] * (1 - t) + arr[i + 1] * t;
  };

  const drawPlot = () => {
    if (curveDirty) computeCurves();
    const ctx = plot.getContext('2d')!;
    const dpr = Math.min(devicePixelRatio, 2);
    const W = plot.clientWidth, H = plot.clientHeight;
    plot.width = W * dpr; plot.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(document.documentElement);
    const text = css.getPropertyValue('--muted').trim();
    const line = css.getPropertyValue('--line-strong').trim();
    const accent = css.getPropertyValue('--accent').trim();
    const fg = css.getPropertyValue('--text').trim();
    const pad = { l: 44, r: 12, t: 14, b: 30 };
    const gx = (g: number) => pad.l + (g / 150) * (W - pad.l - pad.r);
    const smooth = curves!.smooth, rough = curves!.dem;
    const max = Math.max(...smooth, ...rough) * 1.1 || 1;
    const gy = (v: number) => H - pad.b - (v / max) * (H - pad.t - pad.b);

    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = line; ctx.lineWidth = 1;
    ctx.font = '10px "JetBrains Mono Variable", monospace'; ctx.fillStyle = text;
    for (let g = 0; g <= 150; g += 30) {
      ctx.beginPath(); ctx.moveTo(gx(g), pad.t); ctx.lineTo(gx(g), H - pad.b); ctx.stroke();
      ctx.fillText(g + '°', gx(g) - 8, H - 10);
    }
    ctx.fillText('mean I/F', 6, pad.t + 8);
    ctx.fillText(max.toFixed(2), 6, pad.t + 22);
    ctx.beginPath(); ctx.moveTo(pad.l, H - pad.b); ctx.lineTo(W - pad.r, H - pad.b); ctx.stroke();

    const trace = (arr: number[], color: string, dash: number[], lw: number) => {
      ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.setLineDash(dash); ctx.beginPath();
      arr.forEach((v, i) => (i ? ctx.lineTo(gx(gridG[i]), gy(v)) : ctx.moveTo(gx(gridG[i]), gy(v))));
      ctx.stroke(); ctx.setLineDash([]);
    };
    const showRough = rough.length > 0;
    trace(smooth, showRough ? text : fg, showRough ? [4, 4] : [], showRough ? 1.2 : 1.6);
    if (showRough) trace(rough, fg, [], 1.8);

    const active = showRough ? rough : smooth;
    const cur = interp(active, p.g);
    ctx.fillStyle = accent;
    ctx.beginPath(); ctx.arc(gx(p.g), gy(cur), 5, 0, Math.PI * 2); ctx.fill();
    if (readout) readout.textContent = `g = ${p.g.toFixed(0)}°  ·  mean I/F = ${cur.toFixed(3)}${showRough ? '  ·  dashed: smooth sphere' : ''}`;
  };

  // ---- Macro viewport: nadir view of a patch, with its own WebGL context ----
  const macroCanvas = root.querySelector<HTMLCanvasElement>('[data-macro-canvas]');
  const macroOut = root.querySelector<HTMLElement>('[data-macro-readout]');
  const marker = root.querySelector<HTMLElement>('[data-marker]');
  const sunDot = root.querySelector<HTMLElement>('[data-sun]');
  const mgl = macroCanvas?.getContext('webgl', { alpha: false }) ?? null;
  let drawMacro = () => {};
  let uploadMacro = (_d: BodyData) => {};
  if (mgl && macroCanvas) {
    const gl2 = mgl;
    const sh = (type: number, src: string) => { const s = gl2.createShader(type)!; gl2.shaderSource(s, src); gl2.compileShader(s); return s; };
    const prog = gl2.createProgram()!;
    gl2.attachShader(prog, sh(gl2.VERTEX_SHADER, vert));
    gl2.attachShader(prog, sh(gl2.FRAGMENT_SHADER, macroFrag));
    gl2.linkProgram(prog);
    gl2.useProgram(prog);
    const buf = gl2.createBuffer();
    gl2.bindBuffer(gl2.ARRAY_BUFFER, buf);
    gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl2.STATIC_DRAW);
    const loc = gl2.getAttribLocation(prog, 'a');
    gl2.enableVertexAttribArray(loc);
    gl2.vertexAttribPointer(loc, 2, gl2.FLOAT, false, 0, 0);
    const u = (n: string) => gl2.getUniformLocation(prog, n);
    const mkTex = (unit: number) => {
      const t = gl2.createTexture()!;
      gl2.activeTexture(gl2.TEXTURE0 + unit);
      gl2.bindTexture(gl2.TEXTURE_2D, t);
      gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_MIN_FILTER, gl2.LINEAR);
      gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_MAG_FILTER, gl2.LINEAR);
      gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_WRAP_S, gl2.REPEAT);
      gl2.texParameteri(gl2.TEXTURE_2D, gl2.TEXTURE_WRAP_T, gl2.CLAMP_TO_EDGE);
      return t;
    };
    const tAlb = mkTex(0), tDem = mkTex(1);
    gl2.uniform1i(u('uAlb'), 0);
    gl2.uniform1i(u('uDem'), 1);
    uploadMacro = (d) => {
      gl2.pixelStorei(gl2.UNPACK_FLIP_Y_WEBGL, 1);
      gl2.activeTexture(gl2.TEXTURE0); gl2.bindTexture(gl2.TEXTURE_2D, tAlb);
      gl2.texImage2D(gl2.TEXTURE_2D, 0, gl2.RGBA, gl2.RGBA, gl2.UNSIGNED_BYTE, d.alb);
      gl2.activeTexture(gl2.TEXTURE1); gl2.bindTexture(gl2.TEXTURE_2D, tDem);
      gl2.texImage2D(gl2.TEXTURE_2D, 0, gl2.RGBA, gl2.RGBA, gl2.UNSIGNED_BYTE, d.dem);
    };
    drawMacro = () => {
      const dpr = Math.min(devicePixelRatio, 1.5);
      const S = Math.round(macroCanvas.clientWidth * dpr);
      if (S && (macroCanvas.width !== S || macroCanvas.height !== S)) { macroCanvas.width = S; macroCanvas.height = S; }
      gl2.viewport(0, 0, macroCanvas.width, macroCanvas.height);
      const lat = p.lat * D2R, lonP = (p.lon + p.plon) * D2R;
      const c = [Math.cos(lat) * Math.sin(lonP), Math.sin(lat), Math.cos(lat) * Math.cos(lonP)];
      const E = norm([c[2], 0, -c[0] + 1e-5]);
      const N = norm([-c[0] * c[1], 1 - c[1] * c[1], -c[2] * c[1]]);
      const rel = p.relief * BODIES[body].reliefBase;
      gl2.uniform3f(u('c'), c[0], c[1], c[2]);
      gl2.uniform3f(u('E'), E[0], E[1], E[2]);
      gl2.uniform3f(u('N'), N[0], N[1], N[2]);
      gl2.uniform2f(u('origin'), lonP * Math.cos(lat), lat);
      gl2.uniform1f(u('span'), (p.zoom * D2R) / 2);
      gl2.uniform1f(u('K'), rel * Z_PER_UNIT);
      gl2.uniform1f(u('detail'), p.detail * Math.max(p.relief, 0.15));
      gl2.uniform1f(u('g'), Math.max(p.g, 0.5) * D2R);
      gl2.uniform1f(u('az'), p.az);
      gl2.uniform1f(u('w'), p.w);
      gl2.uniform1f(u('b'), p.b);
      gl2.uniform1f(u('B0'), p.B0);
      gl2.uniform1f(u('h'), p.h);
      gl2.uniform1f(u('th'), p.theta * D2R);
      gl2.uniform1f(u('exposure'), BODIES[body].exposure);
      gl2.uniform1f(u('albMean'), data?.albMean ?? 0.3);
      gl2.uniform1f(u('albAmt'), optAlb?.checked ? 1 : 0);
      gl2.uniform1f(u('demOn'), demOn ? 1 : 0);
      gl2.uniform1f(u('shadowOn'), optShadow?.checked === false ? 0 : 1);
      gl2.uniform1f(u('texOn'), data ? 1 : 0);
      gl2.drawArrays(gl2.TRIANGLE_STRIP, 0, 4);
    };
  }
  const updateMarker = () => {
    const lat = p.lat * D2R, dl = p.plon * D2R;
    const x = Math.cos(lat) * Math.sin(dl), y = Math.sin(lat), z = Math.cos(lat) * Math.cos(dl);
    if (marker) {
      marker.style.display = z > 0.05 ? 'block' : 'none';
      marker.style.left = `${50 + x * 0.8485 * 50}%`;
      marker.style.top = `${50 - y * 0.8485 * 50}%`;
      marker.style.width = marker.style.height = `${Math.max(2.5, 0.8485 * p.zoom * D2R * 100 * 0.5)}%`;
    }
    if (macroOut) {
      const km = p.zoom * D2R * (BODY_RADIUS_KM[body] ?? 1737);
      macroOut.textContent = `${km.toFixed(0)} km wide · ${demOn ? 'DEM + synthetic detail' : 'flat'}`;
    }
    if (sunDot) {
      const f = Math.min(p.g / 90, 1);
      sunDot.style.display = p.g <= 90 ? 'block' : 'none';
      sunDot.style.left = `${50 + f * Math.cos(p.az) * 50}%`;
      sunDot.style.top = `${50 - f * Math.sin(p.az) * 50}%`;
    }
  };

  // ---- Grain viewport: packed grains with explicit self-shadowing ----
  const grainCanvas = root.querySelector<HTMLCanvasElement>('[data-grain-canvas]');
  const ggl = grainCanvas?.getContext('webgl', { alpha: false }) ?? null;
  let drawGrain = () => {};
  if (ggl && grainCanvas) {
    const gl3 = ggl;
    const sh = (type: number, src: string) => { const s2 = gl3.createShader(type)!; gl3.shaderSource(s2, src); gl3.compileShader(s2); return s2; };
    const prog = gl3.createProgram()!;
    gl3.attachShader(prog, sh(gl3.VERTEX_SHADER, vert));
    gl3.attachShader(prog, sh(gl3.FRAGMENT_SHADER, grainFrag));
    gl3.linkProgram(prog);
    gl3.useProgram(prog);
    const buf = gl3.createBuffer();
    gl3.bindBuffer(gl3.ARRAY_BUFFER, buf);
    gl3.bufferData(gl3.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl3.STATIC_DRAW);
    const loc = gl3.getAttribLocation(prog, 'a');
    gl3.enableVertexAttribArray(loc);
    gl3.vertexAttribPointer(loc, 2, gl3.FLOAT, false, 0, 0);
    const u = (n: string) => gl3.getUniformLocation(prog, n);
    drawGrain = () => {
      const dpr = Math.min(devicePixelRatio, 1.5);
      const S = Math.round(grainCanvas.clientWidth * dpr);
      if (S && (grainCanvas.width !== S || grainCanvas.height !== S)) { grainCanvas.width = S; grainCanvas.height = S; }
      gl3.viewport(0, 0, grainCanvas.width, grainCanvas.height);
      gl3.uniform1f(u('g'), Math.max(p.g, 0.5) * D2R);
      gl3.uniform1f(u('az'), p.az);
      gl3.uniform1f(u('w'), p.w);
      gl3.uniform1f(u('b'), p.b);
      gl3.uniform1f(u('por'), Math.min(1, Math.max(0, p.h / 0.3)));
      gl3.uniform1f(u('exposure'), BODIES[body].exposure);
      gl3.uniform1f(u('cells'), 7);
      gl3.drawArrays(gl3.TRIANGLE_STRIP, 0, 4);
    };
  }

  const render = () => { draw3d(); drawMacro(); drawGrain(); updateMarker(); drawPlot(); };
  let raf = 0;
  const schedule = () => { curveDirty = true; if (!raf) raf = requestAnimationFrame(() => { raf = 0; if (!dead) render(); }); };

  inputs.forEach((inp) => {
    const key = inp.name as keyof HapkeParams;
    const out = root.querySelector<HTMLOutputElement>(`output[for="${inp.id}"]`);
    const set = () => {
      const val = parseFloat(inp.value);
      if ((key as string) === 'azdeg') p.az = val * D2R; else (p as any)[key] = val;
      if (out) out.textContent = key === 'g' ? `${inp.value}°` : inp.value;
      schedule();
    };
    inp.addEventListener('input', set);
    set();
  });

  const setSlider = (name: string, val: number) => {
    const el = root.querySelector<HTMLInputElement>(`input[name=${name}]`);
    if (el) { el.value = String(val); el.dispatchEvent(new Event('input')); }
  };

  const selectBody = async (k: BodyKey) => {
    body = k;
    bodyBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.body === k)));
    const pr = BODIES[k].preset;
    (Object.keys(pr) as (keyof HapkeParams)[]).forEach((key) => setSlider(key as string, pr[key] as number));
    data = null;
    schedule();
    try {
      const d = await loadBody(k);
      if (dead || body !== k) return;
      data = d;
      uploadTextures(d);
      uploadMacro(d);
    } catch { /* keep the smooth fallback */ }
    schedule();
  };
  bodyBtns.forEach((b) => b.addEventListener('click', () => selectBody(b.dataset.body as BodyKey)));
  terrBtns.forEach((b) => b.addEventListener('click', () => {
    demOn = b.dataset.terrain === 'dem';
    terrBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    schedule();
  }));
  [optShadow, optAlb].forEach((o) => o?.addEventListener('change', schedule));
  // Tabs and reset
  const tabs = root.querySelectorAll<HTMLButtonElement>('[data-tab]');
  const panes = root.querySelectorAll<HTMLElement>('[data-pane]');
  tabs.forEach((t) => t.addEventListener('click', () => {
    tabs.forEach((x) => x.setAttribute('aria-selected', String(x === t)));
    panes.forEach((pn) => { pn.hidden = pn.dataset.pane !== t.dataset.tab; });
  }));
  root.querySelector('[data-reset]')?.addEventListener('click', () => {
    const pr = BODIES[body].preset;
    (Object.keys(pr) as (keyof HapkeParams)[]).forEach((key) => setSlider(key as string, pr[key] as number));
    setSlider('relief', 1); setSlider('detail', 0.7);
  });
  selectBody('moon');

  // Click / drag on the body: choose the zoom patch. Drag in the zoom view: move the Sun.
  const clampv = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  let picking = false;
  const onPick = (e: PointerEvent) => {
    if (!picking) return;
    const r = canvas.getBoundingClientRect();
    const nx = (((e.clientX - r.left) / r.width) * 2 - 1) / 0.8485;
    const ny = (-(((e.clientY - r.top) / r.height) * 2 - 1)) / 0.8485;
    const d = Math.hypot(nx, ny);
    const k = d > 0.97 ? 0.97 / d : 1;
    const x = nx * k, y = ny * k, z = Math.sqrt(Math.max(0, 1 - x * x - y * y));
    setSlider('lat', Math.round(clampv(Math.asin(y) / D2R, -80, 80)));
    setSlider('plon', Math.round(clampv(Math.atan2(x, z) / D2R, -80, 80)));
  };
  canvas.addEventListener('pointerdown', (e) => { picking = true; canvas.setPointerCapture(e.pointerId); onPick(e); });
  canvas.addEventListener('pointermove', onPick);
  canvas.addEventListener('pointerup', () => (picking = false));

  let sunning = false;
  const onSun = (e: PointerEvent) => {
    if (!sunning || !macroCanvas) return;
    const r = macroCanvas.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 2 - 1;
    const y = -(((e.clientY - r.top) / r.height) * 2 - 1);
    setSlider('azdeg', ((Math.round(Math.atan2(y, x) / D2R) % 360) + 360) % 360);
    setSlider('g', Math.round(Math.min(Math.hypot(x, y), 1) * 90));
  };
  macroCanvas?.addEventListener('pointerdown', (e) => { sunning = true; macroCanvas.setPointerCapture(e.pointerId); onSun(e); });
  macroCanvas?.addEventListener('pointermove', onSun);
  macroCanvas?.addEventListener('pointerup', () => (sunning = false));

  const ro = new ResizeObserver(() => schedule());
  ro.observe(canvas);
  const onTheme = () => schedule();
  window.addEventListener('themechange', onTheme);
  return () => { dead = true; ro.disconnect(); window.removeEventListener('themechange', onTheme); };
}
