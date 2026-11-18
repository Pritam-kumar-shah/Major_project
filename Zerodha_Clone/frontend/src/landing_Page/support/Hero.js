import React from "react";

function Hero() {
  return (
    <section className="container-fluid" id="supportHero">
      <div className="p-5 " id="supportHeroContent">
        <h4>Support Portal</h4>
        <a href="" style={{ textDecoration: "", color: "white" }}>
          Track Ticket
        </a>
      </div>
      <div className="row p-5 m-3 ">
        <div className="col-6 p-5">
          <h1 className="fs-4">
            Search for an answer or browse help topics to create a ticket
          </h1>
          <input
            type="text"
            className="form-control mt-4"
            placeholder="Eg : How do i activate  F&O, why is my order getting rejected."
          />
          <br />
          <a href="">Track Account Opening</a>
          <a href="">Track Segment Activation</a>
          <a href="">Intraday Margin</a>
          <a href="">Kite user manual</a>
        </div>
        <div className="col-6 p-5  " id="features">
          <h1 className="fs-4">Features</h1>
          <ul>
            <li>
              <a href="">Current Takeovers and Delisting -January 2024</a>{" "}
            </li>
            <li>
              {" "}
              <a href="">Latest Intraday leverages - MIS & CO</a>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default Hero;
