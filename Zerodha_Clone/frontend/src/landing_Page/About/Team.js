import React from "react";

function Team() {
  return (
    <div className="container">
      <div className="row">
        <h2 className="text-center mb-5 mt-5 ">People</h2>
        <div className="col-5 text-center ms-5">
          <img
            src="media/images/nithinKamath.jpg "
            alt="Nithin Kamath founder of Zerodha"
            className="img-fluid rounded-circle"
            style={{ width: "295px", height: "295px" }}
          />
          <h5>Nithin Kamath</h5>
          <p classname="text-grey">Founder, CEO</p>
        </div>
        <div
          className="col-5  p-3  text-muted"
          style={{ lineHeight: "1.8", fontSize: "1.1em" }}
        >
          <p>
            Nithin bootstrapped and founded Zerodha in 2010 to overcome the
            hurdles he faced during his decade long stint as a trader. Today,
            Zerodha has changed the landscape of the Indian broking industry.
          </p>
          <p>
            He is a member of the SEBI Secondary Market Advisory Committee
            (SMAC) and the Market Data Advisory Committee (MDAC).
          </p>
          <p>Playing basketball is his zen.</p>

          <p>
            Connect on{" "}
            <a href="" className="text-decoration-none ">
              Homepage
            </a>{" "}
            /{" "}
            <a href="" className="text-decoration-none ">
              TradingQnA
            </a>{" "}
            /{" "}
            <a href="" className="text-decoration-none ">
              Twitter
            </a>
          </p>
        </div>
      </div>
      <div className="container mt-5 mb-5">
        <div className="row justify-content-between mt-5">
          <div className="col-4 text-center ">
            <img
              src="media/images/Nikhil.jpg"
              className="img-fluid rounded-circle"
              style={{ width: "220px", height: "220px" }}
            />
            <h5>Nikhil Kamath</h5>
            <p classname="text-grey">Co-founder, CFO</p>
          </div>
          <div className="col-4 text-center ">
            <img
              src="media/images/Kailash.jpg"
              className="img-fluid rounded-circle"
              style={{ width: "220px", height: "220px" }}
            />
            <h5>Dr. Kailash Nadh</h5>
            <p classname="text-grey">CTO</p>
          </div>
          <div className="col-4 text-center ">
            <img
              src="media/images/Venu.jpg"
              className="img-fluid rounded-circle"
              style={{ width: "220px", height: "220px" }}
            />
            <h5>Venu Madhav</h5>
            <p classname="text-grey">COO</p>
          </div>
        </div>
      </div>
      <div className="row justify-content-between mt-5">
        <div className="col-4 text-center ">
          <img
            src="media/images/Seema.jpg"
            className="img-fluid rounded-circle"
            style={{ width: "220px", height: "220px" }}
          />
          <h5>Seema Patil</h5>
          <p classname="text-grey">Director</p>
        </div>
        <div className="col-4 text-center ">
          <img
            src="media/images/karthik.jpg"
            className="img-fluid rounded-circle"
            style={{ width: "220px", height: "220px" }}
          />
          <h5>Karthik Rangappa</h5>
          <p classname="text-grey">Chief of Education</p>
        </div>
        <div className="col-4 text-center ">
          <img
            src="media/images/Austin.jpg"
            className="img-fluid rounded-circle"
            style={{ width: "220px", height: "220px" }}
          />
          <h5>Austin Prakesh</h5>
          <p classname="text-grey">Director Strategy</p>
        </div>
      </div>
    </div>
  );
}

export default Team;
