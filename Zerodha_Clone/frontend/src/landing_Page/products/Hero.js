import React from "react";

function Hero() {
  return (
    <div className="container mt-5 p-5 mb-5 border-bottom">
      <h1 className="fs-2 text-grey text-center">Zerodha Products</h1>
      <p className="fs-5 mt-2 text-center text-grey">
        Sleek, modern, and intuitive trading platforms
      </p>
      <p className="fs-5 mt-2 text-center text-grey mb-5">
        Check out our{" "}
        <a href="" style={{ textDecoration: "none" }}>
          investment offerings →
        </a>
      </p>
    </div>
  );
}

export default Hero;
