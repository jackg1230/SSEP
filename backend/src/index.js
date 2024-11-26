
const { Pool } = require('pg'); // PostgreSQL client
const fs = require('fs');
const https = require('https');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000; // Default HTTPS port is 443

// Load SSL/TLS certificate and private key
const options = {
    key: fs.readFileSync('./server.key'), // Replace with the path to your private key
    cert: fs.readFileSync('./server.cert') // Replace with the path to your certificate
};

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
    release(); 
});


app.use(express.json());

app.get('/api/products/fetch', async (req, res) => {
    const { field } = req.query;

    if (!field) {
        return res.status(400).json({ error: 'Field name is required.' });
    }

    try {
        // Sanitize field name to prevent SQL injection
        const allowedFields = ['ID', 'Name', 'Description', 'Price', 'ItemURL', 'Shop', 'Promotion', 'Category'];
        if (!allowedFields.includes(field)) {
            return res.status(400).json({ error: 'Invalid field name provided.' });
        }

        // Query to fetch all records where the specified field is not NULL
        const query = `
            SELECT * 
            FROM products 
            WHERE "${field}" IS NOT NULL;
        `;
        const result = await pool.query(query);

        // Respond with the results
        if (result.rows.length === 0) {
            return res.status(404).json({ message: `No records found with non-NULL values in field "${field}".` });
        }

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Database query error:', err); // Log the error
        res.status(500).json({ error: 'Internal server error' }); // Send an error response
    }
});


app.get('/users', async (req, res) => { // gets all users
    console.log('GET /users endpoint called'); // Debug log
    try {
        const result = await pool.query('SELECT * FROM users;'); // Fetch users
        console.log('Database query executed'); // Debug log
        console.log(result.rows);
        res.json(result.rows); // Respond with JSON
        // Log each user's email to the console
        result.rows.forEach(user => {
            console.log(`User Email: ${user.email}`);
        });
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



app.post('/users', async (req, res) => { 
    const { email, password_hash, address, postcode, payment_info, public_trolley } = req.body;

    try {
        let house_id;

        // Check if the house already exists
        const houseQuery = `
            SELECT house_id FROM house WHERE address = $1 AND postcode = $2;
        `;
        const houseValues = [address, postcode];
        const houseResult = await pool.query(houseQuery, houseValues);

        if (houseResult.rows.length > 0) {
            // If the house exists, retrieve the house_id
            house_id = houseResult.rows[0].house_id;
            console.log(`House exists. Using house_id: ${house_id}`);
        } else {
            // Find the next available house_id
            const nextHouseQuery = `
                SELECT COALESCE(MAX(house_id) + 1, 1) AS next_house_id FROM house;
            `;
            const nextHouseResult = await pool.query(nextHouseQuery);
            house_id = nextHouseResult.rows[0].next_house_id;

            // Create a new house entry
            const newHouseQuery = `
                INSERT INTO house (house_id, address, postcode)
                VALUES ($1, $2, $3);
            `;
            const newHouseValues = [house_id, address, postcode];
            await pool.query(newHouseQuery, newHouseValues);
            console.log(`New house created. house_id: ${house_id}`);
        }

        // Add the new user with the house_id
        const userQuery = `
            INSERT INTO Users (email, password_hash, house_id, payment_info, public_trolley)
            VALUES ($1, $2, $3, $4, $5) RETURNING *;
        `;
        const userValues = [email, password_hash, house_id, payment_info, public_trolley];
        const userResult = await pool.query(userQuery, userValues);

        // Return the newly created user
        res.status(201).json(userResult.rows[0]);
    } catch (err) {
        console.error('Error executing query:', err.stack);
        res.status(500).send('Database query error');
    }
});


app.get('/api/productscat', async (req, res) => { // gets products provided with a category
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

app.get('/api/products', async (req, res) => { // gets all products
    try {
        const query = `
            SELECT "ID", "Name", "Description", "Price", "ItemURL", "Shop", "Promotion", "Category" FROM products;
        `;
        const result = await pool.query(query); // Query the database for all products

        res.status(200).json(result.rows); // Respond with the retrieved products as JSON
    } catch (err) {
        console.error('Database query error:', err); // Log the error to the console
        res.status(500).json({ error: 'Internal server error' }); // Send an error response to the client
    }
});

app.get('/api/products/search', async (req, res) => {
    const { field, value } = req.query;

    // Validate input
    if (!field || !value) {
        return res.status(400).json({ error: 'Both "field" and "value" query parameters are required.' });
    }

    try {
        // Sanitize field name to prevent SQL injection
        const allowedFields = ['ID', 'Name', 'Description', 'Price', 'ItemURL', 'Shop', 'Promotion', 'Category'];
        if (!allowedFields.includes(field)) {
            return res.status(400).json({ error: 'Invalid field name provided.' });
        }

        // Dynamic query with parameterized values to prevent SQL injection
        const query = `
            SELECT "ID", "Name", "Description", "Price", "ItemURL", "Shop", "Promotion", "Category" 
            FROM products 
            WHERE "${field}" = $1;
        `;
        const result = await pool.query(query, [value]);

        // Respond with results
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No products found matching the criteria.' });
        }

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Database query error:', err); // Log the error
        res.status(500).json({ error: 'Internal server error' }); // Send an error response
    }
});

// Start HTTPS server
https.createServer(options, app).listen(PORT, () => {
    console.log(`HTTPS server running on https://localhost:${PORT}`);
});

