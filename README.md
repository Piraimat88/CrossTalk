# Crosstalk

Detects AI agents that are meant to be isolated communicating through
shared storage. Sheridan College capstone, Kentucky Fried Coders.

## Setup
Requires Python 3.15.

```bash
git clone https://github.com/Piraimat88/CrossTalk.git
cd CrossTalk
python3.15 -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
python -m pip install -r requirements-dev.txt
```

## Run the checks
```bash
python -m pytest -q
python -m ruff check .
```

## Contributing
Work on a branch and open a pull request into main.
CI must pass before a pull request can be merged.