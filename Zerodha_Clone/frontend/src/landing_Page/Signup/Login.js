import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const res = await axios.post("http://localhost:3002/login", formData);

      if (res.data.success) {
        localStorage.setItem("user", JSON.stringify(res.data.user));

        window.location.href = "http://localhost:3001";
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="container-fluid d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        backgroundColor: "#f8f9fa",
      }}
    >
      <div
        className="card shadow border-0"
        style={{
          width: "100%",
          maxWidth: "450px",
          borderRadius: "15px",
        }}
      >
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <img
              src="https://zerodha.com/static/images/logo.svg"
              alt="Zerodha"
              style={{ width: "130px" }}
            />

            <h3 className="mt-4 fw-bold">Login to your account</h3>

            <p className="text-muted">Welcome back to Zerodha Clone</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Email Address</label>

              <input
                type="email"
                className="form-control form-control-lg"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="mb-4">
              <label className="form-label">Password</label>

              <input
                type="password"
                className="form-control form-control-lg"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 btn-lg"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="text-center mt-4">
            <p className="mb-0">
              Don't have an account?{" "}
              <Link to="/signup" className="text-decoration-none fw-semibold">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
