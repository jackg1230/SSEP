import React, { useState, useEffect } from "react";
import "./GroupOrderPage.css";
import { useUser } from "../../context/UserContext";

function GroupOrderPage() {
  const { user } = useUser(); // Assuming user is an object with an 'id' property
  const [activeTab, setActiveTab] = useState("basket"); // Tracks the selected table
  const [basketItems, setBasketItems] = useState([]); // Individual basket items
  const [groupBasketItems, setGroupBasketItems] = useState([]); // Group basket items
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  let data;
  // Fetch products in the user's trolley when user is available
  useEffect(() => {
    
    
    console.log(user);
    if (user && user.user_id) {
      const fetchProducts = async () => {
        setLoading(true);
        console.log("a");
        try {
          // Use user.id dynamically instead of hardcoding
          const response = await fetch(`http://94.174.1.192:3000/api/trolley?user_id=7`);
          console.log("b");
          if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.statusText}`);
          }
          console.log("Fetched data:", data);
          const data = await response.json();
          console.log("Fetched data:", data);
          // Assuming the API response contains separate fields for basket and group basket items
          setBasketItems(data.basket || []); // Set basket items from the response
          setGroupBasketItems(data.groupBasket || []); // Set group basket items from the response
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchProducts();
    }
  }, [user]); // Run effect only when user changes

  if (loading) {
    return <p className="loading">Loading products...</p>;
  }

  if (error) {
    return <p className="error">Error: {error}</p>;
  }

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
