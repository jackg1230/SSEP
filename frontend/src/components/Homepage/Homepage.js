import React, { useState, useEffect } from "react";
import "./Homepage.css";
import { useUser } from "../../context/UserContext";
import Categories from "./Categories";

function Homepage() {
  const { user } = useUser(); // Access user data from context
  const [products, setProducts] = useState([]);
  const [basket, setBasket] = useState({}); // Track quantities for products added to the basket
  const [editingBasket, setEditingBasket] = useState({}); // Tracks whether the user is editing a basket for a product
  const [expandedRow, setExpandedRow] = useState(null); // Tracks which row is expanded

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

  // Toggle expanded row
  const toggleRow = (productId) => {
    setExpandedRow((prev) => (prev === productId ? null : productId));
  };

  // Handle starting the edit mode for a product
  const handleStartEdit = (productId) => {
    setEditingBasket((prev) => ({
      ...prev,
      [productId]: true,
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
      [productId]: (prevBasket[productId] || 0) + 1,
    }));
  };

  // Handle decrementing the quantity
  const handleDecrement = (productId) => {
    setBasket((prevBasket) => {
      const newBasket = { ...prevBasket };
      if (newBasket[productId] > 1) {
        newBasket[productId] -= 1;
      } else {
        delete newBasket[productId];
        setEditingBasket((prev) => ({ ...prev, [productId]: false })); // Exit edit mode if quantity is 0
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

    const quantity = basket[productId];
    if (!quantity || quantity <= 0) {
      alert("Please select a quantity before confirming.");
      return;
    }

    try {
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
              <th colSpan="5" className="table-header">Current Offers</th>
            </tr>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Promotion</th>
              <th>Actions</th>
              <th>View Details</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <React.Fragment key={product.id}>
                {/* Main Row */}
                <tr onClick={() => toggleRow(product.id)} className="product-row">
                  <td>
                    <img
                      src={product.itemURL}
                      alt={product.name}
                      style={{ width: "50px", height: "50px", objectFit: "cover" }}
                    />
                  </td>
                  <td>{product.name}</td>
                  <td>{product.promotion}</td>
                  <td>
                    {editingBasket[product.id] ? (
                      <div
                        className="basket-controls"
                        style={{
                          display: "flex",
                          gap: "8px", // Space between buttons
                          alignItems: "center",
                        }}
                      >
                        <button onClick={(e) => { e.stopPropagation(); handleDecrement(product.id); }}>-</button>
                        <span>{basket[product.id]}</span>
                        <button onClick={(e) => { e.stopPropagation(); handleIncrement(product.id); }}>+</button>
                        <button
                          className="confirm-btn"
                          onClick={(e) => { e.stopPropagation(); handleConfirm(product.id); }}
                        >
                          Confirm
                        </button>
                      </div>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); handleStartEdit(product.id); }}>
                        Add to Basket
                      </button>
                    )}
                  </td>
                  <td>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleRow(product.id); }} 
                      className="view-details-btn"
                    >
                      v
                    </button>
                  </td>
                </tr>

                {/* Expanded Row */}
                {expandedRow === product.id && (
                  <tr className="expanded-row">
                    <td colSpan="5">
                      <div className="expanded-details">
                        <p><strong>Description:</strong> {product.description}</p>
                        <p><strong>Price:</strong> {product.price}</p>
                        <p><strong>Shop:</strong> {product.shop}</p>
                        <p><strong>Category:</strong> {product.category}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <Categories />
    </div>
  );
}

export default Homepage;
