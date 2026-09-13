from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from sqlalchemy import func

from database.models import (
    Budget,
    ChatMessage,
    SavingsGoal,
    Transaction,
    db,
)
from modules.chat_advisor import get_advice


chat_routes = Blueprint(
    "chat_routes",
    __name__,
)


@chat_routes.route("/chat", methods=["POST"])
@jwt_required()
def chat():
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "Question is required"
        }), 400

    question = data.get("question", "").strip()

    if not question:
        return jsonify({
            "error": "Question is required"
        }), 400

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

    transactions = (
        Transaction.query
        .filter_by(user_id=user_id)
        .order_by(Transaction.date.desc())
        .limit(100)
        .all()
    )

    budgets = Budget.query.filter_by(
        user_id=user_id
    ).all()

    goals = SavingsGoal.query.filter_by(
        user_id=user_id
    ).all()

    transaction_data = [
        {
            "type": transaction.type,
            "amount": transaction.amount,
            "category": transaction.category,
            "date": transaction.date.isoformat(),
            "description": transaction.description,
        }
        for transaction in transactions
    ]

    budget_data = [
        {
            "category": budget.category,
            "limit_amount": budget.limit_amount,
            "month": budget.month,
        }
        for budget in budgets
    ]

    goal_data = []

    for goal in goals:
        progress_percentage = 0

        if goal.target_amount > 0:
            progress_percentage = round(
                (goal.current_saved / goal.target_amount) * 100,
                2,
            )

        goal_data.append({
            "name": goal.name,
            "target_amount": goal.target_amount,
            "current_saved": goal.current_saved,
            "deadline": (
                goal.deadline.isoformat()
                if goal.deadline
                else None
            ),
            "progress_percentage": progress_percentage,
        })

    total_income = float(total_income)
    total_expenses = float(total_expenses)

    financial_context = {
        "currency": "PKR",
        "summary": {
            "total_income": total_income,
            "total_expenses": total_expenses,
            "current_balance": (
                total_income - total_expenses
            ),
        },
        "transactions": transaction_data,
        "budgets": budget_data,
        "savings_goals": goal_data,
    }

    answer = get_advice(
        question,
        financial_context,
    )

    user_message = ChatMessage()
    user_message.role = "user"
    user_message.content = question
    user_message.user_id = user_id

    assistant_message = ChatMessage()
    assistant_message.role = "assistant"
    assistant_message.content = answer
    assistant_message.user_id = user_id

    db.session.add_all([
        user_message,
        assistant_message,
    ])
    db.session.commit()

    return jsonify({
        "answer": answer
    }), 200


@chat_routes.route("/chat/history", methods=["GET"])
@jwt_required()
def get_chat_history():
    user_id = int(get_jwt_identity())

    messages = (
        ChatMessage.query
        .filter_by(user_id=user_id)
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    results = []

    for message in messages:
        results.append({
            "id": message.id,
            "role": message.role,
            "content": message.content,
            "created_at": (
                message.created_at.isoformat()
                if message.created_at
                else None
            ),
        })

    return jsonify({
        "messages": results
    }), 200