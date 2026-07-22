<p align="center"><a href="README.md">简体中文</a> · <strong>English</strong></p>

<p align="center">
  <a href="https://clawhub.ai/rfdiosuao">
    <img src="docs/assets/agentskill-logo.png" width="132" alt="AgentSkill logo">
  </a>
</p>

<h1 align="center">AgentSkill</h1>

<p align="center">Turn a solved problem into an agent capability you can call again.</p>

<p align="center">
  <a href="LICENSE"><img alt="MIT License" src="https://img.shields.io/github/license/rfdiosuao/AgentSkill?style=flat-square&color=ff5a1f"></a>
  <a href="https://github.com/rfdiosuao/AgentSkill/stargazers"><img alt="GitHub Stars" src="https://img.shields.io/github/stars/rfdiosuao/AgentSkill?style=flat-square&logo=github"></a>
  <a href="https://github.com/rfdiosuao/AgentSkill/issues"><img alt="GitHub Issues" src="https://img.shields.io/github/issues/rfdiosuao/AgentSkill?style=flat-square"></a>
</p>

<a href="https://github.com/rfdiosuao/AgentSkill">
  <img src="docs/assets/agentskill-hero.png" width="100%" alt="AgentSkill turns one-off tasks into reusable capabilities">
</a>

AgentSkill is a collection of practical skills for OpenClaw, Codex, and general AI-agent workflows. Skills are based on real tasks rather than generic prompts and should include clear boundaries, references, scripts, or tests whenever possible.

## Start Here

| Goal | Recommended entry | Deliverable |
| --- | --- | --- |
| Improve a repository README | [`craft-repository-readme`](craft-repository-readme/) | Skill contract, layout references, and validator |
| Configure multiple Feishu agents | [`feishu-multi-agent-manager`](feishu-multi-agent-manager/) | Source, tests, and ClawHub package |
| Diagnose OpenClaw networking | [`openclaw-network-optimizer`](openclaw-network-optimizer/) | Diagnostics, Windows snapshot script, and rollback flow |
| Request a new skill | [Skill request](https://github.com/rfdiosuao/AgentSkill/issues/new?template=skill-request.yml) | A trackable proposal |

## Quick Start

Install a skill from the cloned repository:

```bash
git clone https://github.com/rfdiosuao/AgentSkill.git
cd AgentSkill
openclaw skills install ./craft-repository-readme --as craft-repository-readme
```

Codex users can copy the same directory into their personal skills folder:

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
cp -R craft-repository-readme "${CODEX_HOME:-$HOME/.codex}/skills/"
```

Windows PowerShell:

```powershell
Copy-Item -Recurse .\craft-repository-readme "$HOME\.codex\skills\craft-repository-readme"
```

## Skill Catalog

| Skill | Use case | Key contents |
| --- | --- | --- |
| [`craft-repository-readme`](craft-repository-readme/) | README audits, rewrites, branding, and release checks | Fact checks, secret scanning, visual guidance, validator |
| [`feishu-multi-agent-manager`](feishu-multi-agent-manager/) | Interactive Feishu multi-agent configuration | Role templates, credential validation, tests |
| [`openclaw-network-optimizer`](openclaw-network-optimizer/) | DNS, proxy, Clash, and CLI connectivity diagnostics | Network snapshots and reversible changes |

## Design Principles

- **Reusable:** a working solution can be applied to the next project.
- **Verifiable:** important claims, commands, links, and assets can be checked.
- **Bounded:** permissions, risks, dependencies, and stop conditions are explicit.
- **Collaborative:** every skill can go through normal code review and versioning.
- **Iterative:** feedback returns through Issues, pull requests, and releases.

## Contributing and Security

- Read [`CONTRIBUTING.md`](CONTRIBUTING.md) before adding or changing a skill.
- Use the structured [request form](https://github.com/rfdiosuao/AgentSkill/issues/new?template=skill-request.yml) for new ideas.
- Follow [`SECURITY.md`](SECURITY.md) and never post keys, cookies, or real credentials in a public issue.

## License

[MIT](LICENSE). Third-party projects referenced by individual skills keep their own licenses and trademarks.
