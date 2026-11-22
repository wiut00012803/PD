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
uniform vec2 uChain[4];
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

const LEAD = 0.05;
const FOLLOW = 0.11;
const LINK = 0.42;
const CHAIN = 4;
const WANDER_SPEED = 46;
const WANDER_STEER = 0.7;

type Rgb = [number, number, number];

function parseColor(value: string, fallback: Rgb): Rgb {
  const hex = value.trim().match(/^#([0-9a-f]{6})$/i);
  if (!hex) return fallback;
  const n = parseInt(hex[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function compile(gl: WebGLRenderingContext): Record<string, WebGLUniformLocation | null> | null {
  const shader = (type: number, source: string) => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, source);
    gl.compileShader(s);
    return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
  };
  const vs = shader(gl.VERTEX_SHADER, VERTEX);
  const fs = shader(gl.FRAGMENT_SHADER, FRAGMENT);
  const program = gl.createProgram();
  if (!vs || !fs || !program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
  gl.useProgram(program);

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const names = ["uView", "uCanvas", "uChain", "uR", "uTime", "uColor", "uPeak"];
  return Object.fromEntries(names.map((n) => [n, gl.getUniformLocation(program, n)]));
}

export function initGlow(): void {
  const root = document.querySelector<HTMLElement>("[data-glow]");
  if (!root || root.dataset.ready) return;
  root.dataset.ready = "1";

  const canvas = root.querySelector<HTMLCanvasElement>("[data-glow-canvas]");
  const fallback = root.querySelector<HTMLElement>("[data-glow-fallback]");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  let gl: WebGLRenderingContext | null = null;
  let uniforms: ReturnType<typeof compile> = null;
  if (canvas) {
    gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, powerPreference: "low-power" });
    uniforms = gl ? compile(gl) : null;
    if (uniforms) root.classList.add("is-gl");
    canvas.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      uniforms = null;
      root.classList.remove("is-gl");
    });
  }

  let vw = window.innerWidth;
  let vh = window.innerHeight;
  let radius = 200;

  const chain = Array.from({ length: CHAIN }, () => ({ x: 0, y: 0 }));
  const head = chain[0];
  const chainData = new Float32Array(CHAIN * 2);
  const pointer = { x: 0, y: 0, vx: 0, vy: 0, t: 0, active: false };
  const wander = { x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, until: 0 };
  const look = { color: [0.753, 0.541, 0.243] as Rgb, peak: 0.32 };

  const readTheme = () => {
    const s = getComputedStyle(document.documentElement);
    look.color = parseColor(s.getPropertyValue("--glow-color"), look.color);
    const peak = parseFloat(s.getPropertyValue("--glow-peak"));
    if (Number.isFinite(peak)) look.peak = peak;
  };

  const resize = () => {
    vw = window.innerWidth;
    vh = window.innerHeight;
    radius = Math.max(140, Math.min(vw * 0.17, 250));
    if (canvas && gl) {
      const scale = Math.min(window.devicePixelRatio || 1, 2) * 0.5;
      canvas.width = Math.max(1, Math.round(vw * scale));
      canvas.height = Math.max(1, Math.round(vh * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    if (fallback) {
      fallback.style.width = `${radius * 3}px`;
      fallback.style.height = `${radius * 3}px`;
    }
  };

  const restPoint = () => ({ x: vw * 0.5, y: Math.min(vh * 0.1, 90) });

  const pickWanderTarget = (now: number) => {
    const marginX = Math.min(vw * 0.15, radius * 1.4);
    wander.tx = marginX + Math.random() * Math.max(1, vw - marginX * 2);
    wander.ty = vh * 0.08 + Math.random() * vh * 0.6;
    wander.until = now + 6000 + Math.random() * 5000;
  };

  const startWander = (now: number, x: number, y: number, vx = 0, vy = 0) => {
    wander.x = x;
    wander.y = y;
    const speed = Math.hypot(vx, vy);
    const k = speed > WANDER_SPEED * 2 ? (WANDER_SPEED * 2) / speed : 1;
    wander.vx = vx * k;
    wander.vy = vy * k;
    pickWanderTarget(now);
  };

  const stepWander = (now: number, dt: number) => {
    const dx = wander.tx - wander.x;
    const dy = wander.ty - wander.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 60 || now > wander.until) pickWanderTarget(now);
    const speed = WANDER_SPEED * Math.min(1, dist / 220);
    const k = Math.min(1, dt * WANDER_STEER);
    wander.vx += ((dist ? (dx / dist) * speed : 0) - wander.vx) * k;
    wander.vy += ((dist ? (dy / dist) * speed : 0) - wander.vy) * k;
    wander.x += wander.vx * dt;
    wander.y += wander.vy * dt;
  };

  const draw = (time: number) => {
    if (uniforms && gl && canvas) {
      gl.uniform2f(uniforms.uView, vw, vh);
      gl.uniform2f(uniforms.uCanvas, canvas.width, canvas.height);
      chain.forEach((c, i) => {
        chainData[i * 2] = c.x;
        chainData[i * 2 + 1] = c.y;
      });
      gl.uniform2fv(uniforms.uChain, chainData);
      gl.uniform1f(uniforms.uR, radius);
      gl.uniform1f(uniforms.uTime, time % 1000);
      gl.uniform3fv(uniforms.uColor, look.color);
      gl.uniform1f(uniforms.uPeak, look.peak);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else if (fallback) {
      const size = radius * 3;
      fallback.style.transform = `translate3d(${head.x - size / 2}px, ${head.y - size / 2}px, 0)`;
    }
  };

  let frame = 0;
  let last = 0;

  const tick = (now: number) => {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
    last = now;
    let tx: number;
    let ty: number;
    if (pointer.active) {
      tx = pointer.x;
      ty = pointer.y;
    } else {
      stepWander(now, dt);
      tx = wander.x;
      ty = wander.y;
    }
    const kLead = 1 - Math.pow(1 - LEAD, dt * 60);
    const kFollow = 1 - Math.pow(1 - FOLLOW, dt * 60);
    head.x += (tx - head.x) * kLead;
    head.y += (ty - head.y) * kLead;
    const maxLink = radius * LINK;
    for (let i = 1; i < CHAIN; i++) {
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
    draw(now / 1000);
    frame = requestAnimationFrame(tick);
  };

  const start = () => {
    if (!frame && !reduced.matches && !document.hidden) {
      last = 0;
      frame = requestAnimationFrame(tick);
    }
  };

  const stop = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };

  const placeAtRest = () => {
    const r = restPoint();
    for (const c of chain) {
      c.x = r.x;
      c.y = r.y;
    }
    draw(0);
  };

  const leave = () => {
    if (!pointer.active) return;
    pointer.active = false;
    startWander(performance.now(), head.x, head.y, pointer.vx * 0.2, pointer.vy * 0.2);
  };

  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse" || reduced.matches) return;
      const now = performance.now();
      const dtp = Math.max(1, now - pointer.t) / 1000;
      if (pointer.active) {
        pointer.vx = pointer.vx * 0.6 + ((e.clientX - pointer.x) / dtp) * 0.4;
        pointer.vy = pointer.vy * 0.6 + ((e.clientY - pointer.y) / dtp) * 0.4;
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
      resize();
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

  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  new MutationObserver(() => {
    readTheme();
    if (!frame) draw(0);
  }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  readTheme();
  resize();
  placeAtRest();
  startWander(performance.now(), head.x, head.y);
  start();
}
