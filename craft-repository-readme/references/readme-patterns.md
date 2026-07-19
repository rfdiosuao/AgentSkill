# Repository README patterns

Use this reference to choose a layout, not to copy every section. The best README is the shortest one that answers the project's real adoption questions.

## Recommended first-screen pattern

```html
<p align="center">
  <a href="https://example.com">
    <img src="docs/assets/logo.png" width="112" alt="Project logo">
  </a>
</p>

<h1 align="center">Project name</h1>

<p align="center">One concrete sentence explaining the value.</p>

<p align="center">
  <a href="LICENSE"><img alt="License" src="https://img.shields.io/github/license/OWNER/REPO"></a>
  <a href="https://github.com/OWNER/REPO/actions"><img alt="Build" src="https://img.shields.io/github/actions/workflow/status/OWNER/REPO/ci.yml"></a>
  <a href="https://github.com/OWNER/REPO/releases"><img alt="Release" src="https://img.shields.io/github/v/release/OWNER/REPO"></a>
</p>

<p align="center">
  <a href="https://example.com">Live demo</a> ·
  <a href="docs/">Documentation</a> ·
  <a href="https://github.com/OWNER/REPO/issues">Report an issue</a>
</p>
```

Replace every placeholder. If there is no verified live demo, CI workflow, release, or license, remove that element.

## Badge decision rules

Choose badges that help a visitor decide whether the project is usable:

| Signal | Use when | Avoid when |
| --- | --- | --- |
| Build / CI | A public workflow exists and runs | No workflow or a private workflow backs it |
| Release | Tagged releases are maintained | The project has never released |
| License | A license file exists | License status is unresolved |
| Runtime / platform | Compatibility is tested | It is only aspirational |
| Coverage | Public coverage is current | The badge points to missing or stale data |
| Container / package | A public artifact is published | Install requires source checkout only |

Keep the set small. Stars, forks, visitor counters, and social badges are secondary; include them only when community scale is part of the repository's story.

## Section selection matrix

| Project shape | Core sections | Useful additions |
| --- | --- | --- |
| Web app | Overview, features, quickstart, configuration, deployment | Screenshots, architecture, API, security |
| Library | Motivation, install, minimal example, API, compatibility | Benchmarks, migration, design notes |
| CLI | Install, command examples, configuration | Shell completion, exit codes, troubleshooting |
| Agent Skill | Purpose, trigger scenarios, installation, resources, validation | Example prompts, compatibility, safety boundaries |
| Template | What is included, use-template flow, customization | Directory map, deployment targets |

## Visual asset rules

- Logo: square or compact silhouette, transparent background when possible, readable at 64-128 px.
- Hero: show the real experience or a purposeful branded illustration; avoid generic stock imagery.
- Screenshots: crop distractions, redact private data, and add a short caption only when context is needed.
- Animated demos: keep files small, provide a static fallback when practical, and never autoplay video with sound.
- Use descriptive alt text. Decorative images may use an empty alt attribute.
- Store important visuals in the repository or a project-controlled CDN.

## Quickstart pattern

The quickstart should be a verified happy path:

1. List prerequisites with minimum supported versions.
2. Clone or install using the real package name.
3. Copy an example configuration without exposing secrets.
4. Run the smallest command that proves success.
5. State the expected URL, output, or behavior.

Avoid mixing production deployment, local development, and contribution setup into one command block.

## Sponsor pattern

```html
## 支持项目

如果这个项目帮到了你，可以请作者喝杯咖啡。赞助会用于服务器和持续维护。

<p align="center">
  <img src="docs/assets/sponsor-wechat.jpg" width="320" alt="微信赞助二维码">
</p>
```

Keep the payment method accurately labeled. Do not manipulate the QR code or place it before product and setup information.

## GitHub repository presentation

When authorized, keep these surfaces consistent with the README:

- Description: one sentence, usually under 120 characters.
- Homepage: canonical live site or documentation URL.
- Topics: five to twelve specific, lowercase topics.
- Social preview: legible at small sizes, limited text, consistent with the logo and hero.
- About links: documentation, issue tracker, security policy, and sponsor page where relevant.

## Final release checklist

- Render the README on GitHub, not only in a local Markdown preview.
- Test the primary call-to-action and every local asset.
- Test installation from a clean directory when practical.
- Check light and dark GitHub themes if the logo uses transparency.
- Check a narrow viewport for oversized images and tables.
- Confirm the current branch contains every referenced image.
- Confirm the repository has an explicit license before showing a license badge.
- Search the diff for tokens, private keys, passwords, local absolute paths, and placeholders.

## Common failure modes

- A beautiful header followed by inaccurate installation steps.
- Badges for workflows, packages, or licenses that do not exist.
- A hero that resembles an unrelated stock template.
- Huge screenshots that dominate mobile rendering.
- Links to localhost, private dashboards, expired previews, or raw temporary files.
- Marketing claims such as “fastest” or “secure” without evidence.
- Donation content appearing before the visitor can understand or use the project.
