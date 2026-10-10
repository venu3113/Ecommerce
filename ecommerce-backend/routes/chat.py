from __future__ import annotations
import os
import re
import json
import requests
from typing import Union, List, Dict, Any, Optional, Tuple

from flask import Blueprint, request, jsonify, g, has_request_context
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from database import get_connection
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

chat_bp = Blueprint("chat", __name__)

# Initialize Gemini client
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

DUMMYJSON_BASE = "https://dummyjson.com/products"


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def _get_db():
    """Helper to acquire a database connection safely."""
    try:
        return get_connection()
    except Exception as e:
        print("Database connection error in chat:", e)
        return None


def get_logged_in_user():
    """
    Get the logged-in user's ID from JWT.
    Returns user ID (int) or None if guest / not logged in.
    """
    try:
        verify_jwt_in_request(optional=True)
        user_id = get_jwt_identity()
        if user_id is None:
            return None
        return int(user_id)
    except Exception:
        return None


def _get_current_user_id(default=1):
    """Helper to safely read current user id."""
    user_id = get_logged_in_user()
    if user_id is not None:
        return user_id
    if has_request_context():
        return getattr(g, "current_user_id", default) or default
    return default


def _add_collected_product(product):
    """Helper to collect products during a request for frontend card rendering."""
    if not has_request_context():
        return
    if not hasattr(g, "collected_products"):
        g.collected_products = []
    if isinstance(product, dict) and "id" in product:
        if not any(p.get("id") == product["id"] for p in g.collected_products):
            g.collected_products.append(product)


def _add_collected_products(products):
    """Helper to collect a list of products."""
    for p in products:
        _add_collected_product(p)


def _resolve_product_id(product_id=None, product_name=""):
    """Helper to find product ID and product object by ID or name."""
    if product_id:
        try:
            res = requests.get(f"{DUMMYJSON_BASE}/{product_id}", timeout=5)
            if res.status_code == 200:
                p = res.json()
                _add_collected_product(p)
                return product_id, p
        except Exception:
            return product_id, None

    if product_name:
        try:
            res = requests.get(f"{DUMMYJSON_BASE}/search?q={product_name}&limit=1", timeout=5)
            if res.status_code == 200:
                items = res.json().get("products", [])
                if items:
                    p = items[0]
                    _add_collected_product(p)
                    return p["id"], p
        except Exception:
            pass

    return product_id, None


STOP_WORDS = {
    'what', 'are', 'is', 'availble', 'available', 'for', 'me', 'show', 'do', 'you',
    'have', 'any', 'i', 'want', 'to', 'buy', 'looking', 'look', 'can', 'find', 'give',
    'the', 'a', 'an', 'some', 'all', 'in', 'store', 'items', 'products', 'item', 'product',
    'please', 'tell', 'about', 'types', 'of', 'good', 'best', 'cheap', 'which', 'there',
    'sell', 'have', 'got', 'need'
}


def _clean_search_query(text: str) -> str:
    """Extract core product keywords by stripping conversational filler words."""
    if not text:
        return ""
    words = re.findall(r'[a-zA-Z0-9]+', text.lower())
    clean_words = [w for w in words if w not in STOP_WORDS]
    return ' '.join(clean_words) if clean_words else text


# =========================================================
# 1. COMBINED PRODUCT TOOL
# =========================================================

