from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import JWT_SECRET_KEY
from routes.auth import auth_bp
from routes.wishlist import wishlist_bp
from routes.orders import orders_bp
from datetime import timedelta

app = Flask(__name__)
CORS(app)
app.config["JWT_SECRET_KEY"] = JWT_SECRET_KEY
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=10)
jwt = JWTManager(app)

app.register_blueprint(auth_bp)
app.register_blueprint(wishlist_bp)
app.register_blueprint(orders_bp)

@app.route("/")
def home():
    return{
        "message":"ecommerce Backend Running Successfully"
    }
    
if __name__ =="__main__":
    app.run(debug=True)

