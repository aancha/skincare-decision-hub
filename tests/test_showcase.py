import functools
import hashlib
import json
import re
import struct
import threading
import unittest
import urllib.request
from collections import Counter
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
ALLOWED_PUBLIC_FILES = {
    ".github/workflows/ci.yml",
    ".github/SECURITY.md",
    ".gitignore",
    "LICENSE",
    "NOTICE.md",
    "PUBLICATION_MANIFEST.json",
    "README.md",
    "data/generated/articles.json",
    "data/generated/catalog.json",
    "data/generated/ratings.json",
    "docs/README.md",
    "docs/architecture/data-pipeline.md",
    "docs/architecture/overview.md",
    "docs/assets/catalog-desktop-synthetic.png",
    "docs/assets/demo-video-poster.png",
    "docs/assets/demo-video-poster.svg",
    "docs/assets/github-social-preview-1280x640.png",
    "docs/assets/github-social-preview-1280x640.svg",
    "docs/assets/shortlist-mobile-synthetic.png",
    "docs/portfolio/case-study.md",
    "docs/portfolio/demo-walkthrough.md",
    "docs/portfolio/engineering-decisions.md",
    "docs/portfolio/evidence.md",
    "docs/portfolio/responsible-ml.md",
    "docs/research/ml/README.md",
    "docs/research/ml/data-card.md",
    "docs/research/ml/model-card.md",
    "scripts/evaluate_skincare_guardrails.py",
    "scripts/check_python_syntax.py",
    "scripts/publication_manifest.py",
    "scripts/routine_planner.py",
    "scripts/skincare_guardrails.py",
    "scripts/verify_fresh_repository.py",
    "tests/browser-smoke.html",
    "tests/fixtures/skincare_guardrail_eval_cases.json",
    "tests/test_browser_smoke.py",
    "tests/test_release_proofs.py",
    "tests/test_showcase.py",
    "web/affiliate-config.js",
    "web/app.js",
    "web/assets/synthetic/cleanser.svg",
    "web/assets/synthetic/moisturizer.svg",
    "web/assets/synthetic/serum.svg",
    "web/assets/synthetic/sunscreen.svg",
    "web/catalog/index.html",
    "web/favicon.svg",
    "web/index.html",
    "web/js/api.js",
    "web/js/cards.js",
    "web/js/catalog.js",
    "web/js/guardrails.js",
    "web/js/recommender.js",
    "web/js/recommender_learning_pilot.js",
    "web/js/recommender_residual_shadow_demo.js",
    "web/js/recommender_residual_slice.js",
    "web/js/recommender_v2.js",
    "web/js/routine.js",
    "web/js/shortlist.js",
    "web/js/state.js",
    "web/public-preflight.js",
    "web/shortlist/index.html",
    "web/skincare_guardrails.json",
    "web/styles.css",
    "web/workplace/index.html",
    "web/workspace/index.html",
}

OPTIONAL_GATE_FILES = {
    "LICENSE",
    "PUBLICATION_MANIFEST.json",
    "docs/assets/catalog-desktop-synthetic.png",
    "docs/assets/shortlist-mobile-synthetic.png",
}


def png_dimensions(path: Path):
    with path.open("rb") as image:
        header = image.read(24)
    if len(header) != 24 or header[:8] != b"\x89PNG\r\n\x1a\n":
        raise AssertionError(f"{path.relative_to(ROOT)} is not a PNG")
    return struct.unpack(">II", header[16:24])


def png_chunk_types(path: Path) -> list[bytes]:
    content = path.read_bytes()
    if content[:8] != b"\x89PNG\r\n\x1a\n":
        raise AssertionError(f"{path.relative_to(ROOT)} is not a PNG")
    offset = 8
    chunks = []
    while offset + 12 <= len(content):
        length = struct.unpack(">I", content[offset : offset + 4])[0]
        chunk_type = content[offset + 4 : offset + 8]
        chunks.append(chunk_type)
        offset += 12 + length
        if chunk_type == b"IEND":
            break
    return chunks