def product_tool(
    action: str,
    query: str = "",
    product_id: Optional[int] = None,
    product_name: str = "",
    product_2: str = "",
    category: str = "",
    brand: str = "",
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_rating: Optional[float] = None,
    sort_by: str = "",
    limit: int = 8
) -> Union[dict, list]:
    """
    Unified product tool for StyleUnion store operations.

    Actions:
    - 'search': Search/filter products by query, category, brand, price range (min_price, max_price), min_rating, and sort_by ('price_asc', 'price_desc', 'rating_desc', 'discount_desc').
    - 'details': Get full details, warranty, dimensions, shipping, return policy for product_id or product_name.
    - 'reviews': Get customer ratings and reviews for product_id or product_name.
    - 'compare': Compare product_name or product_id against product_2.
    - 'deals': Get top discounted products/deals (optionally filtered by category).
    - 'top_rated': Get highest-rated products (rating >= 4.0).
    - 'categories': List all available product categories in the store.
    - 'by_category': Get products in a specific category (e.g. 'smartphones', 'laptops', 'beauty', 'fragrances').
    """
    action_clean = (action or "").lower().strip()

    try:
        # --- ACTION: SEARCH ---
        if action_clean in ["search", "filter", "find"]:
            clean_q = _clean_search_query(query)
            search_term = clean_q or query
            products = []
            seen_ids = set()

            # 1. If explicit category is provided
            if category:
                cat_slug = category.lower().strip().replace(" ", "-")
                res = requests.get(f"{DUMMYJSON_BASE}/category/{cat_slug}?limit=0", timeout=10)
                if res.status_code == 200:
                    for p in res.json().get("products", []):
                        if p["id"] not in seen_ids:
                            seen_ids.add(p["id"])
                            products.append(p)

            # 2. Check if clean_q matches any store category (e.g., 'shoes' -> 'mens-shoes', 'womens-shoes')
            if search_term and not category:
                try:
                    cat_res = requests.get(f"{DUMMYJSON_BASE}/categories", timeout=5)
                    if cat_res.status_code == 200:
                        all_cats = [c["slug"] for c in cat_res.json()]
                        matching_cats = [c for c in all_cats if any(w in c for w in search_term.lower().split())]
                        for c in matching_cats:
                            r = requests.get(f"{DUMMYJSON_BASE}/category/{c}?limit=0", timeout=5)
                            if r.status_code == 200:
                                for p in r.json().get("products", []):
                                    if p["id"] not in seen_ids:
                                        seen_ids.add(p["id"])
                                        products.append(p)
                except Exception:
                    pass

            # 3. Direct keyword search by clean_q and raw query
            if search_term and len(products) < limit:
                for term in [search_term, query]:
                    if not term:
                        continue
                    res = requests.get(f"{DUMMYJSON_BASE}/search?q={term}&limit=0", timeout=10)
                    if res.status_code == 200:
                        for p in res.json().get("products", []):
                            if p["id"] not in seen_ids:
                                seen_ids.add(p["id"])
                                products.append(p)
                    if len(products) >= limit:
                        break

            # 4. If no query or category given, return all products
            if not products and not search_term and not category:
                res = requests.get(f"{DUMMYJSON_BASE}?limit=0", timeout=10)
                if res.status_code == 200:
                    products = res.json().get("products", [])

            filtered = []
            for p in products:
                price = float(p.get("price", 0))
                rating = float(p.get("rating", 0))
                p_brand = p.get("brand") or ""

                if brand and brand.lower() not in p_brand.lower():
                    continue
                if min_price is not None and price < float(min_price):
                    continue
                if max_price is not None and price > float(max_price):
                    continue
                if min_rating is not None and rating < float(min_rating):
                    continue

                filtered.append(p)

            if sort_by == "price_asc":
                filtered.sort(key=lambda x: x.get("price", 0))
            elif sort_by == "price_desc":
                filtered.sort(key=lambda x: x.get("price", 0), reverse=True)
            elif sort_by == "rating_desc":
                filtered.sort(key=lambda x: x.get("rating", 0), reverse=True)
            elif sort_by == "discount_desc":
                filtered.sort(key=lambda x: x.get("discountPercentage", 0), reverse=True)

            _add_collected_products(filtered[:limit])
            return [
                {
                    "id": p.get("id"),
                    "title": p.get("title"),
                    "category": p.get("category"),
                    "brand": p.get("brand"),
                    "price": p.get("price"),
                    "discountPercentage": p.get("discountPercentage"),
                    "rating": p.get("rating"),
                    "stock": p.get("stock"),
                    "description": p.get("description")
                }
            ]

        # --- ACTION: DETAILS ---
        elif action_clean in ["details", "info", "specification", "specs"]:
            pid, product = _resolve_product_id(product_id, product_name or query)
            if not product:
                return {"error": f"Product not found for ID: {product_id} or Name: {product_name or query}"}

            return {
                "id": product.get("id"),
                "title": product.get("title"),
                "description": product.get("description"),
                "category": product.get("category"),
                "brand": product.get("brand"),
                "price": product.get("price"),
                "discountPercentage": product.get("discountPercentage"),
                "rating": product.get("rating"),
                "stock": product.get("stock"),
                "availabilityStatus": product.get("availabilityStatus"),
                "warrantyInformation": product.get("warrantyInformation"),
                "shippingInformation": product.get("shippingInformation"),
                "returnPolicy": product.get("returnPolicy"),
                "dimensions": product.get("dimensions"),
                "weight": product.get("weight"),
                "reviews_count": len(product.get("reviews", []))
            }

        # --- ACTION: REVIEWS ---
        elif action_clean in ["reviews", "ratings", "feedback"]:
            pid, product = _resolve_product_id(product_id, product_name or query)
            if not product:
                return {"error": "Product not found to fetch reviews"}

            return {
                "id": product.get("id"),
                "title": product.get("title"),
                "rating": product.get("rating"),
                "reviews": product.get("reviews", [])
            }

        # --- ACTION: COMPARE ---
        elif action_clean in ["compare", "comparison"]:
            p1_ident = product_name or str(product_id or query)
            p2_ident = product_2

            def fetch_p(ident):
                if not ident:
                    return None
                if str(ident).isdigit():
                    r = requests.get(f"{DUMMYJSON_BASE}/{ident}", timeout=10)
                    if r.status_code == 200:
                        return r.json()
                r = requests.get(f"{DUMMYJSON_BASE}/search?q={ident}&limit=1", timeout=10)
                items = r.json().get("products", [])
                return items[0] if items else None

            p1 = fetch_p(p1_ident)
            p2 = fetch_p(p2_ident)

            if p1:
                _add_collected_product(p1)
            if p2:
                _add_collected_product(p2)

            def extract_summary(p):
                if not p:
                    return "Not found"
                return {
                    "id": p.get("id"),
                    "title": p.get("title"),
                    "price": p.get("price"),
                    "rating": p.get("rating"),
                    "brand": p.get("brand"),
                    "discountPercentage": p.get("discountPercentage"),
                    "stock": p.get("stock"),
                    "warranty": p.get("warrantyInformation"),
                    "returnPolicy": p.get("returnPolicy"),
                    "description": p.get("description")
                }

            return {
                "product_1": extract_summary(p1),
                "product_2": extract_summary(p2)
            }

        # --- ACTION: DEALS ---
        elif action_clean in ["deals", "discounts", "offers", "sale"]:
            url = f"{DUMMYJSON_BASE}/category/{category.lower().strip().replace(' ', '-')}" if category else DUMMYJSON_BASE
            res = requests.get(f"{url}?limit=0", timeout=10)
            products = res.json().get("products", [])
            products.sort(key=lambda x: x.get("discountPercentage", 0), reverse=True)
            top_deals = products[:limit]
            _add_collected_products(top_deals)
            return [
                {
                    "id": p.get("id"),
                    "title": p.get("title"),
                    "price": p.get("price"),
                    "discountPercentage": p.get("discountPercentage"),
                    "rating": p.get("rating"),
                    "brand": p.get("brand"),
                    "category": p.get("category")
                }
                for p in top_deals
            ]

        # --- ACTION: TOP RATED ---
        elif action_clean in ["top_rated", "popular", "best"]:
            url = f"{DUMMYJSON_BASE}/category/{category.lower().strip().replace(' ', '-')}" if category else DUMMYJSON_BASE
            res = requests.get(f"{url}?limit=0", timeout=10)
            products = res.json().get("products", [])
            products.sort(key=lambda x: x.get("rating", 0), reverse=True)
            top_rated = products[:limit]
            _add_collected_products(top_rated)
            return [
                {
                    "id": p.get("id"),
                    "title": p.get("title"),
                    "price": p.get("price"),
                    "rating": p.get("rating"),
                    "brand": p.get("brand"),
                    "category": p.get("category")
                }
                for p in top_rated
            ]

        # --- ACTION: CATEGORIES ---
        elif action_clean in ["categories", "category_list", "list_categories"]:
            res = requests.get(f"{DUMMYJSON_BASE}/categories", timeout=10)
            categories = res.json()
            return [{"slug": c.get("slug"), "name": c.get("name")} for c in categories]

        # --- ACTION: BY CATEGORY ---
        elif action_clean in ["by_category", "category_products", "category"]:
            cat_slug = (category or query).lower().strip().replace(" ", "-")
            res = requests.get(f"{DUMMYJSON_BASE}/category/{cat_slug}?limit={limit}", timeout=10)
            products = res.json().get("products", [])
            if not products:
                res = requests.get(f"{DUMMYJSON_BASE}/search?q={category or query}&limit={limit}", timeout=10)
                products = res.json().get("products", [])
            _add_collected_products(products[:limit])
            return [
                {
                    "id": p.get("id"),
                    "title": p.get("title"),
                    "price": p.get("price"),
                    "rating": p.get("rating"),
                    "stock": p.get("stock"),
                    "brand": p.get("brand"),
                    "description": p.get("description")
                }
                for p in products[:limit]
            ]

        return {"error": f"Unknown product action '{action}'. Valid actions: search, details, reviews, compare, deals, top_rated, categories, by_category"}

    except Exception as e:
        print(f"Error in product_tool({action}):", e)
        return {"error": f"Failed to execute product action '{action}'"}


