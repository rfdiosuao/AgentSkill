/**
 * Minimal stand-ins for heang-design's src/lib/hooks.ts, so OrbitScene can live in any React project.
 * Same contract: data-mode="sky" | "space" on <html> wins, otherwise the OS light/dark preference.
 * data-dim (world) is read as-is; without 宇航.design worlds it is simply absent.
 */
import { useSyncExternalStore } from "react";

export type Mode = "sky" | "space";

const darkQuery = () => window.matchMedia("(prefers-color-scheme: dark)");

function readMode(): Mode {
  const forced = document.documentElement.dataset.mode;
  if (forced === "sky" || forced === "space") return forced;
  return darkQuery().matches ? "space" : "sky";
}

function subscribe(cb: () => void) {
  const q = darkQuery();
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode", "data-dim"] });
  q.addEventListener("change", cb);
  return () => {
    mo.disconnect();
    q.removeEventListener("change", cb);
  };
}

export function useMode(): [Mode] {
  return [useSyncExternalStore(subscribe, readMode, () => "sky" as Mode)];
}

const readDim = () => document.documentElement.dataset.dim ?? "cadet";

/** Changes whenever mode or world changes; the scene re-reads its colors from CSS tokens then. */
export function useThemeKey(): string {
  const [mode] = useMode();
  return `${useSyncExternalStore(subscribe, readDim, () => "cadet")}:${mode}`;
}

export function cssVar(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
