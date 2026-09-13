from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import func

from database.models import Transaction, db

dashboard_routes = Blueprint(
    "dashboard_routes",
    __name__,
)


@dashboard_routes.route(
    "/dashboard/summary",
    methods=["GET"]
)
@jwt_required()
def get_dashboard_summary():
    user_id = int(get_jwt_identity())

    total_income = (
        db.session.query(
            func.coalesce(func.sum(Transaction.amount), 0)
        )
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "income",
        )
        .scalar()
    )

    total_expenses = (
        db.session.query(
            func.coalesce(func.sum(Transaction.amount), 0)
        )
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
        )
        .scalar()
    )

    total_income = float(total_income)
    total_expenses = float(total_expenses)
    current_balance = total_income - total_expenses

    return jsonify({
        "total_income": total_income,
        "total_expenses": total_expenses,
        "current_balance": current_balance,
        "currency": "PKR",
    }), 200


@dashboard_routes.route(
    "/dashboard/spending-by-category",
    methods=["GET"]
)
@jwt_required()
def get_spending_by_category():
    user_id = int(get_jwt_identity())

    category_totals = (
        db.session.query(
            Transaction.category,
            func.sum(Transaction.amount).label("total")
        )
        .filter(
            Transaction.user_id == user_id,
            Transaction.type == "expense",
        )
        .group_by(Transaction.category)
        .order_by(
            func.sum(Transaction.amount).desc()
        )
        .all()
    )

    results = []

    for category, total in category_totals:
        results.append({
            "category": category,
            "total": float(total)
        })

    return jsonify({
        "currency": "PKR",
        "categories": results
    }), 200