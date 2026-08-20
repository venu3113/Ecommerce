import Home from "./pages/Home";
import Products from "./pages/Products"
import { Routes,Route } from "react-router-dom";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WishList from "./pages/WishList";
import Orders from "./pages/Orders";
import Categories from "./pages/Categories";
import CategoryProducts from "./pages/CategoryProducts"
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Navbar/>

      <main className="pt-20">
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<Login />} />

          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route
            path="/products/:id"
            element={<ProductDetails />}
          />

          <Route path="/wishlist" element={<WishList/>}/>
          <Route path="/orders" element={<Orders />} />

          <Route path="/categories" element={<Categories/>}/>
          <Route path="/category/:category" element={<CategoryProducts/>}/>
        </Routes>
      </main>
      </>
  
  );
}

export default App;