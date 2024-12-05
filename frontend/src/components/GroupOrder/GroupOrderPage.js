// Import necessary dependencies
import React, { useState, useEffect } from "react";
import "./GroupOrderPage.css";
import { useUser } from "../../context/UserContext";

function GroupOrderPage() {
  const { user, setUser } = useUser(); // Access user data from context
  const [groupProducts, setGroupProducts] = useState([]);
  const [groupBasket, setGroupBasket] = useState({}); // Track quantities for group basket
  const [editingGroupBasket, setEditingGroupBasket] = useState({}); // Tracks editing mode for group basket items
  const [loading, setLoading] = useState(false);  // Tracks loading state
  const [error, setError] = useState(null); // Tracks error state
  const [successMessage, setSuccessMessage] = useState(""); // Tracks success message
  const [activeTab, setActiveTab] = useState("basket"); // Tracks the selected tab 

  // Use localStorage to persist the user session after a page refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [setUser]);

  // Clear groupProducts when switching tabs
  useEffect(() => {
    setGroupProducts([]); // Reset products to prevent duplicates
  }, [activeTab]);

  // Fetch products based on the active tab
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        if (!user?.user_id) return;
        const endpoint =
          activeTab === "basket"
            ? `http://94.174.1.192:3000/api/trolley?user_id=${user.user_id}`
            : `http://94.174.1.192:3000/api/group-trolley?user_id=${user.user_id}`;
        const response = await fetch(endpoint);
        const data = await response.json();

        if (!Array.isArray(data.items)) {
          console.error("Unexpected data format:", data);
          throw new Error("Expected an array from API response.");
        }

        // Map API response to table fields, deduplicating entries
        const newProducts = data.items.map((product) => ({
          id: product.ID,
          name: product.product_name,
          price: product.Price,
          itemURL: product.ItemURL || "",
          groupSize: product.quantity,
        }));

        setGroupProducts((prevProducts) =>
          [...prevProducts, ...newProducts].filter(
            (product, index, self) =>
              index === self.findIndex((p) => p.id === product.id)
          )
        );

        const initialBasket = {};
        data.items.forEach((product) => {
          initialBasket[product.ID] = product.quantity;
        });
        setGroupBasket(initialBasket);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.user_id) {
      fetchProducts();
    }
  }, [user, activeTab]);

  return (
    <div className="group-order-page">
      <div className="tabs">
        <button
          className={activeTab === "basket" ? "active-tab" : ""}
          onClick={() => setActiveTab("basket")}
        >
          Individual Basket
        </button>
        <button
          className={activeTab === "group" ? "active-tab" : ""}
          onClick={() => setActiveTab("group")}
        >
          Group Basket
        </button>
      </div>
  
      {successMessage && <p className="success-message">{successMessage}</p>}
      {error && <p className="error-message">{error}</p>}
  
      <div className="table-container">
        {loading && <p>Loading products...</p>}
        <table className="group-products-table">
          <thead>
            <tr>
              <th colSpan="5" className="table-header">
                {activeTab === "basket" ? "Individual Basket" : "Group Basket"}
              </th>
            </tr>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {groupProducts.map((product) => {
              const numericPrice = parseFloat(product.price.replace("£", "")) || 0; // Clean price
              return (
                <tr key={product.id} className="product-row">
                  <td>
                    <img
                      src={product.itemURL}
                      alt={product.name}
                      style={{ width: "50px", height: "50px", objectFit: "cover" }}
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.price}</td>
                  <td>{groupBasket[product.id] || 0}</td>
                  <td>
                    {editingGroupBasket[product.id] ? (
                      <button onClick={() => handleConfirm(product.id)}>
                        Confirm Quantity
                      </button>
                    ) : (
                      <>
                        <button onClick={() => handleIncrement(product.id)}>
                          +
                        </button>
                        <button onClick={() => handleDecrement(product.id)}>
                          -
                        </button>
                        <button onClick={() => handleStartEdit(product.id)}>
                          Edit
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
  
            {/* Total Price Row */}
            <tr className="total-row">
              <td colSpan="2" style={{ textAlign: "right", fontWeight: "bold" }}>
                Total:
              </td>
              <td colSpan="3" style={{ textAlign: "left", fontWeight: "bold" }}>
                £
                {groupProducts
                  .reduce((total, product) => {
                    const numericPrice = parseFloat(product.price.replace("£", "")) || 0;
                    const quantity = groupBasket[product.id] || 0;
                    return total + numericPrice * quantity;
                  }, 0)
                  .toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );  
}

export default GroupOrderPage;
