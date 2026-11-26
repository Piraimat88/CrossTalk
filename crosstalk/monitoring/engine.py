from pathlib import Path

from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

from .events import make_event
from .logger import log_event

DEFAULT_SHARED_DIR = Path("shared_storage")


class _EventHandler(FileSystemEventHandler):
    """Receives file activity from Watchdog and reports it."""

    def __init__(self, on_event=None):
        super().__init__()
        self._on_event = on_event

    def on_created(self, event):
        self._report("created", event)

    def on_modified(self, event):
        self._report("modified", event)

    def _report(self, event_type, event):
        if event.is_directory:
            return
        record = make_event(event_type, event.src_path)
        print(f"{record['event_type']}: {record['file_path']}")
        log_event(record)
        if self._on_event is not None:
            self._on_event(record)


class MonitoringEngine:
    """Watches a shared directory for file activity."""

    def __init__(self, shared_dir=DEFAULT_SHARED_DIR, on_event=None):
        self.shared_dir = Path(shared_dir).expanduser().resolve()
        self._on_event = on_event
        self._observer = None

    def start(self):
        self.shared_dir.mkdir(parents=True, exist_ok=True)
        self._observer = Observer()
        self._observer.schedule(
            _EventHandler(self._on_event), str(self.shared_dir), recursive=True
        )
        self._observer.start()

    def stop(self):
        if self._observer is not None:
            self._observer.stop()
            self._observer.join()
            self._observer = None