import json
from datetime import UTC, datetime


def make_event(event_type, file_path, agent_id=None):
    """Build a monitoring event record (a plain dictionary)."""
    return {
        "timestamp": datetime.now(UTC).isoformat(),
        "event_type": event_type,
        "file_path": str(file_path),
        "agent_id": agent_id,
    }


def event_to_json(event):
    """Convert an event record to a JSON string."""
    return json.dumps(event)