# =========================================================
# 2. COMBINED ORDERS TOOL
# =========================================================

def order_tool(
    action: str,
    order_id: Optional[int] = None,
    phone: str = "",
    user_id: Optional[int] = None,
    reason: str = ""
) -> Union[dict, list]:
    """
    Unified orders tool for customer order management.

    Actions:
    - 'track': Track an order by order_id (returns live status, product name, price, address, and date).
    - 'history': Get recent order history for the customer (by user_id or phone number).
    - 'cancel': Cancel a placed/pending order by order_id (initiates refund).
    - 'policy': Get store shipping rates, free shipping threshold ($50+), return window (30 days), and cancellation policies.
    """
    action_clean = (action or "").lower().strip()

    # --- ACTION: POLICY ---
    if action_clean in ["policy", "shipping", "returns", "refund", "shipping_policy"]:
        return {
            "free_shipping_threshold": "$50.00 (Orders over $50 receive free standard delivery)",
            "standard_shipping_fee": "$9.99 for orders below $50",
            "delivery_time": "2 to 5 business days across the country",
            "return_window": "30 days from delivery date for unused items with original tags & packaging",
            "refund_timeline": "Refunds are processed within 3-5 business days after return verification",
            "cancellation_policy": "Orders can be cancelled anytime before they are shipped",
            "customer_support": "support@styleunion.com / 1-800-STYLE-UNION"
        }

    conn = _get_db()
    if not conn:
        return {"error": "Database is currently unavailable"}

    try:
        cursor = conn.cursor()

        # --- ACTION: TRACK ---
        if action_clean in ["track", "status", "get"]:
            if not order_id:
                cursor.close()
                conn.close()
                return {"error": "Order ID is required to track order."}

            cursor.execute("SELECT * FROM orders WHERE id = %s", (order_id,))
            order = cursor.fetchone()
            cursor.close()
            conn.close()

            if not order:
                return {"error": f"Order #{order_id} was not found in our system."}

            # Fetch product details
            p_info = None
            try:
                r = requests.get(f"{DUMMYJSON_BASE}/{order['product_id']}", timeout=5)
                if r.status_code == 200:
                    p_info = r.json()
                    _add_collected_product(p_info)
            except Exception:
                pass

            return {
                "order_id": order["id"],
                "product_id": order["product_id"],
                "product_title": p_info.get("title") if p_info else f"Product #{order['product_id']}",
                "customer_name": order["customer_name"],
                "phone": order["phone"],
                "quantity": order["quantity"],
                "total_price": float(order["total_price"]),
                "status": order["status"] or "Placed",
                "delivery_address": f"{order['address']}, {order['city']}, {order['state']} - {order['pincode']}",
                "order_date": str(order["created_at"]) if order.get("created_at") else "Recent"
            }

        # --- ACTION: HISTORY ---
        elif action_clean in ["history", "list", "my_orders"]:
            uid = user_id or _get_current_user_id(1)
            if phone:
                cursor.execute("SELECT * FROM orders WHERE phone = %s ORDER BY id DESC LIMIT 10", (phone,))
            else:
                cursor.execute("SELECT * FROM orders WHERE user_id = %s ORDER BY id DESC LIMIT 10", (uid,))

            orders = cursor.fetchall()
            cursor.close()
            conn.close()

            if not orders:
                return []

            results = []
            for o in orders:
                p_title = f"Product #{o['product_id']}"
                try:
                    r = requests.get(f"{DUMMYJSON_BASE}/{o['product_id']}", timeout=5)
                    if r.status_code == 200:
                        prod = r.json()
                        p_title = prod.get("title", p_title)
                        _add_collected_product(prod)
                except Exception:
                    pass

                results.append({
                    "order_id": o["id"],
                    "product_title": p_title,
                    "quantity": o["quantity"],
                    "total_price": float(o["total_price"]),
                    "status": o["status"] or "Placed",
                    "customer_name": o.get("customer_name"),
                    "order_date": str(o["created_at"]) if o.get("created_at") else "Recent"
                })
            return results

        # --- ACTION: CANCEL ---
        elif action_clean in ["cancel", "delete", "stop"]:
            if not order_id:
                cursor.close()
                conn.close()
                return {"error": "Order ID is required to cancel an order."}

            cursor.execute("SELECT id, status, total_price FROM orders WHERE id = %s", (order_id,))
            order = cursor.fetchone()
            if not order:
                cursor.close()
                conn.close()
                return {"error": f"Order #{order_id} not found."}

            current_status = (order["status"] or "").lower()
            if current_status in ["delivered", "shipped"]:
                cursor.close()
                conn.close()
                return {"error": f"Order #{order_id} is already {order['status']} and cannot be cancelled automatically. Please initiate a return."}

            if current_status == "cancelled":
                cursor.close()
                conn.close()
                return {"message": f"Order #{order_id} is already cancelled."}

            cursor.execute("UPDATE orders SET status = 'Cancelled' WHERE id = %s", (order_id,))
            conn.commit()
            cursor.close()
            conn.close()

            return {
                "success": True,
                "message": f"Order #{order_id} has been successfully cancelled. A refund of ${float(order['total_price']):.2f} will be initiated to your original payment method.",
                "order_id": order_id,
                "new_status": "Cancelled"
            }

        cursor.close()
        conn.close()
        return {"error": f"Unknown order action '{action}'. Valid actions: track, history, cancel, policy"}

    except Exception as e:
        print(f"Error in order_tool({action}):", e)
        return {"error": f"Failed to execute order action '{action}'"}


