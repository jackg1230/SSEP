import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Categories.css';

const Categories = () => {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const data = [
                {
                    name: 'Dairy',
                    description: 'Fresh dairy products including milk, cheese, and eggs.',
                    image: 'https://example.com/images/dairy.jpg',
                },
                {
                    name: 'Fruits',
                    description: 'Fresh and juicy fruits for every occasion.',
                    image: 'https://example.com/images/fruits.jpg',
                },
                {
                    name: 'Vegetables',
                    description: 'Healthy and fresh vegetables to enrich your meals.',
                    image: 'https://example.com/images/vegetables.jpg',
                },
            ];
            setCategories(data);
        };
        fetchCategories();
    }, []);

    return (
        <div className="categories-container">
            <h1 className="categories-header">Explore Categories</h1>
            <div className="categories-grid">
                {categories.map((category) => (
                    <Link to={`/category/${category.name}`} key={category.name} className="category-link">
                        <div className="category-card">
                            <img src={category.image} alt={`${category.name} category`} className="category-card-image" />
                            <h2 className="category-card-title">{category.name}</h2>
                            <p className="category-card-description">{category.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default Categories;