from datetime import date

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from database.models import Transaction, db

transaction_routes = Blueprint(
    "transaction_routes",
    __name__,
)


@transaction_routes.route("/transactions", methods=["POST"])
@jwt_required()
def add_transaction():
    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Transaction data is required"
        }), 400

    transaction_type = data.get("type")
    amount = data.get("amount")
    category = data.get("category")
    transaction_date = data.get("date")
    description = data.get("description", "")

    if transaction_type not in ["income", "expense"]:
        return jsonify({
            "error": "Type must be income or expense"
        }), 400

    if not amount or not category or not transaction_date:
        return jsonify({
            "error": "Amount, category and date are required"
        }), 400

    try:
        amount = float(amount)

        if amount <= 0:
            raise ValueError

        converted_date = date.fromisoformat(transaction_date)

    except (ValueError, TypeError):
        return jsonify({
            "error": "Enter a valid amount and date"
        }), 400

    logged_in_user_id = int(get_jwt_identity())

    transaction = Transaction()
    transaction.type = transaction_type
    transaction.amount = amount
    transaction.category = category
    transaction.date = converted_date
    transaction.description = description
    transaction.user_id = logged_in_user_id

    db.session.add(transaction)
    db.session.commit()

    return jsonify({
        "message": "Transaction added successfully",
        "transaction": {
            "id": transaction.id,
            "type": transaction.type,
            "amount": transaction.amount,
            "category": transaction.category,
            "date": transaction.date.isoformat(),
            "description": transaction.description,
            "user_id": transaction.user_id
        }
    }), 201


@transaction_routes.route("/transactions", methods=["GET"])
@jwt_required()
def get_transactions():
    logged_in_user_id = int(get_jwt_identity())

    transactions = Transaction.query.filter_by(
        user_id=logged_in_user_id
    ).order_by(Transaction.date.desc()).all()

    results = []

    for transaction in transactions:
        results.append({
            "id": transaction.id,
            "type": transaction.type,
            "amount": transaction.amount,
            "category": transaction.category,
            "date": transaction.date.isoformat(),
            "description": transaction.description
        })

    return jsonify({
        "transactions": results
    }), 200

@transaction_routes.route(
    "/transactions/<int:transaction_id>",
    methods=["PUT"]
)
@jwt_required()
def update_transaction(transaction_id):
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True)

    transaction = Transaction.query.filter_by(
        id=transaction_id,
        user_id=user_id
    ).first()

    if not transaction:
        return jsonify({
            "error": "Transaction not found"
        }), 404

    if not data:
        return jsonify({
            "error": "Transaction data is required"
        }), 400

    transaction_type = data.get("type")
    amount = data.get("amount")
    category = data.get("category", "").strip()
    transaction_date = data.get("date")
    description = data.get("description", "").strip()

    if transaction_type not in ["income", "expense"]:
        return jsonify({
            "error": "Type must be income or expense"
        }), 400

    try:
        amount = float(amount)
        converted_date = date.fromisoformat(transaction_date)

        if amount <= 0 or not category:
            raise ValueError

    except (ValueError, TypeError):
        return jsonify({
            "error": "Enter valid transaction information"
        }), 400

    transaction.type = transaction_type
    transaction.amount = amount
    transaction.category = category
    transaction.date = converted_date
    transaction.description = description

    db.session.commit()

    return jsonify({
        "message": "Transaction updated successfully",
        "transaction": {
            "id": transaction.id,
            "type": transaction.type,
            "amount": transaction.amount,
            "category": transaction.category,
            "date": transaction.date.isoformat(),
            "description": transaction.description
        }
    }), 200

@transaction_routes.route(
    "/transactions/<int:transaction_id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_transaction(transaction_id):
    user_id = int(get_jwt_identity())

    transaction = Transaction.query.filter_by(
        id=transaction_id,
        user_id=user_id
    ).first()

    if not transaction:
        return jsonify({
            "error": "Transaction not found"
        }), 404

    db.session.delete(transaction)
    db.session.commit()

    return jsonify({
        "message": "Transaction deleted successfully"
    }), 200