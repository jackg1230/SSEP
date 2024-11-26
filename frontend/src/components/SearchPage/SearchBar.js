function SearchBar({ onSearch }) {
  return (
    <div style={{ textAlign: "center", margin: "20px 0" }}>
      <input
        type="text"
        placeholder="Search items..."
        onChange={(e) => onSearch(e.target.value)}
        style={{
          width: "60%", // Reduce width
          padding: "8px", // Adjust padding
          fontSize: "14px", // Reduce font size
          borderRadius: "5px", // Add rounded corners
          border: "1px solid #ccc", // Add border
        }}
      />
    </div>
  );
}

export default SearchBar;
