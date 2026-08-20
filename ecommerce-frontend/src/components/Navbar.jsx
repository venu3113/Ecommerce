import {useEffect,useState} from "react";
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import logo from "../assets/logo.jpeg"
import { getCategories } from "../services/categoryService";

function Navbar(){
    const navigate = useNavigate();
    const [isLoggedIn,setLoggedIn]  = useState(
        !!localStorage.getItem("token")
    );

    const handleLogout = ()=>{
        localStorage.removeItem("token");
        localStorage.removeItem("username")
        localStorage.removeItem("user")

        setLoggedIn(false);
        navigate("/login");
    }

        const [categories, setCategories] = useState([]);

        useEffect(() => {
            const fetchCategories = async () => {
                try {
                    const data = await getCategories();
                    setCategories(data);
                } catch (error) {
                    console.error("Category error:", error);
                }
            };

            fetchCategories();
        }, []);
    
    return(
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

                <Link to="/" className="flex items-center">
                    <img src={logo} alt="StyleUnion Logo" className="h-12 w-auto"/>
                        <span className="text-2xl font-bold tracking-wide text-gray-900">
                            StyleUnion
                </span>
                </Link>
            

            <ul className="hidden gap-8 md:flex">
                <li>
                    <Link to="/" className="font-medium text-gray-700 hover:text-blue-600">
                        Home
                    </Link>
                </li>
                <li>
                    <Link to="/products" className="font-medium text-gray-700 hover:text-blue-600">
                        Products
                    </Link>
                </li>

                <li>
                    <div className="relative group">

    {/* Categories */}
    <button
        className="font-medium text-gray-700 hover:text-blue-600"
    >
        Categories
    </button>

    {/* Dropdown */}
    <div
        className="
             absolute
            left-1/2
            -translate-x-1/2
            top-full
            hidden
            group-hover:block
            w-52
            h-[220px]
            hide-scrollbar
            bg-white
            rounded-xl
            shadow-xl
            border
            border-gray-200
            z-50
    "
    >

        {categories.map((category) => (
            <button
                key={category.slug}
                onClick={() =>
                    navigate(`/category/${category.slug}`)
                }
                className="
                    block
                    w-full
                    text-left
                    px-4
                    py-2
                    text-sm
                    text-gray-700
                    hover:bg-blue-50
                    hover:text-blue-600
                "
            >
                {category.name}
            </button>
        ))}

    </div>

</div>
                </li>

                <li>
                    <Link
                        to = "/wishlist"
                        className="font-medium text-gray-700 hover:text-blue-600"
                        >
                            ❤️Wishlist
                        </Link>
                </li>

                <li>
                        <Link
                            to="/orders"
                            className="font-medium text-gray-700 hover:text-blue-600"
                        >
                            Orders
                        </Link>
                </li>
            </ul>

                <div className="flex items-center gap-4">
                    <input 
                    type="text"
                    placeholder="search products..."
                    className="hidden rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none md:block"
                    />

                    <button className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                        🛒Cart
                    </button>

                    <div className="flex items-centre gap-4">
                        {isLoggedIn ? (
                            <button
                                onClick={handleLogout}
                                className="rounded-lg border border-red-600 px-4 py-2 text-red-600 hover:bg-red-600 hover:text-white"
                            >
                                Logout        
                                </button>
                        ) : (
                            <button
                                onClick={()=>navigate("/login")}
                                className="rounded-lg border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-600 hover:text-white"
                                >
                                    Login
                                </button>
                        )}
                    </div>

                    {/* <Link to="/login" className="rounded-lg border border-blue-600 px-4 py-2 text-blue-600 hover:bg-blue-600 hover:text-white">
                        Login
                    </Link> */}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
