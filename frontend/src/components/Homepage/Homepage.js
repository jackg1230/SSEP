import React, { useState, useEffect } from "react";
import "./Homepage.css";
import { useUser } from "../../context/UserContext";

function Homepage() {
  const { user } = useUser(); // Access user data from context
  const [products, setProducts] = useState([]);
  const [basket, setBasket] = useState({}); // Track quantities for products added to the basket
  const [editingBasket, setEditingBasket] = useState({}); // Tracks whether the user is editing a basket for a product

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://94.174.1.192:3000/api/products/fetch?field=Promotion");
        const data = await response.json();

        // Map API to table fields
        const mappedData = data.map((product) => ({
          id: product.ID,
          name: product.Name,
          description: product.Description,
          price: product.Price,
          itemURL: product.ItemURL,
          promotion: product.Promotion,
          shop: product.Shop,
          category: product.Category,
        }));

        setProducts(mappedData);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

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

  return (
    <div className="homepage">
      <div className="table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th colSpan="8" className="table-header">Current Offers</th>
            </tr>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Description</th>
              <th>Price (GBP)</th>
              <th>Promotion</th>
              <th>Shop</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>
                  <img
                    src={product.itemURL}
                    alt={product.name}
                    style={{ width: "50px", height: "50px", objectFit: "cover" }}
                  />
                </td>
                <td>{product.name}</td>
                <td>{product.description}</td>
                <td>{product.price}</td>
                <td>{product.promotion}</td>
                <td>{product.shop}</td>
                <td>{product.category}</td>
                <td>
                  {!editingBasket[product.id] ? (
                    // Show "Add to Basket" button if not editing
                    <button onClick={() => handleStartEdit(product.id)}>Add to Basket</button>
                  ) : (
                    // Show +, -, and Confirm buttons if editing
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <button onClick={() => handleDecrement(product.id)}>-</button>
                      <span>{basket[product.id]}</span>
                      <button onClick={() => handleIncrement(product.id)}>+</button>
                      <button
                        onClick={() => handleConfirm(product.id)}
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

export default Homepage;
