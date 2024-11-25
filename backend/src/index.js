const express = require('express');
const { Pool } = require('pg'); // PostgreSQL client
//require('dotenv').config(); // For environment variables (optional)

const app = express();
const PORT = process.env.PORT || 3000; // Server port


const pool = new Pool({
    host: '94.174.1.192', 
    user: 'ssep1',
    password: 'SSEP123!',
    database: 'ssh_grocery',
    port: 5432
});

// Tests the database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
    } else {
        console.log('Connected to the PostgreSQL database!');
    }
    release(); // Releases the client back to the pool
});


app.use(express.json());


app.get('/users', async (req, res) => { // gets all users
    try {
        const result = await pool.query('SELECT * FROM users;'); // Replace with your actual query
        res.json(result.rows); // Send the retrieved data as JSON
        console.log(result.rows);
    } catch (err) {
        console.error('Error executing query:', err.stack);
        res.status(500).send('Database query error');
    }
});

app.get('/api/trolley', async (req, res) => { // retreives products in user's trolley 
    const { user_id } = req.query;

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        
        const query = `
            SELECT 
                p."ID", 
                p."Name" AS product_name, 
                p."Price", 
                t."quantity"
            FROM "trolley" t
            INNER JOIN "products" p ON t."product_id" = p."ID"
            WHERE t."user_id" = $1;
        `;
        const values = [user_id];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(200).json({ message: 'Trolley is empty', items: [] });
        }

        res.status(200).json({ items: result.rows });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



app.post('/users', async (req, res) => { // adds a new user
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

app.get('/api/products', async (req, res) => { // gets products provided with a category
    const { Category } = req.query;
    try {
        
        if (!Category) {
            return res.status(400).json({ error: 'Category is required' });
        }


        const query = `
            SELECT * FROM products WHERE "Category" = $1;
        `;
        const values = [Category];
        const result = await pool.query(query, values);

        
        res.status(200).json(result.rows);
    } catch (err) {
        
        console.error('Database query error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://94.174.1.192:${PORT}`);
});
