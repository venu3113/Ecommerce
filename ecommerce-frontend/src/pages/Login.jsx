import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import logo from "../assets/logo.jpeg";

function Login({ setIsLoggedIn }) {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const login = async (e) => {
        e.preventDefault();
        
        if (!email.trim()|| !password.trim()){
            alert("Email and Password are required");
            return;
        }

        try {

            const res = await loginUser({
                email,
                password
            });
            console.log("LOGIN RESPONSE:", res);

            localStorage.setItem("token", res.token);
            localStorage.setItem(
                "user",
                JSON.stringify(res.user),
                
            );
            localStorage.setItem("username", res.username);

            if (setIsLoggedIn) {
                setIsLoggedIn(true);
            }

            // const token = localStorage.getItem("token");

            // alert(res.message);

            navigate("/");

        } catch(error) {

            alert( error.response?.data?.message ||
            "Invalid Credentials");

        }
    };

    return (
        <div className="h-[calc(100vh-5rem)] flex items-center justify-center bg-gray-100 p-4 overflow-hidden">
            <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden grid md:grid-cols-2">
                <div className="bg-blue-600 text-white p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3">
                        <img
                            src={logo}
                            alt="Style Union Logo"
                            className="h-10 w-10 object-contain rounded-lg"
                        />
                        <h1 className="text-3xl font-bold">
                            Style Union
                        </h1>
                    </div>

                    <p className="mt-4 text-blue-100 text-sm leading-relaxed">
                        Discover amazing products and enjoy a seamless shopping experience.
                    </p>
                </div>

                <div className="p-8 flex flex-col justify-center">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Welcome Back!
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Sign in to continue shopping
                    </p>

                    <form onSubmit={login} className="mt-5 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>

                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition duration-300"
                        >
                            Login
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <p className="text-xs text-gray-600">
                            Don't have an account?
                        </p>

                        <button
                            onClick={() => navigate("/register")}
                            className="mt-2 w-full border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-2 rounded-lg text-sm font-semibold transition duration-300"
                        >
                            Create Account
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;