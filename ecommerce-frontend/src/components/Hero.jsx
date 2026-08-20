import { Link } from "react-router-dom";
import hero from "../assets/hero.jpeg";

function Hero() {
  return (
    <section className="h-[calc(100vh-5rem)] w-full overflow-hidden bg-gray-100 flex items-center justify-center">
      <div className="flex h-full w-full max-w-7xl items-center justify-between px-6 md:px-12 py-4 md:py-8 flex-col md:flex-row gap-6 md:gap-12">

        {/* Left Side */}
        <div className="max-w-xl flex flex-col justify-center">

          <p className="mb-2 md:mb-3 text-sm md:text-base text-blue-600 font-semibold uppercase tracking-wider">
            New Collection
          </p>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-gray-900">
            Elevate Your Style
          </h1>

          <p className="mt-4 md:mt-6 text-base md:text-lg text-gray-600">
            Discover premium fashion, accessories, and beauty products
            designed to make every day stylish.
          </p>

          <div className="mt-6 md:mt-8 flex gap-4">

            <Link
              to="/products"
              className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 font-medium transition shadow-md hover:shadow-lg"
            >
              Shop Now
            </Link>

            <Link
              to="/categories"
              className="rounded-lg border border-gray-800 px-6 py-3 text-gray-800 hover:bg-gray-800 hover:text-white font-medium transition"
            >
              Explore
            </Link>

          </div>

        </div>

        {/* Right Side */}

        <div className="flex justify-center items-center max-h-[calc(100vh-10rem)] md:max-w-[45%] overflow-hidden">

          <img
            src={hero}
            alt="fashion"
            className="rounded-2xl shadow-xl max-h-[calc(100vh-10rem)] object-cover w-auto"
          />

        </div>

      </div>
    </section>
  );
}

export default Hero;