# =========================================================
# 3. COMBINED WISHLIST TOOL
# =========================================================

def wishlist_tool(
    action: str,
    product_id: Optional[int] = None,
    product_name: str = "",
    user_id: Optional[int] = None
) -> Union[dict, list]:
    """
    Unified wishlist tool for saving and viewing favorite products.

    Actions:
    - 'get': View the user's saved wishlist items with live titles, prices, ratings, and discounts.
    - 'add': Add a product to the user's wishlist by product_id or product_name.
    - 'remove': Remove a product from the user's wishlist by product_id or product_name.
    - 'check': Check if a product is already saved in the user's wishlist.
    """
    action_clean = (action or "").lower().strip()
    uid = user_id or _get_current_user_id(1)

    conn = _get_db()
    if not conn:
        return {"error": "Database is unavailable"}

    try:
        cursor = conn.cursor()

        # --- ACTION: GET ---
        if action_clean in ["get", "list", "view", "show"]:
            cursor.execute("SELECT product_id FROM wishlist WHERE user_id = %s", (uid,))
            rows = cursor.fetchall()
            cursor.close()
            conn.close()

            if not rows:
                return []

            wishlist_items = []
            for r in rows:
                pid = r["product_id"]
                try:
                    res = requests.get(f"{DUMMYJSON_BASE}/{pid}", timeout=5)
                    if res.status_code == 200:
                        p = res.json()
                        _add_collected_product(p)
                        wishlist_items.append({
                            "id": p.get("id"),
                            "title": p.get("title"),
                            "price": p.get("price"),
                            "discountPercentage": p.get("discountPercentage"),
                            "rating": p.get("rating"),
                            "category": p.get("category"),
                            "stock": p.get("stock")
                        })
                except Exception:
                    pass
            return wishlist_items

        # --- ACTION: ADD ---
        elif action_clean in ["add", "save", "insert"]:
            pid, product_obj = _resolve_product_id(product_id, product_name)
            if not pid:
                cursor.close()
                conn.close()
                return {"error": "Product ID or valid product name is required to add to wishlist."}

            cursor.execute("SELECT id FROM wishlist WHERE user_id = %s AND product_id = %s", (uid, pid))
            existing = cursor.fetchone()

            if existing:
                cursor.close()
                conn.close()
                title = product_obj.get("title") if product_obj else f"Product #{pid}"
                return {"message": f"'{title}' is already in your wishlist! ❤️"}

            cursor.execute("INSERT INTO wishlist (user_id, product_id) VALUES (%s, %s)", (uid, pid))
            conn.commit()
            cursor.close()
            conn.close()

            title = product_obj.get("title") if product_obj else f"Product #{pid}"
            return {
                "success": True,
                "message": f"Added '{title}' to your wishlist ❤️",
                "product_id": pid
            }

        # --- ACTION: REMOVE ---
        elif action_clean in ["remove", "delete"]:
            pid, _ = _resolve_product_id(product_id, product_name)
            if not pid:
                cursor.close()
                conn.close()
                return {"error": "Product ID or product name required."}

            cursor.execute("DELETE FROM wishlist WHERE user_id = %s AND product_id = %s", (uid, pid))
            conn.commit()
            cursor.close()
            conn.close()

            return {
                "success": True,
                "message": f"Product #{pid} has been removed from your wishlist."
            }

        # --- ACTION: CHECK ---
        elif action_clean in ["check", "status", "is_in"]:
            pid, _ = _resolve_product_id(product_id, product_name)
            if not pid:
                cursor.close()
                conn.close()
                return {"in_wishlist": False}

            cursor.execute("SELECT id FROM wishlist WHERE user_id = %s AND product_id = %s", (uid, pid))
            row = cursor.fetchone()
            cursor.close()
            conn.close()

            return {"in_wishlist": bool(row), "product_id": pid}

        cursor.close()
        conn.close()
        return {"error": f"Unknown wishlist action '{action}'. Valid actions: get, add, remove, check"}

    except Exception as e:
        print(f"Error in wishlist_tool({action}):", e)
        return {"error": f"Failed to execute wishlist action '{action}'"}


