import React from "react";

function Universe() {
  return (
    <div className="container mt-5 ">
      <p className="mt-5 text-center fs-5 p-5 text-grey">
        Want to know more about our technology stack? Check out the{" "}
        <a href="" style={{ textDecoration: "none" }}>
          Zerodha.tech
        </a>{" "}
        blog.
      </p>
      <div className="row mt-5 p-5">
        <h1 className="text-center fs-3  text-muted">The Zerodha Universe</h1>
        <p className="text-center fs-6 p-3 text-muted">
          Extend your trading and investment experience even further with our
          partner platforms
        </p>
        <div className="col-4 p-3 text-center">
          <div className="d-flex flex-column align-items-center">
            <img
              src="media/images/zerodhaFundhouse.png"
              style={{ height: "55px", width: "192px" }}
              className="mb-3"
              alt="Zerodha Fund House"
            />

            <p className="text-muted small">
              Our asset management venture <br />
              that is creating simple and transparent index <br />
              funds to help you save for your goals.
            </p>
          </div>
          <div className="d-flex flex-column align-items-center mt-4">
            <img
              src="media/images/streak-logo.png"
              style={{ height: "55px", width: "192px" }}
              className="mb-3"
              alt="Zerodha Fund House"
            />

            <p className="text-muted small">
              Systematic trading platform <br />
              that allows you to create and backtest <br />
              strategies without coding.
            </p>
          </div>
        </div>

        <div className="col-4 p-3 text-center">
          <div className="d-flex flex-column align-items-center">
            <img
              src="media/images/sensibullLogo.svg"
              style={{ height: "55px", width: "192px" }}
              className="mb-3"
              alt="Zerodha Fund House"
            />

            <p className="text-muted small">
              Options trading platform that lets you <br />
              create strategies, analyze positions, and examine <br />
              data points like open interest, FII/DII, and more.
            </p>
          </div>
          <div className="d-flex flex-column align-items-center mt-4">
            <img
              src="media/images/smallcaseLogo.png"
              style={{ height: "55px", width: "192px" }}
              className="mb-3"
              alt="Zerodha Fund House"
            />

            <p className="text-muted small">
              Thematic investing platform <br />
              that helps you invest in diversified <br />
              baskets of stocks on ETFs.
            </p>
          </div>
        </div>
        <div className="col-4 p-3 text-center">
          <div className="d-flex flex-column align-items-center">
            <img
              src="media/images/tijori.svg"
              style={{ height: "55px", width: "192px" }}
              className="mb-3"
              alt="Zerodha Fund House"
            />

            <p className="text-muted small">
              Investment research platform <br />
              that offers detailed insights on stocks, <br />
              sectors, supply chains, and more.
            </p>
          </div>
          <div className="d-flex flex-column align-items-center mt-4">
            <img
              src="media/images/dittoLogo.png"
              style={{ height: "55px", width: "143px" }}
              className="mb-3"
              alt="Zerodha Fund House"
            />

            <p className="text-muted small">
              Personalized advice on life <br />
              and health insurance. No spam <br />
              and no mis-selling.
            </p>
          </div>
        </div>
        <div classname="text-center">
          <button
            className="p-2 btn mt-5 btn-primary fs-5 mb-5"
            style={{ width: "20%", margin: "0 auto", marginLeft: "40%" }}
          >
            Sign up for free
          </button>
        </div>
      </div>
    </div>
  );
}

export default Universe;
