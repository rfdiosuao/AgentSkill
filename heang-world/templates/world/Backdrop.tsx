import { useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

/**
 * TEMPLATE live backdrop. Fills the fixed world layer (position:absolute; inset:0 is set by the parent).
 * Rules: follow the pointer a little, stop animating under reduced motion, clean up listeners.
 * For a 3D hero object, render <ArtifactScene variant=… /> from src/components/lab/ArtifactScene.tsx
 * (or add a variant there) instead of a canvas.
 */
export default function Backdrop() {
  const ref = useRef<HTMLCanvasElement>(null);
  const still = useReducedMotion() ?? false;
  useEffect(() => {
    const c = ref.current!,
      ctx = c.getContext("2d")!;
    let raf = 0;
    const resize = () => {
      const d = Math.min(devicePixelRatio || 1, 2);
      c.width = innerWidth * d;
      c.height = innerHeight * d;
      c.style.width = innerWidth + "px";
      c.style.height = innerHeight + "px";
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    const draw = (t: number) => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      // paint here
      void t;
      if (!still) raf = requestAnimationFrame(draw);
    };
    resize();
    addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);
    return () => (cancelAnimationFrame(raf), removeEventListener("resize", resize));
  }, [still]);
  return <canvas ref={ref} className="absolute inset-0" />;
}