# =========================================================
# 4. COMBINED CART TOOL
# =========================================================

def cart_tool(
    action: str,
    product_id: Optional[int] = None,
    product_name: str = "",
    quantity: int = 1,
    user_id: Optional[int] = None
) -> Union[dict, list]:
    """
    Unified shopping cart tool for adding, viewing, and managing items in the user's cart.

    Actions:
    - 'get': View all items currently in the shopping cart with quantities, prices, and subtotal.
    - 'add': Add a product to the user's shopping cart by product_id or product_name with quantity.
    - 'update': Update quantity of a product in the cart (set quantity <= 0 to remove).
    - 'remove': Remove a product from the shopping cart.
    - 'clear': Empty / clear all items from the shopping cart.
    """
    action_clean = (action or "").lower().strip()
    uid = user_id or _get_current_user_id(1)

    conn = _get_db()
    if not conn:
        return {"error": "Database is unavailable"}

    try:
        cursor = conn.cursor()

        # --- ACTION: GET ---
        if action_clean in ["get", "list", "view", "show"]:
            cursor.execute("SELECT id, product_id, quantity FROM cart WHERE user_id = %s", (uid,))
            rows = cursor.fetchall()
            cursor.close()
            conn.close()

            if not rows:
                return {"cart": [], "total_items": 0, "subtotal": 0.0}

            items = []
            subtotal = 0.0
            total_items = 0

            for r in rows:
                pid = r["product_id"]
                qty = int(r["quantity"])
                total_items += qty
                try:
                    res = requests.get(f"{DUMMYJSON_BASE}/{pid}", timeout=5)
                    if res.status_code == 200:
                        p = res.json()
                        _add_collected_product(p)
                        price = float(p.get("price", 0))
                        item_total = price * qty
                        subtotal += item_total
                        items.append({
                            "id": pid,
                            "title": p.get("title"),
                            "price": price,
                            "quantity": qty,
                            "total": round(item_total, 2),
                            "thumbnail": p.get("thumbnail")
                        })
                except Exception:
                    items.append({"id": pid, "quantity": qty})

            return {
                "cart": items,
                "total_items": total_items,
                "subtotal": round(subtotal, 2)
            }

        # --- ACTION: ADD ---
        elif action_clean in ["add", "insert"]:
            pid, product_obj = _resolve_product_id(product_id, product_name)
            if not pid:
                cursor.close()
                conn.close()
                return {"error": "Product ID or product name is required to add to cart."}

            qty = max(1, int(quantity or 1))

            cursor.execute("SELECT id, quantity FROM cart WHERE user_id = %s AND product_id = %s", (uid, pid))
            existing = cursor.fetchone()

            if existing:
                new_qty = existing["quantity"] + qty
                cursor.execute("UPDATE cart SET quantity = %s WHERE id = %s", (new_qty, existing["id"]))
            else:
                cursor.execute("INSERT INTO cart (user_id, product_id, quantity) VALUES (%s, %s, %s)", (uid, pid, qty))

            conn.commit()
            cursor.close()
            conn.close()

            title = product_obj.get("title") if product_obj else f"Product #{pid}"
            return {
                "success": True,
                "message": f"Added {qty}x '{title}' to your shopping cart 🛒",
                "product_id": pid
            }

        # --- ACTION: UPDATE ---
        elif action_clean in ["update", "set_quantity"]:
            pid, _ = _resolve_product_id(product_id, product_name)
            if not pid:
                cursor.close()
                conn.close()
                return {"error": "Product ID required to update cart quantity."}

            qty = int(quantity or 0)
            if qty <= 0:
                cursor.execute("DELETE FROM cart WHERE user_id = %s AND product_id = %s", (uid, pid))
                conn.commit()
                cursor.close()
                conn.close()
                return {"message": f"Product #{pid} removed from your cart."}

            cursor.execute("UPDATE cart SET quantity = %s WHERE user_id = %s AND product_id = %s", (qty, uid, pid))
            conn.commit()
            cursor.close()
            conn.close()
            return {"success": True, "message": f"Updated quantity of Product #{pid} to {qty}."}

        # --- ACTION: REMOVE ---
        elif action_clean in ["remove", "delete"]:
            pid, _ = _resolve_product_id(product_id, product_name)
            if not pid:
                cursor.close()
                conn.close()
                return {"error": "Product ID required to remove from cart."}

            cursor.execute("DELETE FROM cart WHERE user_id = %s AND product_id = %s", (uid, pid))
            conn.commit()
            cursor.close()
            conn.close()
            return {"success": True, "message": f"Product #{pid} removed from your cart."}

        # --- ACTION: CLEAR ---
        elif action_clean in ["clear", "empty"]:
            cursor.execute("DELETE FROM cart WHERE user_id = %s", (uid,))
            conn.commit()
            cursor.close()
            conn.close()
            return {"success": True, "message": "Shopping cart cleared successfully."}

        cursor.close()
        conn.close()
        return {"error": f"Unknown cart action '{action}'. Valid actions: get, add, update, remove, clear"}

    except Exception as e:
        print(f"Error in cart_tool({action}):", e)
        return {"error": f"Failed to execute cart action '{action}'"}


