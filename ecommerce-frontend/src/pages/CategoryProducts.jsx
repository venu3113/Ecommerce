import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductByCategory } from "../services/categoryService";
import ProductCard from "../pages/ProductCard";

function CategoryProducts() {

    const { category } = useParams();

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchProducts = async () => {

            try {

                const data = await getProductByCategory(category);

                setProducts(data);

            } catch (error) {

                console.error("Category products error:", error);

            } finally {

                setLoading(false);

            }
        };

        fetchProducts();

    }, [category]);


    if (loading) {
        return (
            <p className="text-center mt-10">
                Loading products...
            </p>
        );
    }


    return (
        <div className="max-w-7xl mx-auto px-8 py-10">

                <h1 className="text-3xl font-bold mb-8 capitalize">
                    {category}
                </h1>

                {products.length === 0 ? (

                    <p>
                        No products found.
                    </p>

                ) : (

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">

                        {products.map((product) => (

                            <ProductCard
                                key={product.id}
                                product={product}
                            />

                        ))}

                    </div>

                )}

            </div>
    );
}

export default CategoryProducts;