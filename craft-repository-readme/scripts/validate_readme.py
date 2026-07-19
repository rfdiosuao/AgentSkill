#!/usr/bin/env python3
"""Validate the structural and safety basics of a repository README."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit


MARKDOWN_LINK_RE = re.compile(r"!?\[[^\]]*\]\(([^)\s]+)(?:\s+[\"'][^\"']*[\"'])?\)")
HTML_LINK_RE = re.compile(r"(?:src|href)\s*=\s*[\"']([^\"']+)[\"']", re.IGNORECASE)
IMAGE_RE = re.compile(r"!\[[^\]]*\]\([^)]+\)|<img\b", re.IGNORECASE)
BADGE_RE = re.compile(r"shields\.io|badge|github\.com/.+?/actions", re.IGNORECASE)
LOGO_RE = re.compile(r"(?:logo|icon|mark)[^\s\"')>]*\.(?:png|jpe?g|webp|svg|gif)", re.IGNORECASE)
HERO_RE = re.compile(r"(?:hero|banner|cover|screenshot|preview|demo)[^\s\"')>]*\.(?:png|jpe?g|webp|svg|gif)", re.IGNORECASE)
SPONSOR_RE = re.compile(r"(?:sponsor|donat|赞助|支持项目|微信支付|支付宝)", re.IGNORECASE)
PLACEHOLDER_RE = re.compile(r"(?:OWNER/REPO|example\.com|TODO|TBD|<your[_ -]?token>|YOUR_API_KEY)", re.IGNORECASE)
SECRET_PATTERNS = {
    "private key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    "OpenAI-style API key": re.compile(r"\bsk-[A-Za-z0-9_-]{20,}\b"),
    "GitHub token": re.compile(r"\bgh[opurs]_[A-Za-z0-9]{20,}\b"),
    "AWS access key": re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
}
SKIPPED_SCHEMES = {"http", "https", "mailto", "tel", "data"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", default=".", help="Repository root directory")
    parser.add_argument("--readme", default="README.md", help="README path relative to the repository root")
    parser.add_argument("--require-logo", action="store_true")
    parser.add_argument("--require-hero", action="store_true")
    parser.add_argument("--require-badges", action="store_true")
    parser.add_argument("--require-license", action="store_true")
    parser.add_argument("--require-sponsor", action="store_true")
    return parser.parse_args()


def link_targets(text: str) -> list[str]:
    targets = [match.group(1).strip() for match in MARKDOWN_LINK_RE.finditer(text)]
    targets.extend(match.group(1).strip() for match in HTML_LINK_RE.finditer(text))
    return targets


def local_target(target: str) -> str | None:
    target = target.strip().strip("<>")
    if not target or target.startswith("#"):
        return None
    parsed = urlsplit(target)
    if parsed.scheme.lower() in SKIPPED_SCHEMES or parsed.netloc:
        return None
    path = unquote(parsed.path)
    return path or None


def has_license(repo_root: Path) -> bool:
    return any(any(repo_root.glob(pattern)) for pattern in ("LICENSE", "LICENSE.*", "COPYING", "COPYING.*"))


def main() -> int:
    args = parse_args()
    repo_root = Path(args.repo_root).expanduser().resolve()
    readme = Path(args.readme)
    readme_path = readme if readme.is_absolute() else repo_root / readme

    errors: list[str] = []
    warnings: list[str] = []

    if not readme_path.is_file():
        print(f"ERROR: README not found: {readme_path}")
        return 1

    text = readme_path.read_text(encoding="utf-8")
    if len(text.strip()) < 200:
        errors.append("README is too short to explain and onboard users")
    if not re.search(r"^#\s+\S", text, re.MULTILINE) and "<h1" not in text.lower():
        errors.append("README has no level-one heading")

    for label, pattern in SECRET_PATTERNS.items():
        if pattern.search(text):
            errors.append(f"possible {label} exposed in README")

    if PLACEHOLDER_RE.search(text):
        warnings.append("README contains a placeholder such as TODO, example.com, or OWNER/REPO")

    missing: set[str] = set()
    for target in link_targets(text):
        relative = local_target(target)
        if relative is None:
            continue
        candidate = (readme_path.parent / relative).resolve()
        try:
            candidate.relative_to(repo_root)
        except ValueError:
            errors.append(f"local link escapes the repository: {target}")
            continue
        if not candidate.exists():
            missing.add(target)
    errors.extend(f"missing local link target: {target}" for target in sorted(missing))

    image_count = len(IMAGE_RE.findall(text))
    badge_count = len(BADGE_RE.findall(text))
    if args.require_logo and not LOGO_RE.search(text):
        errors.append("a logo image is required but no logo-like asset is referenced")
    if args.require_hero and not HERO_RE.search(text):
        errors.append("a hero or screenshot is required but no hero-like asset is referenced")
    if args.require_badges and badge_count == 0:
        errors.append("badges are required but none were detected")
    if args.require_sponsor and not SPONSOR_RE.search(text):
        errors.append("sponsor content is required but none was detected")
    if args.require_license and not has_license(repo_root):
        errors.append("a license is required but no LICENSE or COPYING file exists")

    print(f"README: {readme_path}")
    print(f"Detected: {image_count} image(s), {badge_count} badge signal(s), {len(link_targets(text))} link target(s)")
    for warning in warnings:
        print(f"WARNING: {warning}")
    for error in errors:
        print(f"ERROR: {error}")

    if errors:
        print(f"FAILED: {len(errors)} error(s), {len(warnings)} warning(s)")
        return 1
    print(f"PASSED: {len(warnings)} warning(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
