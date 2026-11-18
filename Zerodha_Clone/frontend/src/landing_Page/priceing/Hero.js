import React from "react";

function Hero() {
  return (
    <div className="container mb-5">
      <div className="hero">
        <div className="row p-10 text-center mt-5 mb-5">
          <div className="col-12 mt-5 text-light-grey">
            <h1 style={{ fontSize: "1.7rem" }}>Charges</h1>
            <p
              className="text-grey fs-4 mt-2 text-muted"
              style={{ fontSize: "1.2rem" }}
            >
              List of all charges and taxes
            </p>
          </div>
        </div>
        <div className="row text-center mt-5 p-5">
          <div className="col-4">
            <img
              src="media/images/pricing0.svg"
              alt="Charge 1"
              className="img-fluid"
              style={{ width: "65%" }}
            />

            <h2 className="mt-4 fs-3">Free equity delivery</h2>

            <p className="text-muted fs-6 mt-4 lh-lg">
              All equity delivery investments (NSE, BSE), <br />
              are absolutely free — ₹ 0 brokerage.
            </p>
          </div>

          <div className="col-4">
            <img
              src="media/images/intradayTrades.svg"
              alt="Charge 2"
              className="img-fluid"
              style={{ width: "65%" }}
            />

            <h2 className="mt-4 fs-3">Intraday and F&O trades</h2>

            <p className="text-muted fs-6 mt-4 lh-lg">
              Flat ₹ 20 or 0.03% (whichever is lower) per <br />
              executed order on intraday trades across <br />
              equity, currency, and commodity trades.
            </p>
          </div>

          <div className="col-4">
            <img
              src="media/images/pricing0.svg"
              alt="Charge 3"
              className="img-fluid"
              style={{ width: "65%" }}
            />

            <h2 className="mt-4 fs-3">Free direct MF</h2>

            <p className="text-muted fs-6 mt-4 lh-lg">
              All direct mutual fund investments are <br />
              absolutely free — ₹ 0 commissions & DP charges.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
