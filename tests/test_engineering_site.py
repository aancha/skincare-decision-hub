"""Verify that the public build is complete, reproducible, and narrowly scoped."""

import hashlib
from html.parser import HTMLParser
import importlib.util
import json
import shlex
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from urllib.parse import urlsplit
import zipfile


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location("engineering_builder", ROOT / "scripts/build_engineering_site.py")
BUILDER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(BUILDER)


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.targets = []
        self.ids = []
        self.scripts = 0

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag in {"a", "link"} and "href" in values:
            self.targets.append(values["href"])
        if "id" in values:
            self.ids.append(values["id"])
        self.scripts += tag == "script"


class EngineeringSiteTests(unittest.TestCase):
    def test_build_is_reproducible_and_all_links_resolve(self):
        with tempfile.TemporaryDirectory() as first, tempfile.TemporaryDirectory() as second:
            self.assertEqual(BUILDER.build(Path(first)), BUILDER.build(Path(second)))
            page_root = Path(first).resolve() / "engineering"
            self.assertEqual({p.name for p in page_root.iterdir()}, {
                "index.html", "styles.css", "examples.html", "skincare-hub-engineering-examples.zip",
            })
            pages = {}
            for name in ("index.html", "examples.html"):
                parser = Links()
                parser.feed((page_root / name).read_text())
                self.assertEqual(parser.scripts, 0)
                self.assertEqual(len(parser.ids), len(set(parser.ids)))
                pages[name] = parser
            for name, parser in pages.items():
                for target in parser.targets:
                    link = urlsplit(target)
                    if link.scheme:
                        self.assertEqual(link.scheme, "https")
                        if link.hostname == "github.com":
                            self.assertIn(target, {
                                "https://github.com/aancha/skincare-decision-hub",
                                "https://github.com/aancha/skincare-decision-hub/blob/main/docs/portfolio/evidence.md",
                                "https://github.com/aancha/skincare-decision-hub/blob/main/docs/portfolio/engineering-examples.md",
                            })
                        else:
                            self.assertIn(link.hostname, {"skincarehub.app", "www.linkedin.com"})
                        continue
                    path = (page_root / link.path).resolve() if link.path else page_root / name
                    if path.is_dir():
                        path /= "index.html"
                    self.assertTrue(path.is_relative_to(page_root))
                    self.assertTrue(path.is_file(), target)
                    if link.fragment:
                        self.assertIn(link.fragment, pages[path.name].ids)
            with self.assertRaises(ValueError):
                BUILDER.build(Path(first))
        with self.assertRaises(ValueError):
            BUILDER.build(ROOT / "web/engineering")

    def test_download_contains_only_reviewed_sources_and_runs_independently(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "build"
            BUILDER.build(output)
            archive_path = output / "engineering/skincare-hub-engineering-examples.zip"
            with zipfile.ZipFile(archive_path) as archive:
                names = archive.namelist()
                expected = {f"{BUILDER.BUNDLE_NAME}/{p}" for p in BUILDER.SOURCE_FILES}
                expected |= {f"{BUILDER.BUNDLE_NAME}/{p}" for p in ("README.md", "NOTICE.md", "MANIFEST.json")}
                self.assertEqual(len(names), 24)
                self.assertEqual(set(names), expected)
                for source in BUILDER.SOURCE_FILES:
                    self.assertEqual(archive.read(f"{BUILDER.BUNDLE_NAME}/{source}"), (ROOT / source).read_bytes())
                archive.extractall(Path(directory) / "extracted")
            bundle = Path(directory) / "extracted" / BUILDER.BUNDLE_NAME
            manifest = json.loads((bundle / "MANIFEST.json").read_text())
            self.assertEqual(len(manifest["files"]), 23)
            self.assertNotIn("MANIFEST.json", manifest["files"])
            for name, digest in manifest["files"].items():
                self.assertEqual(hashlib.sha256((bundle / name).read_bytes()).hexdigest(), digest)
            self.assertEqual((bundle / "README.md").read_bytes(),
                             (ROOT / "docs/portfolio/engineering-examples.md").read_bytes())
            outputs = {}
            for line in BUILDER.reproduction_commands().splitlines():
                command = shlex.split(line)
                result = subprocess.run(
                    [sys.executable, *command[1:]], cwd=bundle,
                    env={"PYTHONDONTWRITEBYTECODE": "1", "PYTHONIOENCODING": "utf-8"},
                    capture_output=True, text=True, timeout=30,
                )
                self.assertEqual(result.returncode, 0, line + "\n" + result.stdout + result.stderr)
                outputs[line] = result
            result = outputs["python3 -B examples/evaluation/evaluate.py --split all"]
            report = json.loads(result.stdout)
            self.assertEqual(report["sampleCount"], 12)
            self.assertEqual(report["contractPassCount"], 12)


if __name__ == "__main__":
    unittest.main()
