import React from 'react';
import Categories from './Categories';
import Offers from './Offers';
import './Homepage.css';

function Homepage() {
  return (
    <div className="homepage">
      <h2>Welcome to SSH Group Grocery Order System</h2>
      <div className="content">
        <Categories />
        <Offers />
      </div>
    </div>
  );
}

export default Homepage;