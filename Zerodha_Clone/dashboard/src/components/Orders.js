import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:3002/getAllOrders")
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <div className="orders">
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders today</p>

          <Link to={"/"} className="btn">
            Get started
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          <h2>My Orders</h2>

          {orders.map((order, index) => (
            <div className="order-card" key={index}>
              <h3>{order.name}</h3>
              <p>Qty: {order.qty}</p>
              <p>Price: ₹{order.price}</p>
              <p>Mode: {order.mode}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
