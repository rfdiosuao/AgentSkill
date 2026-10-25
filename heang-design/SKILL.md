---
name: heang-design
description: 宇航.design — 宇航（贺昂 / HEANG）的个人设计系统。Use whenever you design or build any UI, website, page, landing page, dashboard, app screen or component for 宇航 / HEANG / heang.top / 星钥 StarKey / MODE II / LOOM, or whenever the user says 用我的风格、宇航 design、宇航.design、太空少年、太空男孩、我的设计 Skill. Gives the default 太空少年 (cadet) style, the two required motion modules (logo loading splash + the water-ripple gravity dot field), the 3D components, and the optional world switcher.
---

# 宇航.design

Every project built "in 宇航's style" gets the same base: the **太空少年 (cadet)** look, a **logo loading splash**
when the page is heavy, and **passive pointer interactions** everywhere. World switching is an extra.

Project root: the `heang-design/` folder that contains this `.claude/`. Source of truth for tokens and components
lives there; this skill tells you which pieces are required and how to wire them.

## What every project gets

| Module | Status | Where |
|---|---|---|
| 太空少年 cadet style (tokens, type, sticker cards, dot grid) | **required, default** | `src/tokens/tokens.css`, `src/index.css`, spec in `references/cadet.md` |
| Water field: gravity + ripples in the dot grid | **required, always on** | `src/motion/field.ts` (`GravityField` wraps it) |
| Logo loading splash → flies to the header logo | **required when the page has heavy resources** | `src/motion/splash.html` + `src/motion/splash.ts` |
| 3D components (头像星系 OrbitScene, artifacts, gravity field) | use where it serves the page | `src/components/lab/`, `assets/orbit-scene/` (portable), see `references/3d.md` |
| World switching (click-anywhere random UI worlds) | **optional, off by default** | the `heang-world` skill |

Don't ask whether to include the two required modules; include them. Ask only about optional ones.

## 1. Default style: 太空少年 (cadet)

Read `references/cadet.md` before designing. The short version:

- Sky ground `#CFE3FF` with a 22px navy dot grid; deep-space dark mode `#0A1233`.
- Navy ink and edges `#0F2044`; sun-yellow accent `#FFD23F` (highlights, primary actions); candy pink `#FF93B4` for the
  hero CTA; fog blue `#9AB8E7`.
- Sticker objects: 2px navy border, 18px radius, hard offset shadow `4px 4px 0` navy (`.stk`). Pill buttons.
- Type: Unbounded (display, Latin), Noto Sans SC 900 (headings), Noto Sans SC (body), JetBrains Mono (labels, data).
- IP devices: the −18° orbit ellipse, `HA-xx` codes, `T−days` to 2040, a sun-yellow `<mark>` on one word of the
  headline, the astronaut avatar, small planet dots.
- In a project inside `heang-design/`, import `src/index.css` and use the components in `src/components/base/`.
  Outside it, copy `src/tokens/tokens.css` and follow the spec; never invent a parallel palette.

## 2. Required: the water field (passive pointer interaction)

The interaction lives **in the background dot grid**, never on top of the UI. 宇航 rejected floating cursor effects
(orbit cursor ring, magnetic buttons, card tilt, spotlight, click bursts): don't add them back.

- **gravity** — dots within ~180px are drawn gently toward the pointer (smoothstep falloff, ≤ 7px), grow and brighten
  (sun yellow at the core).
- **wake** — moving the pointer leaves small, evenly spaced concentric ripples (every ~72px / 120ms).
- **drop** — a click or tap drops a strong ripple: regular crests and troughs two grid steps apart (44px) travelling
  outward at ~420px/s and fading over 1.7s, like a drop in water.
- **grid variant** (`style: "grid"`) — summon.entermodetwo.com-style square cells (44px) that light up near the pointer,
  hold ~0.4s, fade, and ring outward from a click. Use it when the user asks for the 方格 look.

Wiring (React/Vite in this repo): render `<GravityField variant="calm" />` while the cadet world is active (all sites
already do), or call `initField()` from `src/motion` once. One fixed canvas behind the page; page content must sit above
it (`relative z-[1]` wrapper). It follows light/dark through the tokens, draws only while something moves, sleeps in
hidden tabs, shows a still grid under reduced motion, and steps aside in non-default worlds. Outside this repo:
`npm install heang-design` → `initField()`.

Ordinary hover/press feedback stays as CSS (`.press`, `.lift`).

## 3. Required when heavy: logo loading splash

