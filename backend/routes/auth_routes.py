from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required,
)

from database.models import db, User

auth_routes = Blueprint("auth_routes", __name__)


@auth_routes.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "JSON data is required"
        }), 400

    full_name = data.get("full_name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not full_name or not email or not password:
        return jsonify({
            "error": "Full name, email and password are required"
        }), 400

    if len(password) < 8:
        return jsonify({
            "error": "Password must contain at least 8 characters"
        }), 400

    existing_user = User.query.filter_by(email=email).first()

    if existing_user:
        return jsonify({
            "error": "Email is already registered"
        }), 409

    user = User()
    user.full_name = full_name
    user.email = email
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "User registered successfully",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email
        }
    }), 201


@auth_routes.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "error": "JSON data is required"
        }), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({
            "error": "Email and password are required"
        }), 400

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({
            "error": "Invalid email or password"
        }), 401

    access_token = create_access_token(
        identity=str(user.id)
    )

    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email
        }
    }), 200

@auth_routes.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    user_id = int(get_jwt_identity())

    user = db.session.get(User, user_id)

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    return jsonify({
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email
        }
    }), 200