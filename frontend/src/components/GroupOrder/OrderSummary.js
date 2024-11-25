function OrderSummary() {
    const items = [
      { name: "Apples", price: 5, quantity: 3 },
      { name: "Bananas", price: 2, quantity: 6 },
    ];
  
    const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
    return (
      <div className="order-summary">
        <h3>Order Summary</h3>
        <ul>
          {items.map((item, index) => (
            <li key={index}>
              {item.name} - ${item.price} x {item.quantity}
            </li>
          ))}
        </ul>
        <p>Total: ${total}</p>
      </div>
    );
  }