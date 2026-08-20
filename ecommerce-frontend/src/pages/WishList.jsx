import { useEffect,useState } from "react";
import { getWishlist,removeFromWishlist } from "../services/wishlistService";
import api from "../services/api";

function WishList(){
    const [products, setProducts] = useState([]);
    const [loading,setLoading] = useState(true);

    useEffect(()=>{
        const fetchWishlist = async()=>{
            try{
                const wishlistResponse = await getWishlist();

                console.log("Wishlist:", wishlistResponse);

                const wishlistItems = wishlistResponse.wishlist;

                const productsResponse = await api.get("/products");

                const allProducts = productsResponse.data.products;

                const wishlistProducts = allProducts.filter(product=> wishlistItems.some(
                    item=> item.product_id === product.id)
                )

                setProducts(wishlistProducts)
            }
            catch(error){
                console.error("Wishlist error:",error);

                alert(
                    error.response?.data?.message||
                    "Failed to load wishlist"
                );
            } 
            finally{
                setLoading(false);
            }
            }; 
            
            fetchWishlist();
            
        },[])

    if (loading){
        return <p className="text-center mt-10">Loading Wishlist...</p>
        }
        
    const handleRemove = async(productId)=>{
        try{
            const response = await removeFromWishlist(productId);
            
            alert(response.message);
            setProducts((previousProducts)=>
            previousProducts.filter(product=> product.id !== productId)
        );
        }
        catch(error){
            console.log("Remove Wishlist error:",error);
            alert(
                error.response?.data?.message||
                "Failed to remove product"
            );
            
        }
    }
    return(
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="mb-8 text-3xl font-bold">
                My Wishlist ❤️
            </h1>

            {products.length === 0?(
                <p>Your wishlist is empty.</p>
            ):(
                <div className="space-y-4">
                    {products.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white p-5 rounded-xl shadow flex gap-6 items-center"
                        >
                            <img
                                src={item.thumbnail}
                                alt={item.title}
                                className="w-32 h-32 object-cover rounded-lg"
                            />

                            <div className="flex-1">

                                <h2 className="text-xl font-semibold">
                                    {item.title}
                                </h2>

                                <p className="text-gray-500 mt-2">
                                    {item.description}
                                </p>

                                <p className="text-lg font-bold text-blue-600 mt-2">
                                    ${item.price}
                                </p>

                            </div>

                            <button
                                onClick={() => handleRemove(item.id)}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
                            >
                                Remove
                            </button>

                        </div>
                    ))}
                </div>
            )}

        </div>
    )

}

export default WishList