# =========================================================
# Registered Combined Tools List
# =========================================================
tools = [
    product_tool,
    order_tool,
    wishlist_tool,
    cart_tool
]

SYSTEM_INSTRUCTION = """
You are the intelligent AI Shopping Assistant for StyleUnion, an e-commerce store.
You have access to 4 combined tools:
1. `product_tool`: Search items, get specs/details, customer reviews, product comparisons, deals/discounts, top-rated products, category listings, and category products.
2. `order_tool`: Track order status by ID, view past order history, cancel orders, and check shipping/returns policies.
3. `wishlist_tool`: View saved wishlist items, add products, remove products, and check wishlist status.
4. `cart_tool`: View shopping cart, add products to cart, update quantities, remove items, and clear cart.

Rules:
1. Always call the relevant tool with the required `action` parameter when user asks about products, orders, wishlist, or cart.
2. Provide clear, structured, friendly answers in markdown with prices, ratings, and key highlights.
3. If products are returned, summarize their top advantages for the customer.
4. For general greetings, be warm and guide them on what they can ask (e.g. search products, track orders, view cart or wishlist).
5. Never hallucinate fake order statuses or product prices; rely on tool outputs.
"""

# Candidate models in priority order for automatic failover
MODELS_TO_TRY = [
    "gemini-3.6-flash"
]


