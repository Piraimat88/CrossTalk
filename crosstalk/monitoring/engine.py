from pathlib import Path

from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer


from .logger import log_event
from .events import make_event

DEFAULT_SHARED_DIR = Path("shared_storage")

record = make_event(event_type, event.src_path)
print(f"{record['event_type']}: {record['file_path']}")
log_event(record)

class _EventHandler(FileSystemEventHandler):
    """Recieves file activity from Watchdog and reports it."""

    'when called during creation of file, it will hand it off to _report method, passsing both the string "created"and the event.'
    def on_created(self, event):
        self._report("created", event)

    'Same as on_created, but for file modifications.'
    def on_modified(self, event):
        self._report("modified", event)


    'internal method that watchdog does not call directly, creates a record of the event and prints it to the console.'
    def _report(self, event_type, event):
        if event.is_directory:
            return
        record = make_event(event_type, event.src_path)
        print(f"{record['event_type']}: {record['file_path']}")


class MonitoringEngine:
    """Watches a shared directory for file activity."""

    def __init__(self, shared_dir: Path = DEFAULT_SHARED_DIR):
        self.shared_dir = Path(shared_dir).expanduser().resolve()
        self._observer = None

    def start(self):
        self.shared_dir.mkdir(parents=True, exist_ok=True)
        self._observer = Observer()
        self._observer.schedule(_EventHandler(), str(self.shared_dir), recursive=True)
        self._observer.start()

    def stop(self):
        if self._observer:
            self._observer.stop()
            self._observer.join()
            self._observer = None
        