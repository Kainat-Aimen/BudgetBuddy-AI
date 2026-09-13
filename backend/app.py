import os
from pathlib import Path

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from database.models import db
from routes.auth_routes import auth_routes
from routes.transaction_routes import transaction_routes
from routes.dashboard_routes import dashboard_routes
from routes.budget_routes import budget_routes
from routes.goal_routes import goal_routes
from routes.chat_routes import chat_routes

load_dotenv()

app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = (BASE_DIR / "budgetbuddy.db").as_posix()

app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"sqlite:///{DATABASE_PATH}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

if not app.config["JWT_SECRET_KEY"]:
    raise RuntimeError(
        "JWT_SECRET_KEY is missing from the .env file"
    )

db.init_app(app)
jwt = JWTManager(app)

app.register_blueprint(
    auth_routes,
    url_prefix="/api/auth"
)

app.register_blueprint(
    transaction_routes,
    url_prefix="/api"
)

app.register_blueprint(
    dashboard_routes,
    url_prefix="/api"
)

app.register_blueprint(
    budget_routes,
    url_prefix="/api"
)

app.register_blueprint(
    goal_routes,
    url_prefix="/api"
)

app.register_blueprint(
    chat_routes,
    url_prefix="/api"
)
with app.app_context():
    db.create_all()


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok"
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)