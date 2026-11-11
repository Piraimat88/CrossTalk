from pathlib import Path
from .events import event_to_json

def log_event(event, log_path="data/logs/events.jsonl"):
    path = Path(log_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    with path.open("a", encoding="utf-8") as file:
        file.write(event_to_json(event) + "\n")

        
