from __future__ import annotations
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
from routes.chat import product_tool, order_tool, wishlist_tool, cart_tool

load_dotenv()

# =========================================================
# Gemini Client
# =========================================================
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)

# =========================================================
# Combined Tools List
# =========================================================
tools = [
    product_tool,
    order_tool,
    wishlist_tool,
    cart_tool
]

SYSTEM_INSTRUCTION = """
You are the intelligent AI Shopping Assistant for StyleUnion.
You have access to 4 combined tools:
1. `product_tool`: Search items, get specs/details, customer reviews, product comparisons, deals/discounts, top-rated products, category listings, and category products.
2. `order_tool`: Track order status by ID, view past order history, cancel orders, and check shipping/returns policies.
3. `wishlist_tool`: View saved wishlist items, add products, remove products, and check wishlist status.
4. `cart_tool`: View shopping cart, add products to cart, update quantities, remove items, and clear cart.

Rules:
- Always call the relevant tool with the required `action` parameter when user asks about products, orders, wishlist, or cart.
- Provide clear, structured, friendly answers in markdown with prices, ratings, and key highlights.
- Mention the tool and action used when answering questions.
"""

MODELS_TO_TRY = [
    "gemini-3.5-flash",
    "gemini-flash-latest",
    "gemini-3.8-flash",
    "gemini-3.5-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-3.6-flash"
]


def agent(user_input: str) -> str:
    for model_name in MODELS_TO_TRY:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=user_input,
                config=types.GenerateContentConfig(
                    tools=tools,
                    system_instruction=SYSTEM_INSTRUCTION
                )
            )
            return response.text or "I processed your request."
        except Exception as e:
            continue

    return "I am currently unable to reach the AI models. Please try again in a moment."


if __name__ == "__main__":
    print("🤖 StyleUnion AI Assistant Started (Type 'exit' to quit)\n")
    while True:
        user_input = input("\nYou: ")
        if user_input.lower() in ["exit", "quit"]:
            print("Agent: Goodbye! Have a great day!")
            break
        try:
            answer = agent(user_input)
            print("Agent:", answer)
        except Exception as e:
            print("Error:", e)