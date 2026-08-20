import { useEffect,useState } from "react"
import ProductCard from "./ProductCard";
import { getAllProducts } from "../services/productService";

function Products(){
    const[products,setProducts] = useState([]);

        useEffect(()=>{
            async function fetchProducts(){
                try{
                    const products = await getAllProducts();
                    setProducts(products);;
                    console.log("all products",products);
                
                } catch(error) {
                    console.log(error);  
                    }
                }
                
                
                fetchProducts();
                
            },[]);
    return(
        <div className="mx-auto max-w-7xl p-6">
            <h1 className="mb-8 text-3xl font-bold">Latest products</h1>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                {products.map((product)=>(
                    <ProductCard
                    key={product.id}
                    product={product}/>
                
                ))}
            </div>
        </div>
    )
}
export default Products;