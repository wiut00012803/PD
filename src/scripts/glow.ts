const CHAIN = 4;

const VERTEX = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uView;
uniform vec2 uCanvas;
uniform vec2 uChain[${CHAIN}];
uniform float uR;
uniform float uTime;
uniform vec3 uColor;
uniform float uPeak;

float hash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1.0, 0.0, 0.0)), f.x), mix(hash(i + vec3(0.0, 1.0, 0.0)), hash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(hash(i + vec3(0.0, 0.0, 1.0)), hash(i + vec3(1.0, 0.0, 1.0)), f.x), mix(hash(i + vec3(0.0, 1.0, 1.0)), hash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z
  );
}

float ball(vec2 p, vec2 center, float size, float weight) {
  vec2 v = (p - center / uR) * vec2(1.0, 1.3) / size;
  return weight * exp(-dot(v, v));
}

float field(vec2 p) {
  float f = ball(p, uChain[0], 0.95, 1.0);
  f += ball(p, uChain[1], 0.9, 0.85);
  f += ball(p, uChain[2], 0.84, 0.72);
  f += ball(p, uChain[3], 0.78, 0.6);
  vec3 q = vec3(p * 1.2, uTime * 0.22);
  float n = noise(q) * 0.62 + noise(q * 2.1 + 7.3) * 0.38;
  return f * (0.72 + n * 0.56);
}

void main() {
  vec2 css = vec2(gl_FragCoord.x, uCanvas.y - gl_FragCoord.y) * (uView / uCanvas);
  float f = field(css / uR);
  float a = uPeak * (1.0 - exp(-f * 1.7));
  float dither = fract(52.9829189 * fract(dot(gl_FragCoord.xy + fract(uTime * 7.0) * 17.0, vec2(0.06711056, 0.00583715))));
  a += (dither - 0.5) * 2.0 / 255.0;
  a = clamp(a, 0.0, 1.0);
  gl_FragColor = vec4(uColor * a, a);
}
`;

const UNIFORMS = ["uView", "uCanvas", "uChain", "uR", "uTime", "uColor", "uPeak"] as const;
type Uniforms = Record<(typeof UNIFORMS)[number], WebGLUniformLocation>;

const REFERENCE_FPS = 60;
const MAX_FRAME_SECONDS = 0.05;
const COARSE_FRAME_MS = 1000 / 30;
const LEAD = 0.05;
const FOLLOW = 0.11;
const LINK = 0.42;
const RADIUS_MIN = 140;
const RADIUS_VIEWPORT = 0.17;
const RADIUS_MAX = 250;
const DPR_CAP = 2;
const CANVAS_SCALE_FINE = 0.5;
const CANVAS_SCALE_COARSE = 0.35;
const FALLBACK_SIZE = 3;
const REST_Y_RATIO = 0.1;
const REST_Y_MAX = 90;
const WANDER_SPEED = 46;
const WANDER_STEER = 0.7;
const WANDER_ARRIVE = 60;
const WANDER_SLOWDOWN = 220;
const WANDER_MARGIN_X = 0.15;
const WANDER_MARGIN_RADII = 1.4;
const WANDER_TOP = 0.08;
const WANDER_HEIGHT = 0.6;
const WANDER_HOLD_MS = 6000;
const WANDER_HOLD_JITTER_MS = 5000;
const POINTER_HANDOFF = 0.2;
const POINTER_SMOOTHING = 0.6;
const TIME_PERIOD = 600;
const DEFAULT_COLOR: Rgb = [0.753, 0.541, 0.243];
const DEFAULT_PEAK = 0.32;

type Rgb = [number, number, number];
interface Point {
  x: number;
  y: number;
}

const clamp = (min: number, value: number, max: number) => Math.max(min, Math.min(value, max));
const easeFactor = (rate: number, dt: number) => 1 - Math.pow(1 - rate, dt * REFERENCE_FPS);
const pingPong = (t: number, period: number) => period - Math.abs((t % (2 * period)) - period);

function parseColor(value: string, fallback: Rgb): Rgb {
  const hex = value.trim().match(/^#([0-9a-f]{6})$/i);
  if (!hex) {
    if (value.trim()) console.warn(`pd: --glow-color должен быть в формате #rrggbb, получено «${value.trim()}»`);
    return fallback;
  }
  const n = parseInt(hex[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function createProgram(gl: WebGLRenderingContext): Uniforms | null {
  const shader = (type: number, source: string) => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (gl.getShaderParameter(s, gl.COMPILE_STATUS)) return s;
    if (!gl.isContextLost()) console.warn("pd: шейдер свечения не скомпилировался", gl.getShaderInfoLog(s));
    return null;
  };
  const vs = shader(gl.VERTEX_SHADER, VERTEX);
  const fs = shader(gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vs || !fs || !program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    if (!gl.isContextLost()) console.warn("pd: программа свечения не собралась", gl.getProgramInfoLog(program));
    return null;
  }
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "aPos");
  if (position < 0) return null;
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

  const uniforms = {} as Uniforms;
  for (const name of UNIFORMS) {
    const location = gl.getUniformLocation(program, name);
    if (!location) {
      console.warn(`pd: в шейдере свечения нет uniform ${name}`);
      return null;
    }
    uniforms[name] = location;
  }
  return uniforms;
}

