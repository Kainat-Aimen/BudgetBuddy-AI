"""
BudgetBuddy AI - Flask Backend
Owner: Member 2

This is the main entry point. Import and call the module functions
built by Members 3-6 here, rather than writing their logic inline.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS

from database.models import init_db, save_transaction, get_transactions, save_goal, get_goals
from modules.categorization import categorize
from modules.anomaly_detection import is_anomaly
from modules.chat_advisor import get_advice
from modules.ocr_scanner import scan_receipt
from modules.forecast import forecast_next_month

app = Flask(__name__)
CORS(app)  # allows the frontend (served separately) to call this API

init_db()


@app.route("/transactions", methods=["POST"])
def add_transaction():
    """
    Expects JSON: { "amount": float, "description": str, "date": "YYYY-MM-DD" }
    TODO (Member 2): validate input
    TODO (Member 3): categorization + anomaly detection are already wired below
    """
    data = request.get_json()
    amount = data.get("amount")
    description = data.get("description", "")
    date = data.get("date")

    category = categorize(description)
    history = get_transactions(category=category)
    flagged = is_anomaly(amount, category, history)

    transaction = save_transaction(
        amount=amount,
        description=description,
        category=category,
        date=date,
        is_anomaly=flagged,
        source="manual",
    )
    return jsonify(transaction), 201


@app.route("/transactions", methods=["GET"])
def list_transactions():
    return jsonify(get_transactions())


@app.route("/goals", methods=["POST"])
def add_goal():
    """
    Expects JSON: { "target_amount": float, "deadline": "YYYY-MM-DD" }
    TODO (Member 6): hook up progress-tracking logic here
    """
    data = request.get_json()
    goal = save_goal(target_amount=data.get("target_amount"), deadline=data.get("deadline"))
    return jsonify(goal), 201


@app.route("/goals", methods=["GET"])
def list_goals():
    return jsonify(get_goals())


@app.route("/chat", methods=["POST"])
def chat():
    """
    Expects JSON: { "question": str }
    TODO (Member 4): implement get_advice() in modules/chat_advisor.py
    """
    data = request.get_json()
    question = data.get("question", "")
    transactions = get_transactions()
    answer = get_advice(question, transactions)
    return jsonify({"answer": answer})


@app.route("/scan-receipt", methods=["POST"])
def scan_receipt_route():
    """
    Expects a multipart/form-data image upload under the key 'receipt'.
    TODO (Member 5): implement scan_receipt() in modules/ocr_scanner.py
    """
    image_file = request.files.get("receipt")
    extracted = scan_receipt(image_file)
    return jsonify(extracted)


@app.route("/forecast", methods=["GET"])
def forecast():
    """
    TODO (Member 6): implement forecast_next_month() in modules/forecast.py
    """
    transactions = get_transactions()
    prediction = forecast_next_month(transactions)
    return jsonify(prediction)


if __name__ == "__main__":
    app.run(debug=True, port=5000)
