import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import logo from "../assets/logo.jpeg";

function Login() {

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

            // const token = localStorage.getItem("token");

            // alert(res.message);

            navigate("/");

        } catch(error) {

            alert( error.response?.data?.message ||
            "Invalid Credentials");

        }
    };

    return (

        <div className="flex flex-col items-center justify-center bg-gray-100 p-6">

            <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden grid md:grid-cols-2">
                <div className="bg-blue-600 text-white p-10 flex flex-col justify-center">
                    <div className="flex items-center justify-center gap-3">

                        <img
                            src={logo}
                            alt="Style Union Logo"
                            className="h-10 w-10 object-contain"
                        />
                    <h1 className="text-4xl font-bold text-center">
                        Style Union
                    </h1>
                    </div>

                    <p className="mt-4 text-blue-100">
                        Discover amazing products and enjoy a seamless shopping experience.
                    </p>
                </div>


                <div className="p-10 flex flex-col justify-center">

                <h1 className="text-4xl font-bold mt-4">
                    Welcome Back!
                </h1>

                <p className="mt-2 text-gray-500">
                    Sign in to continue shopping
                </p>

                <form onSubmit={login} className="mt-8 space-y-5">

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Email
                        </label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Password
                        </label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-300"
                    >
                        Login
                    </button>

                </form>

                <div className="text-center mt-6">

                    <p className="text-gray-600">
                        Don't have an account?
                    </p>

                    <button
                        onClick={() => navigate("/register")}
                        className="mt-3 w-full border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-3 rounded-lg font-semibold transition duration-300"
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