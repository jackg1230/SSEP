import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { UserProvider } from './context/UserContext'; // Import UserProvider
import Header from './components/Header/Header'; // Import Header
import LoginPage from './components/Login/LoginPage';
import Homepage from './components/Homepage/Homepage';
import SettingsPage from './components/Settings/SettingsPage';
import GroupOrderPage from './components/GroupOrder/GroupOrderPage';
import SearchPage from "./components/SearchPage/SearchPage";
import CategoryPage from "./components/Category/CategoryPage";

function AppContent() {
    const location = useLocation();
    const showHeader = location.pathname !== "/";
  
    return (
      <>
        {showHeader && <Header />}
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/home" element={<Homepage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/orders" element={<GroupOrderPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
        </Routes>
      </>
    );
  }

function App() {
    return (
        <UserProvider>
            <Router>
                <AppContent />
            </Router>
        </UserProvider>
    );
}

export default App;
