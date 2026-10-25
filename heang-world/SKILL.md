---
name: heang-world
description: OPTIONAL module of 宇航.design (see the heang-design skill for the required base). Add a new UI world (a complete visual style) or a new world-switch transition to 宇航.design / heang-design. Use when the user asks for a new 世界/次元/UI 风格/主题, sends reference screenshots of a look they want added, wants another 切换动效, or asks to change how the random world switcher behaves.
---

# heang-world

> Optional. The required base of every project (太空少年 style, pointer interactions, logo splash) is in the
> `heang-design` skill; world switching is only added when the user asks for it.

宇航.design shows one page in many **worlds**. The content and layout never change; a world
restyles everything through tokens + scoped CSS and paints its own backdrop. Clicking anywhere
(while 切换模式 is on) jumps to a random world with a random **transition**.

Project root: the `heang-design/` folder that contains this `.claude/`.

## The pieces

| What | Where | Registered by |
|---|---|---|
| World definition | `src/worlds/<id>/index.ts` | `import.meta.glob` in `src/worlds/registry.ts` — just create the folder |
| World look | `src/worlds/<id>/world.css` (imported by its index.ts) | — |
| Live backdrop (optional) | `src/worlds/<id>/Backdrop.tsx` | `backdrop: () => import("./Backdrop")` |
| 3D hero object (optional) | add a variant to `src/components/lab/ArtifactScene.tsx` | used from a Backdrop |
| Transition | `src/transitions/fx/<id>.ts` | `import.meta.glob` in `src/transitions/engine.ts` |
| Paintings / videos | `public/dims/` | referenced from `image` / `video` |
| Fonts | the Google Fonts `<link>` in `index.html` | — |

Contracts: `src/worlds/types.ts` (WorldDef) and `src/transitions/types.ts` (TransitionCtx).
World `01` (`cadet`, 太空少年) is the default every visit starts in; its tokens live in
`src/tokens/tokens.css` because public sites use them as the base set. Don't renumber it.

## Add a world

1. **Read the brief.** From the user's words or reference images, name: ground color, one accent,
   display face, what sits behind the page (painting, video, or something drawable live), and the
   one detail that makes it unmistakable (vertical CJK, HUD chamfers, a seal, a glowing ring…).
   Reference screenshots with text baked in can't be used as backdrops — ask for the clean
   image/video, or draw the hero object live (canvas / `ArtifactScene`).
2. **Copy the templates**: `templates/world/*` → `src/worlds/<id>/`. Replace every `__PLACEHOLDER__`.
   `no` = next free two-digit number.
3. **Tokens first** (`world.css` block 1). Set every token; the template lists them all.
   `--h-r-pill` controls how round buttons are, `--h-bw` border weight, `--h-sh*` shadows.
4. **Redraw** (block 3) through the hook classes only — never edit components for one world:
   `h1`, `h1 mark`, `h1 > i` (the title's end dot), `h2`, `.kv`, `.h-badge`, `.h-badge--sun`,
   `.h-prompt`, `.h-btn`, `.h-btn--primary`, `.h-btn--term`, `.stk` (every card),
   `.h-bar` (sticky top bar — keep it readable: translucent + blur), `.h-bar b`, `.h-bar svg` (logo),
   `.h-nav`, `.h-nav[aria-current="page"]`, `.kbd`, `.h-account`, `.h-chip`, `.h-sechead`, `.h-status`.
   Keep the `@scope ([data-dim="<id>"]) to ([data-dim])` wrapper: the transition's frozen copy of the
   previous world sits inside the page, and the lower boundary is what stops styles leaking into it.
5. **Backdrop.** Painting → `image`. Video → `video` (+ `image` as poster), muted loop, ≤ 5 MB,
   10–20 s, slow push-in. Live → `Backdrop.tsx` from the template; follow the pointer a little,
   freeze under `prefers-reduced-motion`. Tune `.dim-world__shade` so text on the left stays legible,
   and add a `@media (max-width: 900px)` veil if the subject crosses the text on phones.
6. **Fonts**: add any new family to the `<link>` in `index.html`, with a real fallback stack.
7. **Verify** (see below).

## Add a transition

1. Copy `templates/transition.ts` → `src/transitions/fx/<id>.ts`.
2. The page underneath is already the new world. Remove the old world using `c.ghost()` copies
   (clip-path, mask, transform, filter), light it with `c.fx()` in `c.accent`. `c.origin` is the click.
3. Rules the user set — don't break them:
   - **Fast and discrete.** ≤ 600 ms of motion, hard stops, staggered hits ("啪叽啪叽"). No slow reveals.
   - No page-curl, no decoration that stays on screen after the switch.
   - Everything you create is removed by the engine; don't leave timers running past `run()`.
4. Try it from the TRANSITIONS row on the page (it forces that transition).

## Verify

Run from the project root:

```bash
npx tsc --noEmit && npx vite build
```

Then in the preview (`npm run dev`):
- Set `document.documentElement.dataset.dim = "<id>"` and check the hero, the bar, a section of
  cards and the status bar, at desktop width and at ~400 px.
- Run every transition into and out of the new world and confirm no errors and no leftovers:
  ```js
  const { switchWorld, TRANSITIONS, randomWorld } = await import('/src/transitions/engine.ts');
  for (const t of TRANSITIONS) await switchWorld(randomWorld(document.documentElement.dataset.dim), { transition: t.id });
  document.querySelectorAll('.dim-ghost,.dim-fx').length // → 0
  ```
- The Claude browser pane's screenshots lag behind fast animation and mis-map clicks under viewport
  emulation; judge motion in a real browser and click-test at the pane's native size.

## Behaviour of the switcher (don't regress)

- Every visit starts in world 01 太空少年 (`restoreMode()` forces it).
- 切换模式 defaults to on; the choice is remembered (`localStorage["heang-switch"]`).
- While on, any click switches — except inside `[data-switch-ignore]` (the 打开/关闭切换 control,
  the world picker, the transition row), form fields and dialogs. Mark new controls that must keep
  working with `data-switch-ignore`.
- Random world never repeats the current one; random transition never repeats the last one.
