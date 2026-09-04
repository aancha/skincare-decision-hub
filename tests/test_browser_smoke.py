import functools
import json
import os
import shutil
import subprocess
import tempfile
import threading
import time
import unittest
import urllib.request
import uuid
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
RESULTS = {}
RESULTS_CONDITION = threading.Condition()
UNEXPECTED_API_REQUESTS = []


class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format_string, *args):
        return

    def do_GET(self):
        if self.path.startswith("/api/"):
            UNEXPECTED_API_REQUESTS.append(self.path)
            self.send_error(418)
            return
        super().do_GET()

    def do_POST(self):
        if self.path != "/__smoke_result__":
            self.send_error(404)
            return
        length = int(self.headers.get("Content-Length", "0"))
        payload = json.loads(self.rfile.read(length).decode("utf-8"))
        token = str(payload.get("token", ""))
        with RESULTS_CONDITION:
            RESULTS[token] = payload
            RESULTS_CONDITION.notify_all()
        self.send_response(204)
        self.end_headers()


def find_browser() -> str:
    candidates = (
        shutil.which("google-chrome"),
        shutil.which("chromium"),
        shutil.which("chromium-browser"),
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        "/Applications/Chromium.app/Contents/MacOS/Chromium",
    )
    for candidate in candidates:
        if candidate and Path(candidate).is_file() and os.access(candidate, os.X_OK):
            return candidate
    raise AssertionError("Chrome or Chromium is required for the public browser smoke test")


class PublicBrowserSmokeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        UNEXPECTED_API_REQUESTS.clear()
        handler = functools.partial(QuietHandler, directory=str(ROOT))
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
        cls.server_thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.server_thread.start()
        cls.base_url = f"http://127.0.0.1:{cls.server.server_port}"
        with urllib.request.urlopen(f"{cls.base_url}/tests/browser-smoke.html", timeout=5) as response:
            if response.status != 200:
                raise AssertionError("Browser smoke harness is not reachable")

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.server_thread.join(timeout=5)

    def test_catalog_shortlist_and_routine_at_desktop_and_mobile_sizes(self):
        browser = find_browser()
        for width, height in ((1440, 1000), (390, 844)):
            with self.subTest(viewport=f"{width}x{height}"), tempfile.TemporaryDirectory(
                prefix="skincare-hub-browser-smoke-"
            ) as profile_dir:
                token = uuid.uuid4().hex
                command = [
                    browser,
                    "--headless=new",
                    "--disable-background-networking",
                    "--disable-breakpad",
                    "--disable-component-update",
                    "--disable-default-apps",
                    "--disable-extensions",
                    "--disable-sync",
                    "--metrics-recording-only",
                    "--no-first-run",
                    "--host-resolver-rules=MAP * 0.0.0.0, EXCLUDE 127.0.0.1",
                    f"--user-data-dir={profile_dir}",
                    f"--window-size={width},{height}",
                    f"{self.base_url}/tests/browser-smoke.html?viewport={width}x{height}&token={token}",
                ]
                process = subprocess.Popen(
                    command,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                )
                deadline = time.monotonic() + 25
                with RESULTS_CONDITION:
                    while token not in RESULTS and time.monotonic() < deadline:
                        RESULTS_CONDITION.wait(timeout=max(0, deadline - time.monotonic()))
                    payload = RESULTS.pop(token, None)
                process.terminate()
                try:
                    stdout, stderr = process.communicate(timeout=5)
                except subprocess.TimeoutExpired:
                    process.kill()
                    stdout, stderr = process.communicate(timeout=5)
                detail = (stderr or stdout)[-3000:]
                self.assertIsNotNone(payload, f"Browser did not report a result. {detail}")
                self.assertEqual(payload.get("status"), "passed", payload.get("detail") or detail)
                self.assertIn(
                    "12 products; saved flow; shortlist; routine; four Learn guardrails; 50-case browser contract; public network boundary",
                    payload.get("detail", ""),
                )
        self.assertEqual(UNEXPECTED_API_REQUESTS, [], "Public showcase requested an API path")


if __name__ == "__main__":
    unittest.main()
