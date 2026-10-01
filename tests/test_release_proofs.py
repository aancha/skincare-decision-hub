import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from typing import Dict, Optional, Sequence


ROOT = Path(__file__).resolve().parents[1]
AUTHOR_NAME = "Release Proof Test"
AUTHOR_EMAIL = "12345+release-proof" + "@" + "users.noreply.github.com"
EXPECTED_REMOTE = "https://github.com/aancha/skincare-decision-hub.git"
EXPECTED_COMMIT_MESSAGE = "Publish Skincare Decision Hub"


class ReleaseProofTests(unittest.TestCase):
    def run_command(
        self,
        *command: str,
        cwd: Path,
        check: bool = True,
        input_text: Optional[str] = None,
        environment_overrides: Optional[Dict[str, str]] = None,
    ) -> subprocess.CompletedProcess:
        environment = {**os.environ, "PYTHONDONTWRITEBYTECODE": "1", "GIT_NO_REPLACE_OBJECTS": "1"}
        environment.update(environment_overrides or {})
        return subprocess.run(command, cwd=cwd, check=check, capture_output=True, text=True, input=input_text, env=environment)

    def create_repository(self, root: Path) -> None:
        scripts = root / "scripts"
        scripts.mkdir(parents=True)
        for name in ("publication_manifest.py", "verify_fresh_repository.py"):
            shutil.copy2(ROOT / "scripts" / name, scripts / name)
        (root / "README.md").write_text("# Release proof fixture\n", encoding="utf-8")
        self.run_command(
            sys.executable,
            str(scripts / "publication_manifest.py"),
            "generate",
            "--root",
            str(root),
            "--manifest",
            str(root / "PUBLICATION_MANIFEST.json"),
            cwd=root,
        )
        self.run_command("git", "init", "-q", "-b", "main", cwd=root)
        self.run_command("git", "config", "--local", "user.name", AUTHOR_NAME, cwd=root)
        self.run_command("git", "config", "--local", "user.email", AUTHOR_EMAIL, cwd=root)
        self.run_command("git", "config", "--local", "commit.gpgSign", "false", cwd=root)
        self.run_command("git", "add", "--all", cwd=root)
        self.run_command("git", "commit", "-q", "-m", EXPECTED_COMMIT_MESSAGE, cwd=root)

    def fake_ls_remote_environment(self, root: Path, output: str) -> Dict[str, str]:
        actual_git = shutil.which("git")
        self.assertIsNotNone(actual_git)
        fake_bin = root / ".git" / "test-bin"
        fake_bin.mkdir()
        wrapper = fake_bin / "git"
        wrapper.write_text(
            "#!/usr/bin/env python3\n"
            "import os\n"
            "import sys\n"
            "if sys.argv[1:3] == ['ls-remote', '--refs']:\n"
            "    print(os.environ.get('FAKE_LS_REMOTE_OUTPUT', ''), end='')\n"
            "    raise SystemExit(0)\n"
            f"os.execv({actual_git!r}, [{actual_git!r}, *sys.argv[1:]])\n",
            encoding="utf-8",
        )
        wrapper.chmod(0o755)
        return {
            "PATH": f"{fake_bin}{os.pathsep}{os.environ.get('PATH', '')}",
            "FAKE_LS_REMOTE_OUTPUT": output,
        }

    def verify_repository(
        self,
        root: Path,
        phase: str,
        check: bool = True,
        environment_overrides: Optional[Dict[str, str]] = None,
        expected_repository: Optional[str] = None,
        expected_ref: Optional[str] = None,
        expected_pushed_sha: Optional[str] = None,
        forbidden_objects: Sequence[str] = (),
    ) -> subprocess.CompletedProcess:
        command = [
            sys.executable,
            str(root / "scripts" / "verify_fresh_repository.py"),
            "--root",
            str(root),
            "--phase",
            phase,
            "--author-name",
            AUTHOR_NAME,
            "--author-email",
            AUTHOR_EMAIL,
        ]
        if expected_repository is not None:
            command.extend(("--expected-repository", expected_repository))
        if expected_ref is not None:
            command.extend(("--expected-ref", expected_ref))
        if expected_pushed_sha is not None:
            command.extend(("--expected-pushed-sha", expected_pushed_sha))
        for object_id in forbidden_objects:
            command.extend(("--forbidden-object", object_id))
        return self.run_command(
            *command,
            cwd=root,
            check=check,
            environment_overrides=environment_overrides,
        )

    def test_manifest_rejects_noncanonical_json_bytes(self):
        with tempfile.TemporaryDirectory(prefix="skincare-manifest-proof-") as directory:
            root = Path(directory)
            (root / "sample.txt").write_text("fixture\n", encoding="utf-8")
            manifest = root / "PUBLICATION_MANIFEST.json"
            script = ROOT / "scripts" / "publication_manifest.py"
            self.run_command(sys.executable, str(script), "generate", "--root", str(root), "--manifest", str(manifest), cwd=root)
            payload = json.loads(manifest.read_text(encoding="utf-8"))
            manifest.write_text(json.dumps(payload, separators=(",", ":")), encoding="utf-8")
            result = self.run_command(
                sys.executable,
                str(script),
                "verify",
                "--root",
                str(root),
                "--manifest",
                str(manifest),
                cwd=root,
                check=False,
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("canonical deterministic encoding", result.stderr)

    def test_fresh_repository_accepts_only_exact_fetch_and_push_remote(self):
        with tempfile.TemporaryDirectory(prefix="skincare-repository-proof-") as directory:
            root = Path(directory)
            self.create_repository(root)
            self.verify_repository(root, "pre-gate-2")
            self.run_command("git", "remote", "add", "origin", EXPECTED_REMOTE, cwd=root)
            self.verify_repository(root, "post-create-pre-push")
            self.run_command("git", "remote", "set-url", "--add", "--push", "origin", EXPECTED_REMOTE, cwd=root)
            self.run_command("git", "remote", "set-url", "--add", "--push", "origin", "https://example.invalid/unapproved.git", cwd=root)
            result = self.verify_repository(root, "post-create-pre-push", check=False)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Exactly one approved origin push URL", result.stderr)

    def test_post_push_phase_binds_github_repository_ref_and_sha(self):
        with tempfile.TemporaryDirectory(prefix="skincare-repository-proof-") as directory:
            root = Path(directory)
            self.create_repository(root)
            self.run_command("git", "remote", "add", "origin", EXPECTED_REMOTE, cwd=root)
            commit_sha = self.run_command("git", "rev-parse", "HEAD", cwd=root).stdout.strip()
            remote_environment = self.fake_ls_remote_environment(
                root,
                f"{commit_sha}\trefs/heads/main\n",
            )
            result = self.verify_repository(
                root,
                "post-push",
                environment_overrides=remote_environment,
                expected_repository="aancha/skincare-decision-hub",
                expected_ref="refs/heads/main",
                expected_pushed_sha=commit_sha,
            )
            self.assertIn("phase=post-push", result.stdout)

            for label, overrides, expected_message in (
                ("repository", {"expected_repository": "other/repository"}, "repository identity mismatch"),
                ("ref", {"expected_ref": "refs/heads/other"}, "Git ref mismatch"),
                ("sha", {"expected_pushed_sha": "0" * 40}, "commit does not match"),
            ):
                with self.subTest(label=label):
                    values = {
                        "environment_overrides": remote_environment,
                        "expected_repository": "aancha/skincare-decision-hub",
                        "expected_ref": "refs/heads/main",
                        "expected_pushed_sha": commit_sha,
                        **overrides,
                    }
                    failed = self.verify_repository(root, "post-push", check=False, **values)
                    self.assertNotEqual(failed.returncode, 0)
                    self.assertIn(expected_message, failed.stderr)

            extra_ref_environment = {
                **remote_environment,
                "FAKE_LS_REMOTE_OUTPUT": (
                    f"{commit_sha}\trefs/heads/main\n"
                    f"{commit_sha}\trefs/heads/unapproved\n"
                ),
            }
            failed = self.verify_repository(
                root,
                "post-push",
                check=False,
                environment_overrides=extra_ref_environment,
                expected_repository="aancha/skincare-decision-hub",
                expected_ref="refs/heads/main",
                expected_pushed_sha=commit_sha,
            )
            self.assertNotEqual(failed.returncode, 0)
            self.assertIn("Published remote must contain exactly", failed.stderr)

    def test_fresh_repository_rejects_dirty_tree_grafts_and_unexpected_refs(self):
        with tempfile.TemporaryDirectory(prefix="skincare-repository-proof-") as directory:
            root = Path(directory)
            self.create_repository(root)
            malformed = self.verify_repository(
                root,
                "pre-gate-2",
                check=False,
                forbidden_objects=("a" * 41,),
            )
            self.assertNotEqual(malformed.returncode, 0)
            self.assertIn("object ID is malformed", malformed.stderr)
            dirty = root / "untracked.txt"
            dirty.write_text("not committed\n", encoding="utf-8")
            self.assertNotEqual(self.verify_repository(root, "pre-gate-2", check=False).returncode, 0)
            dirty.unlink()

            commit_sha = self.run_command("git", "rev-parse", "HEAD", cwd=root).stdout.strip()
            grafts = root / ".git" / "info" / "grafts"
            grafts.write_text(f"{commit_sha}\n", encoding="utf-8")
            self.assertNotEqual(self.verify_repository(root, "pre-gate-2", check=False).returncode, 0)
            grafts.unlink()

            self.run_command("git", "update-ref", "refs/notes/unapproved", commit_sha, cwd=root)
            result = self.verify_repository(root, "pre-gate-2", check=False)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("only ref", result.stderr)
            self.run_command("git", "update-ref", "-d", "refs/notes/unapproved", cwd=root)

            self.run_command("git", "update-ref", f"refs/replace/{commit_sha}", commit_sha, cwd=root)
            result = self.verify_repository(root, "pre-gate-2", check=False)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("only ref", result.stderr)

    def test_fresh_repository_rejects_every_history_and_identity_escape(self):
        def run_mutation(label, mutate, expected_message):
            with self.subTest(label=label), tempfile.TemporaryDirectory(prefix="skincare-repository-proof-") as directory:
                root = Path(directory)
                self.create_repository(root)
                mutate(root)
                result = self.verify_repository(root, "pre-gate-2", check=False)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn(expected_message, result.stderr)

        def add_alternate(root):
            path = root / ".git" / "objects" / "info" / "alternates"
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("/nonexistent/object-store\n", encoding="utf-8")

        def add_shallow_marker(root):
            commit_sha = self.run_command("git", "rev-parse", "HEAD", cwd=root).stdout.strip()
            (root / ".git" / "shallow").write_text(f"{commit_sha}\n", encoding="utf-8")

        def add_parented_commit(root):
            (root / "README.md").write_text("# Second commit\n", encoding="utf-8")
            self.run_command("git", "add", "README.md", cwd=root)
            self.run_command("git", "commit", "-q", "-m", "Create forbidden parent", cwd=root)

        def add_tag(root):
            self.run_command("git", "tag", "v0", cwd=root)

        def add_unreachable_object(root):
            self.run_command("git", "hash-object", "-w", "--stdin", cwd=root, input_text="unreachable\n")

        def change_commit_message(root):
            self.run_command("git", "commit", "--amend", "-q", "-m", "Unapproved release message", cwd=root)

        def pad_commit_message(root):
            self.run_command(
                "git",
                "commit",
                "--amend",
                "-q",
                "--cleanup=verbatim",
                "-F",
                "-",
                cwd=root,
                input_text=f"{EXPECTED_COMMIT_MESSAGE} \n",
            )

        def change_local_identity(root):
            self.run_command("git", "config", "--local", "user.name", "Unapproved Identity", cwd=root)

        def add_git_database_symlink(root):
            (root / ".git" / "redirected-link").symlink_to(root.parent)

        run_mutation("object alternate", add_alternate, "alternates are forbidden")
        run_mutation("shallow repository", add_shallow_marker, "not a fresh-history proof")
        run_mutation("parented commit", add_parented_commit, "Exactly one reachable commit")
        run_mutation("tag", add_tag, "only ref")
        run_mutation("unreachable object", add_unreachable_object, "Unreachable Git objects")
        run_mutation("commit message", change_commit_message, "approved public release message")
        run_mutation("padded commit message", pad_commit_message, "approved public release message")
        run_mutation("identity", change_local_identity, "user.name mismatch")
        run_mutation("Git database symlink", add_git_database_symlink, "Symlinks are forbidden")

    def test_fresh_repository_rejects_extra_fetch_url_and_missing_manifest_blob(self):
        with tempfile.TemporaryDirectory(prefix="skincare-repository-proof-") as directory:
            root = Path(directory)
            self.create_repository(root)
            self.run_command("git", "remote", "add", "origin", EXPECTED_REMOTE, cwd=root)
            self.run_command("git", "remote", "set-url", "--add", "origin", "https://example.invalid/unapproved.git", cwd=root)
            result = self.verify_repository(root, "post-create-pre-push", check=False)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Exactly one approved origin fetch URL", result.stderr)

        with tempfile.TemporaryDirectory(prefix="skincare-repository-proof-") as directory:
            root = Path(directory)
            scripts = root / "scripts"
            scripts.mkdir(parents=True)
            for name in ("publication_manifest.py", "verify_fresh_repository.py"):
                shutil.copy2(ROOT / "scripts" / name, scripts / name)
            (root / ".gitignore").write_text("PUBLICATION_MANIFEST.json\n", encoding="utf-8")
            (root / "README.md").write_text("# Missing manifest blob\n", encoding="utf-8")
            self.run_command("git", "init", "-q", "-b", "main", cwd=root)
            self.run_command("git", "config", "--local", "user.name", AUTHOR_NAME, cwd=root)
            self.run_command("git", "config", "--local", "user.email", AUTHOR_EMAIL, cwd=root)
            self.run_command("git", "config", "--local", "commit.gpgSign", "false", cwd=root)
            self.run_command("git", "add", "--all", cwd=root)
            self.run_command("git", "commit", "-q", "-m", EXPECTED_COMMIT_MESSAGE, cwd=root)
            self.run_command(
                sys.executable,
                str(scripts / "publication_manifest.py"),
                "generate",
                "--root",
                str(root),
                "--manifest",
                str(root / "PUBLICATION_MANIFEST.json"),
                cwd=root,
            )
            result = self.verify_repository(root, "pre-gate-2", check=False)
            self.assertNotEqual(result.returncode, 0)

    def test_verifier_scrubs_git_repository_redirection_environment(self):
        with tempfile.TemporaryDirectory(prefix="skincare-repository-proof-") as directory:
            root = Path(directory)
            self.create_repository(root)
            result = self.verify_repository(
                root,
                "pre-gate-2",
                environment_overrides={
                    "GIT_DIR": "/nonexistent/redirected-git-dir",
                    "GIT_WORK_TREE": "/nonexistent/redirected-work-tree",
                    "GIT_OBJECT_DIRECTORY": "/nonexistent/redirected-object-store",
                    "GIT_ALTERNATE_OBJECT_DIRECTORIES": "/nonexistent/alternate-object-store",
                    "GIT_INDEX_FILE": "/nonexistent/redirected-index",
                    "GIT_NAMESPACE": "redirected-namespace",
                    "GIT_CONFIG_COUNT": "1",
                    "GIT_CONFIG_KEY_0": "core.worktree",
                    "GIT_CONFIG_VALUE_0": "/nonexistent/config-work-tree",
                },
            )
            self.assertIn("phase=pre-gate-2", result.stdout)

    def test_verifier_rejects_core_worktree_and_commondir_redirection(self):
        with tempfile.TemporaryDirectory(prefix="skincare-repository-proof-") as directory:
            parent = Path(directory)
            root = parent / "candidate"
            alternate = parent / "alternate-worktree"
            root.mkdir()
            self.create_repository(root)
            shutil.copytree(root, alternate, ignore=shutil.ignore_patterns(".git"))
            self.run_command("git", "config", "--local", "core.worktree", str(alternate), cwd=root)
            (root / "README.md").write_text("# Unverified root bytes\n", encoding="utf-8")
            result = self.verify_repository(root, "pre-gate-2", check=False)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("core.worktree redirection is forbidden", result.stderr)

        with tempfile.TemporaryDirectory(prefix="skincare-repository-proof-") as directory:
            root = Path(directory)
            self.create_repository(root)
            (root / ".git" / "commondir").write_text("../redirected-common-dir\n", encoding="utf-8")
            result = self.verify_repository(root, "pre-gate-2", check=False)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("common directory is forbidden", result.stderr)

        with tempfile.TemporaryDirectory(prefix="skincare-repository-proof-") as directory:
            root = Path(directory)
            self.create_repository(root)
            self.run_command("git", "config", "--local", "include.path", "/nonexistent/external-config", cwd=root)
            result = self.verify_repository(root, "pre-gate-2", check=False)
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("configuration includes are forbidden", result.stderr)

    def test_verifier_ignores_alternate_index_environment(self):
        with tempfile.TemporaryDirectory(prefix="skincare-repository-proof-") as directory:
            root = Path(directory)
            self.create_repository(root)
            alternate_index = root / ".git" / "alternate-index"
            shutil.copy2(root / ".git" / "index", alternate_index)
            readme = root / "README.md"
            readme.write_text("# Staged only in the canonical index\n", encoding="utf-8")
            self.run_command("git", "add", "README.md", cwd=root)
            readme.write_text("# Release proof fixture\n", encoding="utf-8")
            result = self.verify_repository(
                root,
                "pre-gate-2",
                check=False,
                environment_overrides={"GIT_INDEX_FILE": str(alternate_index)},
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("Index and worktree must exactly match HEAD", result.stderr)


if __name__ == "__main__":
    unittest.main()
