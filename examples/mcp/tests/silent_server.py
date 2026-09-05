"""Deliberately non-responsive local subprocess for client-deadline testing only."""

import sys
import threading

sys.stdin.buffer.readline()
threading.Event().wait(30)
