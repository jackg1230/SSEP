import React, { useState } from "react";
import "./Register.css"; // Add CSS for the registration page
import { useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    // Check if passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
        const response = await fetch("http://94.174.1.192:3000/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              password_hash: password,
              address,
              postcode,
              payment_info: null, // Placeholder, can be updated with payment details later
              public_trolley: false, // Default value
            }),
          });

      if (response.ok) {
        alert("Registration successful!");
        navigate("/"); // Navigate to the login page after successful registration
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to register. Please try again.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An error occurred. Please try again later.");
    }
  };

  return (
    <section id="RegisterPage">
      <div id="RegisterPage-container">
        <h1>Register</h1>
        {error && <p className="error">{error}</p>}
        <form id="Register-Form" onSubmit={handleRegister}>
          <div>
            <label>Email: </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Password: </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Confirm Password: </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Address: </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="register-button">
            Register
          </button>
        </form>
      </div>
    </section>
  );
}

export default Register;
