import React, { useState, useEffect } from "react";
import "./Homepage.css";

function Homepage() {
  const [products, setProducts] = useState([]);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://94.174.1.192:3000/api/products/fetch?field=Promotion");
        const data = await response.json();
        
        // Map API to table fields
        const mappedData = data.map(product => ({
          id: product.ID,
          name: product.Name,
          description: product.Description,
          price: product.Price,
          itemURL: product.ItemURL,
          promotion: product.Promotion,
          shop: product.Shop,
          category: product.Category,
          availableQuantity: 10, // Replace with actual quantity when provided
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
      <div className="table-container">
        <table className="products-table">
          {/* Add a row for the "Current Offers" header inside the table */}
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
                  <img src={product.itemURL} alt={product.name} style={{ width: "50px", height: "50px", objectFit: "cover" }} />
                </td>
                <td>{product.name}</td>
                <td>{product.description}</td>
                <td>{product.price}</td>
                <td>{product.promotion}</td>
                <td>{product.shop}</td>
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