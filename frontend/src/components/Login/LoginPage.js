// LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext'; //imports stored user data from UserContext file

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState(''); 
    const { setUser } = useUser(); 
    const navigate = useNavigate();
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(
                `http://94.174.1.192:3000/api/userlogin?email=${encodeURIComponent(
                    email
                )}&password_hash=${encodeURIComponent(password)}`,
                { method: 'GET' }
            );
            if (response.ok) {
                const data = await response.json();
                setUser({
                    user_id: data.user_id,
                    house_id: data.house_id,
                    public_trolley: data.public_trolley,
                });
                navigate('/home'); 
            } else {
                alert('Invalid login credentials.');
            }
        } catch (err) {
            console.error('Login error:', err);
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>
        </div>
    );
};

export default LoginPage;
