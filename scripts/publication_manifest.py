#!/usr/bin/env python3
"""Generate or verify the deterministic public-showcase publication manifest."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import subprocess
from pathlib import Path


SCHEMA_VERSION = "skincare-hub-publication-manifest-v1"
MANIFEST_NAME = "PUBLICATION_MANIFEST.json"
GIT_REDIRECTION_VARIABLES = {
    "GIT_ALTERNATE_OBJECT_DIRECTORIES",
    "GIT_CEILING_DIRECTORIES",
    "GIT_COMMON_DIR",
    "GIT_CONFIG_COUNT",
    "GIT_CONFIG_GLOBAL",
    "GIT_CONFIG_NOSYSTEM",
    "GIT_CONFIG_PARAMETERS",
    "GIT_CONFIG_SYSTEM",
    "GIT_DIR",
    "GIT_DISCOVERY_ACROSS_FILESYSTEM",
    "GIT_INDEX_FILE",
    "GIT_NAMESPACE",
    "GIT_OBJECT_DIRECTORY",
    "GIT_PREFIX",
    "GIT_QUARANTINE_PATH",
    "GIT_REPLACE_REF_BASE",
    "GIT_SHALLOW_FILE",
    "GIT_WORK_TREE",
}
GIT_REDIRECTION_PREFIXES = ("GIT_CONFIG_KEY_", "GIT_CONFIG_VALUE_")


def git_environment() -> dict[str, str]:
    environment = {
        key: value
        for key, value in os.environ.items()
        if key not in GIT_REDIRECTION_VARIABLES
        and not key.startswith(GIT_REDIRECTION_PREFIXES)
    }
    environment["GIT_NO_REPLACE_OBJECTS"] = "1"
    environment["GIT_CONFIG_GLOBAL"] = os.devnull
    environment["GIT_CONFIG_NOSYSTEM"] = "1"
    return environment


def _relative_files(root: Path, tracked: bool) -> list[str]:
    if tracked:
        result = subprocess.run(
            ["git", "ls-tree", "-r", "--name-only", "-z", "HEAD"],
            cwd=root,
            check=True,
            capture_output=True,
            env=git_environment(),
        )
        paths = [item.decode("utf-8") for item in result.stdout.split(b"\0") if item]
    else:
        paths = []
        for path in root.rglob("*"):
            if not path.is_file() or path.is_symlink():
                continue
            relative = path.relative_to(root)
            if relative.parts[0] == ".git" or "__pycache__" in relative.parts:
                continue
            if path.suffix.lower() in {".pyc", ".pyo"}:
                continue
            paths.append(relative.as_posix())
    return sorted(path for path in paths if path != MANIFEST_NAME)


def _entry(root: Path, relative: str) -> dict[str, object]:
    path = root / relative
    if path.is_symlink() or not path.is_file():
        raise ValueError(f"Manifest path is not a regular file: {relative}")
    content = path.read_bytes()
    return {
        "path": relative,
        "bytes": len(content),
        "sha256": hashlib.sha256(content).hexdigest(),
    }


def _tracked_entry(root: Path, relative: str) -> dict[str, object]:
    result = subprocess.run(
        ["git", "show", f"HEAD:{relative}"],
        cwd=root,
        check=True,
        capture_output=True,
        env=git_environment(),
    )
    content = result.stdout
    return {
        "path": relative,
        "bytes": len(content),
        "sha256": hashlib.sha256(content).hexdigest(),
    }


def build_manifest(root: Path, tracked: bool = False) -> dict[str, object]:
    entry_builder = _tracked_entry if tracked else _entry
    return {
        "schemaVersion": SCHEMA_VERSION,
        "files": [entry_builder(root, relative) for relative in _relative_files(root, tracked)],
    }


def canonical_bytes(payload: dict[str, object]) -> bytes:
    return (json.dumps(payload, indent=2, sort_keys=True) + "\n").encode("utf-8")


def generate(root: Path, output: Path) -> None:
    payload = build_manifest(root, tracked=False)
    output.write_bytes(canonical_bytes(payload))
    print(f"wrote {len(payload['files'])} entries to {output.name}")


def verify(root: Path, manifest_path: Path, tracked: bool) -> None:
    if tracked:
        committed_manifest = subprocess.run(
            ["git", "show", f"HEAD:{MANIFEST_NAME}"],
            cwd=root,
            check=True,
            capture_output=True,
            env=git_environment(),
        ).stdout
        if manifest_path.read_bytes() != committed_manifest:
            raise ValueError("Working manifest differs from the committed manifest")
    payload = json.loads(manifest_path.read_text(encoding="utf-8"))
    if payload.get("schemaVersion") != SCHEMA_VERSION:
        raise ValueError("Manifest schema version mismatch")
    entries = payload.get("files")
    if not isinstance(entries, list):
        raise ValueError("Manifest files must be a list")
    paths = [entry.get("path") for entry in entries]
    if paths != sorted(paths) or len(paths) != len(set(paths)):
        raise ValueError("Manifest paths must be unique and sorted")
    expected = build_manifest(root, tracked=tracked)
    if payload != expected:
        raise ValueError("Manifest paths, byte counts, or SHA-256 values differ")
    if manifest_path.read_bytes() != canonical_bytes(expected):
        raise ValueError("Manifest bytes are not in the canonical deterministic encoding")
    digest = hashlib.sha256(manifest_path.read_bytes()).hexdigest()
    print(f"verified {len(entries)} entries; manifest sha256 {digest}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=("generate", "verify"))
    parser.add_argument("--root", type=Path, default=Path.cwd())
    parser.add_argument("--manifest", type=Path, default=Path(MANIFEST_NAME))
    parser.add_argument("--tracked", action="store_true")
    args = parser.parse_args()

    root = args.root.resolve()
    manifest_path = args.manifest if args.manifest.is_absolute() else root / args.manifest
    if args.mode == "generate":
        if args.tracked:
            parser.error("--tracked is only valid with verify")
        generate(root, manifest_path)
    else:
        verify(root, manifest_path, tracked=args.tracked)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