def _smart_local_fallback(message: str) -> Tuple[str, list]:
    """
    Intelligent rule-based fallback when AI models are rate-limited or unavailable.
    Guarantees user always gets a meaningful answer, orders, wishlist, cart, or products.
    """
    msg_lower = message.lower().strip()

    # 1. Greetings
    if msg_lower in ["hi", "hello", "hey", "hola", "greetings", "good morning", "good evening", "help"]:
        return (
            "Hello! 👋 I'm your StyleUnion Shopping Assistant. How can I help you today?\n\n"
            "Here's what I can do for you:\n"
            "• **Products**: Search catalog, check specs & reviews, compare items, find top deals\n"
            "• **Cart**: View cart items (e.g., 'View my cart'), add products to cart\n"
            "• **Orders**: Track orders (e.g., 'Track order 1'), view history, cancel orders\n"
            "• **Wishlist**: View saved items (e.g., 'Show my wishlist'), save favorites\n"
            "• **Policies**: Shipping rates, 30-day return window, and refund info",
            []
        )

    # 2. Track Order / Order status
    order_id_match = re.search(r'(?:order\s*(?:id|#|number)?\s*[:#]?\s*)(\d+)', msg_lower)
    if order_id_match and any(w in msg_lower for w in ["track", "status", "where", "check", "find", "order"]):
        oid = int(order_id_match.group(1))
        res = order_tool(action="track", order_id=oid)
        if isinstance(res, dict) and "error" in res:
            return (res["error"], [])
        reply = (
            f"📦 **Order #{res['order_id']} Details**\n\n"
            f"• **Product**: {res['product_title']}\n"
            f"• **Status**: **{res['status']}**\n"
            f"• **Quantity**: {res['quantity']}\n"
            f"• **Total**: ${res['total_price']:.2f}\n"
            f"• **Delivery Address**: {res['delivery_address']}\n"
            f"• **Order Date**: {res['order_date']}"
        )
        return (reply, getattr(g, "collected_products", []) if has_request_context() else [])

    # 3. Cancel Order
    if order_id_match and any(w in msg_lower for w in ["cancel", "stop", "abort"]):
        oid = int(order_id_match.group(1))
        res = order_tool(action="cancel", order_id=oid)
        if isinstance(res, dict) and "error" in res:
            return (res["error"], [])
        return (res.get("message", f"Order #{oid} cancellation processed."), [])

    # 4. View Order History
    if any(w in msg_lower for w in ["my order", "my orders", "order history", "past orders", "recent orders", "what did i order"]):
        orders = order_tool(action="history")
        if not orders:
            return ("You don't have any placed orders yet. You can browse our catalog and place your first order!", [])
        lines = [f"• **Order #{o['order_id']}**: {o['product_title']} (Qty: {o['quantity']}) - **${o['total_price']:.2f}** [{o['status']}]" for o in orders]
        reply = "📋 **Here are your recent orders:**\n\n" + "\n".join(lines)
        return (reply, getattr(g, "collected_products", []) if has_request_context() else [])

    # 5. Shipping & Return Policy
    if any(w in msg_lower for w in ["shipping", "return policy", "refund", "return", "delivery fee", "delivery time"]):
        policy = order_tool(action="policy")
        reply = (
            "🚚 **StyleUnion Shipping & Return Policy**\n\n"
            f"• **Free Shipping**: {policy['free_shipping_threshold']}\n"
            f"• **Standard Delivery**: {policy['delivery_time']} ({policy['standard_shipping_fee']})\n"
            f"• **Returns**: {policy['return_window']}\n"
            f"• **Refunds**: {policy['refund_timeline']}\n"
            f"• **Cancellations**: {policy['cancellation_policy']}\n"
            f"• **Support**: {policy['customer_support']}"
        )
        return (reply, [])

    # 6. Cart View & Add
    if any(w in msg_lower for w in ["cart", "my cart", "shopping cart"]):
        if any(w in msg_lower for w in ["add", "put in"]):
            cleaned = re.sub(r'(?:add|put|to|the|my|in|cart|product)', '', msg_lower).strip()
            if cleaned:
                res = cart_tool(action="add", product_name=cleaned)
                return (res.get("message", "Product added to cart!"), getattr(g, "collected_products", []) if has_request_context() else [])
        else:
            cart_res = cart_tool(action="get")
            items = cart_res.get("cart", [])
            if not items:
                return ("Your shopping cart is currently empty 🛒. Feel free to browse our products and add your favorites!", [])
            lines = [f"• **{it['title']}** (Qty: {it['quantity']}) - ${it['total']:.2f}" for it in items]
            reply = f"🛒 **Your Shopping Cart ({cart_res['total_items']} items):**\n\n" + "\n".join(lines) + f"\n\n**Subtotal**: ${cart_res['subtotal']:.2f}"
            return (reply, getattr(g, "collected_products", []) if has_request_context() else [])

    # 7. Wishlist View & Add
    if any(w in msg_lower for w in ["wishlist", "my wishlist", "saved items", "favorites"]):
        if any(w in msg_lower for w in ["add", "save"]):
            cleaned = re.sub(r'(?:add|save|to|the|my|wishlist|product)', '', msg_lower).strip()
            if cleaned:
                res = wishlist_tool(action="add", product_name=cleaned)
                return (res.get("message", "Product added to wishlist!"), getattr(g, "collected_products", []) if has_request_context() else [])
        else:
            items = wishlist_tool(action="get")
            if not items:
                return ("Your wishlist is currently empty. Click the ❤️ icon on any product to save it to your wishlist!", [])
            reply = f"❤️ **Your Wishlist ({len(items)} items):**\n\n" + "\n".join([f"• **{it['title']}** - ${it['price']}" for it in items])
            return (reply, getattr(g, "collected_products", []) if has_request_context() else [])

    # 8. Categories
    if any(k in msg_lower for k in ["category", "categories", "what do you sell", "types of products", "what can i buy"]):
        try:
            cats = product_tool(action="categories")
            if cats:
                sample_cats = [c["name"] for c in cats[:10]]
                reply = (
                    "Here are some popular categories available at StyleUnion:\n\n"
                    + "\n".join([f"• **{name}**" for name in sample_cats])
                    + "\n\nLet me know which category you'd like to explore!"
                )
                return reply, []
        except Exception:
            pass

    # 9. Deals / Discounts
    if any(k in msg_lower for k in ["deal", "deals", "discount", "discounts", "sale", "offer", "offers", "cheap"]):
        product_tool(action="deals", limit=6)
        return (
            "Here are the top discounted deals currently available at StyleUnion with the biggest savings:",
            getattr(g, "collected_products", [])[:6] if has_request_context() else []
        )

    # 10. Top rated
    if any(k in msg_lower for k in ["top rated", "best rated", "highest rated", "popular", "trending"]):
        product_tool(action="top_rated", limit=6)
        return (
            "Here are our highest-rated products loved by customers:",
            getattr(g, "collected_products", [])[:6] if has_request_context() else []
        )

    # 11. General Search
    clean_keyword = _clean_search_query(message)
    product_tool(action="search", query=message)
    products = getattr(g, "collected_products", []) if has_request_context() else []

    if products:
        subject = clean_keyword if clean_keyword else "products"
        return (
            f"Here are the {subject} available at StyleUnion:",
            products[:8]
        )

    return (
        f"I searched for '{clean_keyword or message}', but couldn't find exact matches. Try searching by keyword (e.g. 'laptop', 'perfume', 'shoes'), tracking an order ('Track order 1'), or checking your cart / wishlist!",
        []
    )


