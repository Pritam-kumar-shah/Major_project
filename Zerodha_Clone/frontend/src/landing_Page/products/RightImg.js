import React from "react";

function RightImg({ imageUrl, productName, productDescription, learnMore }) {
  return (
    <div className="container mt-5 ">
      <div className="row ">
        <div className="col-6" mt-5 p-5>
          <h2 className="mt-5 p-5">{productName}</h2>
          <p>{productDescription}</p>
          <div>
            <a href={learnMore} style={{ marginLeft: "50px" }}>
              Learn More
            </a>
          </div>
        </div>
        <div className="col-6 p-4">
          <img src={imageUrl} alt="Kite" className="img-fluid" />
        </div>
      </div>
    </div>
  );
}

export default RightImg;
