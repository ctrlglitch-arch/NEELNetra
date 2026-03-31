# app/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from app.crud import load_river_data
from app.utils import calculate_pollution_index, dominant_pollutant, disease_risk
import matplotlib.pyplot as plt
import io

app = FastAPI(title="NeelNetra Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Home Route
@app.get("/")
def home():
    return {"message": "Welcome to NeelNetra Backend - Hackathon MVP"}


# ✅ MAIN DATA API
@app.get("/api/river/{river_name}")
def river_info(river_name: str):

    river_data = load_river_data(river_name.lower())

    if not river_data:
        raise HTTPException(status_code=404, detail="River not found")

    latest_data = river_data[-1]

    pollution_index = calculate_pollution_index(latest_data)
    lead_pollutant = dominant_pollutant(latest_data)
    risks = disease_risk(pollution_index, latest_data)

    response = {
    "river": river_name.title(),
    "current_pollution_index": pollution_index,
    "dominant_pollutant": lead_pollutant,
    "disease_risks": risks,
    "latest_chemistry": latest_data,
    "advice": "Avoid direct contact and boil water before use."
}

    return JSONResponse(content=response)


# ✅ GRAPH IMAGE API (🔥 IMPORTANT)
@app.get("/api/river/{river_name}/graph")
def river_graph(river_name: str):

    river_data = load_river_data(river_name.lower())

    if not river_data:
        raise HTTPException(status_code=404, detail="River not found")

    years = [data["year"] for data in river_data]

    # Multiple parameters
    bod = [data["BOD"] for data in river_data]
    do = [data["DO"] for data in river_data]
    nitrate = [data["Nitrate"] for data in river_data]

    # (optional extra)
    ph = [data["pH"] for data in river_data]
    phosphate = [data["Phosphate"] for data in river_data]

    plt.figure(figsize=(10,6))

    plt.plot(years, bod, marker='o', label="BOD")
    plt.plot(years, do, marker='o', label="DO")
    plt.plot(years, nitrate, marker='o', label="Nitrate")

    # optional lines
    plt.plot(years, ph, linestyle='--', label="pH")
    plt.plot(years, phosphate, linestyle='--', label="Phosphate")

    plt.title(f"{river_name.title()} River Chemistry Trend")
    plt.xlabel("Year")
    plt.ylabel("Level")

    plt.legend()
    plt.grid()

    import io
    from fastapi.responses import StreamingResponse

    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    plt.close()

    return StreamingResponse(buf, media_type="image/png")