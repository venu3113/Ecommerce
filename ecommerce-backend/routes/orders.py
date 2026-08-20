from flask import Blueprint,jsonify,request
from flask_jwt_extended import jwt_required,get_jwt_identity

from database import get_connection

orders_bp = Blueprint("orders",__name__)

@orders_bp.route("/orders",methods=["POST"])
@jwt_required()
def place_order():
    user_id = get_jwt_identity()
    
    data = request.get_json()
    
    product_id = data.get("product_id")
    customer_name = data.get("customer_name")
    phone = data.get("phone")
    address = data.get("address")
    city = data.get("city")
    state = data.get("state")
    pincode = data.get("pincode")
    quantity = data.get("quantity")
    total_price = data.get("total_price")
    status = data.get("status")
    created_at = data.get("created_at")
        
    if not product_id:
        return jsonify({
            "message":"All customer details are required"
        }),400
        
    connection = get_connection()
    cursor = connection.cursor()
    
    sql ="""
    insert into orders
    (user_id,
    product_id,
    customer_name,
    phone,
    address,
    city,
    state,
    pincode,
    quantity,
    total_price,
    status,
    created_at    
    )
    values (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
    """
    
    cursor.execute(
        sql,
        (   user_id,
            product_id,
            customer_name,
            phone,
            address,
            city,
            state,
            pincode,
            quantity,
            total_price,
            status,
            created_at
        )
    )
    
    connection.commit()
    
    cursor.close()
    connection.close()
    
    return jsonify({
        "message":"order placed successfully"
    }),201
    
@orders_bp.route("/orders",methods = ["GET"])
@jwt_required()
def get_orders():
    user_id = get_jwt_identity()
    
    print("JWT USER ID:", user_id)
    connection = get_connection()
    cursor = connection.cursor()
    
    sql = """
        select 
            id,
            user_id,
            product_id,
            customer_name,
            phone,
            address,
            city,
            state,
            pincode,
            quantity,
            total_price,
            status,
            created_at
            
            from orders
            where user_id = %s
        """
        
    cursor.execute(sql,(user_id,))
    orders = cursor.fetchall()
    print("ORDERS:", orders)
    
    cursor.close()
    connection.close()
    
    for order in orders:
        order["total_price"] =float(order["total_price"])

    return jsonify({
        "orders":orders
    }),200
    
    