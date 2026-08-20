import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import logo from "../assets/logo.jpeg"

function Register() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        first_name: "",
        last_name: "",
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
            !form.fname.trim() ||
            !form.lname.trim() ||
            !form.email.trim() ||
            !form.password.trim()
        ) {
            alert("All fields are required.");
            return;
        }

        if (!form.fname.trim()) {
            alert("First Name is required");
            first_nameRef.current.focus();
            return;
        }

        if (!form.lname.trim()) {
            alert("Last Name is required");
            last_nameRef.current.focus();
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(form.email)) {
            alert("Enter a valid email.");
            setForm({ ...form, email: "" });
            emailRef.current.focus();
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

            passwordRef.current.focus();
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

            alert(res.message);

            navigate("/login");

        } catch(error){

            alert(
                error.response?.data?.message ||"Registration Failed"
            );

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
                    Create Account
                </h1>

                <p className="text-gray-500 mt-2">
                    Join Style Union and start shopping your favorite products. 
                </p>

                <form
                    onSubmit={register}
                    className="space-y-5 mt-6"
                >
                    <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block mb-2 font-medium text-gray-700">
                            First Name
                        </label>

                        <input
                            ref={first_nameRef}
                            name="fname"
                            value={form.fname}
                            placeholder="Enter First Name"
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-gray-700">
                            Last Name
                        </label>

                        <input
                            ref={last_nameRef}
                            name="lname"
                            value={form.lname}
                            placeholder="Enter Last Name"
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-gray-700">
                            Email
                        </label>

                        <input
                            ref={emailRef}
                            type="email"
                            name="email"
                            value={form.email}
                            placeholder="Enter Email"
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 font-medium text-gray-700">
                            Password
                        </label>

                        <input
                            ref={passwordRef}
                            type="password"
                            name="password"
                            value={form.password}
                            placeholder="Enter Password"
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition duration-300"
                    >
                        Register
                    </button>

                </form>

                <div className="text-center mt-6">

                    <p className="text-gray-600">
                        Already have an account?
                    </p>

                    <button
                        onClick={() => navigate("/login")}
                        className="mt-3 w-full border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white py-3 rounded-lg font-semibold transition duration-300"
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