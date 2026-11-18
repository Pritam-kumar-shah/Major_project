import React from "react";

function LeftImg({
  imageUrl,
  productName,
  productDescription,
  tryDemo,
  learnMore,
  googlePlay,
  appStore,
}) {
  return (
    <div className="container mt-5">
      <div className="row ">
        <div className="col-7 p-4">
          <img src={imageUrl} alt="Kite" className="img-fluid" />
        </div>
        <div className="col-4" mt-5 p-5>
          <h2 className="mt-5 p-5">{productName}</h2>
          <p>{productDescription}</p>
          <div>
            <a href={tryDemo}>Try Demo </a>
            <a href={learnMore} style={{ marginLeft: "50px" }}>
              Learn More
            </a>
          </div>
          <div className="mt-3">
            <a href={googlePlay}>
              <img src="/media/images/googlePlayBadge.svg" />
            </a>
            <a href={appStore}>
              <img
                src="/media/images/appstoreBadge.svg"
                style={{ marginLeft: "50px" }}
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeftImg;
