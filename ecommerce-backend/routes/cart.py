from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import get_connection

cart_bp = Blueprint("cart", __name__)


@cart_bp.route("/cart", methods=["GET"])
@jwt_required()
def get_cart():

    user_id = get_jwt_identity()

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT product_id, quantity
        FROM cart
        WHERE user_id = %s
        """,
        (user_id,)
    )

    cart_items = cursor.fetchall()

    cursor.close()
    connection.close()

    return jsonify(cart_items), 200

@cart_bp.route("/cart", methods=["POST"])
@jwt_required()
def add_to_cart():

    user_id = get_jwt_identity()

    data = request.get_json()

    product_id = data.get("product_id")
    quantity = data.get("quantity", 1)

    if not product_id:
        return jsonify({
            "error": "Product ID is required"
        }), 400

    connection = get_connection()
    cursor = connection.cursor()

    # Check whether product is already in cart
    cursor.execute(
        """
        SELECT id, quantity
        FROM cart
        WHERE user_id = %s AND product_id = %s
        """,
        (user_id, product_id)
    )

    existing_item = cursor.fetchone()

    if existing_item:

        new_quantity = existing_item["quantity"] + quantity

        cursor.execute(
            """
            UPDATE cart
            SET quantity = %s
            WHERE id = %s
            """,
            (new_quantity, existing_item["id"])
        )

    else:

        cursor.execute(
            """
            INSERT INTO cart (user_id, product_id, quantity)
            VALUES (%s, %s, %s)
            """,
            (user_id, product_id, quantity)
        )

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "Product added to cart successfully"
    }), 201
    
@cart_bp.route("/cart/<int:product_id>", methods=["PUT"])
@jwt_required()
def update_cart_item(product_id):

    user_id = get_jwt_identity()
    data = request.get_json()

    quantity = data.get("quantity")

    if quantity is None or int(quantity) < 1:
        return jsonify({
            "message": "Quantity must be at least 1"
        }), 400

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        UPDATE cart
        SET quantity = %s
        WHERE user_id = %s AND product_id = %s
        """,
        (int(quantity), user_id, product_id)
    )

    if cursor.rowcount == 0:
        cursor.close()
        connection.close()

        return jsonify({
            "message": "Product not found in cart"
        }), 404

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "Cart quantity updated successfully"
    }), 200
    
@cart_bp.route("/cart/<int:product_id>", methods=["DELETE"])
@jwt_required()
def remove_from_cart(product_id):

    user_id = get_jwt_identity()

    connection = get_connection()
    cursor = connection.cursor()

    cursor.execute(
        """
        DELETE FROM cart
        WHERE user_id = %s AND product_id = %s
        """,
        (user_id, product_id)
    )

    if cursor.rowcount == 0:
        cursor.close()
        connection.close()

        return jsonify({
            "message": "Product not found in cart"
        }), 404

    connection.commit()

    cursor.close()
    connection.close()

    return jsonify({
        "message": "Product removed from cart successfully"
    }), 200