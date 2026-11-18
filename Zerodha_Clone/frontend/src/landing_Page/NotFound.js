import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center"
      style={{ height: "100vh" }}
    >
      <h1 className="display-1 fw-bold text-secondary">404</h1>

      <h3 className="mb-3">Page not found</h3>

      <p className="text-secondary mb-4">
        The page you are looking for doesn’t exist.
      </p>

      <Link to="/" className="btn btn-primary px-4 py-2">
        Go to Home
      </Link>
    </div>
  );
}

export default NotFound;
