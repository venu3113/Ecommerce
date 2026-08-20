from flask import Blueprint,request,jsonify
from flask_jwt_extended import jwt_required,get_jwt_identity
from database import get_connection


wishlist_bp = Blueprint("wishlist",__name__)

@wishlist_bp.route("/wishlist/add",methods=["POST"])
@jwt_required()
def add_to_wishlist():
    data = request.get_json()
    product_id = data.get("product_id")
    
    if not product_id:
        return jsonify({
            "message":"product ID is required"
        }),400
        
    user_id = get_jwt_identity()
    
    connection = get_connection()
    cursor = connection.cursor()
    
    sql = """
    select id
    from wishlist
    where user_id = %s
    and product_id = %s
    """
    cursor.execute(sql,(user_id,product_id))
    
    existing = cursor.fetchone()
    
    if existing:
        cursor.close()
        connection.close()
        
        return jsonify({
            "message":"product already in wishlist"
        }),409
        
    sql = """
    insert into wishlist(user_id,product_id)
    values (%s,%s)
    """
    
    cursor.execute(sql,(user_id,product_id))

    connection.commit()
    
    cursor.close()
    connection.close()
    
    return jsonify({
        "message":"product added to wishlist"
    }),201
    


@wishlist_bp.route("/wishlist",methods=["GET"])
@jwt_required()
def get_wishlist():
    
    user_id = get_jwt_identity()
    
    connection = get_connection()
    cursor = connection.cursor()
    
    sql="""
    select product_id
    from wishlist
    where user_id= %s
    """
    cursor.execute(sql,(user_id,))
    wishlist = cursor.fetchall()
    
    cursor.close()
    connection.close()
    
    return jsonify({
        "wishlist":wishlist
        }),200
    
    
    
@wishlist_bp.route("/wishlist/<int:product_id>",methods=["DELETE"])
@jwt_required()
def remove_from_wishlist(product_id):
    user_id = get_jwt_identity()
    
    connection = get_connection()
    cursor = connection.cursor()
    
    sql = """
    delete from wishlist
    where user_id = %s and product_id = %s"""
    
    cursor.execute(sql,(user_id,product_id))
    
    connection.commit()
    
    cursor.close()
    connection.close()
    
    return jsonify({
        "message":"product removed from wishlist"
    }),200
    

    
    
    
    