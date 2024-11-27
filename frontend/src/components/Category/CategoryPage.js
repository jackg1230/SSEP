import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './CategoryPage.css';

const CategoryPage = () => {
    const { categoryName } = useParams(); // Extract category name from the URL
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Fetch products by category
                const response = await fetch(`http://94.174.1.192:3000/api/products?category=${encodeURIComponent(categoryName)}`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch products: ${response.statusText}`);
                }
                const data = await response.json();
                setProducts(data.products || []); // Assuming the API response includes a "products" array
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categoryName]); // Refetch when categoryName changes

    if (loading) {
        return <p className="loading">Loading products...</p>;
    }

    if (error) {
        return <p className="error">Error: {error}</p>;
    }

    return (
        <div className="category-page">
            <h1 className="category-header">Products in {categoryName}</h1>
            <div className="product-grid">
                {products.length > 0 ? (
                    products.map((product) => (
                        <div key={product.id} className="product-card">
                            <img src={product.image || 'https://via.placeholder.com/150'} alt={product.name} className="product-image" />
                            <h2 className="product-name">{product.name}</h2>
                            <p className="product-price">Price: {product.price}</p>
                            <p className="product-description">{product.description}</p>
                        </div>
                    ))
                ) : (
                    <p className="no-products">No products found in this category.</p>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;
