import React from "react";

function Footer() {
  return (
    <div style={{ backgroundColor: "#fbfbfb", width: "100%" }}>
      <hr className="border-secondary opacity-25" />
      <div className="container pt-3">
        <div className="row">
          <div className="col-3">
            <img
              src="media/images/logo.svg"
              style={{ padding: "10px", height: "40px" }}
            />
            <footer style={{ fontSize: "15px", color: "#888" }}>
              © 2010 - 2026, Zerodha Broking Ltd. All rights reserved.
            </footer>
            <ul className="list-unstyled mt-3 d-flex gap-4 ">
              <li>
                <a href="#">
                  <img
                    src="media/images/x-twitter.svg"
                    style={{ width: "20px" }}
                  />
                </a>
              </li>
              <li className="">
                <a href="">
                  <i className="fa-brands fa-square-facebook fs-4 mt-1 text-secondary"></i>
                </a>
              </li>
              <li className="">
                <a href="">
                  <i className="fab fa-instagram fs-4 mt-1 text-secondary"></i>
                </a>
              </li>
              <li className="">
                <a href="">
                  <i className="fa-brands fa-linkedin fs-4 mt-1 text-secondary"></i>
                </a>
              </li>
            </ul>
            <hr />
            <ul className="list-unstyled mt-3 d-flex gap-4 ">
              <li className="">
                <a href="">
                  <i className="fa-brands fa-youtube fs-4 mt-1 text-secondary"></i>
                </a>
              </li>
              <li className="">
                <a href="">
                  <i className="fab fa-whatsapp fs-4 mt-1 text-secondary"></i>
                </a>
              </li>
              <li className="">
                <a href="">
                  <i className="fa-brands fa-telegram fs-4 mt-1 text-secondary"></i>
                </a>
              </li>
            </ul>

            <ul className="list-unstyled mt-3 d-flex gap-4">
              <a href="">
                <img
                  src="media/images/googlePlaybadge.svg"
                  style={{ width: "100px" }}
                  className="mr-5"
                />
              </a>
              <a href="">
                <img
                  src="media/images/appstoreBadge.svg"
                  style={{ width: "96px" }}
                />
              </a>
            </ul>
          </div>
          <div className="col-9">
            <div className="row justify-content-between">
              <div className="col-3">
                <ul className="list-unstyled">
                  <li className="fs-5 mb-2 ">Account</li>
                  <li className=" mb-2">
                    <a href="#" className="text-secondary text-decoration-none">
                      Open demat account
                    </a>
                  </li>
                  <li className=" mb-2">
                    <a href="#" className="text-secondary text-decoration-none">
                      Minor demat account
                    </a>
                  </li>

                  <li className=" mb-2">
                    <a href="#" className="text-secondary text-decoration-none">
                      NRI demat account
                    </a>
                  </li>
                  <li className=" mb-2">
                    <a href="#" className="text-secondary text-decoration-none">
                      HUF demat account
                    </a>
                  </li>
                  <li className=" mb-2">
                    <a href="#" className="text-secondary text-decoration-none">
                      Commodity
                    </a>
                  </li>

                  <li className=" mb-2">
                    {" "}
                    <a href="#" className="text-secondary text-decoration-none">
                      Dematerialisation
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-secondary text-decoration-none">
                      Fund transfer
                    </a>
                  </li>
                  <li className=" mb-2">
                    <a href="#" className="text-secondary text-decoration-none">
                      MTF
                    </a>
                  </li>
                </ul>
              </div>
              <div className="col-3">
                <ul className="list-unstyled">
                  <li className="fs-5 mb-2 ">Support</li>
                  <li className=" mb-2">
                    <a href="#" className="text-secondary text-decoration-none">
                      Contact us
                    </a>
                  </li>
                  <li className=" mb-2">
                    <a href="#" className="text-secondary text-decoration-none">
                      Support portal
                    </a>
                  </li>

                  <li className=" mb-2">
                    <a href="#" className="text-secondary text-decoration-none">
                      How to file a complaint?
                    </a>
                  </li>
                  <li className=" mb-2">
                    <a href="#" className="text-secondary text-decoration-none">
                      Status of your complaints
                    </a>
                  </li>
                  <li className=" mb-2">
                    <a href="#" className="text-secondary text-decoration-none">
                      Bulletin
                    </a>
                  </li>

                  <li className=" mb-2">
                    {" "}
                    <a href="#" className="text-secondary text-decoration-none">
                      Circular
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-secondary text-decoration-none">
                      Z-Connect blog
                    </a>
                  </li>
                  <li className=" mb-2">
                    <a href="#" className="text-secondary text-decoration-none">
                      Downloads
                    </a>
                  </li>
                </ul>
              </div>
              <div className="col-3">
                <ul className="list-unstyled">
                  <li className="fs-5 mb-2 ">Company</li>
                  <li className=" mb-2">
                    <a href="#" className="text-secondary text-decoration-none">
                      About
                    </a>
                  </li>
                  <li className=" mb-2">
                    <a href="#" className="text-secondary text-decoration-none">
                      Philosophy
                    </a>
                  </li>

                  <li className=" mb-2">
                    <a href="#" className="text-secondary text-decoration-none">
                      Press & media
                    </a>
                  </li>
                  <li className=" mb-2">
                    <a href="#" className="text-secondary text-decoration-none">
                      Careers
                    </a>
                  </li>
                  <li className=" mb-2">
                    <a href="#" className="text-secondary text-decoration-none">
                      Zerodha Cares (CSR)
                    </a>
                  </li>

                  <li className=" mb-2">
                    {" "}
                    <a href="#" className="text-secondary text-decoration-none">
                      Zerodha.tech
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-secondary text-decoration-none">
                      Open source
                    </a>
                  </li>
                  <li className=" mb-2">
                    <a href="#" className="text-secondary text-decoration-none">
                      Referral program
                    </a>
                  </li>
                </ul>
              </div>
              <div className="col-3">
                <ul className="list-unstyled">
                  <li className="fs-5 mb-2 ">Quick links</li>
                  <li className=" mb-2 y">
                    <a
                      href="#"
                      className="text-secondary text-decoration-none"
                      // style={{ textDecoration: "none", color: "black" }}
                    >
                      Upcoming IPOs
                    </a>
                  </li>
                  <li className=" mb-2">
                    <a href="#" className="text-secondary text-decoration-none">
                      Brokerage charges
                    </a>
                  </li>

                  <li className=" mb-2">
                    <a href="#" className="text-secondary text-decoration-none">
                      Market holidays
                    </a>
                  </li>
                  <li className=" mb-2">
                    <a href="#" className="text-secondary text-decoration-none">
                      Economic calendar
                    </a>
                  </li>
                  <li className=" mb-2">
                    <a href="#" className="text-secondary text-decoration-none">
                      Calculators
                    </a>
                  </li>

                  <li className=" mb-2">
                    {" "}
                    <a href="#" className="text-secondary text-decoration-none">
                      Markets
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-secondary text-decoration-none">
                      Sectors
                    </a>
                  </li>
                  <li className=" mb-2">
                    <a href="#" className="text-secondary text-decoration-none">
                      Gift Nifty
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="row mt-5">
          <div className="col">
            <p className="text-secondary" style={{ fontSize: "10px" }}>
              Zerodha Broking Ltd.: Member of NSE, BSE, MCX & MSEI – SEBI
              Registration no.: INZ000031633 CDSL/NSDL: Depository services
              through Zerodha Broking Ltd. – SEBI Registration no.:
              IN-DP-431-2019 Registered Address: Zerodha Broking Ltd., #153/154,
              4th Cross, Dollars Colony, Opp. Clarence Public School, J.P Nagar
              4th Phase, Bengaluru - 560078, Karnataka, India. For any
              complaints pertaining to securities broking please write to{" "}
              <a href="" style={{ textDecoration: "none" }}>
                complaints@zerodha.com
              </a>
              , for DP related to{" "}
              <a href="" style={{ textDecoration: "none" }}>
                dp@zerodha.com
              </a>
              . Please ensure you carefully read the Risk Disclosure Document as
              prescribed by SEBI | ICF
            </p>
            <p className="text-secondary" style={{ fontSize: "10px" }}>
              Procedure to file a complaint on{" "}
              <a href="" style={{ textDecoration: "none" }}>
                SEBI SCORES
              </a>
              : Register on SCORES portal. Mandatory details for filing
              complaints on SCORES: Name, PAN, Address, Mobile Number, E-mail
              ID. Benefits: Effective Communication, Speedy redressal of the
              grievances
            </p>
            <p className="text-secondary" style={{ fontSize: "10px" }}>
              <a href="" style={{ textDecoration: "none" }}>
                Smart Online Dispute Resolution | Grievances Redressal Mechanism
              </a>
            </p>
            <p className="text-secondary" style={{ fontSize: "10px" }}>
              Investments in securities market are subject to market risks; read
              all the related documents carefully before investing.
            </p>
            <p className="text-secondary" style={{ fontSize: "10px" }}>
              Attention investors: 1) Stock brokers can accept securities as
              margins from clients only by way of pledge in the depository
              system w.e.f September 01, 2020. 2) Update your e-mail and phone
              number with your stock broker / depository participant and receive
              OTP directly from depository on your e-mail and/or mobile number
              to create pledge. 3) Check your securities / MF / bonds in the
              consolidated account statement issued by NSDL/CDSL every month.
            </p>
            <p className="text-secondary" style={{ fontSize: "10px" }}>
              India's largest broker based on networth as per NSE.
              <a href="" style={{ textDecoration: "none" }}>
                {" "}
                NSE broker factsheet
              </a>
            </p>
            <p className="text-secondary" style={{ fontSize: "10px" }}>
              "Prevent unauthorised transactions in your account. Update your
              mobile numbers/email IDs with your stock brokers/depository
              participants. Receive information of your transactions directly
              from Exchange/Depositories on your mobile/email at the end of the
              day. Issued in the interest of investors. KYC is one time exercise
              while dealing in securities markets - once KYC is done through a
              SEBI registered intermediary (broker, DP, Mutual Fund etc.), you
              need not undergo the same process again when you approach another
              intermediary." Dear Investor, if you are subscribing to an IPO,
              there is no need to issue a cheque. Please write the Bank account
              number and sign the IPO application form to authorize your bank to
              make payment in case of allotment. In case of non allotment the
              funds will remain in your bank account. As a business we don't
              give stock tips, and have not authorized anyone to trade on behalf
              of others. If you find anyone claiming to be part of Zerodha and
              offering such services, please{" "}
              <a href="" style={{ textDecoration: "none" }}>
                create a ticket here
              </a>
              .
            </p>
            <p className="text-secondary" style={{ fontSize: "10px" }}>
              *Customers availing insurance advisory services offered by Ditto
              (Tacterial Consulting Private Limited | IRDAI Registered Corporate
              Agent (Composite) License No CA0738) will not have access to the
              exchange investor grievance redressal forum, SEBI SCORES/ODR, or
              arbitration mechanism for such products.
            </p>
            <p className="text-secondary" style={{ fontSize: "10px" }}>
              Fixed deposit products offered on this platform are third-party
              products (TPP) and are not Exchange traded products. These are
              offered through Blostem Fintech Private Limited. Zerodha Broking
              Limited (SEBI Registration No.: INZ000031633) is acting solely as
              a distributor for these products. Any disputes arising with
              respect to such distribution activity will not have access to SEBI
              SCORES/ODR, Exchange Investor Grievance Redressal Forum, or
              Arbitration mechanism. Fixed deposits are regulated by the Reserve
              Bank of India (RBI).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Footer;
