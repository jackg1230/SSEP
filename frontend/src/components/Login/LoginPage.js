import "./Login.css";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext"; // Import UserContext for managing user state

function Login() {
  const [email, setEmail] = useState(""); // For email input
  const [password, setPassword] = useState(""); // For password input
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility
  const { setUser } = useUser(); // Access UserContext
  const navigate = useNavigate(); // For navigation

  // Handle regular login
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://94.174.1.192:3000/api/userlogin?email=${encodeURIComponent(
          email
        )}&password_hash=${encodeURIComponent(password)}`,
        { method: "GET" }
      );
      if (response.ok) {
        const data = await response.json();
        setUser({
          user_id: data.user_id,
          house_id: data.house_id,
          public_trolley: data.public_trolley,
        });
        navigate("/home"); // Navigate to the home page upon successful login
      } else {
        alert("Invalid login credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  

  return (
    <section id="LoginPage">
      <div id="LoginPage-container">
        <h1>Login</h1>
        {/* Regular Login Form */}
        <form id="Login-Inputs" onSubmit={handleLogin}>
          <div id="Username-Input">
            <label>Email: </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div id="Password-Input">
            <label>Password: </label>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
          
        </form>

        
      </div>
    </section>
  );
}

export default Login;
