# 太空少年 · CADET — 宇航.design 的默认风格

World `01`. Every HEANG project starts here unless the user asks for another world. Token source of truth:
`src/tokens/tokens.css` (`:root:not([data-dim]), [data-dim="cadet"]`). If a value below and the file disagree, the
file wins; update this page.

## Mood

A teenage astronaut's mission notebook: sky-blue ground, navy ink, sun-yellow stickers, hand-placed planets.
Playful but precise, like a geek's well-labelled kit. Bright and friendly in light mode; deep space at night.

## Color

| Token | Sky (light) | Space (dark) | Use |
|---|---|---|---|
| `--h-bg` | `#CFE3FF` | `#0A1233` | page ground |
| `--h-bg-dot` | `rgba(15,32,68,.13)` | `rgba(190,210,255,.09)` | 22px dot grid on the ground |
| `--h-card` | `#FFFFFF` | `#141F4A` | sticker surfaces |
| `--h-ink` | `#0F2044` | `#EAF1FF` | text |
| `--h-muted` | `#4A5A7C` | `#9DADD6` | secondary text |
| `--h-edge` / `--h-shadow` | `#0F2044` | `#DCE6FF` / `#02061A` | borders / hard shadows |
| `--h-accent` | `#FFD23F` | same | sun yellow: highlight, primary action, focus |
| `--h-primary` | `#FF93B4` | same | candy pink: the one hero CTA |
| `--h-brand` | `#2F4B73` | `#9AB8E7` | links, brand blue |
| `--h-term` | `#0F2044` | `#050A20` | terminal / code blocks, fg `#DDE8FF` |
| `--h-fog` | `#9AB8E7` | — | planets, soft fills |

Planet colors, one per site: 主页 `#FFD23F`, MODE II `#FF93B4`, LOOM `#3FD9A6`, Lumi/星钥 `#5FD3F3`, 星匣 `#9C8CFF`,
服呢 `#FFA53D`, 唤名 `#B9ED08`, 拾光 `#FF7A5C`, AI 导航 / 文档 `#2F4B73`. Semantic colors stay separate from the accent.

## Type

| Role | Face | Notes |
|---|---|---|
| Display (Latin, numbers) | Unbounded 700–800 | big numbers, brand words like "StarKey" |
| Headings (CJK) | Noto Sans SC **900** | `text-wrap: balance`, tight leading 1.05–1.2 |
| Body | Noto Sans SC 400 | 15–16px, line-height 1.7–1.8, ~32–36em measure |
| Labels / data | JetBrains Mono 500–700 | uppercase `.kv` labels with .12em tracking, codes, prices |

Self-host Noto Sans SC and JetBrains Mono (`src/fonts.ts`, @fontsource) — Google's mainland endpoints are unreliable.

## Shape and depth

- Border `2px` (`--h-bw`), thin `1.5px`. Radius `18px` cards, `10px` inputs/terminals, `6px` badges, pills for buttons.
- Hard offset shadows, never blurred: `--h-sh-sm 3px 3px 0`, `--h-sh 4px 4px 0`, `--h-sh-lg 6px 6px 0`, press `1px 1px 0`.
- `.stk` = card/sticker; `.press` = button feel (hover lifts −1px, active presses +2px); `.lift` = card hover lift.
- Ground: flat color + dot grid. No gradients on surfaces except the spotlight and soft glows.

## Components (in `src/components/base/`)

`HeangBar` (sticky sticker strip, logo with `data-heang-logo`, ⌘K site jumper, account), `Button` / `LinkButton`
(variants: `primary` pink, `secondary` white, `sun` yellow, `ghost` dashed, `term` mono `$` prompt), `Badge`
(`plain`, `online` green dot, `beta`, `sun`), `Planet`, `StarDot`, `SiteCard`, `StatusBar`, `Comments`, `Input`.

## IP devices (use at least one per page)

- **The −18° orbit**: a tilted ellipse around a planet; logos, loaders, bursts and 3D orbits all use −18°.
- **HA codes**: every site/section has `HA-xx` (HA-00 主页, HA-KEY 星钥 …) shown as a mono label.
- **T−days to 2040**: the long goal (去一次太空), shown as a countdown or stat.
- **Sun `<mark>`**: exactly one word of a headline on a sun-yellow block.
- **End dot**: headings may end with a small fog-blue circle (`h1 > i`).
- **Astronaut avatar** and small planet dots as markers instead of icons or emoji.

## Motion

Durations `--h-dur-m1 140ms` (micro), `m2 480ms` (reveals), `m3 900ms` (scenes); ease `--h-ease-out`
`cubic-bezier(.22,1,.36,1)`. Sections reveal from a visible resting state (never stuck at opacity 0). Always respect
`prefers-reduced-motion`. Required modules: pointer interactions + logo splash (see SKILL.md).

## Copy voice

Plain, first-person Chinese, short sentences, concrete numbers ("6w+ AI 收入", "2040 年前去一次太空"). Mono labels in
English caps (`SELECTED WORK / 01—07`). No hype words, no emoji as section markers.

## Don'ts

No warm cream/serif "editorial" look (the user rejected it), no purple gradients, no blurred drop shadows, no
borderless floating cards, no second accent competing with sun yellow, no light-grey-on-white text.
