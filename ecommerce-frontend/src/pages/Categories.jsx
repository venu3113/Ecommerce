import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories } from "../services/categoryService";

function Categories() {
    const [categories, setCategories] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
            } catch (error) {
                console.error("Categories error:", error);
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryClick = (categorySlug) => {
        navigate(`/category/${categorySlug}`);
    };

    return (
        <div className="mx-auto max-w-7xl p-8">
            <h1 className="text-3xl font-bold mb-6">
                Categories
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((category) => (
                    <button
                        key={category.slug}
                        onClick={() => handleCategoryClick(category.slug)}
                        className="block w-full text-left px-5 py-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-500 hover:bg-blue-50 transition capitalize font-medium text-gray-800"
                    >
                        {category.name}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default Categories;