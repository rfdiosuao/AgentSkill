---
name: craft-repository-readme
description: Create or overhaul polished, trustworthy GitHub repository READMEs with a logo, meaningful badges, hero visuals, navigation, quickstart instructions, verified links, sponsor content, and repository metadata. Use when a user asks to write, beautify, professionalize, brand, audit, or publish a project README, especially when they want a README with images, badges, demos, links, or donation QR codes.
---

# Craft Repository README

Turn a repository into a clear, credible landing page. Base every claim, command, badge, and link on the actual project; visual polish must never outrun accuracy.

## Choose the operating mode

- Use **audit** mode when the user asks for feedback only. Inspect and report; do not edit or publish.
- Use **build** mode when the user asks to create or improve the README. Edit the repository and validate the result.
- Use **publish** mode only when the user asks to commit, push, open a pull request, or update repository settings. Follow the repository's normal Git workflow.

## 1. Inspect the real project

Before drafting, inspect:

- Existing `README*`, contribution, security, license, changelog, and deployment documents.
- Package manifests, entry points, example environment files, test commands, screenshots, logos, and public URLs.
- Git remote, default branch, release tags, CI workflows, and hosting configuration.
- Repository-level instructions such as `AGENTS.md` or `CONTRIBUTING.md`.

Derive the product name, one-sentence value proposition, audience, supported platforms, install commands, run commands, and deployment story from evidence. If a material fact cannot be verified, omit it or label it clearly as planned.

## 2. Run a public-scope and security check

Treat README work as a release review. Before exposing details:

- Search tracked files and staged changes for API keys, private keys, tokens, passwords, cookies, internal hostnames, private IPs, and personal paths.
- Never paste secrets from local configuration, chat history, shell history, or deployment files.
- Link to `.env.example`; never reproduce values from `.env`.
- Confirm that screenshots, QR codes, names, and contact links are intentionally public.
- Preserve license, trademark, attribution, and third-party asset notices.

Stop and surface a concrete blocker if publication would expose sensitive material.

## 3. Design the story before the decoration

Write the README for this sequence:

1. **Recognize** — name, logo, concise promise.
2. **Trust** — a small set of truthful badges and a real product visual.
3. **Understand** — what it does, who it is for, and its key difference.
4. **Try** — shortest verified path from clone to working result.
5. **Adopt** — configuration, deployment, architecture, limitations, and support.
6. **Participate** — contribution, security, license, sponsors, and community.

Read [references/readme-patterns.md](references/readme-patterns.md) before rebuilding a README layout or selecting badges.

## 4. Build a compact branded header

Use this order when the project has the assets to support it:

1. Linked logo with descriptive alt text and a restrained display size.
2. Project name and one-line value proposition.
3. Four to eight meaningful badges.
4. Primary links such as live demo, documentation, issue tracker, or download.
5. Optional in-page navigation for a long README.
6. One strong hero image, product screenshot, or short demo.

Prefer repository-owned assets under a stable `docs/`, `.github/`, or `assets/` path. Reuse an existing logo before generating a new one. If the user requests a new visual and an image-generation skill is available, use it, then optimize the result for repository display.

Do not use fake build badges, placeholder metrics, giant badge walls, decorative counters, or hotlinked assets that the project does not control.

## 5. Select only useful sections

A compact project normally needs:

- What it is and why it exists.
- Feature highlights grounded in implemented behavior.
- Quickstart with copyable, tested commands.
- Configuration using safe placeholders.
- Screenshots or demo when visual proof materially helps.
- Deployment or production notes when the project is deployable.
- Contributing, security, license, and acknowledgements links when those files exist.

Add architecture, API reference, compatibility, roadmap, FAQ, or troubleshooting only when the project warrants them. Do not create empty boilerplate sections.

For Chinese projects, write natural Chinese first and retain technical identifiers in their original form. Add an English version only when requested or when the repository already maintains one.

## 6. Add sponsorship without disrupting the product story

When the user provides and authorizes a sponsor image or QR code:

- Copy it into a stable repository-owned asset path.
- Use a clear heading such as `支持项目` or `Sponsor` near the lower part of the README.
- Add alt text, a reasonable width, and one sentence explaining what support funds.
- Never alter, decode, or regenerate a payment QR code unless explicitly requested.

Do not let sponsorship outrank the quickstart, documentation, or security information.

## 7. Verify the README as executable documentation

Run the project's relevant build, test, lint, or smoke commands when practical. Then run the bundled checker:

```bash
python3 craft-repository-readme/scripts/validate_readme.py \
  --repo-root . \
  --readme README.md
```

Add strict flags when the corresponding elements are required:

```bash
python3 craft-repository-readme/scripts/validate_readme.py \
  --repo-root . \
  --readme README.md \
  --require-logo --require-badges --require-hero --require-sponsor
```

Also verify manually:

- Every install and run command matches the repository.
- Relative image and document links resolve with GitHub's case-sensitive paths.
- External links use the intended canonical domains.
- Heading anchors and table-of-contents links work.
- Images have descriptive alt text and reasonable dimensions.
- The README renders well on both desktop and narrow screens.
- No secret, placeholder, local absolute path, or unverified claim remains.

## 8. Publish deliberately

When publication is in scope:

- Review `git diff` and keep unrelated changes out of the commit.
- Commit with a focused message and push through the repository's normal workflow.
- Prefer a pull request when branch protections or collaboration practices require one.
- Update the GitHub description, homepage, topics, and social preview only when the user requested repository settings changes and the values are verified.
- Re-open the rendered README on GitHub after publishing and check images, badges, links, and mobile layout.

## Completion criteria

- The first screen communicates name, purpose, trust signals, and the primary next action.
- All prominent claims and commands are verified against the repository.
- Logo, hero, badges, and sponsor content are intentional rather than ornamental.
- Links and local assets resolve.
- No secret or private environment detail is exposed.
- Validation passes, and the requested publish step is complete.
