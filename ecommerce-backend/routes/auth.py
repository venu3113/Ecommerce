from flask import Blueprint,request,jsonify
from werkzeug.security import generate_password_hash,check_password_hash
from database import get_connection
from utils.validators import validate_email,validate_password
from flask_jwt_extended import create_access_token

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register",methods=["POST"])
def register():
    
    data = request.get_json()
    first_name = data.get("first_name")
    last_name = data.get("last_name")
    email = data.get("email")
    password = data.get("password")
    
    if not all([
        first_name,last_name,email,password
    ]):
        return jsonify({
            "message":"all fields are required"
        })
    if not validate_email(email):
        return jsonify({
            "message":"Invalid Email Address"
        }),400
    if not  validate_password(password):
        return {
            "message": "Password must contain uppercase, lowercase, number and special character"
        }
    connection = get_connection()
    cursor = connection.cursor()
    
    sql = "select id from users where email=%s"
    cursor.execute(sql,(email,))
    existing_user = cursor.fetchone()
    
    if existing_user:
        return jsonify({
            "message": "Email already exists"
        }),409
    
    hashed_password = generate_password_hash(password)
    
    sql = """insert into users
    (first_name,last_name,email,password)values(%s,%s,%s,%s)"""
    
    cursor.execute(
        sql,(first_name,last_name,email,hashed_password)
    )
    
    connection.commit()
    
    cursor.execute("SELECT * FROM users")
    
    cursor.close()
    connection.close()
    
    return jsonify({
        "message":"Registration Successful"
    }),201
    
@auth_bp.route("/login",methods=["POST"])
def login():
    data = request.get_json()
    
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({
            "message":"Email and Password are required"
        }),400
        
    connection = get_connection()
    cursor = connection.cursor()
    
    sql = """
    select * from users where email = %s"""
    
    cursor.execute(sql,(email,))
    
    user = cursor.fetchone()
    
    if not user:
        cursor.close()
        connection.close()
        return jsonify({
            "message":"Invalid credentials"
        }),401
        
    if not check_password_hash(user["password"],password):
        cursor.close()
        connection.close()
        
        return jsonify
    ({
        "message": "Invalid Credentials"
    }),401
    
    token = create_access_token(identity=str(user["id"]))

    cursor.close()
    connection.close()

    return jsonify({
        "message": "Login Successful",
        "token": token,
        "user": {
                "id": user["id"],
                "first_name": user["first_name"],
                "last_name": user["last_name"],
                "email": user["email"]},
        "username": f"{user['first_name']} {user['last_name']}"
        }), 200
    
        
        
        
    
    