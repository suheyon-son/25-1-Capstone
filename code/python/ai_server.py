from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    result = { 
        "message" : "This is a mock prediction.",
        "received_data" : data
        }
    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5000)