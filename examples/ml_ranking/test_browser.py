"""Execute plain-JavaScript parity in a real local Chrome/Chromium process."""

import functools
import json
import os
import shutil
import subprocess
import tempfile
import threading
import unittest
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent


def find_browser() -> str:
    choices = (shutil.which("google-chrome"), shutil.which("chromium"), shutil.which("chromium-browser"),
               "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
    for candidate in choices:
        if candidate and Path(candidate).is_file() and os.access(candidate, os.X_OK):
            return candidate
    raise AssertionError("Chrome/Chromium required: open browser.html manually or install outside this example")


class Handler(SimpleHTTPRequestHandler):
    def log_message(self, format_string, *args):
        return

    def do_GET(self):
        # A real iframe viewport avoids the minimum top-level window width in Chrome.
        if self.path in ("/__ml_frame__/390", "/__ml_frame__/1440"):
            width = int(self.path.rsplit("/", 1)[1])
            body = (f'<!doctype html><html><title>ML viewport test</title><body style="margin:0">'
                    f'<iframe title="Parity example" style="border:0;width:{width}px;height:1000px" '
                    'src="/browser.html?test=1"></iframe></body></html>').encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()

    def do_POST(self):
        if self.path != "/__ml_result__":
            self.send_error(404)
            return
        size = int(self.headers.get("Content-Length", "0"))
        if not 0 < size <= 10000:
            self.send_error(400)
            return
        self.server.report = json.loads(self.rfile.read(size))
        self.send_response(204)
        self.end_headers()
        self.server.ready.set()


class BrowserParityTests(unittest.TestCase):
    def test_real_browser_parity_desktop_and_mobile(self):
        browser = find_browser()
        for width, height in ((1440, 1000), (390, 844)):
            with self.subTest(viewport=width), tempfile.TemporaryDirectory(prefix="synthetic-ranking-browser-") as profile:
                handler = functools.partial(Handler, directory=str(ROOT))
                server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
                server.ready = threading.Event()
                server.report = None
                thread = threading.Thread(target=server.serve_forever, daemon=True)
                thread.start()
                command = [browser, "--headless=new", "--disable-background-networking", "--disable-breakpad",
                           "--disable-component-update", "--disable-default-apps", "--disable-extensions", "--disable-sync",
                           "--metrics-recording-only", "--no-first-run", "--no-sandbox",
                           "--host-resolver-rules=MAP * 0.0.0.0, EXCLUDE 127.0.0.1",
                           f"--user-data-dir={profile}", f"--window-size={width},{height}",
                           f"http://127.0.0.1:{server.server_port}/__ml_frame__/{width}"]
                process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
                try:
                    self.assertTrue(server.ready.wait(25), "Browser did not return parity evidence")
                    self.assertEqual(server.report["status"], "PASS", server.report)
                    self.assertEqual(server.report["parityCases"], 50)
                    self.assertLessEqual(server.report["maximumNumericError"], 1e-9)
                    self.assertEqual(server.report["invalidArtifactsRejected"], 6)
                    self.assertTrue(server.report["checksumRejected"])
                    self.assertEqual(server.report["viewportWidth"], width)
                    self.assertFalse(server.report["overflow"])
                finally:
                    process.terminate()
                    try:
                        process.communicate(timeout=5)
                    except subprocess.TimeoutExpired:
                        process.kill()
                        process.communicate(timeout=5)
                    server.shutdown()
                    server.server_close()
                    thread.join(timeout=5)


if __name__ == "__main__":
    unittest.main()
