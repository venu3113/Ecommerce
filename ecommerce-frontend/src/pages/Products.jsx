// import { useEffect,useState } from "react"
// import ProductCard from "./ProductCard";
// import { getAllProducts } from "../services/productService";
// import { useSearchParams } from "react-router-dom";

// function Products(){
//     const[products,setProducts] = useState([]);
//     const[filteredProducts, setFilteredProducts] = useState([])

//     const [searchParams] = useSearchParams()
//     const search = searchParams.get("search")||"";

//         useEffect(()=>{
//             async function fetchProducts(){
//                 try{
//                     const products = await getAllProducts();
//                     setProducts(products);;
//                     console.log("all products",products);
                
//                 } catch(error) {
//                     console.log(error);  
//                     }
//                 }
                
                
//                 fetchProducts();
                
//             },[]);

//             useEffect(()=>{
//                 if(!search){
//                     setFilteredProducts(products);
//                     return;
//                 }
//                 const filtered = products.filter((product)=>product.name.toLowerCase().includes(search.toLowerrCase())
                
//             ) 
//             setFilteredProducts(filtered)
        
//             },[search, products])
//     return(
//         <div className="mx-auto max-w-7xl p-6">
//             {/* <div>
//                 <h1 className="mb-8 text-3xl font-bold">Latest products</h1>

//             <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
//                 {products.map((product)=>(
//                     <ProductCard
//                     key={product.id}
//                     product={product}/>
                
//                 ))}
//             </div>
//             </div> */}

//             <div>
//       <h1>Products</h1>

//       {search && (
//         <p>
//           Search results for: <strong>{search}</strong>
//         </p>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {filteredProducts.length > 0 ? (
//           filteredProducts.map((product) => (
//             <ProductCard
//               key={product.id}
//               product={product}
//             />
//           ))
//         ) : (
//           <p>No products found.</p>
//         )}
//       </div>
//     </div>
//         </div>
//     )
// }
// export default Products;

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { getAllProducts } from "../services/productService";
import { useSearchParams } from "react-router-dom";

function Products() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);

    const [searchParams] = useSearchParams();
    const search = searchParams.get("search") || "";

    useEffect(() => {
        async function fetchProducts() {
            try {
                const data = await getAllProducts();

                console.log("all products:", data);

                setProducts(data);
            } catch (error) {
                console.log("Error fetching products:", error);
            }
        }

        fetchProducts();
    }, []);

    useEffect(() => {
        if (!search) {
            setFilteredProducts(products);
            return;
        }

        const filtered = products.filter((product) =>
            (product.title || "")
                .toLowerCase()
                .includes(search.toLowerCase())
        );

        setFilteredProducts(filtered);
    }, [search, products]);

    return (
        <div className="mx-auto max-w-7xl p-6">

            <h1 className="mb-8 text-3xl font-bold">
                Latest Products
            </h1>

            {search && (
                <p className="mb-6">
                    Search results for: <strong>{search}</strong>
                </p>
            )}

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">

                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                        />
                    ))
                ) : (
                    <p>No products found.</p>
                )}

            </div>
        </div>
    );
}

export default Products;