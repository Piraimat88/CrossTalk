import json
from datetime import UTC, datetime
from pathlib import Path

DEFAULT_REGISTRY_PATH = Path("data/canary_registry.json")

def load_registry(registry_path=DEFAULT_REGISTRY_PATH):
    """Load the canary registry list from a JSON file (empty if none left.)"""
    path = Path(registry_path)
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8") as file:
        return json.load(file)

def register_canary(canary_path, registry_path=DEFAULT_REGISTRY_PATH):
    """Add one canary to the registry and return its record."""
    path = Path(registry_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    records = load_registry(path)
    record = {
        "path": str(Path(canary_path).resolve()),
        "created": datetime.now(UTC).isoformat(),
    }
    records.append(record)



    with path.open("w", encoding="utf-8") as file:
        json.dump(records, file, indent=2)
    return record