class ShowcaseTests(unittest.TestCase):
    def test_public_boundary_excludes_private_material(self):
        repository_metadata = {".git"}
        root_names = {
            path.name
            for path in ROOT.iterdir()
            if path.name not in repository_metadata
        }
        required_root_names = {
            ".github",
            ".gitignore",
            "NOTICE.md",
            "README.md",
            "data",
            "docs",
            "scripts",
            "tests",
            "web",
        }
        allowed_root_names = required_root_names | {"LICENSE", "PUBLICATION_MANIFEST.json"}
        self.assertTrue(required_root_names.issubset(root_names))
        self.assertTrue(root_names.issubset(allowed_root_names))
        actual_public_files = {
            path.relative_to(ROOT).as_posix()
            for path in ROOT.rglob("*")
            if path.is_file()
            and path.relative_to(ROOT).parts[0] not in repository_metadata
        }
        expected_public_files = (ALLOWED_PUBLIC_FILES - OPTIONAL_GATE_FILES) | {
            relative
            for relative in OPTIONAL_GATE_FILES
            if (ROOT / relative).is_file()
        }
        self.assertEqual(actual_public_files, expected_public_files, "Public export differs from the reviewed pre-freeze allowlist")
        self.assertEqual(
            {
                path.relative_to(ROOT).as_posix()
                for path in (ROOT / "data").rglob("*")
                if path.is_file()
            },
            {
                "data/generated/articles.json",
                "data/generated/catalog.json",
                "data/generated/ratings.json",
            },
        )

        forbidden_names = {
            "credentials",
            "deploy",
            "id_dsa",
            "id_ecdsa",
            "id_ed25519",
            "id_rsa",
            "launchd",
            "output",
            "secrets",
        }
        forbidden_suffixes = {
            ".7z",
            ".bak",
            ".backup",
            ".db",
            ".env",
            ".gz",
            ".key",
            ".log",
            ".old",
            ".orig",
            ".p12",
            ".pfx",
            ".pem",
            ".rar",
            ".sqlite",
            ".sqlite3",
            ".tar",
            ".tgz",
            ".tmp",
            ".zip",
        }
        binary_suffixes = {".png"}
        secret_or_path_pattern = re.compile(
            r"/(?:Users|home)/|[A-Za-z]:\\Users\\|"
            r"-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----|"
            r"gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|glpat-[A-Za-z0-9_-]{20,}|"
            r"AKIA[0-9A-Z]{16}|"
            r"ASIA[0-9A-Z]{16}|"
            r"sk-[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|xapp-[A-Za-z0-9-]{10,}|"
            r"sk_(?:live|test)_[A-Za-z0-9]{16,}|rk_(?:live|test)_[A-Za-z0-9]{16,}|"
            r"npm_[A-Za-z0-9]{20,}|"
            r"AIza[0-9A-Za-z_-]{20,}|ya29\.[0-9A-Za-z_-]{20,}|"
            r"eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}|"
            r"(?i:(?:api[_-]?key|client[_-]?secret|password|private[_-]?key|access[_-]?token)\s*[:=]\s*[\"'][^\"']{8,}[\"'])|"
            r"(?i:(?:https?|ssh|ftp)://[^/\s:@]+:[^@\s/]+@)|"
            r"(?i:(?:postgres(?:ql)?|mysql|mongodb(?:\+srv)?|redis|amqp)://[^\s]+)|"
            r"(?i:[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})|"
            r"(?<![0-9])(?:10\.(?:[0-9]{1,3}\.){2}[0-9]{1,3}|192\.168\.(?:[0-9]{1,3}\.)[0-9]{1,3}|172\.(?:1[6-9]|2[0-9]|3[01])\.(?:[0-9]{1,3}\.)[0-9]{1,3})(?![0-9])|"
            r"(?i:[a-z0-9][a-z0-9.-]*\.local\b)|"
            r"(?i:(?:hooks\.slack\.com/services|discord(?:app)?\.com/api/webhooks|api\.telegram\.org/bot))"
        )

        violations = []
        for path in ROOT.rglob("*"):
            relative = path.relative_to(ROOT).as_posix()
            if path.relative_to(ROOT).parts[0] in repository_metadata:
                continue
            if path.is_symlink():
                violations.append(f"symlink: {relative}")
                continue
            if any(part.lower().startswith(".env") for part in path.relative_to(ROOT).parts):
                violations.append(f"environment path: {relative}")
            if forbidden_names.intersection(path.relative_to(ROOT).parts):
                violations.append(f"forbidden path: {relative}")
            if path.is_file() and path.suffix.lower() in forbidden_suffixes:
                violations.append(f"forbidden file type: {relative}")
            if path.is_file() and path.stat().st_size > 5 * 1024 * 1024:
                violations.append(f"file exceeds 5 MiB: {relative}")
            if path.is_file() and path.suffix.lower() not in binary_suffixes:
                try:
                    text = path.read_text(encoding="utf-8")
                except UnicodeDecodeError:
                    violations.append(f"unexpected binary file: {relative}")
                else:
                    if secret_or_path_pattern.search(text):
                        violations.append(f"secret/path marker: {relative}")

        self.assertEqual(violations, [], "\n".join(violations))

    def test_readme_front_door_contract(self):
        readme = (ROOT / "README.md").read_text(encoding="utf-8")
        self.assertLessEqual(len(readme.splitlines()), 180)
        self.assertLessEqual(len(readme.split()), 1500)
        self.assertNotRegex(readme, r"/(?:Users|home)/|[A-Za-z]:\\Users\\")
        self.assertNotRegex(readme, r"\b(?:TB|GP|APP-SUB)-?\d{3,}\b")
        self.assertEqual(len(re.findall(r"!\[[^]]*\]\([^)]*badge[^)]*\)", readme)), 1)
        public_workflow_url = "https://github.com/aancha/skincare-decision-hub/actions/workflows/ci.yml"
        self.assertIn(
            f"[![Public showcase CI]({public_workflow_url}/badge.svg)]({public_workflow_url})",
            readme,
        )
        self.assertIn("https://skincarehub.app/", readme)
        self.assertIn("local release-candidate status as of September 4, 2026 is 18/18", readme)
        self.assertIn("decision support, not medical advice", readme)
        self.assertIn("not affiliated with or endorsed", readme)
        self.assertIn("ML has no production ranking authority", readme)
        self.assertIn("python3 -m http.server 8000 --bind 127.0.0.1", readme)
        self.assertIn("http://127.0.0.1:8000/web/", readme)

        first_screen = "\n".join(readme.splitlines()[:14])
        for required_front_door_signal in (
            "A privacy-safe skincare comparison and decision-support experience",
            "[**Open the live product**](https://skincarehub.app/)",
            "Designed, built, tested, and operated end to end by **Aanchal**",
            "Stack: Python, SQLite, server-sent events",
            "docs/assets/catalog-desktop-synthetic.png",
        ):
            self.assertIn(required_front_door_signal, first_screen)

    def test_synthetic_evidence_language_and_links_fail_closed(self):
        notice = (ROOT / "NOTICE.md").read_text(encoding="utf-8")
        license_text = (ROOT / "LICENSE").read_text(encoding="utf-8")
        self.assertIn("MIT License", license_text)
        self.assertIn("Copyright (c) 2026 Aanchal", license_text)
        self.assertIn("The MIT License in `LICENSE` applies only", notice)
        self.assertIn("browser screenshots capture the owner-authored interface", notice)
        self.assertIn("only fictional synthetic fixtures", notice)
        self.assertIn("Legacy captures containing production-retailer content are excluded", notice)
        self.assertIn("Retailer names appear only as nominative text labels for comparison", notice)

        browser_sources = "\n".join(
            path.read_text(encoding="utf-8")
            for path in sorted((ROOT / "web").rglob("*"))
            if path.is_file() and path.suffix.lower() in {".html", ".js"}
        )
        for forbidden_copy in (
            "Best value today",
            "Lowest live price",
            "Strongest live rating",
            "current live catalog",
            "is currently ${money(product.price)} on",
            "High review confidence",
            "Strong review signal",
            "live review signal",
            "Available on backorder.",
            "Available for preorder.",
            "Seen in stock in the latest check.",
        ):
            self.assertNotIn(forbidden_copy, browser_sources)
        self.assertNotRegex(browser_sources, r'href="\$\{buildOutboundUrl\(')
        self.assertNotRegex(browser_sources, r"\.href\s*=\s*buildOutboundUrl\(")
        self.assertIn("Inert demo link", browser_sources)
        self.assertIn("synthetic fixture rating", browser_sources)
        self.assertIn('`$${value.toFixed(2)} · synthetic fixture`', browser_sources)
        self.assertNotIn("service-worker.js", browser_sources)
        self.assertNotIn("serviceWorker.register(", browser_sources)
        self.assertFalse((ROOT / "web" / "service-worker.js").exists())
        self.assertIn('browserSmokeAllowed && params.has("public-showcase-browser-smoke")', browser_sources)

        workflow_path = ROOT / ".github/workflows/ci.yml"
        workflow_bytes = workflow_path.read_bytes()
        self.assertEqual(
            hashlib.sha256(workflow_bytes).hexdigest(),
            "f7dfd3decd4547035ec7b915a8d96c10afeead86cea954fd48d0803393a4dadd",
            "CI workflow bytes changed; re-review the complete security boundary before updating this digest",
        )
        workflow = workflow_bytes.decode("utf-8")
        self.assertIn("on:\n  pull_request:\n  push:\n\npermissions:", workflow)
        self.assertIn("permissions:\n  contents: read", workflow)
        self.assertIn("runs-on: ubuntu-24.04", workflow)
        self.assertEqual(
            [line.strip() for line in workflow.splitlines() if line.strip().startswith("uses:")],
            ["uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683"],
        )
        self.assertIn("persist-credentials: false", workflow)
        self.assertIn('PYTHONDONTWRITEBYTECODE: "1"', workflow)
        self.assertIn("python3 scripts/check_python_syntax.py", workflow)
        self.assertNotIn("--phase post-push", workflow)
        self.assertNotIn("git ls-remote", workflow)
        self.assertNotIn("git remote remove origin", workflow)
        self.assertNotIn("compileall", workflow)
        for prohibited_workflow_token in (
            "pull_request_target",
            "workflow_dispatch",
            "schedule:",
            "contents: write",
            "secrets.",
            "upload-artifact",
            "pip install",
            "npm ",
            "curl ",
            "wget ",
            "apt-get ",
        ):
            self.assertNotIn(prohibited_workflow_token, workflow)

    def test_publication_manifest_matches_exact_export(self):
        manifest_path = ROOT / "PUBLICATION_MANIFEST.json"
        self.assertTrue(
            manifest_path.is_file(),
            "Final manifest is required after license, screenshots, and source freeze",
        )
        manifest_bytes = manifest_path.read_bytes()
        payload = json.loads(manifest_bytes)
        self.assertEqual(manifest_bytes, (json.dumps(payload, indent=2, sort_keys=True) + "\n").encode("utf-8"))
        self.assertEqual(payload.get("schemaVersion"), "skincare-hub-publication-manifest-v1")
        entries = payload.get("files")
        self.assertIsInstance(entries, list)
        paths = [entry.get("path") for entry in entries]
        self.assertEqual(paths, sorted(paths))
        self.assertEqual(len(paths), len(set(paths)))

        actual_paths = {
            path.relative_to(ROOT).as_posix()
            for path in ROOT.rglob("*")
            if path.is_file()
            and path != manifest_path
            and path.relative_to(ROOT).parts[0] != ".git"
            and "__pycache__" not in path.relative_to(ROOT).parts
            and path.suffix.lower() not in {".pyc", ".pyo"}
        }
        self.assertEqual(set(paths), actual_paths)
        for entry in entries:
            relative = entry["path"]
            content = (ROOT / relative).read_bytes()
            self.assertEqual(entry.get("bytes"), len(content), relative)
            self.assertEqual(entry.get("sha256"), hashlib.sha256(content).hexdigest(), relative)

    def test_required_visual_assets_exist_at_exact_dimensions(self):
        expected = {
            "docs/assets/catalog-desktop-synthetic.png": (1440, 1000),
            "docs/assets/shortlist-mobile-synthetic.png": (390, 844),
            "docs/assets/demo-video-poster.png": (1280, 720),
            "docs/assets/github-social-preview-1280x640.png": (1280, 640),
        }
        missing = [relative for relative in expected if not (ROOT / relative).is_file()]
        self.assertEqual(missing, [], f"Missing required visual assets: {missing}")
        for relative, dimensions in expected.items():
            self.assertEqual(png_dimensions(ROOT / relative), dimensions, relative)
        sensitive_metadata_chunks = {b"eXIf", b"iTXt", b"tEXt", b"tIME", b"zTXt"}
        for relative in expected:
            self.assertEqual(
                sensitive_metadata_chunks.intersection(png_chunk_types(ROOT / relative)),
                set(),
                f"Sensitive metadata chunk in {relative}",
            )

    def test_catalog_is_small_and_fully_synthetic(self):
        payload = json.loads(
            (ROOT / "data" / "generated" / "catalog.json").read_text(
                encoding="utf-8"
            )
        )
        products = payload["products"]
        self.assertEqual(payload["metadata"]["fixtureType"], "fictional-synthetic")
        self.assertEqual(len(products), 12)
        for product in products:
            self.assertEqual(product["source"], "fictional synthetic fixture")
            self.assertIn(product["brand"], {"Demo Lab", "Sample Science", "Placeholder Skin"})
            self.assertTrue(product["url"].startswith("https://example.invalid/"))
            self.assertTrue(product["image"].startswith("assets/synthetic/"))
        metadata = payload["metadata"]
        self.assertEqual(metadata["productCount"], len(products))
        self.assertEqual(metadata["retailerCounts"], dict(sorted(Counter(product["retailer"] for product in products).items())))
        self.assertEqual(metadata["categoryCounts"], dict(sorted(Counter(product["category"] for product in products).items())))
        concern_counts = Counter(concern for product in products for concern in product.get("concerns", []))
        self.assertEqual(metadata["concernCounts"], dict(sorted(concern_counts.items())))
        retailer_concern_matrix = {
            retailer: dict(sorted(Counter(
                concern
                for product in products
                if product["retailer"] == retailer
                for concern in product.get("concerns", [])
            ).items()))
            for retailer in sorted(metadata["retailers"])
        }
        self.assertEqual(metadata["retailerConcernMatrix"], retailer_concern_matrix)

    def test_static_quick_start_paths(self):
        handler = functools.partial(SimpleHTTPRequestHandler, directory=str(ROOT))
        server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        self.addCleanup(server.server_close)
        self.addCleanup(server.shutdown)
        base = f"http://127.0.0.1:{server.server_port}"
        with urllib.request.urlopen(f"{base}/web/", timeout=5) as response:
            self.assertEqual(response.status, 200)
            self.assertIn(b"Public showcase", response.read())
        with urllib.request.urlopen(
            f"{base}/data/generated/catalog.json", timeout=5
        ) as response:
            self.assertEqual(len(json.load(response)["products"]), 12)

    def test_local_markdown_links_resolve_case_sensitively(self):
        failures = []
        pattern = re.compile(r"!?\[[^]]*\]\(([^)]+)\)")
        for source in sorted(ROOT.rglob("*.md")):
            text = source.read_text(encoding="utf-8")
            for raw_href in pattern.findall(text):
                href = raw_href.strip().split(maxsplit=1)[0].strip("<>")
                parsed = urlsplit(href)
                if parsed.scheme or href.startswith(("#", "/")):
                    continue
                target = (source.parent / unquote(parsed.path)).resolve()
                try:
                    target.relative_to(ROOT.resolve())
                except ValueError:
                    failures.append(f"{source.relative_to(ROOT)} escapes: {href}")
                    continue
                if not target.exists():
                    failures.append(f"{source.relative_to(ROOT)} missing: {href}")
                    continue
                actual = ROOT
                for part in target.relative_to(ROOT).parts:
                    if part not in {entry.name for entry in actual.iterdir()}:
                        failures.append(f"{source.relative_to(ROOT)} case mismatch: {href}")
                        break
                    actual = actual / part
        self.assertEqual(failures, [], "\n".join(failures))


if __name__ == "__main__":
    unittest.main()
