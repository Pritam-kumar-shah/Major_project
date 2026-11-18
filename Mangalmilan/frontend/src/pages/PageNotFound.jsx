import React from "react";
import { Link } from "react-router-dom";

function PageNotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-pink-100 via-white to-pink-100 text-center">
      <h1 className="text-9xl font-extrabold text-pink-500 animate-bounce">404</h1>
      <p className="text-2xl mt-4 font-semibold text-gray-700">
        Oops! The page you are looking for does not exist.
      </p>
      <p className="mt-2 text-gray-500">Maybe you mistyped the URL or the page was removed.</p>
      <Link 
        to="/" 
        className="mt-6 px-6 py-3 rounded-lg bg-pink-500 text-white font-semibold text-lg hover:bg-pink-600 transition-all shadow-lg hover:shadow-xl"
      >
        Go Back Home
      </Link>
    </div>
  );
}

export default PageNotFound;