**When:** the page loads anything heavy — Three.js / 3D, video, big images or galleries, a large JS bundle, or data
the first screen depends on. Light text pages (docs, blog posts, tool lists) skip it.

**Behaviour (don't change these):**
1. The site's logo sits mid-screen at medium size (88px) on the site's own dotted ground, a white arc spinning
   around it (with a faint navy glow so it reads on light blue).
2. When the page is really ready, the ring fades and the logo **flies smoothly onto the header logo** (FLIP:
   translate + scale, 640ms `cubic-bezier(.65,0,.25,1)`), lands exactly on it, then the backdrop dissolves (420ms).
3. At least 0.7s so it reads as a moment, at most 8s so it never holds the page hostage; a CSS failsafe clears it
   after 9s even without JS; reduced motion skips the flight and just fades.

**Wiring:**
1. Paste `src/motion/splash.html` right after `<body>` in the page's `index.html` (it must paint before any JS).
   The logo inside `.hs-mark` must be the **same artwork** as the header logo.
2. Mark the header logo element with `data-heang-logo` (`HeangBar` already does).
3. Anything heavy marks itself `data-heang-loading` while it loads (the `OrbitLoader` Suspense fallback already does),
   so the splash waits for it.
4. Call `runSplash()` in `main.tsx` after `createRoot(...).render(...)`.

Reference implementation: `sites/heang-top/` (index.html + main.tsx). Non-React reference: the NewAPI injection
`sites/newapi-theme/heang-splash.js` (same behaviour, finds the app's logo by position).

## 4. 3D components

See `references/3d.md`. Default picks:
- **OrbitScene（头像星系）** — the signature from heang.top: 宇航's astronaut avatar in the centre, every HEANG site
  as a planet and every open-source project as a moon on −18° orbits, draggable, click to open. Lazy-load it behind
  `<Suspense fallback={<OrbitLoader/>}>` so the splash waits for it. **Portable package for any other project:**
  `assets/orbit-scene/` (component + loader + HEANG bodies + avatar + README with install and usage).
- **GravityField** (`variant="calm"`) — the dot grid bending around the pointer; use on cadet pages as the backdrop.
- **ArtifactScene** — single hero objects (`rock`, `core`) for world backdrops.
- **OrbitLoader** — inline loading state for any lazy section.

## 5. Optional: world switching

Only when the user asks for it (or for a showcase like 宇航.design): `initSwitching(true|false)` from
`src/lib/switcher.ts` plus the switch control in `HeangBar`. Public sites start with it **off**. To add worlds or
transitions use the `heang-world` skill.

## New projects outside heang-design: use the npm package

`npm install heang-design` (published by 宇航, source `heang-design/packages/heang-design`). It ships `initField`,
`runSplash`, `heang-design/orbit` (OrbitScene, OrbitLoader, heangBodies), and `tokens.css` / `motion.css` /
`tailwind.css` / `splash.html` / `avatar.jpg`. With Tailwind v4: `@import "tailwindcss"; @import "heang-design/tailwind.css";`.
To release a new version: bump `version`, `npm publish --access public` from that folder (宇航's account has 2FA:
he approves in the browser; run it in his terminal, never handle the code yourself). Re-copy changed sources into
`packages/heang-design/src` first.

## Other stacks (plain HTML, VitePress, injected into third-party apps)

- Copy `src/tokens/tokens.css` and the needed parts of `src/index.css` (`.stk`, `.press`, `.lift`, `.kv`).
- Water field: bundle `src/motion/field.ts` to a vanilla script
  (`npx esbuild src/motion/standalone.ts --bundle --format=iife --minify --outfile=dist/heang-motion.js`); it starts
  `initField()` by itself. Needs the tokens on the page (for colors) and content above the canvas.
- Splash: paste `splash.html`, call `runSplash({ target: "<your logo selector>" })`, or adapt `heang-splash.js` when
  you can't touch the app's code (it targets the logo by position).

## Verify before you hand it over

1. Load the page in a **visible** browser tab (a hidden tab freezes transitions): the splash shows instantly, waits
   for heavy parts, the logo lands exactly on the header logo, nothing jumps after it disappears.
2. Move the pointer over empty ground (dots gather and a light wake follows), click (a regular ripple spreads);
   content stays above the field and stays clickable.
3. Touch emulation (a tap ripples) and `prefers-reduced-motion` (still grid, no flight): page fully usable.
4. Dark mode and phone width (≈ 390px): splash ground, ring and cards stay legible; no horizontal scroll.
