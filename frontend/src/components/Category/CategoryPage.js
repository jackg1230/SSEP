import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './CategoryPage.css';

const CategoryPage = () => {
    const { categoryName } = useParams(); // Get the category name from the URL
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            // Replace this with an API call to fetch products by category
            const data = [
                { id: 1, name: 'Milk', price: '£1.50', category: 'Dairy' },
                { id: 2, name: 'Cheese', price: '£2.50', category: 'Dairy' },
                { id: 3, name: 'Yogurt', price: '£1.00', category: 'Dairy' },
            ];
            const filteredProducts = data.filter((product) => product.category === categoryName);
            setProducts(filteredProducts);
        };
        fetchProducts();
    }, [categoryName]);

    return (
        <div className="category-page">
            <h1 className="category-header">{categoryName}</h1>
            <div className="product-grid">
                {products.map((product) => (
                    <div key={product.id} className="product-card">
                        <h2>{product.name}</h2>
                        <p>Price: {product.price}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryPage;
