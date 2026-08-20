import { useEffect, useState } from "react";
import { getProductsByCategory } from "../services/productService";
import ProductCard from "../pages/ProductCard"

function RelatedProducts({ category, currentProductId }) {

    const [products, setProducts] = useState([]);

    useEffect(() => {

        async function fetchRelatedProducts() {

            try {

                const data = await getProductsByCategory(category);

                const filteredProducts = data.filter(
                    product => product.id !== currentProductId
                );

                setProducts(filteredProducts);

            } catch (error) {

                console.log(error);

            }

        }

        if (category) {
            fetchRelatedProducts();
        }

    }, [category, currentProductId]);

    return (

        <div className="mt-12">

            <h2 className="mb-6 text-3xl font-bold">
                Related Products
            </h2>

            <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">

                {products.slice(0,4).map(product => (

                    <ProductCard
                        key={product.id}
                        product={product}
                    />

                ))}

            </div>

        </div>

    );
}

export default RelatedProducts;