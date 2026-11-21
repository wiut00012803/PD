const FOLLOW = 0.075;
const RETURN = 0.03;

export function initGlow(): void {
  const el = document.querySelector<HTMLElement>("[data-glow]");
  if (!el || el.dataset.ready) return;
  el.dataset.ready = "1";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  let width = 0;
  let height = 0;
  let x = 0;
  let y = 0;
  let targetX = 0;
  let targetY = 0;
  let pointerActive = false;
  let frame = 0;
  let last = 0;

  const rest = () => ({ x: window.innerWidth / 2, y: finePointer.matches ? -height * 0.04 : window.innerHeight * 0.12 });

  const measure = () => {
    const rect = el.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
  };

  const apply = () => {
    el.style.translate = "none";
    el.style.transform = `translate3d(${x - width / 2}px, ${y - height / 2}px, 0)`;
  };

  const tick = (now: number) => {
    const dt = last ? Math.min(64, now - last) : 16.7;
    last = now;
    if (!pointerActive && !finePointer.matches && !reduced.matches) {
      const t = now / 1000;
      const r = rest();
      targetX = r.x + Math.sin(t * 0.21) * window.innerWidth * 0.22 + Math.sin(t * 0.07) * window.innerWidth * 0.06;
      targetY = r.y + Math.sin(t * 0.17 + 1.3) * window.innerHeight * 0.1;
    }
    const k = 1 - Math.pow(1 - (pointerActive ? FOLLOW : RETURN), dt / 16.7);
    x += (targetX - x) * k;
    y += (targetY - y) * k;
    apply();
    const settled = Math.abs(targetX - x) < 0.3 && Math.abs(targetY - y) < 0.3;
    if (settled && (finePointer.matches || reduced.matches)) {
      frame = 0;
      last = 0;
      return;
    }
    frame = requestAnimationFrame(tick);
  };

  const run = () => {
    if (!frame) frame = requestAnimationFrame(tick);
  };

  const reset = (snap = false) => {
    measure();
    const r = rest();
    targetX = r.x;
    targetY = r.y;
    if (snap) {
      x = targetX;
      y = targetY;
      apply();
    }
    if (!reduced.matches) run();
  };

  window.addEventListener(
    "pointermove",
    (e) => {
      if (e.pointerType !== "mouse" || reduced.matches) return;
      pointerActive = true;
      targetX = e.clientX;
      targetY = e.clientY;
      run();
    },
    { passive: true },
  );

  document.documentElement.addEventListener("pointerleave", () => {
    pointerActive = false;
    reset();
  });

  window.addEventListener("resize", () => reset(), { passive: true });
  reduced.addEventListener("change", () => reset(true));
  finePointer.addEventListener("change", () => reset());

  reset(true);
}
