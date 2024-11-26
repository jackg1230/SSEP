function StockTable({ items }) {
  return (
    <div style={{ marginTop: "20px" }}>
      <table
        style={{
          width: "80%",
          margin: "0 auto",
          borderCollapse: "collapse",
          backgroundColor: "#fff",
        }}
      >
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Item</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Description</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Price</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Category</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item) => (
              <tr key={item.ID}>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{item.Name}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{item.Description}</td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>
                  {item.Price} {/* Print Price as a string */}
                </td>
                <td style={{ border: "1px solid #ccc", padding: "8px" }}>{item.Category}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="4"
                style={{ border: "1px solid #ccc", padding: "8px", textAlign: "center" }}
              >
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default StockTable;