# =========================================================
# Chat Route
# =========================================================
@chat_bp.route("/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}
    message = data.get("message", "").strip()

    if not message:
        return jsonify({
            "error": "Message is required"
        }), 400

    # Initialize collected products for this request
    g.collected_products = []

    # Extract user identity safely from JWT
    user_id = get_logged_in_user()
    g.current_user_id = user_id if user_id is not None else 1

    # 1. Try Gemini models with automatic failover
    last_error = None
    for model_name in MODELS_TO_TRY:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=message,
                config=types.GenerateContentConfig(
                    tools=tools,
                    system_instruction=SYSTEM_INSTRUCTION
                )
            )

            reply_text = response.text or "Here is what I found for you."

            # Deduplicate collected products by ID
            unique_products = []
            seen_ids = set()
            for p in getattr(g, "collected_products", []):
                if isinstance(p, dict) and "id" in p:
                    if p["id"] not in seen_ids:
                        seen_ids.add(p["id"])
                        unique_products.append(p)

            # If Gemini answered with text without calling tools on a product query, supplement with matching catalog products
            if not unique_products:
                clean_q = _clean_search_query(message)
                if clean_q and len(clean_q) > 2 and clean_q not in ["hi", "hello", "hey", "help", "thanks", "bye", "good"]:
                    product_tool(action="search", query=message)
                    for p in getattr(g, "collected_products", []):
                        if isinstance(p, dict) and "id" in p:
                            if p["id"] not in seen_ids:
                                seen_ids.add(p["id"])
                                unique_products.append(p)

            return jsonify({
                "reply": reply_text,
                "products": unique_products[:8]
            }), 200

        except Exception as error:
            last_error = error
            err_msg = str(error)
            print(f"Model {model_name} failed: {err_msg[:120]}... Trying next model.")
            continue

    # 2. Smart local fallback if all Gemini models failed/rate-limited
    print("All Gemini models exhausted. Running smart local fallback. Last error:", last_error)
    g.collected_products = []
    reply_text, fallback_products = _smart_local_fallback(message)

    unique_products = []
    seen_ids = set()
    for p in fallback_products:
        if isinstance(p, dict) and "id" in p:
            if p["id"] not in seen_ids:
                seen_ids.add(p["id"])
                unique_products.append(p)

    return jsonify({
        "reply": reply_text,
        "products": unique_products[:8]
    }), 200
    
    