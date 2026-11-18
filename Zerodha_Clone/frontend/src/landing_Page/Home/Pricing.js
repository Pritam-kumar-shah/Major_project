import React from 'react';

function Pricing() {
    return ( 
        <div className="container my-5">
           <div className="row align-items-center">

                {/* Left Section */}
                <div className="col-md-5">
                  <h1 className="mb-4">Unbeatable pricing</h1>
            
                  <p className="text-muted fs-5">
                    We pioneered the concept of discount broking and price
                    transparency in India. Flat fees and no hidden charges.
                  </p>
            
                  <a
                    href="#"
                    style={{ textDecoration: "none" }}
                  >
                    See pricing{" "}
                    <i className="fas fa-long-arrow-alt-right"></i>
                  </a>
                </div>
            
                {/* Right Section */}
                <div className="col-md-7">
                  <div className="row text-center align-items-center">
            
                    <div className="col-4">
                      <img
                        src="media/images/pricing-eq.svg"
                        alt=""
                        className="img-fluid mb-2"
                        style={{ width: "130px" }}
                      />
                      <p className="small">Free account opening</p>
                    </div>
            
                    <div className="col-4">
                      <img
                        src="media/images/pricing-eq.svg"
                        alt=""
                        className="img-fluid mb-2"
                        style={{ width: "130px" }}
                      />
                      <p className="small">
                        Free equity delivery and direct mutual funds
                      </p>
                    </div>
            
                    <div className="col-4">
                      <img
                        src="media/images/other-trades.svg"
                        alt=""
                        className="img-fluid mb-2"
                        style={{ width: "130px" }}
                      />
                      <p className="small">Intraday and F&O</p>
                    </div>
            
                  </div>
                </div>

           </div>
           
       </div>
    );
}

export default Pricing;