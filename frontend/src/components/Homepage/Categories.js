function Categories() {
    const categories = ["Electronics", "Groceries", "Clothing"];
    return (
      <div className="categories">
        <h2>Categories</h2>
        <ul>
          {categories.map((category, index) => (
            <li key={index}>{category}</li>
          ))}
        </ul>
      </div>
    );
  }
  export default Categories;