import React, { useState, useEffect } from "react";
import "./GroupOrderPage.css";
import { useUser } from "../../context/UserContext";

function GroupOrderPage() {
  const { user, setUser } = useUser(); // Access user data from context
  const [groupProducts, setGroupProducts] = useState([]);
  const [userBasketProducts, setUserBasketProducts] = useState([]);
  const [groupBasket, setGroupBasket] = useState({});
  const [editingGroupBasket, setEditingGroupBasket] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState("basket");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [setUser]);

  useEffect(() => {
    setGroupProducts([]);
    setUserBasketProducts([]);
  }, [activeTab]);

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
          throw new Error("Expected an array from API response.");
        }

        const userBasket = [];
        const groupItems = [];
        const basketQuantities = {};

        data.items.forEach((product) => {
          const productData = {
            id: product.ID,
            name: product.product_name,
            price: product.Price,
            itemURL: product.ItemURL || "",
            quantity: product.quantity,
          };
          if (product.user_id === user.user_id) {
            userBasket.push(productData);
          } else {
            groupItems.push(productData);
          }
          basketQuantities[product.ID] = product.quantity;
        });

        setUserBasketProducts(userBasket);
        setGroupProducts(groupItems);
        setGroupBasket(basketQuantities);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user?.user_id) {
      fetchProducts();
    }
  }, [user, activeTab]);

  const renderProductRow = (product) => (
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
      {activeTab === "basket" && (
        <td>
          {editingGroupBasket[product.id] ? (
            <button onClick={() => handleConfirm(product.id)}>
              Confirm Quantity
            </button>
          ) : (
            <>
              <button onClick={() => handleIncrement(product.id)}>+</button>
              <button onClick={() => handleDecrement(product.id)}>-</button>
              <button onClick={() => handleStartEdit(product.id)}>Edit</button>
            </>
          )}
        </td>
      )}
    </tr>
  );

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
              <th colSpan={activeTab === "basket" ? "5" : "4"} className="table-header">
                {activeTab === "basket" ? "Individual Basket" : "Group Basket"}
              </th>
            </tr>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Price</th>
              <th>Quantity</th>
              {activeTab === "basket" && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {/* User's Basket Items */}
            {userBasketProducts.length > 0 && (
              <>
                {userBasketProducts.map(renderProductRow)}
                <tr>
                  <td colSpan={activeTab === "basket" ? "5" : "4"} style={{ fontWeight: "bold", textAlign: "center" }}>
                    Other items in the group's basket
                  </td>
                </tr>
              </>
            )}

            {/* Group's Basket Items */}
            {groupProducts.map(renderProductRow)}

            {/* Total Price Row */}
            <tr className="total-row">
              <td colSpan={activeTab === "basket" ? "3" : "2"} style={{ textAlign: "right", fontWeight: "bold" }}>
                Total:
              </td>
              <td colSpan={activeTab === "basket" ? "2" : "2"} style={{ textAlign: "left", fontWeight: "bold" }}>
                £
                {groupProducts
                  .concat(userBasketProducts)
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
