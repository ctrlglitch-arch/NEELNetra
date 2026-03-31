# app/crud.py
import json
from pathlib import Path

DATA_FILE = Path(__file__).parent / "data/river_data.json"

def load_river_data(river_name: str):
    """
    Load river data for a given river from JSON.
    Returns list of yearly chemical data.
    """
    if not DATA_FILE.exists():
        return None
    with open(DATA_FILE) as f:
        all_data = json.load(f)
    return all_data.get(river_name.lower())