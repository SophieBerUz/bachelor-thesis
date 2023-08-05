from flask import Flask, render_template, request,jsonify
import json
import os
import pandas as pd
app = Flask(__name__)

@app.route("/",methods=["POST","GET"])
def home():
    #define data
    with open('static/data/abortion_stance2_withoutRetweets.json','r', encoding='utf-8') as f:
        abortion = json.load(f)
    with open('static/data/feminism_stance2_withoutRetweets.json','r', encoding='utf-8') as f:
        feminism = json.load(f)
    with open('static/data/climate_stance2_withoutRetweets.json','r', encoding='utf-8') as f:
        climate = json.load(f)
    with open('static/data/hierarchy_bubbletree.json','r', encoding='utf-8') as f:
        data = json.load(f)
    with open('static/data/politicians.json','r', encoding='utf-8') as f:
        politicians = json.load(f)
    return render_template("main.html",abortion=abortion,climate=climate,feminism=feminism,data=data,politicians=politicians)

if __name__ == '__main__':
    app.run(debug=True)