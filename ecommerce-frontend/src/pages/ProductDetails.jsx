import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../services/productService";
import { createOrder } from "../services/orderService";

import ProductImageGallary from "../components/ProductImageGallary";
import ProductInfo from "../components/ProductInfo";
import ProductDescription from "../components/ProductDescription";
import ReviewList from "../components/Reviewlist";
import RelatedProducts from "../components/Relatedproducts";

function ProductDetails() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);

    // Controls order form
    const [showOrderForm, setShowOrderForm] = useState(false);

    // Order form data
    const [form, setForm] = useState({
        customer_name: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        quantity: 1
    });

    useEffect(() => {

        async function fetchProduct() {

            try {

                const data = await getProductById(id);

                console.log(data);
                console.log(data.reviews);

                setProduct(data);

            } catch (error) {

                console.log(error);
            }
        }

        fetchProduct();

    }, [id]);


    // Handle form inputs
    const handleChange = (e) => {

        const { name, value } = e.target;

        setForm({
            ...form,
            [name]: value
        });
    };


    // Place order
    const handlePlaceOrder = async (e) => {

        e.preventDefault();

        try {

            const quantity = Number(form.quantity);

            const total_price = product.price * quantity;

            const orderData = {

                product_id: product.id,

                customer_name: form.customer_name,

                phone: form.phone,

                address: form.address,

                city: form.city,

                state: form.state,

                pincode: form.pincode,

                quantity: quantity,

                total_price: total_price,

                status: "Placed"
            };

            console.log("Order Data:", orderData);

            const response = await createOrder(orderData);

            console.log("Order Response:", response);

            alert(
                response.message ||
                "Order placed successfully!"
            );

            // Go to My Orders
            navigate("/orders");

        } catch (error) {

            console.error("Order error:", error);

            alert(
                error.response?.data?.message ||
                "Failed to place order"
            );
        }
    };


    if (!product) {

        return (
            <h1 className="text-center mt-10 text-2xl">
                Loading...
            </h1>
        );
    }


    return (
        <div className="mx-auto max-w-screen-2xl p-8">

        <div className="grid md:grid-cols-2 gap-10">

        <ProductImageGallary
        images={product.images}
        title={product.title}
        />
        <ProductInfo 
          product={product}            
          onBuyNow={() => setShowOrderForm(true)} />

        {showOrderForm && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">

        <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl p-8">

            

            <button
                type="button"
                onClick={() => setShowOrderForm(false)}
                className="absolute right-5 top-5 text-2xl text-gray-500 hover:text-black"
            >
                ✕
            </button>



            <h2 className="text-2xl font-bold mb-6">
                Place Your Order
            </h2>



            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-100 rounded-lg">

                <img
                    src={product.thumbnail}
                    alt={product.title}
                    className="w-20 h-20 object-cover rounded-lg"
                />

                <div>

                    <h3 className="font-semibold">
                        {product.title}
                    </h3>

                    <p className="text-gray-600">
                        Product ID: {product.id}
                    </p>

                    <p className="font-bold text-blue-600">
                        ${product.price}
                    </p>

                </div>

            </div>




            <form onSubmit={handlePlaceOrder}>


                <div className="mb-4">

                    <label className="block font-medium mb-2">
                        Customer Name
                    </label>

                    <input
                        type="text"
                        name="customer_name"
                        value={form.customer_name}
                        onChange={handleChange}
                        placeholder="Enter your name"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>



                <div className="mb-4">

                    <label className="block font-medium mb-2">
                        Phone
                    </label>

                    <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Enter phone number"
                        required
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>



                <div className="mb-4">

                    <label className="block font-medium mb-2">
                        Address
                    </label>

                    <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Enter your address"
                        required
                        rows="3"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />

                </div>



                <div className="grid grid-cols-2 gap-4 mb-4">

                    <div>

                        <label className="block font-medium mb-2">
                            City
                        </label>

                        <input
                            type="text"
                            name="city"
                            value={form.city}
                            onChange={handleChange}
                            placeholder="City"
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3"
                        />

                    </div>


                    <div>

                        <label className="block font-medium mb-2">
                            State
                        </label>

                        <input
                            type="text"
                            name="state"
                            value={form.state}
                            onChange={handleChange}
                            placeholder="State"
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3"
                        />

                    </div>

                </div>



                <div className="grid grid-cols-2 gap-4 mb-4">

                    <div>

                        <label className="block font-medium mb-2">
                            Pincode
                        </label>

                        <input
                            type="text"
                            name="pincode"
                            value={form.pincode}
                            onChange={handleChange}
                            placeholder="Pincode"
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3"
                        />

                    </div>


                    <div>

                        <label className="block font-medium mb-2">
                            Quantity
                        </label>

                        <input
                            type="number"
                            name="quantity"
                            min="1"
                            value={form.quantity}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-3"
                        />

                    </div>

                </div>



                <div className="flex justify-between items-center bg-gray-100 rounded-lg p-4 mb-6">

                    <span className="font-semibold">
                        Total Price
                    </span>

                    <span className="text-xl font-bold text-blue-600">
                        ${product.price * Number(form.quantity)}
                    </span>

                </div>



                <div className="flex gap-4">

                    <button
                        type="button"
                        onClick={() => setShowOrderForm(false)}
                        className="w-1/2 border border-gray-300 py-3 rounded-lg hover:bg-gray-100"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
                    >
                        Place Order
                    </button>

                </div>

            </form>

        </div>

    </div>
)}


        <ProductDescription Product={product}/>
        <ReviewList reviews={product.reviews}/>
        </div>
        <RelatedProducts
            category={product.category}
            currentProductId={product.id}
        />
      </div>
    );
}

export default ProductDetails;