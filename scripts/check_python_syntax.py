#!/usr/bin/env python3
"""Parse public Python source without creating bytecode or other residue."""

from __future__ import annotations

import ast
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def main() -> int:
    paths = sorted((ROOT / "scripts").rglob("*.py")) + sorted((ROOT / "tests").rglob("*.py"))
    for path in paths:
        ast.parse(path.read_text(encoding="utf-8"), filename=str(path.relative_to(ROOT)))
    print(f"Python syntax: {len(paths)}/{len(paths)} files passed")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
