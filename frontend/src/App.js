import React from 'react';
import './App.css';

function Header() {
  return (
    <header className="app-header">
      <h1>SSH Group Grocery Order System</h1>
    </header>
  );
}

function MainContent() {
  return (
    <main className="app-content">
      <p>Template</p>
    </main>
  );
}

function App() {
  return (
    <div className="app-container">
      <Header />
      <div className="app-body">
        <MainContent />
      </div>
    </div>
  );
}

export default App;