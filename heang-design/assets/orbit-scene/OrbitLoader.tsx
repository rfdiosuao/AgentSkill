import { motion, useReducedMotion } from "motion/react";

/** Loading state: a planet travelling the logo's tilted orbit. */
export function OrbitLoader({ size = 88, label = "加载中" }: { size?: number; label?: string }) {
  const still = useReducedMotion();
  return (
    <div role="status" aria-label={label} data-heang-loading className="relative grid place-items-center" style={{ width: size, height: size }}>
      <div className="absolute inset-0 -rotate-[18deg] scale-y-50">
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-edge" />
        <motion.div
          className="absolute inset-0"
          animate={still ? undefined : { rotate: 360 }}
          transition={{ duration: 2.4, ease: "linear", repeat: Infinity }}
        >
          <span className="absolute left-1/2 top-0 size-3.5 -translate-x-1/2 -translate-y-1/2 scale-y-[2] rounded-full border-2 border-navy bg-primary" />
        </motion.div>
      </div>
      <span className="size-6 rounded-full border-2 border-navy bg-accent" />
    </div>
  );
}
