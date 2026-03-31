# app/utils.py
from io import BytesIO
import base64
import matplotlib
matplotlib.use("Agg") 
import matplotlib.pyplot as plt

def calculate_pollution_index(data_point):
    """
    Calculate a simple pollution index from chemical values.
    Higher BOD, higher Nitrate, and lower DO increase pollution index.
    """
    BOD = data_point.get("BOD", 0)
    DO = data_point.get("DO", 0)
    Nitrate = data_point.get("Nitrate", 0)
    
    # Weighted formula
    pollution_index = BOD*2 - DO*1.5 + Nitrate*3
    return max(0, round(pollution_index, 2))

def dominant_pollutant(data_point):
    """
    Determine the leading pollutant type based on chemical levels.
    """
    chemical_levels = {
        "Algae": data_point.get("Phosphate", 0),
        "Industrial": data_point.get("BOD", 0),
        "Nitrate Pollution": data_point.get("Nitrate", 0)
    }
    return max(chemical_levels, key=chemical_levels.get)

def disease_risk(pollution_index, data_point):
    """
    Suggest possible disease risks based on pollution index and chemicals.
    """
    risks = []
    if pollution_index > 6:
        risks.append("Cholera")
        risks.append("Skin infections")
    if data_point.get("Nitrate",0) > 2.5:
        risks.append("Gastrointestinal issues")
    return risks

def generate_trend_graph(river_data):
    """
    Generates a line plot of BOD, DO, Nitrate for the last 10 years.
    Returns base64 string for frontend embedding.
    """
    years = [d["year"] for d in river_data]
    BOD = [d["BOD"] for d in river_data]
    DO = [d["DO"] for d in river_data]
    Nitrate = [d["Nitrate"] for d in river_data]
    
    plt.figure(figsize=(8,5))
    plt.plot(years, BOD, label="BOD", marker="o")
    plt.plot(years, DO, label="DO", marker="o")
    plt.plot(years, Nitrate, label="Nitrate", marker="o")
    plt.title("River Chemistry Trend")
    plt.xlabel("Year")
    plt.ylabel("Level")
    plt.legend()
    plt.tight_layout()
    
    buf = BytesIO()
    plt.savefig(buf, format="png")
    plt.close()
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("utf-8")