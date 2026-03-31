# app/schemas.py
from pydantic import BaseModel
from typing import List, Dict

class Trend(BaseModel):
    year: int
    pollution_index: int
    algae: int
    industrial: int

class RiverData(BaseModel):
    river: str
    current_level: str
    dominant_pollutant: str
    past_trends: List[Trend]
    disease_risks: List[str]
    advice: str