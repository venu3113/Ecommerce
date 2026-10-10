import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const [messages, setMessages] = useState([
        {
            sender: "bot",
            text: "Hi! 👋 I'm your StyleUnion Shopping Assistant. Ask me about shoes, laptops, perfumes, deals, order tracking, wishlist, or store policies!",
            products: []
        }
    ]);

    const quickPrompts = [
        "👟 Shoes",
        "💻 Laptops",
        "🔥 Top deals",
        "📦 Track order 1",
        "❤️ My wishlist",
        "🚚 Shipping policy"
    ];

    const sendMessage = async (customText = null) => {
        const textToSend = (customText || message).trim();
        if (!textToSend || loading) return;

        // Add user message to chat
        const userMessage = {
            sender: "user",
            text: textToSend,
            products: []
        };
        setMessages((prev) => [...prev, userMessage]);

        if (!customText) {
            setMessage("");
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            const response = await axios.post(
                "http://127.0.0.1:5000/chat",
                {
                    message: textToSend
                },
                {
                    headers: token ? { Authorization: `Bearer ${token}` } : {}
                }
            );

            const botMessage = {
                sender: "bot",
                text: response.data.reply || "Here is what I found for you:",
                products: response.data.products || []
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error("Chatbot error:", error);

            setMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: "Sorry, I'm having trouble connecting right now. Please try asking again in a moment! 🛍️",
                    products: []
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-20 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-white shadow-2xl border border-gray-100 flex flex-col h-[520px]">
                    {/* Header */}
                    <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-white">
                        <div className="flex items-center gap-2.5">
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg shadow-inner">
                                🤖
                            </span>
                            <div>
                                <h2 className="font-bold text-sm tracking-wide">
                                    StyleUnion Assistant
                                </h2>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    <p className="text-xs text-blue-100">
                                        Online • Ready to help
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setIsOpen(false)}
                            className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition"
                            title="Close chat"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Quick Prompts */}
                    <div className="flex gap-1.5 overflow-x-auto bg-gray-100/80 px-3 py-2 border-b border-gray-200 hide-scrollbar">
                        {quickPrompts.map((prompt, idx) => (
                            <button
                                key={idx}
                                onClick={() => sendMessage(prompt.replace(/^[^\w]+/, "").trim())}
                                className="whitespace-nowrap rounded-full bg-white border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition shadow-xs cursor-pointer"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${
                                    msg.sender === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                }`}
                            >
                                <div
                                    className={`max-w-[85%] ${
                                        msg.sender === "user"
                                            ? "rounded-2xl rounded-tr-sm bg-blue-600 px-3.5 py-2.5 text-white shadow-sm"
                                            : ""
                                    }`}
                                >
                                    {/* Message text */}
                                    <div
                                        className={
                                            msg.sender === "bot"
                                                ? "rounded-2xl rounded-tl-sm bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm border border-gray-100 leading-relaxed whitespace-pre-wrap"
                                                : "text-sm leading-relaxed"
                                        }
                                    >
                                        {msg.text}
                                    </div>

                                    {/* Product cards */}
                                    {msg.products && msg.products.length > 0 && (
                                        <div className="mt-3 space-y-2.5">
                                            {msg.products.map((product) => (
                                                <div
                                                    key={product.id}
                                                    className="overflow-hidden rounded-xl bg-white border border-gray-200/70 shadow-sm hover:shadow-md transition flex items-center p-2.5 gap-3"
                                                >
                                                    <img
                                                        src={product.thumbnail || (product.images && product.images[0]) || "https://via.placeholder.com/150"}
                                                        alt={product.title}
                                                        className="h-16 w-16 object-contain rounded-lg bg-gray-50 p-1 border border-gray-100 shrink-0"
                                                    />

                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">
                                                            {product.category || "Product"}
                                                        </span>
                                                        <h4 className="text-xs font-bold text-gray-900 line-clamp-1" title={product.title}>
                                                            {product.title}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-sm font-bold text-gray-900">
                                                                ${product.price}
                                                            </span>
                                                            {product.rating && (
                                                                <span className="text-xs text-amber-600 font-medium">
                                                                    ⭐ {product.rating}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                setIsOpen(false);
                                                                navigate(`/products/${product.id}`);
                                                            }}
                                                            className="mt-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer block"
                                                        >
                                                            View Details →
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-3 shadow-sm border border-gray-100 flex items-center gap-1.5">
                                    <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce"></span>
                                    <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></span>
                                    <span className="h-2 w-2 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Bar */}
                    <div className="border-t border-gray-200 bg-white p-3">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                sendMessage();
                            }}
                            className="flex items-center gap-2"
                        >
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about shoes, laptops, orders..."
                                disabled={loading}
                                className="flex-1 rounded-xl border border-gray-300 px-3.5 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-gray-50"
                            />

                            <button
                                type="submit"
                                disabled={!message.trim() || loading}
                                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-2xl text-white shadow-xl transition hover:scale-105 hover:shadow-2xl cursor-pointer"
                title="Open AI Shopping Assistant"
            >
                {isOpen ? "✕" : "💬"}
            </button>
        </>
    );
}

export default ChatBot;