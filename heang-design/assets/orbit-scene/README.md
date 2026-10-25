# OrbitScene — 宇航的头像星系（可复用包）

heang.top 首页那个 3D 场景：宇航的宇航员头像在中心，HEANG 各个站点作为行星、开源项目作为卫星，沿 −18° 的倾斜轨道
环绕，外圈有小行星带；可以拖动旋转，悬停 / 点击星球显示名字并打开对应网站。

This folder is a self-contained copy for projects outside `heang-design/`. Inside heang-design, import the original
from `src/components/lab/OrbitScene.tsx` instead (this copy is generated from it; re-copy after changing the original).

## Files

| File | What |
|---|---|
| `OrbitScene.tsx` | the scene (React Three Fiber). Props: `bodies`, `avatar`, `className` |
| `OrbitLoader.tsx` | the inline loading state; marks `data-heang-loading` so a page splash waits for the scene |
| `bodies.ts` | the HEANG registry: `SITES`, `PROJECTS`, `heangBodies(except?)` |
| `heang-3d.ts` | minimal light/dark + token hooks the scene needs |
| `orbit-scene.css` | label show/hide rules |
| `avatar.jpg` | 宇航's astronaut avatar (put it in the project's `public/`) |

## Install

```bash
npm install three @react-three/fiber @react-three/drei motion
```

Styling: the scene reads 宇航.design CSS tokens (`--h-3d-edge`, `--h-*` colors) and its labels use the design system's
Tailwind utilities (`bw`, `sh-xs`, `r-pill`, `border-edge`, `bg-card`, `text-ink`, `bg-accent`…). Copy
`heang-design/src/tokens/tokens.css` and the `@theme` / utility parts of `heang-design/src/index.css` into the project
(any 宇航.design project already has them), and import `orbit-scene.css`.

## Use

```tsx
import { lazy, Suspense } from "react";
import { OrbitLoader } from "./orbit-scene/OrbitLoader";
import { heangBodies } from "./orbit-scene/bodies";
import "./orbit-scene/orbit-scene.css";

// Three.js is heavy: always lazy-load, so the first screen and the splash aren't blocked by it
const OrbitScene = lazy(() => import("./orbit-scene/OrbitScene").then((m) => ({ default: m.OrbitScene })));

export function Hero() {
  return (
    // place-items-center avoids a canvas height feedback loop inside grids
    <div className="grid place-items-center">
      <Suspense fallback={<OrbitLoader size={120} label="星系加载中" />}>
        <OrbitScene bodies={heangBodies()} avatar="/avatar.jpg" />
      </Suspense>
    </div>
  );
}
```

- `heangBodies("HA-00")` = every HEANG site except the one you're on (inner orbits, larger, labelled) plus every
  open-source project (outer orbits, small moons, label on hover). Pass your own `OrbitBody[]` for other content:
  `{ name, code, href, color, kind?: "sphere" | "ring" | "gem" | "sat", tier?: "major" | "minor", pinLabel? }`.
- Keep pinned labels to about four, or the scene gets crowded.
- The scene pauses when scrolled off screen and stops auto-rotating under `prefers-reduced-motion`.
- On a page with this scene, the 宇航.design logo splash is required (see the skill's SKILL.md §3): the
  `OrbitLoader` fallback holds the splash until the scene has loaded.
