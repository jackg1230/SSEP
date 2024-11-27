import React from 'react';
import './CategoryCard.css'; // Import CSS specific to this component

const CategoryCard = ({ name, description, image }) => {
    return (
        <div className="category-card">
            {image && <img src={image} alt={`${name} category`} className="category-card-image" />}
            <h2 className="category-card-title">{name}</h2>
            <p className="category-card-description">{description}</p>
        </div>
    );
};

export default CategoryCard;
