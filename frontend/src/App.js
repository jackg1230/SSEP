import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { UserProvider } from './context/UserContext'; // Import UserProvider
import Header from './components/Header/Header'; // Import Header
import Homepage from './components/Homepage/Homepage';
import SettingsPage from './components/Settings/SettingsPage';
import GroupOrderPage from './components/GroupOrder/GroupOrderPage';

function AppContent() {
    const location = useLocation(); // Moved inside Router
    const showHeader = location.pathname !== '/'; // Show Header only if not on login page

    return (
        <>
            {showHeader && <Header />}
            <Routes>
                {/* Set the default route to home */}
                <Route path="/" element={<Homepage />} />
                <Route path="/home" element={<Homepage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/orders" element={<GroupOrderPage />} />
            </Routes>
        </>
    );
}

function App() {
    return (
        <UserProvider>
            <Router>
                <AppContent /> {/* Place AppContent inside the Router */}
            </Router>
        </UserProvider>
    );
}

export default App;
