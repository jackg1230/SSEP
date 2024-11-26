import React, { useState, useEffect } from "react";
import "./Homepage.css";

function Homepage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("https://94.174.1.192:3000/api/products/fetch?field=Promotion");
        const data = await response.json();
        
        // Map API response to match table fields
        const mappedData = data.map(product => ({
          id: product.ID, // Use correct field name
          name: product.Name,
          originalPrice: product.Price,
          offerPrice: product.Promotion,
          category: product.Category,
          availableQuantity: 10 // Replace with actual quantity if provided
        }));

        setProducts(mappedData);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="homepage">
      <header>
        <h1>SSH Group Grocery Order System</h1>
      </header>
      <div className="table-container">
        <table className="products-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Original Price (GBP)</th>
              <th>Offer Price</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.originalPrice}</td>
                <td>{product.offerPrice}</td>
                <td>{product.category}</td>
                <td>
                  <button>Add to Basket</button>
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