function createWander() {
  const state = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, until: 0 };

  const pickTarget = (now: number, vw: number, vh: number, radius: number) => {
    const marginX = Math.min(vw * WANDER_MARGIN_X, radius * WANDER_MARGIN_RADII);
    state.tx = marginX + Math.random() * Math.max(1, vw - marginX * 2);
    state.ty = vh * WANDER_TOP + Math.random() * vh * WANDER_HEIGHT;
    state.until = now + WANDER_HOLD_MS + Math.random() * WANDER_HOLD_JITTER_MS;
  };

  return {
    position: state as Readonly<Point>,
    start(now: number, from: Point, velocity: Point, vw: number, vh: number, radius: number) {
      state.x = from.x;
      state.y = from.y;
      const speed = Math.hypot(velocity.x, velocity.y);
      const k = speed > WANDER_SPEED * 2 ? (WANDER_SPEED * 2) / speed : 1;
      state.vx = velocity.x * k;
      state.vy = velocity.y * k;
      pickTarget(now, vw, vh, radius);
    },
    step(now: number, dt: number, vw: number, vh: number, radius: number) {
      const dx = state.tx - state.x;
      const dy = state.ty - state.y;
      const dist = Math.hypot(dx, dy);
      if (dist < WANDER_ARRIVE || now > state.until) pickTarget(now, vw, vh, radius);
      const speed = WANDER_SPEED * Math.min(1, dist / WANDER_SLOWDOWN);
      const k = Math.min(1, dt * WANDER_STEER);
      state.vx += ((dist ? (dx / dist) * speed : 0) - state.vx) * k;
      state.vy += ((dist ? (dy / dist) * speed : 0) - state.vy) * k;
      state.x += state.vx * dt;
      state.y += state.vy * dt;
    },
  };
}

function followChain(chain: Point[], target: Point, dt: number, maxLink: number) {
  const head = chain[0];
  const kLead = easeFactor(LEAD, dt);
  const kFollow = easeFactor(FOLLOW, dt);
  head.x += (target.x - head.x) * kLead;
  head.y += (target.y - head.y) * kLead;
  for (let i = 1; i < chain.length; i++) {
    const prev = chain[i - 1];
    const cur = chain[i];
    cur.x += (prev.x - cur.x) * kFollow;
    cur.y += (prev.y - cur.y) * kFollow;
    const lx = cur.x - prev.x;
    const ly = cur.y - prev.y;
    const len = Math.hypot(lx, ly);
    if (len > maxLink) {
      cur.x = prev.x + (lx / len) * maxLink;
      cur.y = prev.y + (ly / len) * maxLink;
    }
  }
}

