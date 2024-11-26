import React, { useState } from "react";
import SearchBar from "./SearchBar";
import StockTable from "./StockTable";

function SearchPage() {
  const [items, setItems] = useState([]); // State to store search results

  const handleSearch = async (query) => {
    if (!query) {
      setItems([]); // Clear results if query is empty
      return;
    }

    try {
      const response = await fetch(`/api/search?q=${query}`); // Adjust API endpoint as needed
      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }

      const data = await response.json();
      setItems(data); // Assume API returns an array of items
    } catch (error) {
      console.error(error);
      setItems([]); // Clear results on error
    }
  };

  return (
    <div>
      <h1>Search Items</h1>
      <SearchBar onSearch={handleSearch} />
      <StockTable items={items} />
    </div>
  );
}

export default SearchPage;
