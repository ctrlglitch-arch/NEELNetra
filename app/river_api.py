# filename: app.py
from flask import Flask, jsonify, send_from_directory
import matplotlib.pyplot as plt
import os

app = Flask(__name__)

# Create a folder to store static files if not exists
STATIC_FOLDER = "static"
if not os.path.exists(STATIC_FOLDER):
    os.makedirs(STATIC_FOLDER)

def generate_trend_graph():
    # Pollution index for Yamuna over 10 years
    years = list(range(2014, 2024))
    pollution_index = [12, 15, 17, 20, 18, 22, 23, 21, 22, 22.75]
    
    # Create plot
    plt.figure(figsize=(8, 4))
    plt.plot(years, pollution_index, marker='o', color='blue')
    plt.title("Yamuna Pollution Index Trend")
    plt.xlabel("Year")
    plt.ylabel("Pollution Index")
    plt.grid(True)
    
    # Save the plot to static folder
    file_path = os.path.join(STATIC_FOLDER, "yamuna_trend.png")
    plt.savefig(file_path)
    plt.close()
    
    # Return URL relative to backend
    return "/static/yamuna_trend.png"

@app.route("/api/river_data")
def river_data():
    # Generate the graph first
    graph_url = generate_trend_graph()
    
    # JSON payload with URL instead of huge base64
    data = {
        "river": "Yamuna",
        "current_pollution_index": 22.75,
        "dominant_pollutant": "Industrial",
        "disease_risks": [
            "Cholera",
            "Skin infections",
            "Gastrointestinal issues"
        ],
        "latest_chemistry": {
            "year": 2023,
            "pH": 6.3,
            "DO": 3.5,
            "BOD": 8,
            "Nitrate": 4,
            "Phosphate": 1.8,
            "Turbidity": 15
        },
        "trend_graph_url": graph_url  # <-- URL here
    }
    return jsonify(data)

# Route to serve static files (images)
@app.route("/static/<path:filename>")
def static_files(filename):
    return send_from_directory(STATIC_FOLDER, filename)

if __name__ == "__main__":
    app.run(debug=True)