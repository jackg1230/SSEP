import React, { useEffect, useState } from "react";
import "./SettingsPage.css"; // Add your CSS for styling the toggle switch
import { useUser } from "../../context/UserContext";

function SettingsPage() {
  const { user, setUser } = useUser();
  const [publicTrolley, setPublicTrolley] = useState(false); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);

  
  useEffect(() => {
    const fetchPublicTrolleyStatus = async () => {
      try {
        const response = await fetch(
          `http://94.174.1.192:3000/api/trolley/public-trolley-status?user_id=${user.user_id}`
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const data = await response.json();
        setPublicTrolley(data.public_trolley); 
      } catch (err) {
        console.error("Error fetching public trolley status:", err);
        setError("Unable to fetch public trolley status.");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicTrolleyStatus();
  }, [user.user_id]);

  
  const togglePublicTrolley = async () => {
    try {
      const response = await fetch(
        "http://94.174.1.192:3000/api/trolley/toggle-public-trolley",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: user.user_id }),
        }
      );
      if (!response.ok) {
        throw new Error(`Failed to toggle: ${response.statusText}`);
      }
      const data = await response.json();
      setPublicTrolley(data.public_trolley); 
    } catch (err) {
      console.error("Error toggling public trolley:", err);
      setError("Unable to toggle public trolley status.");
    }
  };

  if (loading) {
    return <p>Loading settings...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="settings">
      <h2>Settings</h2>
      <p>Configure your preferences here.</p>
      <div className="toggle-container">
        <label className="toggle-label">
          Public Trolley
          <div className="toggle-switch">
            <input
              type="checkbox"
              checked={publicTrolley}
              onChange={togglePublicTrolley}
            />
            <span className="slider" />
          </div>
          <div className="toggle-dropdown"></div>
        </label>
      </div>
    </div>
  );
}

export default SettingsPage;
