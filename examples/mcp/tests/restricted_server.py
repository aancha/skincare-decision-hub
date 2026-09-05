"""Test-only wrapper: deny sockets, subprocesses, writes, and non-allowlisted reads.

This audit hook verifies exercised Python operations, not an OS sandbox guarantee.
It is installed before the example server or its guardrail module is imported.
"""

import os
import runpy
import sys
import sysconfig
from pathlib import Path


EXAMPLE_ROOT = Path(__file__).resolve().parents[1]
PUBLIC_ROOT = EXAMPLE_ROOT.parents[1]
STDLIB_ROOT = Path(sysconfig.get_path("stdlib")).resolve()
ALLOWED_FILES = {PUBLIC_ROOT / "scripts" / "skincare_guardrails.py",
                 PUBLIC_ROOT / "web" / "skincare_guardrails.json"}
WRITE_FLAGS = os.O_WRONLY | os.O_RDWR | os.O_CREAT | os.O_TRUNC | os.O_APPEND


def audit(event: str, arguments: tuple) -> None:
    if event.startswith("socket.") or event in {"subprocess.Popen", "os.system", "os.exec", "os.spawn"}:
        raise PermissionError("Network and process creation are forbidden in the test server")
    if event == "open":
        path, mode, flags = arguments
        if flags & WRITE_FLAGS or (isinstance(mode, str) and any(character in mode for character in "wax+")):
            raise PermissionError("File writes are forbidden in the test server")
        if isinstance(path, (str, bytes)):
            resolved = Path(os.fsdecode(path)).resolve()
            if resolved not in ALLOWED_FILES and EXAMPLE_ROOT not in resolved.parents and STDLIB_ROOT not in resolved.parents:
                raise PermissionError("File is outside the test allowlist")


sys.path.insert(0, str(EXAMPLE_ROOT))
sys.addaudithook(audit)
runpy.run_path(str(EXAMPLE_ROOT / "server.py"), run_name="__main__")
