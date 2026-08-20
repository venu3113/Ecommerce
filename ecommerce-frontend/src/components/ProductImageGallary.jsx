import { useEffect,useState } from "react";

function ProductImageGallary({images,title}){

    const [selectedImage,setSelectedImage] = useState(images[0]);

     useEffect(() => {
        setSelectedImage(images[0]);
    }, [images]);

    return(
        <div>
            <img src={selectedImage} alt={title} 
            className="h-[500px] w-full rounded-xl border object-cover"/>

            <div className="mt-4 flex gap-3">
                {images.map((image,index)=>(
                    <img src={image} key={index} alt={title} onClick={()=>setSelectedImage(image)}
                    className={`h-24 w-24 cursor-pointer rounded-lg border object-cover
                        ${
                            selectedImage === image?
                            "border-blue-600":"border-gray-200"
                        }`
                    }/>
                ))}
            </div>
        </div>

    )
    
}
export default ProductImageGallary;