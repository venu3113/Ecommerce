import Home from "./pages/Home";
import Products from "./pages/Products"
import { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import WishList from "./pages/WishList";
import Orders from "./pages/Orders";
import Categories from "./pages/Categories";
import CategoryProducts from "./pages/CategoryProducts"
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatBot from "./components/Chatbot"
import Cart from "./pages/Cart";

import { isTokenValid, getTokenRemainingTime, clearAuthData } from "./services/authService";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => isTokenValid());
  const location = useLocation();

  // 1. Auto-check token on route changes
  useEffect(() => {
    if (isLoggedIn && !isTokenValid()) {
      setIsLoggedIn(false);
    }
  }, [location.pathname, isLoggedIn]);

  // 2. Set an automatic logout timer for when the token expires in real-time
  useEffect(() => {
    if (!isLoggedIn) return;

    if (!isTokenValid()) {
      setIsLoggedIn(false);
      return;
    }

    const remainingTime = getTokenRemainingTime();
    if (remainingTime <= 0) {
      clearAuthData();
      setIsLoggedIn(false);
      return;
    }

    // Set timeout to automatically log out when token expires
    const timer = setTimeout(() => {
      clearAuthData();
      setIsLoggedIn(false);
    }, Math.min(remainingTime, 2147483647));

    return () => clearTimeout(timer);
  }, [isLoggedIn]);

  // 3. Listen to cross-tab storage changes, API 401s, and window focus
  useEffect(() => {
    const syncAuth = () => {
      setIsLoggedIn(isTokenValid());
    };

    window.addEventListener("storage", syncAuth);
    window.addEventListener("auth-change", syncAuth);
    window.addEventListener("focus", syncAuth);
    return () => {
      window.removeEventListener("storage", syncAuth);
      window.removeEventListener("auth-change", syncAuth);
      window.removeEventListener("focus", syncAuth);
    };
  }, []);

  return (
    <>
      <Navbar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
      />
       
      <main className="pt-20">

        {/* {public routes} */}
        <Routes>
              <Route path="/" element={<Home/>}/>
              <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />

              <Route path="/register" element={<Register />} />
              <Route path="/products" element={<Products />} />
              <Route
                path="/products/:id"
                element={<ProductDetails />}
              />
              <Route path="/categories" element={<Categories/>}/>
              <Route path="/category/:category" element={<CategoryProducts/>}/>
              <Route path="/cart" element={<Cart />} />

        {/* {ProtectedRoutes} */}
        
          <Route element={<ProtectedRoute/>}>

              <Route path="/wishlist" element={<WishList/>}/>
              <Route path="/orders" element={<Orders />} />

          </Route>

        </Routes>
        
        <ChatBot />
      </main>
      </>
  
  );
}

export default App;