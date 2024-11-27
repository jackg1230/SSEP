const { Pool } = require('pg'); // PostgreSQL client
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000; // Default HTTP port is 3000

app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

// PostgreSQL pool configuration
const pool = new Pool({
    host: '94.174.1.192', 
    user: 'ssep1',
    password: 'SSEP123!',
    database: 'ssh_grocery',
    port: 5432
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to the database:', err.stack);
    } else {
        console.log('Connected to the PostgreSQL database!');
    }
    release();
});

// Fetch products by a specific field
app.get('/api/products/fetch', async (req, res) => {
    const { field } = req.query;

    if (!field) {
        return res.status(400).json({ error: 'Field name is required.' });
    }

    try {
        const allowedFields = ['ID', 'Name', 'Description', 'Price', 'ItemURL', 'Shop', 'Promotion', 'Category'];
        if (!allowedFields.includes(field)) {
            return res.status(400).json({ error: 'Invalid field name provided.' });
        }

        const query = `
            SELECT * 
            FROM products 
            WHERE "${field}" IS NOT NULL;
        `;
        const result = await pool.query(query);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: `No records found with non-NULL values in field "${field}".` });
        }

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Fetch products in a user's trolley
app.get('/api/trolley', async (req, res) => {
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

// Add a new user
app.post('/users', async (req, res) => {
    const { email, password_hash, address, postcode, payment_info, public_trolley } = req.body;

    try {
        let house_id;

        const houseQuery = `
            SELECT house_id FROM house WHERE address = $1 AND postcode = $2;
        `;
        const houseValues = [address, postcode];
        const houseResult = await pool.query(houseQuery, houseValues);

        if (houseResult.rows.length > 0) {
            house_id = houseResult.rows[0].house_id;
        } else {
            const nextHouseQuery = `
                SELECT COALESCE(MAX(house_id) + 1, 1) AS next_house_id FROM house;
            `;
            const nextHouseResult = await pool.query(nextHouseQuery);
            house_id = nextHouseResult.rows[0].next_house_id;

            const newHouseQuery = `
                INSERT INTO house (house_id, address, postcode)
                VALUES ($1, $2, $3);
            `;
            const newHouseValues = [house_id, address, postcode];
            await pool.query(newHouseQuery, newHouseValues);
        }

        const userQuery = `
            INSERT INTO Users (email, password_hash, house_id, payment_info, public_trolley)
            VALUES ($1, $2, $3, $4, $5) RETURNING *;
        `;
        const userValues = [email, password_hash, house_id, payment_info, public_trolley];
        const userResult = await pool.query(userQuery, userValues);

        res.status(201).json(userResult.rows[0]);
    } catch (err) {
        console.error('Error executing query:', err.stack);
        res.status(500).send('Database query error');
    }
});



// User login
app.get('/api/userlogin', async (req, res) => {
    const { email, password_hash } = req.query;

    if (!email || !password_hash) {
        return res.status(400).json({ error: 'Both "email" and "password_hash" are required.' });
    }

    try {
        const query = `
            SELECT 
                "house_id", 
                "user_id", 
                "public_trolley" 
            FROM users 
            WHERE email = $1 AND password_hash = $2;
        `;
        const values = [email, password_hash];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Invalid login credentials.' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Search bar get request
app.get('/api/search', async (req, res) => {
    const { term } = req.query;

    if (!term) {
        return res.status(400).json({ error: 'Search term is required' });
    }

    try {
        // Finds products where the name or description matches the term
        const query = `
            SELECT "ID", "Name", "Description", "Price", "Category", "Shop"
            FROM products
            WHERE "Name" ILIKE $1;
        `;
        const values = [`%${term}%`]; // Wildcard search
        // term is placed in an array to prevent SQL injections

        const result = await pool.query(query, values);

        res.status(200).json({ products: result.rows }); // Send rows as products
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Add an item to the trolley
app.post('/api/trolley/add', async (req, res) => {
    const { user_id, product_id, quantity } = req.body;

    if (!user_id || !product_id || !quantity) {
        return res.status(400).json({ error: 'user_id, product_id, and quantity are required.' });
    }

    try {
        const lastIdQuery = `SELECT MAX(trolley_id) AS last_id FROM trolley;`;
        const lastIdResult = await pool.query(lastIdQuery);
        const lastId = lastIdResult.rows[0].last_id || 0;
        const newTrolleyId = lastId + 1;

        const insertQuery = `
            INSERT INTO trolley (trolley_id, user_id, product_id, quantity)
            VALUES ($1, $2, $3, $4);
        `;
        const values = [newTrolleyId, user_id, product_id, quantity];
        await pool.query(insertQuery, values);

        res.status(200).json({ message: 'Item added to trolley.', trolley_id: newTrolleyId });
    } catch (err) {
        console.error('Error adding to trolley:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/products', async (req, res) => { // gets products provided with a category
    const { category } = req.query;
    try {
        
        if (!category) {
            return res.status(400).json({ error: 'Category is required' });
        }
        const query = `
            SELECT * FROM products WHERE "Category" = $1;
        `;
        const values = [category];
        const result = await pool.query(query, values);
        
        res.status(200).json(result.rows);
    } catch (err) {
        
        console.error('Database query error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Remove an item from the trolley
app.delete('/api/trolley/remove', async (req, res) => {
    const { user_id, product_id } = req.body;

    if (!user_id || !product_id) {
        return res.status(400).json({ error: 'user_id and product_id are required.' });
    }

    try {
        const query = `
            DELETE FROM trolley 
            WHERE user_id = $1 AND product_id = $2;
        `;
        const values = [user_id, product_id];
        await pool.query(query, values);

        res.status(200).json({ message: 'Item removed from trolley.' });
    } catch (err) {
        console.error('Error removing item from trolley:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start HTTP server
app.listen(PORT, () => {
    console.log(`HTTP server running on http://localhost:${PORT}`);
});
