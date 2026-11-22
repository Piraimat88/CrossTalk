from datetime import datetime, timedelta
from pathlib import Path

from crosstalk.monitoring.events import make_event

#window after planting in which events are ignored. allows for proper event visibility.
PLANTING_GRACE = timedelta(seconds=3)

def find_canary(file_path, registry):
    """Return the registry record for file_path, or None if it isnt a canary."""
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




    

    