function createRenderer(root: HTMLElement, coarse: MediaQueryList) {
  const canvas = root.querySelector<HTMLCanvasElement>("[data-glow-canvas]");
  const fallback = root.querySelector<HTMLElement>("[data-glow-fallback]");
  const look = { color: DEFAULT_COLOR, peak: DEFAULT_PEAK };
  const chainData = new Float32Array(CHAIN * 2);
  const view = { width: window.innerWidth, height: window.innerHeight, radius: RADIUS_MIN };
  let gl: WebGLRenderingContext | null = null;
  let uniforms: Uniforms | null = null;

  const setup = () => {
    uniforms = gl ? createProgram(gl) : null;
    root.classList.toggle("is-gl", Boolean(uniforms));
  };

  if (canvas) {
    gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
    canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      uniforms = null;
      root.classList.remove("is-gl");
    });
    canvas.addEventListener("webglcontextrestored", () => {
      setup();
      resize();
    });
  }

  const readTheme = () => {
    const style = getComputedStyle(document.documentElement);
    look.color = parseColor(style.getPropertyValue("--glow-color"), DEFAULT_COLOR);
    const peak = parseFloat(style.getPropertyValue("--glow-peak"));
    look.peak = Number.isFinite(peak) ? peak : DEFAULT_PEAK;
  };

  const resize = () => {
    view.width = window.innerWidth;
    view.height = window.innerHeight;
    view.radius = clamp(RADIUS_MIN, view.width * RADIUS_VIEWPORT, RADIUS_MAX);
    if (canvas && gl) {
      const scale = Math.min(window.devicePixelRatio || 1, DPR_CAP) * (coarse.matches ? CANVAS_SCALE_COARSE : CANVAS_SCALE_FINE);
      canvas.width = Math.max(1, Math.round(view.width * scale));
      canvas.height = Math.max(1, Math.round(view.height * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    if (fallback) {
      const size = `${view.radius * FALLBACK_SIZE}px`;
      fallback.style.width = size;
      fallback.style.height = size;
    }
  };

  const draw = (chain: Point[], seconds: number) => {
    if (uniforms && gl && canvas) {
      chain.forEach((c, i) => {
        chainData[i * 2] = c.x;
        chainData[i * 2 + 1] = c.y;
      });
      gl.uniform2f(uniforms.uView, view.width, view.height);
      gl.uniform2f(uniforms.uCanvas, canvas.width, canvas.height);
      gl.uniform2fv(uniforms.uChain, chainData);
      gl.uniform1f(uniforms.uR, view.radius);
      gl.uniform1f(uniforms.uTime, pingPong(seconds, TIME_PERIOD));
      gl.uniform3fv(uniforms.uColor, look.color);
      gl.uniform1f(uniforms.uPeak, look.peak);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else if (fallback) {
      const size = view.radius * FALLBACK_SIZE;
      fallback.style.transform = `translate3d(${chain[0].x - size / 2}px, ${chain[0].y - size / 2}px, 0)`;
    }
  };

  setup();
  return { view: view as Readonly<typeof view>, readTheme, resize, draw };
}

export function initGlow(): void {
  const root = document.querySelector<HTMLElement>("[data-glow]");
  if (!root || root.dataset.ready) return;
  root.dataset.ready = "1";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const coarse = window.matchMedia("(pointer: coarse)");
  const renderer = createRenderer(root, coarse);
  const wander = createWander();
  const chain: Point[] = Array.from({ length: CHAIN }, () => ({ x: 0, y: 0 }));
  const pointer = { x: 0, y: 0, vx: 0, vy: 0, t: 0, active: false };

  let frame = 0;
  let last = 0;
  let lastDraw = 0;

  const restPoint = (): Point => ({ x: renderer.view.width / 2, y: Math.min(renderer.view.height * REST_Y_RATIO, REST_Y_MAX) });

  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    if (coarse.matches && now - lastDraw < COARSE_FRAME_MS) return;
    lastDraw = now;
    const dt = last ? Math.min(MAX_FRAME_SECONDS, (now - last) / 1000) : 1 / REFERENCE_FPS;
    last = now;
    const { width, height, radius } = renderer.view;
    if (!pointer.active) wander.step(now, dt, width, height, radius);
    followChain(chain, pointer.active ? pointer : wander.position, dt, radius * LINK);
    renderer.draw(chain, now / 1000);
  };

  const start = () => {
    if (frame || reduced.matches || document.hidden) return;
    last = 0;
    frame = requestAnimationFrame(tick);
  };

  const stop = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };

  const placeAtRest = () => {
    const r = restPoint();
    chain.forEach((c) => {
      c.x = r.x;
      c.y = r.y;
    });
    renderer.draw(chain, 0);
  };

  const startWanderFrom = (from: Point, velocity: Point) => {
    const { width, height, radius } = renderer.view;
    wander.start(performance.now(), from, velocity, width, height, radius);
  };

  const leave = () => {
    if (!pointer.active) return;
    pointer.active = false;
    startWanderFrom(chain[0], { x: pointer.vx * POINTER_HANDOFF, y: pointer.vy * POINTER_HANDOFF });
  };

  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse" || reduced.matches) return;
      const now = performance.now();
      const dtp = Math.max(1, now - pointer.t) / 1000;
      if (pointer.active) {
        pointer.vx = pointer.vx * POINTER_SMOOTHING + ((e.clientX - pointer.x) / dtp) * (1 - POINTER_SMOOTHING);
        pointer.vy = pointer.vy * POINTER_SMOOTHING + ((e.clientY - pointer.y) / dtp) * (1 - POINTER_SMOOTHING);
      }
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.t = now;
      pointer.active = true;
      start();
    },
    { passive: true },
  );

  document.addEventListener("pointerout", (e) => {
    if (!e.relatedTarget && e.pointerType === "mouse") leave();
  });
  window.addEventListener("blur", leave);

  window.addEventListener(
    "resize",
    () => {
      renderer.resize();
      if (reduced.matches) placeAtRest();
    },
    { passive: true },
  );

  reduced.addEventListener("change", () => {
    if (reduced.matches) {
      stop();
      placeAtRest();
    } else {
      start();
    }
  });

  coarse.addEventListener("change", () => renderer.resize());

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  new MutationObserver(() => {
    renderer.readTheme();
    if (!frame) renderer.draw(chain, 0);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  renderer.readTheme();
  renderer.resize();
  placeAtRest();
  startWanderFrom(chain[0], { x: 0, y: 0 });
  start();
}
