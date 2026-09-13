from calendar import monthrange
from datetime import date, datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import func

from database.models import Budget, Transaction, db

budget_routes = Blueprint(
    "budget_routes",
    __name__,
)


@budget_routes.route("/budgets", methods=["POST"])
@jwt_required()
def add_budget():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "Budget data is required"
        }), 400

    category = data.get("category", "").strip()
    limit_amount = data.get("limit_amount")
    month = data.get("month", "").strip()

    if not category or not limit_amount or not month:
        return jsonify({
            "error": "Category, limit amount and month are required"
        }), 400

    try:
        limit_amount = float(limit_amount)

        if limit_amount <= 0:
            raise ValueError

        datetime.strptime(month, "%Y-%m")

    except (ValueError, TypeError):
        return jsonify({
            "error": "Enter a valid amount and month in YYYY-MM format"
        }), 400

    user_id = int(get_jwt_identity())

    existing_budget = Budget.query.filter_by(
        user_id=user_id,
        category=category,
        month=month
    ).first()

    if existing_budget:
        return jsonify({
            "error": "Budget already exists for this category and month"
        }), 409

    budget = Budget()
    budget.category = category
    budget.limit_amount = limit_amount
    budget.month = month
    budget.user_id = user_id

    db.session.add(budget)
    db.session.commit()

    return jsonify({
        "message": "Budget added successfully",
        "budget": {
            "id": budget.id,
            "category": budget.category,
            "limit_amount": budget.limit_amount,
            "month": budget.month
        }
    }), 201


@budget_routes.route("/budgets", methods=["GET"])
@jwt_required()
def get_budgets():
    user_id = int(get_jwt_identity())
    month = request.args.get("month")

    query = Budget.query.filter_by(user_id=user_id)

    if month:
        query = query.filter_by(month=month)

    budgets = query.order_by(Budget.category).all()

    results = []

    for budget in budgets:
        results.append({
            "id": budget.id,
            "category": budget.category,
            "limit_amount": budget.limit_amount,
            "month": budget.month
        })

    return jsonify({
        "budgets": results
    }), 200

@budget_routes.route("/budgets/status", methods=["GET"])
@jwt_required()
def get_budget_status():
    user_id = int(get_jwt_identity())

    selected_month = request.args.get(
        "month",
        date.today().strftime("%Y-%m")
    )

    try:
        parsed_month = datetime.strptime(
            selected_month,
            "%Y-%m"
        )

    except ValueError:
        return jsonify({
            "error": "Month must use YYYY-MM format"
        }), 400

    year = parsed_month.year
    month_number = parsed_month.month
    final_day = monthrange(year, month_number)[1]

    start_date = date(year, month_number, 1)
    end_date = date(year, month_number, final_day)

    budgets = Budget.query.filter_by(
        user_id=user_id,
        month=selected_month
    ).all()

    results = []

    for budget in budgets:
        spent = (
            db.session.query(
                func.coalesce(
                    func.sum(Transaction.amount),
                    0
                )
            )
            .filter(
                Transaction.user_id == user_id,
                Transaction.type == "expense",
                Transaction.category == budget.category,
                Transaction.date >= start_date,
                Transaction.date <= end_date,
            )
            .scalar()
        )

        spent = float(spent)
        remaining = budget.limit_amount - spent
        percentage = (
            spent / budget.limit_amount
        ) * 100

        results.append({
            "id": budget.id,
            "category": budget.category,
            "limit_amount": budget.limit_amount,
            "spent": spent,
            "remaining": remaining,
            "percentage_used": round(percentage, 2),
            "is_over_budget": spent > budget.limit_amount
        })

    return jsonify({
        "month": selected_month,
        "currency": "PKR",
        "budgets": results
    }), 200

@budget_routes.route(
    "/budgets/<int:budget_id>",
    methods=["PUT"]
)
@jwt_required()
def update_budget(budget_id):
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True)

    budget = Budget.query.filter_by(
        id=budget_id,
        user_id=user_id
    ).first()

    if not budget:
        return jsonify({
            "error": "Budget not found"
        }), 404

    if not data:
        return jsonify({
            "error": "Budget data is required"
        }), 400

    category = data.get("category", "").strip()
    limit_amount = data.get("limit_amount")
    month = data.get("month", "").strip()

    try:
        limit_amount = float(limit_amount)
        datetime.strptime(month, "%Y-%m")

        if limit_amount <= 0 or not category:
            raise ValueError

    except (ValueError, TypeError):
        return jsonify({
            "error": "Enter valid budget information"
        }), 400

    budget.category = category
    budget.limit_amount = limit_amount
    budget.month = month

    db.session.commit()

    return jsonify({
        "message": "Budget updated successfully",
        "budget": {
            "id": budget.id,
            "category": budget.category,
            "limit_amount": budget.limit_amount,
            "month": budget.month
        }
    }), 200

@budget_routes.route(
    "/budgets/<int:budget_id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_budget(budget_id):
    user_id = int(get_jwt_identity())

    budget = Budget.query.filter_by(
        id=budget_id,
        user_id=user_id
    ).first()

    if not budget:
        return jsonify({
            "error": "Budget not found"
        }), 404

    db.session.delete(budget)
    db.session.commit()

    return jsonify({
        "message": "Budget deleted successfully"
    }), 200