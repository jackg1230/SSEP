const express = require('express');
const { Pool } = require('pg'); // PostgreSQL client
//require('dotenv').config(); // For environment variables (optional)

const app = express();
const PORT = process.env.PORT || 3000; // Server port

// Database configuration
const pool = new Pool({
    host: '94.174.1.192', // Database host
    user: 'ssep1',        // Database username
    password: 'SSEP123!', // Database password
    database: 'ssh_grocery', // Database name
    port: 5432            // Default PostgreSQL port
});

// Test the database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
    } else {
        console.log('Connected to the PostgreSQL database!');
    }
    release(); // Release the client back to the pool
});

// Middleware for parsing JSON
app.use(express.json());

// Example route to fetch all users
app.get('/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users;'); // Replace with your actual query
        res.json(result.rows); // Send the retrieved data as JSON
        console.log(result.rows);
    } catch (err) {
        console.error('Error executing query:', err.stack);
        res.status(500).send('Database query error');
    }
});
pool.query('SELECT * FROM users', (err, result) => {
    if (err) {
        console.error('Database query error:', err.stack);
    } else {
        console.log('Database query result:', result.rows);
    }
});

// Example route to add a new user
app.post('/users', async (req, res) => {
    const { email, password_hash, house_id, address, payment_info, public_trolley } = req.body;

    try {
        const query = `
            INSERT INTO Users (email, password_hash, house_id, address, payment_info, public_trolley)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;
        `;
        const values = [email, password_hash, house_id, address, payment_info, public_trolley];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error executing query:', err.stack);
        res.status(500).send('Database query error');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
