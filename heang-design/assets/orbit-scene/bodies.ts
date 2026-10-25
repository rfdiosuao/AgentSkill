import type { OrbitBody } from "./OrbitScene";
export type Site = {
  code: string;
  name: string;
  host: string;
  color: string;
  /** the same planet color as a literal, for canvas / 3D */
  hex: string;
  blurb: string;
};

/** The HEANG orbit registry: one entry per site, in HA order. */
export const SITES: Site[] = [
  { code: "HA-00", name: "主页 HEANG", host: "heang.top", color: "var(--h-ha00)", hex: "#ffd23f", blurb: "宇航的项目、路径和原则" },
  { code: "HA-01", name: "MODE II", host: "entermodetwo.com", color: "var(--h-ha01)", hex: "#ff93b4", blurb: "AI 第二曲线社区" },
  { code: "HA-02", name: "麓鸣 LOOM", host: "loom.heang.top", color: "var(--h-ha02)", hex: "#3fd9a6", blurb: "面向真实交付的 AI 自动化工作台" },
  { code: "HA-03", name: "Lumi", host: "lumiu.heang.top", color: "var(--h-ha03)", hex: "#5fd3f3", blurb: "AI 商家交付工具箱" },
  { code: "HA-04", name: "星匣", host: "xingxia.heang.top", color: "var(--h-ha04)", hex: "#9c8cff", blurb: "免费 Image 2 画廊" },
  { code: "HA-05", name: "服呢 Fune", host: "fune.heang.top", color: "var(--h-ha05)", hex: "#ffa53d", blurb: "Minecraft 服务器发现与探针" },
  { code: "HA-06", name: "唤名 SUMMON", host: "summon.entermodetwo.com", color: "var(--h-ha06)", hex: "#b9ed08", blurb: "让 Agent 住进任何一台机器" },
  { code: "HA-07", name: "拾光 Echo", host: "shiguang.heang.top", color: "var(--h-ha07)", hex: "#ff7a5c", blurb: "为银发人群保存人生故事" },
  { code: "HA-08", name: "AI 导航", host: "ai.heang.top", color: "var(--h-ha08)", hex: "#2f4b73", blurb: "宇航常用的 AI 工具" },
  { code: "HA-09", name: "文档", host: "docs.heang.top", color: "var(--h-ha09)", hex: "#2f4b73", blurb: "产品文档与教程" },
];

export const siteUrl = (s: Site) => `https://${s.host}/`;


const KIND: Record<string, OrbitBody["kind"]> = { "HA-01": "ring", "HA-06": "sat", "HA-04": "gem", "HA-02": "sat" };
// the four sites whose names stay on screen; the rest label themselves on hover
const PINNED = new Set(["HA-01", "HA-02", "HA-04", "HA-06"]);

/** Public open-source projects that aren't sites of their own: the small moons on the outer orbits. */
export const PROJECTS: { name: string; code: string; href: string; hex: string }[] = [
  { name: "Hermes Agent Phone", code: "OS-01", href: "https://github.com/rfdiosuao/Hermes-Agent-phone", hex: "#9ab8e7" },
  { name: "债序天工", code: "OS-02", href: "https://rfdiosuao.github.io/enterprise-debt-remediation-skill/", hex: "#ffd23f" },
  { name: "AgentSkill", code: "OS-03", href: "https://github.com/rfdiosuao/AgentSkill", hex: "#ffffff" },
  { name: "Claude Code Orchestrator", code: "OS-04", href: "https://github.com/rfdiosuao/claude-code-orchestrator-skill", hex: "#ff93b4" },
  { name: "ManJu Creator", code: "OS-05", href: "https://github.com/rfdiosuao/Yuhang-ManJu", hex: "#9c8cff" },
  { name: "PDD CS Gateway", code: "OS-06", href: "https://github.com/rfdiosuao/pdd-cs-gateway", hex: "#3fd9a6" },
  { name: "OpenFang 中文版", code: "OS-07", href: "https://github.com/rfdiosuao/openfang-cn", hex: "#ffa53d" },
  { name: "ZMT AI Media Agent", code: "OS-08", href: "https://github.com/rfdiosuao/zmt-ai-media-agent", hex: "#5fd3f3" },
  { name: "YuHang-Skill", code: "OS-09", href: "https://github.com/rfdiosuao/YuHang-Skill", hex: "#dce6ff" },
];

/** Every HEANG site (except the one you're on) as a planet, every open-source project as a moon. */
export function heangBodies(except = "HA-00"): OrbitBody[] {
  const planets = SITES.filter((s) => s.code !== except).map((s) => ({
    name: s.name.replace(/ (HEANG|SUMMON|Fune)$/, ""),
    code: s.code,
    href: siteUrl(s),
    color: s.hex,
    kind: KIND[s.code] ?? "sphere",
    tier: "major" as const,
    pinLabel: PINNED.has(s.code),
  }));
  const moons = PROJECTS.map((p, i) => ({ name: p.name, code: p.code, href: p.href, color: p.hex, kind: (i % 2 ? "gem" : "sphere") as OrbitBody["kind"], tier: "minor" as const }));
  return [...planets, ...moons];
}
