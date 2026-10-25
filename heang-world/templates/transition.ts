import type { Transition } from "../types";

/**
 * TEMPLATE — copy to src/transitions/fx/<id>.ts. It joins the random pool automatically.
 * When run() starts the page underneath is ALREADY the new world; the old world is only
 * visible through c.ghost() copies. Remove them in your own way, fast (≤ 600 ms of motion).
 */
const __id__: Transition = {
  id: "__id__",
  name: "__NAME__", // shown on the stamp as "via __NAME__"
  async run(c) {
    const g = c.ghost(); // the copy already covering the screen; call again for more copies
    const fx = c.fx(); // canvas above everything, for light in c.accent
    await Promise.all([
      c.animate(g, [{ opacity: 1 }, { opacity: 0 }], { duration: 300, easing: "cubic-bezier(.7,0,.9,.5)" }),
      c.frames(300, (t) => {
        fx.clearRect(0, 0, c.w, c.h);
        fx.fillStyle = c.alpha(c.accent, 0.3 * (1 - t));
        fx.fillRect(0, 0, c.w, c.h);
      }),
    ]);
  },
};
export default __id__;
