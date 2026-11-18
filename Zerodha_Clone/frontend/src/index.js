import React from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter, Router, Routes, Route } from "react-router-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
// Pages
import HomePage from "./landing_Page/Home/HomePage.js";
import Signup from "./landing_Page/Signup/Signup.js";
import Login from "./landing_Page/Signup/Login.js";
import About from "./landing_Page/About/About.js";
import Support from "./landing_Page/support/SupportPage.js";
import Product from "./landing_Page/products/ProductPage.js";
import Pricing from "./landing_Page/priceing/PricingPage.js";
import Navbar from "./landing_Page/Navbar";
import Footer from "./landing_Page/Footer";
import NotFound from "./landing_Page/NotFound.js";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Navbar />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/about" element={<About />} />
      <Route path="/support" element={<Support />} />
      <Route path="/products" element={<Product />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    <Footer />
  </BrowserRouter>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
