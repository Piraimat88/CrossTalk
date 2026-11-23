from datetime import datetime, timedelta
from pathlib import Path

from crosstalk.decoys.registry import DEFAULT_REGISTRY_PATH, load_registry
from crosstalk.monitoring.events import make_event
from crosstalk.monitoring.logger import log_event

# Window after planting in which events are ignored.
PLANTING_GRACE = timedelta(seconds=3)


def find_canary(file_path, registry):
    """Return the registry record for file_path, or None if it isn't a canary."""
    wanted = str(Path(file_path).resolve())
    for record in registry:
        if record["path"] == wanted:
            return record
    return None


def check_event(event, registry):
    """Return a canary alert event if this event touches a canary, else None."""
    record = find_canary(event["file_path"], registry)
    if record is None:
        return None

    event_time = datetime.fromisoformat(event["timestamp"])
    planted_time = datetime.fromisoformat(record["created"])
    if event_time <= planted_time + PLANTING_GRACE:
        return None

    alert = make_event("canary_alert", record["path"], event["agent_id"])
    alert["operation"] = event["event_type"]
    return alert


def handle_event(event, registry_path=DEFAULT_REGISTRY_PATH):
    """Check one event against the registry; print and log an alert if it fires."""
    registry = load_registry(registry_path)
    alert = check_event(event, registry)
    if alert is not None:
        print(f"ALERT: {alert['agent_id']} {alert['operation']} {alert['file_path']}")
        log_event(alert)