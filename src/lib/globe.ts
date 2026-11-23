import * as THREE from 'three';

/**
 * Planetary body that morphs from the Moon to Ceres.
 * Surfaces use real public-domain imagery (LRO "CGI Moon Kit" colour map and the Dawn global mosaic of Ceres),
 * with a procedural cratered surface as a fallback if a texture fails to load. Shaded with a
 * Lommel-Seeliger / Lambert blend, the same family of models used for photometric correction.
 */

const vertex = /* glsl */ `
  uniform sampler2D uMoonH;
  uniform sampler2D uCeresH;
  uniform float uHasMoonH;
  uniform float uHasCeresH;
  uniform float uMix;
  varying vec3 vObj;
  varying vec3 vWorld;
  const float PI = 3.14159265;
  vec2 eqUV(vec3 p) { return vec2(atan(p.x, p.z) / (2.0 * PI) + 0.5, asin(clamp(p.y, -1.0, 1.0)) / PI + 0.5); }
  void main() {
    vec3 p = normalize(position);
    vObj = p;
    vec2 uv = eqUV(p);
    float hm = uHasMoonH > 0.5 ? textureLod(uMoonH, uv, 2.5).r : 0.5;
    float hc = uHasCeresH > 0.5 ? textureLod(uCeresH, uv, 2.5).r : 0.5;
    // Real elevation (LOLA / Dawn), vertically exaggerated so the relief reads at this scale
    float disp = (hm - 0.5) * 0.03 * (1.0 - uMix) + (hc - 0.5) * 0.05 * uMix;
    vec4 w = modelMatrix * vec4(p * (1.0 + disp), 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const fragment = /* glsl */ `
  precision highp float;
  uniform vec3 uLight;
  uniform float uMix;      // 0 = Moon, 1 = Ceres
  uniform float uTime;
  uniform vec3 uRim;
  uniform mat3 uRot;
  uniform sampler2D uMoonTex;
  uniform sampler2D uCeresTex;
  uniform float uHasMoon;
  uniform float uHasCeres;
  uniform sampler2D uMoonH;
  uniform sampler2D uCeresH;
  uniform float uHasMoonH;
  uniform float uHasCeresH;
  varying vec3 vObj;
  varying vec3 vWorld;

  const float PI = 3.14159265;

  float hash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  vec3 hash3(vec3 p) {
    p = vec3(dot(p, vec3(127.1, 311.7, 74.7)), dot(p, vec3(269.5, 183.3, 246.1)), dot(p, vec3(113.5, 271.9, 124.6)));
    return fract(sin(p) * 43758.5453123);
  }
  float noise(vec3 x) {
    vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x), mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x), mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++) { s += a * noise(p); p *= 2.03; a *= 0.5; } return s; }

  // Voronoi-placed craters: bowl + raised rim (procedural fallback only)
  float craters(vec3 p, float density) {
    vec3 i = floor(p); vec3 f = fract(p); float h = 0.0;
    for (int z = -1; z <= 1; z++) for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
      vec3 g = vec3(float(x), float(y), float(z));
      vec3 o = hash3(i + g);
      if (o.z > density) continue;
      vec3 r = g + o - f;
      float rad = 0.18 + 0.28 * o.x;
      float d = length(r) / rad;
      float bowl = d < 1.0 ? (d * d - 1.0) * 0.7 : 0.0;
      float rim = exp(-pow((d - 1.0) * 3.5, 2.0)) * 0.32;
      h += bowl + rim;
    }
    return h;
  }

  float height(vec3 p) {
    float h = fbm(p * 2.2) * 0.35;
    h += craters(p * 3.0, 0.45) * 0.55;
    h += craters(p * 7.5, 0.6) * 0.22;
    h += craters(p * 18.0, 0.7) * 0.08;
    return h;
  }

  vec2 eqUV(vec3 p) { return vec2(atan(p.x, p.z) / (2.0 * PI) + 0.5, asin(clamp(p.y, -1.0, 1.0)) / PI + 0.5); }
  float lum(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

  // Screen-space UV footprint (set once in main). The u derivative is wrapped so the atan() seam does not
  // produce a huge footprint (which would pick the blurriest mip along a line).
  vec2 gUV; vec2 gDx; vec2 gDy; float gStep;
  // 0.7 = slightly sharper than the pixel footprint; anisotropic filtering keeps it from crawling
  vec4 tx(sampler2D t, vec2 uv) { return textureGrad(t, uv, gDx * 0.7, gDy * 0.7); }

  // Sample an equirectangular map: returns linear albedo, writes a perturbed object-space normal.
  vec3 sampleMap(sampler2D tex, vec3 p, float texel, float bump, float aScale, float gam, out vec3 nOut) {
    vec2 uv = gUV;
    texel = gStep;
    vec3 c = pow(tx(tex, uv).rgb, vec3(gam)) * aScale;
    float hl = lum(tx(tex, uv - vec2(texel, 0.0)).rgb);
    float hr = lum(tx(tex, uv + vec2(texel, 0.0)).rgb);
    float hd = lum(tx(tex, uv - vec2(0.0, texel * 2.0)).rgb);
    float hu = lum(tx(tex, uv + vec2(0.0, texel * 2.0)).rgb);
    vec3 east = normalize(vec3(p.z, 0.0, -p.x) + vec3(1e-5, 0.0, 0.0));
    vec3 north = normalize(vec3(0.0, 1.0, 0.0) - p * p.y);
    float cosLat = max(sqrt(1.0 - p.y * p.y), 0.15);
    nOut = normalize(p - bump / (gStep * 2048.0) * ((hr - hl) / cosLat * east + (hu - hd) * north));
    return c;
  }

  // Tilt a base normal by the gradient of a real elevation map (central differences, equal metric step in u and v).
  vec3 demNormal(sampler2D t, vec3 p, vec3 nBase, float relief) {
    float texel = gStep;
    vec2 uv = gUV;
    float hl = tx(t, uv - vec2(texel, 0.0)).r;
    float hr = tx(t, uv + vec2(texel, 0.0)).r;
    float hd = tx(t, uv - vec2(0.0, texel * 2.0)).r;
    float hu = tx(t, uv + vec2(0.0, texel * 2.0)).r;
    vec3 east = normalize(vec3(p.z, 0.0, -p.x) + vec3(1e-5, 0.0, 0.0));
    vec3 north = normalize(vec3(0.0, 1.0, 0.0) - p * p.y);
    float cosLat = max(sqrt(1.0 - p.y * p.y), 0.15);
    return normalize(nBase - relief / (gStep * 2048.0) * ((hr - hl) / cosLat * east + (hu - hd) * north));
  }

  void main() {
    vec3 p = normalize(vObj);
    gUV = eqUV(p);
    gDx = dFdx(gUV); gDy = dFdy(gUV);
    gDx.x -= floor(gDx.x + 0.5); gDy.x -= floor(gDy.x + 0.5);
    // Sample the gradient over at least the pixel footprint, so per-texel noise is not amplified when minified
    gStep = clamp(max(length(gDx), length(gDy)) * 0.55, 1.0 / 2048.0, 1.0 / 128.0);

    // ---- Procedural fallback surface (only when a texture is missing) ----
    vec3 nProc = p;
    vec3 moonProc = vec3(0.5);
    vec3 ceresProc = vec3(0.2);
    if (min(min(uHasMoon, uHasCeres), min(uHasMoonH, uHasCeresH)) < 0.5) {
      vec3 up = abs(p.y) < 0.99 ? vec3(0, 1, 0) : vec3(1, 0, 0);
      vec3 t = normalize(cross(up, p));
      vec3 b = cross(p, t);
      float e = 0.0025;
      float h0 = height(p);
      float ht = height(normalize(p + t * e));
      float hb = height(normalize(p + b * e));
      float pbump = mix(0.9, 0.5, uMix);
      nProc = normalize(p - pbump * ((ht - h0) / e * t + (hb - h0) / e * b) * 0.05);
      float maria = smoothstep(0.40, 0.56, fbm(p * 1.1 + 3.0));
      float moonAlb = mix(0.66, 0.24, maria) + (fbm(p * 12.0) - 0.5) * 0.12;
      moonProc = vec3(moonAlb) * vec3(1.0, 0.985, 0.96);
      float ceresAlb = 0.2 + (fbm(p * 3.0) - 0.5) * 0.1;
      ceresProc = vec3(ceresAlb) * vec3(1.0, 0.92, 0.82);
    }

    // ---- Real imagery: only sample the body that is actually visible ----
    vec3 nMoon = nProc; vec3 nCeres = nProc;
    vec3 moonCol = moonProc; vec3 ceresCol = ceresProc;
    if (uMix < 0.999) {
      if (uHasMoon > 0.5) moonCol = sampleMap(uMoonTex, p, 1.0 / 2048.0, 0.012, 1.0, 1.3, nMoon);
      if (uHasMoonH > 0.5) nMoon = demNormal(uMoonH, p, nMoon, 8.0);
    }
    if (uMix > 0.001) {
      if (uHasCeres > 0.5) ceresCol = sampleMap(uCeresTex, p, 1.0 / 2048.0, 0.02, 1.25, 2.2, nCeres);
      if (uHasCeresH > 0.5) nCeres = demNormal(uCeresH, p, nCeres, 16.0);
    }

    vec3 albedo = mix(moonCol, ceresCol, uMix);
    vec3 nObj = normalize(mix(nMoon, nCeres, uMix));
    vec3 n = normalize(uRot * nObj);

    // Photometry: Lommel-Seeliger blended with Lambert
    vec3 L = normalize(uLight);
    vec3 V = normalize(cameraPosition - vWorld);
    float mu0 = max(dot(n, L), 0.0);
    float mu = max(dot(n, V), 0.001);
    float ls = mu0 / (mu0 + mu);
    float lambert = mu0;
    float I = mix(ls * 1.6, lambert, 0.35);

    vec3 col = albedo * I;
    // Faint earthshine on night side
    col += albedo * 0.025 * (1.0 - smoothstep(0.0, 0.2, mu0));
    // No rim glow: these bodies are airless, and an amber rim lit up the terrain contours near the limb.

    col = pow(col, vec3(1.0 / 2.2));
    gl_FragColor = vec4(col, 1.0);
  }
`;

export interface Globe {
  setMix(v: number): void;
  setScroll(v: number): void;
  destroy(): void;
  ready: Promise<void>;
}

export function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function createGlobe(canvas: HTMLCanvasElement, opts: { stars?: boolean; interactive?: boolean } = {}): Globe | null {
  if (!hasWebGL()) return null;
  const { stars = true, interactive = true } = opts;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Phones: fewer pixels and vertices, no MSAA. Everything adapts further below if frames run slow.
  const coarse = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 700;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !coarse, alpha: true, powerPreference: 'high-performance' });
  // Software WebGL (browser hardware acceleration off, or GPU blocklisted) is far too slow for per-pixel shading: start tiny
  let software = false;
  try {
    const gl = renderer.getContext();
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const name = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
    software = /swiftshader|software|llvmpipe|basic render|microsoft basic/i.test(name);
  } catch { /* ignore */ }
  let pixelRatio = software ? 0.5 : Math.min(window.devicePixelRatio, coarse ? 1.25 : 1.75);
  renderer.setPixelRatio(pixelRatio);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, 6);

  const uniforms = {
    uLight: { value: new THREE.Vector3(-0.56, 0.35, 0.83) },
    uMix: { value: 0 },
    uTime: { value: 0 },
    uRim: { value: new THREE.Color('#f2a541') },
    uRot: { value: new THREE.Matrix3() },
    uMoonTex: { value: null as THREE.Texture | null },
    uCeresTex: { value: null as THREE.Texture | null },
    uHasMoon: { value: 0 },
    uHasCeres: { value: 0 },
    uMoonH: { value: null as THREE.Texture | null },
    uCeresH: { value: null as THREE.Texture | null },
    uHasMoonH: { value: 0 },
    uHasCeresH: { value: 0 },
  };
  type TexKey = 'uMoonTex' | 'uCeresTex' | 'uMoonH' | 'uCeresH';
  type FlagKey = 'uHasMoon' | 'uHasCeres' | 'uHasMoonH' | 'uHasCeresH';
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const loader = new THREE.TextureLoader();
  const loadTex = (file: string, tex: TexKey, flag: FlagKey) =>
    new Promise<void>((resolve) =>
    loader.load(
      `${base}/textures/${file}`,
      (t) => {
        t.generateMipmaps = true;
        t.minFilter = THREE.LinearMipmapLinearFilter;
        t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        t.magFilter = THREE.LinearFilter;
        t.wrapS = THREE.RepeatWrapping;
        t.needsUpdate = true;
        uniforms[tex].value = t;
        uniforms[flag].value = 1;
        resolve();
      },
      undefined,
      () => resolve(), // keep the procedural fallback
    ));
  // Resolves when both textures are in (or failed / timed out), so the page can fade the globe in without a pop
  const moonLoaded = Promise.all([
    loadTex('moon-2k.jpg', 'uMoonTex', 'uHasMoon'),
    loadTex('moon-dem-2k.jpg', 'uMoonH', 'uHasMoonH'),
  ]).then(() => {});
  // Ceres is only needed once the user scrolls, so it loads after the Moon and never blocks the first paint
  moonLoaded.then(() => {
    loadTex('ceres-2k.jpg', 'uCeresTex', 'uHasCeres');
    loadTex('ceres-dem-2k.jpg', 'uCeresH', 'uHasCeresH');
  });
  const ready = Promise.race([moonLoaded, new Promise<void>((res) => setTimeout(res, 3500))]);
  const geo = new THREE.SphereGeometry(1, software ? 64 : coarse ? 128 : 256, software ? 64 : coarse ? 128 : 256);
  const mat = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms });
  const body = new THREE.Mesh(geo, mat);
  body.rotation.z = 0.12;
  scene.add(body);

  let starPoints: THREE.Points | null = null;
  let starMat: THREE.PointsMaterial | null = null;
  if (stars) {
    const n = 1400;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 18 + Math.random() * 20;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
      pos[i * 3 + 2] = -Math.abs(r * Math.cos(ph)) - 4;
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    starMat = new THREE.PointsMaterial({ size: 0.06, sizeAttenuation: true, transparent: true, opacity: 0.8, color: 0xffffff });
    starPoints = new THREE.Points(sg, starMat);
    scene.add(starPoints);
  }

  const applyTheme = () => {
    const light = document.documentElement.dataset.theme === 'light';
    starMat?.color.set(light ? 0x6a675e : 0xffffff);
    if (starMat) starMat.opacity = light ? 0.35 : 0.8;
  };
  applyTheme();
  window.addEventListener('themechange', applyTheme);

  // Interaction state
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let dragging = false;
  let lastX = 0;
  let spin = 0;
  let velocity = 0;
  let scrollP = 0;
  let mixTarget = 0;

  const onMove = (e: PointerEvent) => {
    pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.ty = -((e.clientY / window.innerHeight) * 2 - 1);
    if (dragging) {
      velocity += (e.clientX - lastX) * 0.0009;
      lastX = e.clientX;
    }
  };
  const onDown = (e: PointerEvent) => { dragging = true; lastX = e.clientX; canvas.setPointerCapture?.(e.pointerId); };
  const onUp = () => { dragging = false; };
  if (interactive) {
    window.addEventListener('pointermove', onMove, { passive: true });
    canvas.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
  }

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  let visible = true;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
  io.observe(canvas);

  const clock = new THREE.Clock();
  let raf = 0;
  let frameAcc = 0, frameCount = 0, warm = 0;
  let skip = software ? 2 : 1; // render every Nth frame; raised when even the lowest resolution cannot keep up
  let tickN = 0;
  let told = false;
  const m4 = new THREE.Matrix4();
  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (!visible || document.hidden) return;
    if (++tickN % skip !== 0) return;
    const raw = clock.getDelta();
    const dt = Math.min(raw, 0.05);
    uniforms.uTime.value += dt;

    // Dynamic resolution: if frames are consistently slow, drop the render resolution a step (never raises it again)
    frameAcc += raw; frameCount++;
    if (frameCount >= 40) {
      // Compare against the time we are allowed per rendered frame (a 60 Hz screen at skip N gives N x 16.7 ms)
      if (warm++ > 0 && frameAcc / frameCount > 0.027 * skip) {
        if (pixelRatio > 0.55) {
          pixelRatio = Math.max(0.5, pixelRatio - (pixelRatio > 1 ? 0.25 : 0.15));
          renderer.setPixelRatio(pixelRatio);
          resize();
        } else if (skip < 3) {
          skip++;
        }
        // This device is struggling: tell the page so it can drop its own smooth-scroll layer and stay native
        if (!told && (pixelRatio <= 0.75 || skip > 1)) {
          told = true;
          window.dispatchEvent(new CustomEvent('portfolio:slow'));
        }
      }
      frameAcc = 0; frameCount = 0;
    }

    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;

    velocity *= 0.94;
    spin += velocity + (reduce ? 0 : dt * 0.04);
    body.rotation.y = spin + scrollP * Math.PI * 1.2;
    body.rotation.x = pointer.y * 0.08;

    // Sun follows the cursor (orbits around the body)
    const ang = -0.45 + pointer.x * 1.1;
    uniforms.uLight.value.set(Math.sin(ang), 0.35 + pointer.y * 0.5, Math.cos(ang) * 0.9).normalize();

    uniforms.uMix.value += (mixTarget - uniforms.uMix.value) * 0.08;

    body.updateMatrixWorld();
    m4.extractRotation(body.matrixWorld);
    uniforms.uRot.value.setFromMatrix4(m4);

    if (starPoints) {
      starPoints.rotation.y = pointer.x * 0.04 + spin * 0.05;
      starPoints.rotation.x = pointer.y * 0.03;
    }
    renderer.render(scene, camera);
  };
  loop();

  return {
    ready,
    setMix(v) { mixTarget = Math.max(0, Math.min(1, v)); },
    setScroll(v) { scrollP = v; },
    destroy() {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('themechange', applyTheme);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointerdown', onDown);
      geo.dispose();
      mat.dispose();
      starPoints?.geometry.dispose();
      starMat?.dispose();
      renderer.dispose();
    },
  };
}
