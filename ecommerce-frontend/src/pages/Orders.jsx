import { useEffect,useState } from "react";
import { getOrders } from "../services/orderService";
import api from "../services/api"

function Orders(){
    const[orders,setOrders]= useState([]);
    const[products,setProducts]= useState([]);
    const [loading,setLoading]=useState(true);

    useEffect(()=>{
        const fetchOrders = async()=>{
            try{
         
                const orderResponse = await getOrders();

                const productsResponse = await api.get("/products");

                const ordersData = orderResponse.orders || [];
                const productsData = productsResponse.data.products || [];

                setOrders(ordersData);
                setProducts(productsData);
            } catch(error){
                console.error("Orders error:",error);
                
                alert(
                    error.response?.data?.message || 
                    "Failed to load orders"
                )
            } finally{
                setLoading(false);
            }
                
            }

        fetchOrders();

    }, []);

     if (loading) {
        return (
            <p className="text-center mt-10">
                Loading Orders...
            </p>
        );
    }


    return(
        <div className="min-h-screen bg-gray-100 p-8">

            <h1 className="text-3xl font-bold mb-8">
                My Orders 📦
            </h1>

            {orders.length === 0 ? (

                <p className="text-gray-600">
                    You have no orders.
                </p>

            ) : (

                <div className="space-y-6">

                    {orders.map((order) => {

                        const product = products.find(
                            (item) => item.id === order.product_id
                        );

                        return (
                            <div
                                key={order.id}
                                className="bg-white rounded-xl shadow p-6"
                            >

                                <div className="flex gap-6">

                                    {product && (
                                        <img
                                            src={product.thumbnail}
                                            alt={product.title}
                                            className="w-32 h-32 object-cover rounded-lg"
                                        />
                                    )}

                                    <div className="flex-1">

                                        <h2 className="text-xl font-semibold">
                                            {product
                                                ? product.title
                                                : `Product ${order.product_id}`}
                                        </h2>

                                        {product && (
                                            <p className="text-gray-500 mt-2">
                                                {product.description}
                                            </p>
                                        )}

                                        <p className="mt-3">
                                            Quantity: {order.quantity}
                                        </p>

                                        <p className="text-lg font-bold text-blue-600 mt-2">
                                            Total: ₹{order.total_price}
                                        </p>

                                        <p className="mt-2">
                                            Status:{" "}
                                            <span className="text-green-600 font-semibold">
                                                {order.status}
                                            </span>
                                        </p>

                                    </div>

                                </div>

                                <div className="border-t mt-5 pt-5">

                                    <h3 className="font-semibold mb-2">
                                        Delivery Address
                                    </h3>

                                    <p className="text-gray-600">
                                        {order.customer_name}
                                    </p>

                                    <p className="text-gray-600">
                                        {order.phone}
                                    </p>

                                    <p className="text-gray-600">
                                        {order.address}, {order.city}
                                    </p>

                                    <p className="text-gray-600">
                                        {order.state} - {order.pincode}
                                    </p>

                                </div>

                            </div>
                        );
                    })}

                </div>
            )}

        </div>
    )
}

export default Orders;