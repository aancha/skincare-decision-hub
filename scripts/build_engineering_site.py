#!/usr/bin/env python3
"""Build the self-contained engineering page from reviewed synthetic sources."""

from __future__ import annotations

import argparse
import hashlib
import html
import io
import json
from pathlib import Path
import zipfile


ROOT = Path(__file__).resolve().parents[1]
BUNDLE_NAME = "skincare-hub-engineering-examples"
SOURCE_FILES = (
    "examples/evaluation/evaluate.py", "examples/evaluation/rubric.json",
    "examples/evaluation/scenarios.json", "examples/evaluation/test_evaluation.py",
    "examples/mcp/client.py", "examples/mcp/fixtures/products.json",
    "examples/mcp/server.py", "examples/mcp/tests/restricted_server.py",
    "examples/mcp/tests/silent_server.py", "examples/mcp/tests/test_mcp.py",
    "examples/mcp/tool_logic.py", "examples/shortlist_ai/responses_provider.py",
    "examples/shortlist_ai/shortlist.py", "examples/shortlist_ai/test_responses_provider.py",
    "examples/shortlist_ai/test_shortlist.py", "scripts/skincare_guardrails.py",
    "scripts/routine_planner.py", "scripts/evaluate_skincare_guardrails.py",
    "tests/fixtures/skincare_guardrail_eval_cases.json", "web/skincare_guardrails.json", "LICENSE",
)
SOURCE_VIEWS = (
    ("shortlist", "Context, validation, and fallback", "examples/shortlist_ai/shortlist.py"),
    ("validation-tests", "Explanation tests and the grounding limitation", "examples/shortlist_ai/test_shortlist.py"),
    ("provider", "Provider adapter — disabled by default", "examples/shortlist_ai/responses_provider.py"),
    ("mcp", "MCP stdio server", "examples/mcp/server.py"),
    ("mcp-tools", "MCP tool contracts and response projection", "examples/mcp/tool_logic.py"),
    ("mcp-client", "MCP local client", "examples/mcp/client.py"),
    ("evaluation", "Paired offline contract evaluation", "examples/evaluation/evaluate.py"),
)

def source_bytes(relative: str) -> bytes:
    path = ROOT / relative
    if path.is_symlink() or not path.resolve().is_relative_to(ROOT) or not path.is_file():
        raise ValueError(f"Source must be a regular repository file: {relative}")
    return path.read_bytes()


def reproduction_commands() -> str:
    """Use the bundle README as the single reproduction recipe."""
    guide = source_bytes("docs/portfolio/engineering-examples.md").decode()
    blocks = guide.split("```sh\n")
    if len(blocks) != 2 or "```" not in blocks[1]:
        raise ValueError("Expected one shell recipe in the canonical guide")
    commands = blocks[1].split("```", 1)[0].strip()
    if not commands or any(not line.startswith("python3 ") for line in commands.splitlines()):
        raise ValueError("Expected explicit Python commands in the canonical guide")
    return commands


def build_bundle() -> tuple[bytes, dict[str, bytes]]:
    files = {name: source_bytes(name) for name in SOURCE_FILES}
    files["README.md"] = source_bytes("docs/portfolio/engineering-examples.md")
    files["NOTICE.md"] = source_bytes("docs/portfolio/engineering-download-notice.md")
    manifest = {
        "bundle": BUNDLE_NAME,
        "evidence": "synthetic offline examples; checksums identify content, not verification status",
        "files": {name: hashlib.sha256(data).hexdigest() for name, data in sorted(files.items())},
    }
    files["MANIFEST.json"] = (json.dumps(manifest, indent=2) + "\n").encode()
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, "w", compression=zipfile.ZIP_DEFLATED) as archive:
        for name, data in sorted(files.items()):
            info = zipfile.ZipInfo(f"{BUNDLE_NAME}/{name}", (2026, 9, 15, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            archive.writestr(info, data)
    return stream.getvalue(), files


def render_examples(archive: bytes, files: dict[str, bytes]) -> bytes:
    template = source_bytes("web/engineering/examples-template.html").decode()
    sources = []
    for anchor, title, name in SOURCE_VIEWS:
        sources.append(
            f'<details class="eng-source" id="{anchor}"><summary>{html.escape(title)} · '
            f'{html.escape(name)}</summary><pre tabindex="0" aria-label="{html.escape(title)} source code">'
            f'<code>{html.escape(files[name].decode())}</code></pre></details>'
        )
    replacements = {
        "@@COMMANDS@@": html.escape(reproduction_commands()),
        "@@FILES@@": "".join(f"<li>{html.escape(name)}</li>" for name in sorted(files)),
        "@@SHA256@@": hashlib.sha256(archive).hexdigest(),
        "@@SOURCES@@": "".join(sources),
    }
    for token, value in replacements.items():
        if template.count(token) != 1:
            raise ValueError(f"Expected one template token: {token}")
        template = template.replace(token, value)
    return template.encode()


def build(output: Path) -> dict[str, str]:
    output = output.resolve()
    if output.is_relative_to(ROOT):
        raise ValueError("Build outside the source repository; generated archives are not source files.")
    if output.exists() and any(output.iterdir()):
        raise ValueError("Use an empty output directory to preserve existing files.")
    archive, files = build_bundle()
    assets = {
        "index.html": source_bytes("web/engineering/index.html"),
        "styles.css": source_bytes("web/engineering/styles.css"),
        "examples.html": render_examples(archive, files),
        f"{BUNDLE_NAME}.zip": archive,
    }
    destination = output / "engineering"
    destination.mkdir(parents=True, exist_ok=True)
    for name, data in assets.items():
        (destination / name).write_bytes(data)
    return {name: hashlib.sha256(data).hexdigest() for name, data in sorted(assets.items())}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True, help="Empty directory outside the repository")
    args = parser.parse_args()
    print(json.dumps(build(args.output), indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
