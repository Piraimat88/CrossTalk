from pathlib import Path

DEFAULT_SHARED_DIR = Path("shared_storage")

class MonitoringEngine:
    """Watches a shared directory for file activity."""

    def __init__(self, shared_dir: Path = DEFAULT_SHARED_DIR):
        self.shared_dir = Path(shared_dir).expanduser().resolve()