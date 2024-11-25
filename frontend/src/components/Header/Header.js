import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="app-header">
      <div className="logo">
        <h1>SSH Group Grocery Order System</h1>
      </div>
      <nav>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/settings">Settings</Link></li>
          <li><Link to="/orders">Orders</Link></li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;