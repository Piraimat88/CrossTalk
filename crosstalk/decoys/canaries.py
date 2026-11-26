import random
from pathlib import Path

#import default registry path and register_canary function from registry.py
from .registry import DEFAULT_REGISTRY_PATH, register_canary

"""lists topics and kinds of files used to generate decoy/canary files for the monitoring engine"""

TOPICS = ["budget", "meeting", "project","hr", "quarterly", "financial"]
KINDS = ["plan", "summary", "proposal", "assessment", "evaluation", "report"]

"""Name templates for decoy/canary files, using placeholders for topic, kind, and number."""

NAME_TEMPLATES = [
    "{topic}_{kind}_{number}.txt",
    "{kind}_{topic}_{number}.md",
    "{topic}_{kind}_{number}.txt",
    "{topic}{kind}_{number}.md ",
]


"""Content templates for the decoy/canary files body contents."""

CONTENT_TEMPLATES = [
    (
        "{topic} {kind}\n\n"
        "Case number: {number}\n"
        "Open items:\n "
        "- ensure {topic} is complant with regulations.\n"
        "- send an update to support team regarding the {topic} {kind}."
    ),
    (
        "This is a {kind} for the {topic} project.\n"
        "Case number: {number}\n"
        "Please review and provide feedback."
    ),
    (
        "Subject: {topic} {kind} Update\n"
        "Case number: {number}\n"
        "Dear team,\n"
        "Please find attached the latest {kind} for the {topic} project.\n"
        "Your feedback is appreciated."
    )
]


"""Creates and defines the canary files."""

def generate_canary():
    """Return a (file_name, content) pair for one decoy file."""

    topic = random.choice(TOPICS)
    kind = random.choice(KINDS)
    number = random.randint(1, 1000)

    name_template = random.choice(NAME_TEMPLATES)
    content_template = random.choice(CONTENT_TEMPLATES)

    file_name = name_template.format(topic=topic, kind=kind, number=number)
    content = content_template.format(topic=topic, kind=kind, number=number)

    return file_name, content

#implement planter
def plant_canary(shared_dir, registry_path=DEFAULT_REGISTRY_PATH):
    """Write a new canary file into shared_dir and return its path."""
    folder = Path(shared_dir)
    folder.mkdir(parents=True, exist_ok=True)

    while True:
        name, content = generate_canary()
        #in this case, is not division; its how Path joins a folder and a file name.
        path = folder / name
        if not path.exists():
            break

    path.write_text(content, encoding="utf-8")
    register_canary(path, registry_path)
    return path

