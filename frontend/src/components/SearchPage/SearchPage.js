import React, { useState, useEffect } from "react";
import SearchBar from "./SearchBar";
import { useUser } from "../../context/UserContext";

function SearchPage() {
  const { user } = useUser(); // Access user data
  const [query, setQuery] = useState(""); // Search query
  const [items, setItems] = useState([]); // Search results
  const [basket, setBasket] = useState({}); // Track quantities for products added to the basket
  const [editingBasket, setEditingBasket] = useState({}); // Tracks if editing a product in the basket
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch search results from the API
  const fetchProducts = async (searchTerm) => {
    if (!searchTerm) {
      setItems([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://94.174.1.192:3000/api/search?term=${searchTerm}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setItems(data.products); // Update with API results
    } catch (err) {
      console.error(err);
      setError("Unable to fetch results. Please try again.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle starting the edit mode for a product
  const handleStartEdit = (productId) => {
    setEditingBasket((prev) => ({
      ...prev,
      [productId]: true, // Set this product to editing mode
    }));
    setBasket((prevBasket) => ({
      ...prevBasket,
      [productId]: prevBasket[productId] || 1, // Initialize quantity to 1 if not already set
    }));
  };

  // Handle incrementing the quantity
  const handleIncrement = (productId) => {
    setBasket((prevBasket) => ({
      ...prevBasket,
      [productId]: (prevBasket[productId] || 0) + 1, // Increment quantity
    }));
  };

  // Handle decrementing the quantity
  const handleDecrement = (productId) => {
    setBasket((prevBasket) => {
      const newBasket = { ...prevBasket };
      if (newBasket[productId] > 1) {
        newBasket[productId] -= 1; // Decrement quantity
      } else {
        delete newBasket[productId]; // Remove item if quantity is 0
        setEditingBasket((prev) => ({ ...prev, [productId]: false })); // Exit edit mode
      }
      return newBasket;
    });
  };

  // Handle confirming the quantity
  const handleConfirm = async (productId) => {
    if (!user?.user_id) {
      alert("User not logged in.");
      return;
    }

    const quantity = basket[productId]; // Get the quantity
    if (!quantity || quantity <= 0) {
      alert("Please select a quantity before confirming.");
      return;
    }

    try {
      // Send POST request to the server
      const response = await fetch("http://94.174.1.192:3000/api/trolley/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.user_id,
          product_id: productId,
          quantity,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item to basket");
      } else {
        alert("Item successfully added to the basket.");
        setEditingBasket((prev) => ({ ...prev, [productId]: false })); // Exit edit mode
      }
    } catch (error) {
      console.error("Error confirming basket item:", error);
    }
  };

  // Debounce function to delay API calls
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedFetchProducts = debounce(fetchProducts, 300);

  useEffect(() => {
    debouncedFetchProducts(query);
  }, [query]);

  return (
    <div>
      <h1>Search Products</h1>
      <SearchBar onSearch={setQuery} />
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className="table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Category</th>
              <th>Shop</th> 
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.ID}>
                <td>{item.Name}</td>
                <td>{item.Description}</td>
                <td>{item.Price}</td>
                <td>{item.Category}</td>
                <td>{item.Shop}</td>
                <td>
                  {!editingBasket[item.ID] ? (
                    <button onClick={() => handleStartEdit(item.ID)}>
                      Add to Basket
                    </button>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <button onClick={() => handleDecrement(item.ID)}>-</button>
                      <span>{basket[item.ID]}</span>
                      <button onClick={() => handleIncrement(item.ID)}>+</button>
                      <button
                        onClick={() => handleConfirm(item.ID)}
                        style={{
                          backgroundColor: "green",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          cursor: "pointer",
                        }}
                      >
                        Confirm
                      </button>
                    </div>
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

export default SearchPage;
