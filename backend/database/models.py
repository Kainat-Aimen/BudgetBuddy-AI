from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash


db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)

    transactions = db.relationship(
        "Transaction",
        backref="user",
        lazy=True,
        cascade="all, delete-orphan",
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Transaction(db.Model):
    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(10), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    date = db.Column(db.Date, nullable=False)
    description = db.Column(db.String(255))
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
    )

    __table_args__ = (
        db.CheckConstraint(
            "type IN ('income', 'expense')",
            name="valid_transaction_type",
        ),
        db.CheckConstraint(
            "amount > 0",
            name="positive_transaction_amount",
        ),
    )

class Budget(db.Model):
    __tablename__ = "budgets"

    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(
        db.String(50),
        nullable=False
    )
    limit_amount = db.Column(
        db.Float,
        nullable=False
    )
    month = db.Column(
        db.String(7),
        nullable=False
    )
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    user = db.relationship(
        "User",
        backref="budgets"
    )

    __table_args__ = (
        db.UniqueConstraint(
            "user_id",
            "category",
            "month",
            name="unique_user_category_month"
        ),
        db.CheckConstraint(
            "limit_amount > 0",
            name="positive_budget_limit"
        ),
    )

class SavingsGoal(db.Model):
    __tablename__ = "savings_goals"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(100),
        nullable=False
    )

    target_amount = db.Column(
        db.Float,
        nullable=False
    )

    current_saved = db.Column(
        db.Float,
        nullable=False,
        default=0
    )

    deadline = db.Column(
        db.Date,
        nullable=False
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    user = db.relationship(
        "User",
        backref="savings_goals"
    )

    __table_args__ = (
        db.CheckConstraint(
            "target_amount > 0",
            name="positive_goal_target"
        ),
        db.CheckConstraint(
            "current_saved >= 0",
            name="valid_current_saved"
        ),
    )

class ChatMessage(db.Model):
    __tablename__ = "chat_messages"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    role = db.Column(
        db.String(20),
        nullable=False
    )

    content = db.Column(
        db.Text,
        nullable=False
    )

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    user = db.relationship(
        "User",
        backref="chat_messages"
    )

    __table_args__ = (
        db.CheckConstraint(
            "role IN ('user', 'assistant')",
            name="valid_chat_role"
        ),
    )