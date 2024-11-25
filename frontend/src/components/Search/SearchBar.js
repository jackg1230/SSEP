function SearchBar({ onSearch }) {
    return (
      <input
        type="text"
        placeholder="Search items..."
        onChange={(e) => onSearch(e.target.value)}
      />
    );
  }