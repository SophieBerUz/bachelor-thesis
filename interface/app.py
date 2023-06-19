from flask import Flask, render_template, request,jsonify
import json
import os
import pandas as pd
app = Flask(__name__)

@app.route("/",methods=["POST","GET"])
def home():
    #define data
    with open('interface/static/data/abortion_stance_c.json','r', encoding='utf-8') as f:
        abortion = json.load(f)
    return render_template("main.html",abortion=abortion)

if __name__ == '__main__':
    app.run(debug=True)