import React, { useState, useEffect } from "react";
import "./GroupOrderPage.css";

function GroupOrderPage() {
  const [activeTab, setActiveTab] = useState("basket"); // Tracks the selected table
  const [basketItems, setBasketItems] = useState([]); // Individual basket items
  const [groupBasketItems, setGroupBasketItems] = useState([]); // Group basket items

  // Placeholder for fetching basket data
  useEffect(() => {
    setBasketItems([/* Example items */]);
    setGroupBasketItems([/* Example items */]);
  }, []);

  // Button click handler
  const handleButtonClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="container">
      {/* Buttons to switch between tables */}
      <div className="button-container">
        <button
          className={`switch-button ${activeTab === "basket" ? "active" : ""}`}
          onClick={() => handleButtonClick("basket")}
        >
          Basket
        </button>
        <button
          className={`switch-button ${activeTab === "groupBasket" ? "active" : ""}`}
          onClick={() => handleButtonClick("groupBasket")}
        >
          Group Basket
        </button>
      </div>

      {/* Table content */}
      <div className="table-container">
        {activeTab === "basket" && <BasketTable items={basketItems} />}
        {activeTab === "groupBasket" && <GroupBasketTable items={groupBasketItems} />}
      </div>
    </div>
  );
}

// Basket table component
function BasketTable({ items }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Product Name</th>
          <th>Quantity</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        {items.length > 0 ? (
          items.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>£{item.price}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="3" style={{ textAlign: "center" }}>
              No items in your basket.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

// Group Basket table component
function GroupBasketTable({ items }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Product Name</th>
          <th>Group Quantity</th>
          <th>Total Price</th>
        </tr>
      </thead>
      <tbody>
        {items.length > 0 ? (
          items.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.groupQuantity}</td>
              <td>£{item.totalPrice}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="3" style={{ textAlign: "center" }}>
              No items in the group basket.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

export default GroupOrderPage;
