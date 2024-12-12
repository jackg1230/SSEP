import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';
import { useUser } from '../../context/UserContext';

function Header() {
    const location = useLocation();
    const { user } = useUser();

    // Do not render the Header on the login page
    if (location.pathname === '/') {
        return null;
    }

    return (
        <header className="app-header">
            <div className="logo">
                <h1>SSH Group Grocery Order System</h1>
                {user?.user_id && <p>Your User ID: {user.user_id}</p>}
            </div>
            <nav>
                <ul>
                    <li><Link to="/home">Home</Link></li>
                    <li><Link to="/search">Search for Products</Link></li>
                    <li><Link to="/orders">View Orders</Link></li>
                    <li><Link to="/calendar">Calendar</Link></li>
                    <li><Link to="/settings">Settings</Link></li>
                    
                    
                </ul>
            </nav>
        </header>
    );
}

export default Header;
