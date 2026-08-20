function ProductDescription({Product}){
    return(
        <div className="mt-12 rounded-xl border bg-white p-8">
            <h2 className="mb-8 border-b pb-4 text-3xl font-bold">
                🗒️ Product Details
            </h2>
            <div className="space-y-5">
                <h3 className="font-semibold text-lg">
                    Description
                </h3>
                <p className="text-gray-600 leading-7">
                    {Product.description}
                </p>
            </div>

            <hr className="my-8" />

                <div className="grid gap-5 md:grid-cols-1">
                    <div className="flex justify-between border-b pb-2">
                        <h3 className="font-semibold text-lg">
                            Brand
                        </h3>

                        <p className="text-gray-600">
                            {Product.brand || "N/A"}
                        </p>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                        <h3 className="font-semibold text-lg">
                            Category
                        </h3>

                        <p className="text-gray-600 capitalize">
                            {Product.category}
                        </p>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                        <h3 className="font-semibold text-lg">
                            Weight
                        </h3>

                        <p className="text-gray-600">
                            {Product.weight}g
                        </p>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold text-lg">
                        Minimum Order
                    </span>

                    <span className="text-gray-600">
                        {Product.minimumOrderQuantity}
                    </span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <h3 className="font-semibold text-lg mt-4">
                            Tags
                        </h3>

                        <div className="flex flex-wrap gap-3 mt-2">

                            {Product.tags.map((tag,index)=>(
                            <span
                                key={index}
                                className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700"
                            >
                                #{tag}
                            </span>
                            ))}

                        </div>
                </div>

                <div>
                    <h3 className="font-semibold text-lg mt-4">
                        Barcode
                    </h3>

                    <p className="text-gray-600">
                        {Product.meta.barcode}
                    </p>
                </div>

                </div>

                <div className="rounded-lg bg-gray-100 mt-4 text-left">
                    <h3 className="font-semibold text-lg">
                        Dimensions
                    </h3>

                    <p className="text-gray-600">
                        Width : {Product.dimensions.width} cm
                    </p>

                    <p className="text-gray-600">
                        Height : {Product.dimensions.height} cm
                    </p>

                    <p className="text-gray-600">
                        Depth : {Product.dimensions.depth} cm
                    </p>
                </div>

                
                
                <div className="rounded-lg bg-green-50 p-4 mt-4">
                    <h3 className="font-semibold text-lg">
                       🔄 Warranty
                    </h3>

                    <p className="font-semibold text-lg">
                        {Product.warrantyInformation}
                    </p>
                </div>
            <div className="rounded-lg bg-blue-50 p-4">
                <h3 className="font-semibold text-lg">
                    🚚 Shipping
                </h3>

                <p className="text-gray-600">
                    {Product.shippingInformation}
                </p>
            </div>

            <div className="rounded-lg bg-green-50 p-4">

            <h3 className="font-semibold text-lg">
                Return Policy
            </h3>

            <p className="text-gray-600">
                {Product.returnPolicy}
            </p>
            </div>
                
        </div>
    );
}
export default ProductDescription;