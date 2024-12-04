import React, { useState, useEffect } from "react";
import "./GroupOrderPage.css";
import { useUser } from "../../context/UserContext";

function GroupOrderPage() {
  const { user, setUser } = useUser(); // Access user data from context
  const [groupProducts, setGroupProducts] = useState([]);
  const [groupBasket, setGroupBasket] = useState({}); // Track quantities for group basket
  const [editingGroupBasket, setEditingGroupBasket] = useState({}); // Tracks editing mode for group basket items
  const [loading, setLoading] = useState(false); // Tracks loading state
  const [error, setError] = useState(null); // Tracks error state
  const [successMessage, setSuccessMessage] = useState(""); // Tracks success message
  const [activeTab, setActiveTab] = useState("basket"); // Tracks the selected tab ("basket" or "group")

  // Use localStorage to persist the user session after a page refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Set the user from localStorage if available
    }
  }, [setUser]);

  // Fetch products based on the active tab
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        if (!user?.user_id) return; // Don't fetch products if the user is not logged in
        const endpoint =
          activeTab === "basket"
            ? `http://94.174.1.192:3000/api/trolley?user_id=${user.user_id}`
            : `http://94.174.1.192:3000/api/group-trolley?user_id=${user.user_id}`;
        const response = await fetch(endpoint);
        const data = await response.json();

        // Access the 'items' property to get the array
        if (!Array.isArray(data.items)) {
          console.error("Unexpected data format:", data);
          throw new Error("Expected an array from API response.");
        }

        // Map API response to table fields
        const mappedData = data.items.map((product) => ({
          id: product.ID,
          name: product.product_name,
          price: product.Price,
          itemURL: product.ItemURL || "",
          groupSize: product.quantity,
        }));

        setGroupProducts(mappedData);

        // Initialize groupBasket state with the correct quantities from the response
        const initialBasket = {};
        data.items.forEach((product) => {
          initialBasket[product.ID] = product.quantity; // Set the quantity to what's in the basket
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

  // Handle starting edit mode for a product
  const handleStartEdit = (productId) => {
    setEditingGroupBasket((prev) => ({
      ...prev,
      [productId]: true,
    }));
  };

  // Handle incrementing quantity
  const handleIncrement = (productId) => {
    setGroupBasket((prevBasket) => ({
      ...prevBasket,
      [productId]: Math.max((prevBasket[productId] || 0), 0) + 1, // Increment quantity
    }));
  };

  // Handle decrementing quantity
  const handleDecrement = (productId) => {
    setGroupBasket((prevBasket) => ({
      ...prevBasket,
      [productId]: Math.max((prevBasket[productId] || 0) - 1, 0), // Decrement quantity, but don't go below 0
    }));
  };

  // Handle confirming quantity for a product
  const handleConfirm = async (productId) => {
    if (!user?.user_id) {
      alert("User not logged in.");
      return;
    }

    const quantity = groupBasket[productId];

    try {
      // If quantity is 0, delete the item from the basket
      if (quantity === 0) {
        const response = await fetch("http://94.174.1.192:3000/api/trolley/remove", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.user_id,
            product_id: productId,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to remove item from the basket.");
        } else {
          setSuccessMessage("Item successfully removed from the basket.");
        }
      } else {
        // If quantity > 0, add/update the item in the basket
        const response = await fetch("http://94.174.1.192:3000/api/trolley/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user.user_id,
            product_id: productId,
            quantity, // Send the new quantity to replace the old one
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to add/update item in the basket.");
        } else {
          setSuccessMessage("Item successfully updated.");
        }
      }

      // After confirming, fetch the updated basket from the server
      await fetchUpdatedBasket();

      // Revert back to "Edit Quantity" after the request is processed
      setEditingGroupBasket((prev) => ({
        ...prev,
        [productId]: false, // Reset to non-editing mode
      }));

    } catch (error) {
      console.error("Error confirming basket item:", error);
      setError("Error confirming item.");
    }
  };

  // Fetch the updated basket after confirming the changes
  const fetchUpdatedBasket = async () => {
    try {
      const response = await fetch(
        `http://94.174.1.192:3000/api/trolley?user_id=${user.user_id}`
      );
      const data = await response.json();
      if (data.items) {
        const updatedBasket = {};
        data.items.forEach((product) => {
          updatedBasket[product.ID] = product.quantity; // Set the quantity directly
        });
        setGroupBasket(updatedBasket); // Update the state with the latest basket data

        setGroupProducts(data.items.map((product) => ({
          id: product.ID,
          name: product.product_name,
          price: product.Price,
          itemURL: product.ItemURL || "",
          groupSize: product.quantity,
        })));
      }
    } catch (error) {
      console.error("Error fetching updated basket:", error);
      setError("Error fetching updated basket.");
    }
  };

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
              <th colSpan="4" className="table-header">
                {activeTab === "basket" ? "Individual Basket" : "Group Basket"}
              </th>
            </tr>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {groupProducts.map((product) => (
              <tr key={product.id} className="product-row">
                <td>
                  <img
                    src={product.itemURL}
                    alt={product.name}
                    style={{ width: "50px", height: "50px", objectFit: "cover" }}
                  />
                </td>
                <td>{product.name}</td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GroupOrderPage;
