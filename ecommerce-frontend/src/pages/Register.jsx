import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import logo from "../assets/logo.jpeg";

function Register() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        fname: "",
        lname: "",
        email: "",
        password: ""
    });

    const first_nameRef = useRef(null);
    const last_nameRef = useRef(null);
    const emailRef = useRef(null);
    const passwordRef = useRef(null);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const register = async (e) => {
        e.preventDefault();

        if (
            !form.fname?.trim() ||
            !form.lname?.trim() ||
            !form.email?.trim() ||
            !form.password?.trim()
        ) {
            alert("All fields are required.");
            return;
        }

        if (!form.fname.trim()) {
            alert("First Name is required");
            first_nameRef.current?.focus();
            return;
        }

        if (!form.lname.trim()) {
            alert("Last Name is required");
            last_nameRef.current?.focus();
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(form.email)) {
            alert("Enter a valid email.");
            setForm({ ...form, email: "" });
            emailRef.current?.focus();
            return;
        }

        const passwordPattern =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

        if (!passwordPattern.test(form.password)) {
            alert(
                "Password must contain 8+ characters, uppercase, lowercase, number and special character."
            );

            setForm({
                ...form,
                password: ""
            });

            passwordRef.current?.focus();
            return;
        }

        try {
            const userData = {
                first_name: form.fname,
                last_name: form.lname,
                email: form.email,
                password: form.password
            };

            const res = await registerUser(userData);

            alert(res.message || "Registered successfully!");

            navigate("/login");
        } catch (error) {
            alert(
                error.response?.data?.message || "Registration Failed"
            );
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

                <div className="p-6 md:p-8 flex flex-col justify-center">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Create Account
                    </h2>

                    <p className="text-xs text-gray-500 mt-1">
                        Join Style Union and start shopping your favorite products.
                    </p>

                    <form onSubmit={register} className="space-y-3 mt-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block mb-1 text-xs font-medium text-gray-700">
                                    First Name
                                </label>

                                <input
                                    ref={first_nameRef}
                                    name="fname"
                                    value={form.fname}
                                    placeholder="First Name"
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block mb-1 text-xs font-medium text-gray-700">
                                    Last Name
                                </label>

                                <input
                                    ref={last_nameRef}
                                    name="lname"
                                    value={form.lname}
                                    placeholder="Last Name"
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block mb-1 text-xs font-medium text-gray-700">
                                Email
                            </label>

                            <input
                                ref={emailRef}
                                type="email"
                                name="email"
                                value={form.email}
                                placeholder="Enter Email"
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-xs font-medium text-gray-700">
                                Password
                            </label>

                            <input
                                ref={passwordRef}
                                type="password"
                                name="password"
                                value={form.password}
                                placeholder="Enter Password"
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-semibold transition duration-300"
                        >
                            Register
                        </button>
                    </form>

                    <div className="text-center mt-3">
                        <p className="text-xs text-gray-600">
                            Already have an account?
                        </p>

                        <button
                            onClick={() => navigate("/login")}
                            className="mt-1.5 w-full border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-2 rounded-lg text-sm font-semibold transition duration-300"
                        >
                            Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;