import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header/Header';
import Homepage from './components/Homepage/Homepage';
import SettingsPage from './components/Settings/SettingsPage';
import GroupOrderPage from './components/GroupOrder/GroupOrderPage'; 

function App() {
  return (
    <Router>
      <Header />
      <div className="app-body">
        <Routes>
          <Route path="/" element={<Homepage />} />  {/* Home page with categories and offers */}
          <Route path="/settings" element={<SettingsPage />} />  {/* Settings page */}
          <Route path="/orders" element={<GroupOrderPage />} />  {/* Order management page */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;