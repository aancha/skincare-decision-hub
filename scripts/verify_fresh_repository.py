#!/usr/bin/env python3
"""Fail-closed proof checks for the isolated one-commit public repository."""

from __future__ import annotations

import argparse
import hashlib
import os
import re
import subprocess
from pathlib import Path


EXPECTED_REMOTE = "https://github.com/aancha/skincare-decision-hub.git"
EXPECTED_REPOSITORY = "aancha/skincare-decision-hub"
EXPECTED_REF = "refs/heads/main"
EXPECTED_COMMIT_MESSAGE = "Publish Skincare Decision Hub"
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


def git(root: Path, *args: str, check: bool = True) -> str:
    result = subprocess.run(
        ["git", *args],
        cwd=root,
        check=check,
        capture_output=True,
        text=True,
        env=git_environment(),
    )
    return result.stdout.strip()


def git_bytes(root: Path, *args: str) -> bytes:
    result = subprocess.run(
        ["git", *args],
        cwd=root,
        check=True,
        capture_output=True,
        env=git_environment(),
    )
    return result.stdout


def require(condition: bool, message: str) -> None:
    if not condition:
        raise ValueError(message)


def verify(args: argparse.Namespace) -> None:
    root = args.root.resolve()
    git_directory = root / ".git"
    require(git_directory.is_dir() and not git_directory.is_symlink(), "Candidate is not an independently initialized Git repository")
    require(
        not any(path.is_symlink() for path in git_directory.rglob("*")),
        "Symlinks are forbidden inside the fresh Git database",
    )
    require(not (root / ".git/commondir").exists(), "A redirected Git common directory is forbidden")
    require(not (root / ".git/config.worktree").exists(), "Per-worktree Git configuration is forbidden")
    require(not (root / ".git/worktrees").exists(), "Linked Git worktree metadata is forbidden")
    require(not (root / ".git/objects/info/alternates").exists(), "Git object alternates are forbidden")
    require(not (root / ".git/shallow").exists(), "A shallow repository is not a fresh-history proof")
    require(not (root / ".git/info/grafts").exists(), "Git grafts are forbidden")

    core_worktree = subprocess.run(
        ["git", "config", "--local", "--get-all", "core.worktree"],
        cwd=root,
        capture_output=True,
        text=True,
        env=git_environment(),
    )
    require(core_worktree.returncode in (0, 1), "Unable to inspect repository-local core.worktree")
    require(not core_worktree.stdout.strip(), "Repository-local core.worktree redirection is forbidden")
    local_config_keys = [
        key.lower()
        for key in git(
            root,
            "config",
            "--file",
            str(root / ".git/config"),
            "--no-includes",
            "--name-only",
            "--list",
        ).splitlines()
        if key
    ]
    require(
        not any(key == "include.path" or key.startswith("includeif.") for key in local_config_keys),
        "External Git configuration includes are forbidden",
    )
    require(git(root, "rev-parse", "--is-bare-repository") == "false", "A bare repository is forbidden")
    require(Path(git(root, "rev-parse", "--show-toplevel")).resolve() == root, "Git worktree root does not match the candidate root")
    require(
        Path(git(root, "rev-parse", "--absolute-git-dir")).resolve() == root / ".git",
        "Git directory does not match the candidate .git directory",
    )
    common_dir_value = Path(git(root, "rev-parse", "--git-common-dir"))
    common_dir = common_dir_value if common_dir_value.is_absolute() else root / common_dir_value
    require(common_dir.resolve() == root / ".git", "Git common directory does not match the candidate .git directory")
    require(not git(root, "status", "--porcelain=v1", "--untracked-files=all"), "Index and worktree must exactly match HEAD")

    refs = [line for line in git(root, "for-each-ref", "--format=%(refname)").splitlines() if line]
    require(refs == ["refs/heads/main"], "refs/heads/main must be the repository's only ref")

    require(git(root, "rev-list", "--all", "--count") == "1", "Exactly one reachable commit is required")
    branches = [line for line in git(root, "for-each-ref", "--format=%(refname:short)", "refs/heads").splitlines() if line]
    require(branches == ["main"], "main must be the only local branch")
    require(not git(root, "tag", "--list"), "Tags are forbidden before Approval Gate 3")

    commit_sha = git(root, "rev-parse", "HEAD")
    commit_parts = git(root, "rev-list", "--parents", "-n", "1", "HEAD").split()
    require(commit_parts == [commit_sha], "The sole commit must have no parent")
    raw_commit = git_bytes(root, "cat-file", "commit", commit_sha)
    raw_commit_header_bytes, separator, raw_commit_message = raw_commit.partition(b"\n\n")
    require(separator == b"\n\n", "The raw commit object must contain a header/message separator")
    raw_commit_headers = raw_commit_header_bytes.decode("utf-8", errors="strict").splitlines()
    raw_tree_headers = [line.removeprefix("tree ") for line in raw_commit_headers if line.startswith("tree ")]
    raw_parent_headers = [line for line in raw_commit_headers if line.startswith("parent ")]
    require(len(raw_tree_headers) == 1, "The raw commit must contain exactly one tree header")
    require(not raw_parent_headers, "The raw commit object must have no parent headers")
    require(raw_tree_headers[0] == git(root, "rev-parse", "HEAD^{tree}"), "Raw commit tree does not match HEAD tree")
    require(
        raw_commit_message == f"{EXPECTED_COMMIT_MESSAGE}\n".encode("utf-8"),
        "Commit message does not match the approved public release message",
    )
    require(not git(root, "fsck", "--full", "--no-reflogs", "--unreachable"), "Unreachable Git objects are forbidden")

    identity = git(root, "show", "-s", "--format=%an%n%ae%n%cn%n%ce", "HEAD").splitlines()
    require(
        identity == [args.author_name, args.author_email, args.author_name, args.author_email],
        "Commit author/committer identity does not match the approved public identity",
    )
    require(args.author_email.endswith("@users.noreply.github.com"), "A GitHub noreply email is required")
    require(git(root, "config", "--local", "--get", "user.name") == args.author_name, "Repository-local user.name mismatch")
    require(git(root, "config", "--local", "--get", "user.email") == args.author_email, "Repository-local user.email mismatch")

    remotes = [line for line in git(root, "remote").splitlines() if line]
    if args.phase == "pre-gate-2":
        require(remotes == [], "The pre-Gate-2 candidate must have no remote")
    else:
        require(remotes == ["origin"], "Exactly one origin remote is required")
        fetch_urls = [line for line in git(root, "remote", "get-url", "--all", "origin").splitlines() if line]
        push_urls = [line for line in git(root, "remote", "get-url", "--push", "--all", "origin").splitlines() if line]
        require(fetch_urls == [EXPECTED_REMOTE], "Exactly one approved origin fetch URL is required")
        require(push_urls == [EXPECTED_REMOTE], "Exactly one approved origin push URL is required")

    if args.phase == "post-push":
        require(args.expected_repository == EXPECTED_REPOSITORY, "Pushed GitHub repository identity mismatch")
        require(args.expected_ref == EXPECTED_REF, "Pushed Git ref mismatch")
        require(args.expected_pushed_sha == commit_sha, "Pushed Git commit does not match the verified commit")
        published_refs = [line for line in git(root, "ls-remote", "--refs", "origin").splitlines() if line]
        require(
            published_refs == [f"{commit_sha}\t{EXPECTED_REF}"],
            "Published remote must contain exactly refs/heads/main at the verified commit",
        )

    for object_id in args.forbidden_object:
        require(
            re.fullmatch(r"(?:[0-9a-f]{40}|[0-9a-f]{64})", object_id) is not None,
            "Forbidden private object ID is malformed",
        )
        object_probe = subprocess.run(
            ["git", "cat-file", "-e", object_id],
            cwd=root,
            capture_output=True,
            env=git_environment(),
        )
        require(object_probe.returncode in {0, 1}, "Forbidden private object inspection failed")
        require(object_probe.returncode == 1, f"Forbidden private object is present: {object_id}")

    manifest_path = root / "PUBLICATION_MANIFEST.json"
    require(manifest_path.is_file(), "Publication manifest is missing")
    subprocess.run(
        ["git", "cat-file", "-e", f"HEAD:{manifest_path.name}"],
        cwd=root,
        check=True,
        env=git_environment(),
    )
    subprocess.run(
        [
            "python3",
            str(root / "scripts/publication_manifest.py"),
            "verify",
            "--root",
            str(root),
            "--manifest",
            str(manifest_path),
        ],
        cwd=root,
        check=True,
        env=git_environment(),
    )
    subprocess.run(
        [
            "python3",
            str(root / "scripts/publication_manifest.py"),
            "verify",
            "--root",
            str(root),
            "--manifest",
            str(manifest_path),
            "--tracked",
        ],
        cwd=root,
        check=True,
        env=git_environment(),
    )

    manifest_digest = hashlib.sha256(manifest_path.read_bytes()).hexdigest()
    tree_sha = git(root, "rev-parse", "HEAD^{tree}")
    print(f"manifest_sha256={manifest_digest}")
    print(f"tree_sha={tree_sha}")
    print(f"commit_sha={commit_sha}")
    print(f"phase={args.phase}")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, required=True)
    parser.add_argument("--phase", choices=("pre-gate-2", "post-create-pre-push", "post-push"), required=True)
    parser.add_argument("--author-name", required=True)
    parser.add_argument("--author-email", required=True)
    parser.add_argument("--expected-repository")
    parser.add_argument("--expected-ref")
    parser.add_argument("--expected-pushed-sha")
    parser.add_argument("--forbidden-object", action="append", default=[])
    args = parser.parse_args()
    verify(args)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
