const { Pool } = require('pg'); 
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000; 

app.use(cors());
app.use(express.json());

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
        console.error(err.stack);
    } else {
        console.log('Connected to the database!');
    }
    release();
});

// Fetch products by a specific field (use for promotions)
app.get('/api/products/fetch', async (req, res) => {
    const { field } = req.query;

    try {
        const query = `
            SELECT * 
            FROM products 
            WHERE "${field}" IS NOT NULL;
        `;
        const result = await pool.query(query);

        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
    }
});

// Fetch products in a user's trolley
app.get('/api/trolley', async (req, res) => {
    const { user_id } = req.query;
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
        res.status(200).json({ items: result.rows });
    } catch (err) {
        console.error( err);
    }
});

// Fetch delivery dates for a house
app.get('/api/delivery-dates', async (req, res) => {
    const { house_id } = req.query; // Extract house_id from query parameters
    try {
        const query = `
            SELECT "Delivery_Date"
            FROM "orders"
            WHERE "house_id" = $1;
        `;
        const values = [house_id]; // Provide the house_id as a parameter
        const result = await pool.query(query, values);
        
        res.status(200).json({ deliveryDates: result.rows }); // Return the delivery dates
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch delivery dates' });
    }
});


app.get('/api/group-trolley', async (req, res) => {
    const { user_id } = req.query;
    try {
        const query = `
            WITH UserHouse AS (
                SELECT "house_id"
                FROM "users"
                WHERE "user_id" = $1
            ),
            UserTrolley AS (
                SELECT 
                    t."user_id", 
                    t."product_id", 
                    t."quantity"
                FROM "trolley" t
                WHERE t."user_id" = $1
            ),
            HouseTrolley AS (
                SELECT 
                    t."user_id", 
                    t."product_id", 
                    t."quantity"
                FROM "trolley" t
                INNER JOIN "users" u ON t."user_id" = u."user_id"
                WHERE u."house_id" = (SELECT "house_id" FROM UserHouse)
                AND u."public_trolley" = TRUE
            )
            SELECT 
                p."ID",
                p."Name" AS product_name,
                p."Price",
                trolley."quantity",
                trolley."user_id"
            FROM (
                SELECT * FROM UserTrolley
                UNION ALL
                SELECT * FROM HouseTrolley
            ) AS trolley
            INNER JOIN "products" p ON trolley."product_id" = p."ID";
        `;
        const values = [user_id];
        const result = await pool.query(query, values);
        res.status(200).json({ items: result.rows });
    } catch (err) {
        console.error( err);
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
        console.error( err.stack);
    }
});



// User login
app.get('/api/userlogin', async (req, res) => {
    const { email, password_hash } = req.query;
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
        console.error(err);
    }
});

// Search bar get request
app.get('/api/search', async (req, res) => {
    const { term } = req.query;
    try {
        // Finds products where the name or description matches the term
        const query = `
            SELECT "ID", "Name", "Description", "Price", "Category", "Shop"
            FROM products
            WHERE "Name" ILIKE $1;
        `;
        const values = [`%${term}%`]; 
        const result = await pool.query(query, values);
        res.status(200).json({ products: result.rows });
    } catch (err) {
        console.error(err);
    }
});


// Add an item to the trolley
app.post('/api/trolley/add', async (req, res) => {
    const { user_id, product_id, quantity } = req.body;

    if (!user_id || !product_id || !quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Invalid input: user_id, product_id, and quantity are required and quantity must be greater than 0.' });
    }

    try {
        // Check if the product already exists in the user's trolley
        const checkQuery = `
            SELECT quantity 
            FROM trolley 
            WHERE user_id = $1 AND product_id = $2;
        `;
        const checkValues = [user_id, product_id];
        const checkResult = await pool.query(checkQuery, checkValues);

        if (checkResult.rows.length > 0) {
            // Product exists in the trolley, update the quantity
            const newQuantity = checkResult.rows[0].quantity + quantity;
            const updateQuery = `
                UPDATE trolley 
                SET quantity = $1 
                WHERE user_id = $2 AND product_id = $3;
            `;
            const updateValues = [newQuantity, user_id, product_id];
            await pool.query(updateQuery, updateValues);

            return res.status(200).json({ message: 'Trolley updated successfully.', product_id, new_quantity: newQuantity });
        } else {
            // Product does not exist in the trolley, insert a new row
            const lastIdQuery = `SELECT MAX(trolley_id) AS last_id FROM trolley;`;
            const lastIdResult = await pool.query(lastIdQuery);
            const lastId = lastIdResult.rows[0].last_id || 0;
            const newTrolleyId = lastId + 1;

            const insertQuery = `
                INSERT INTO trolley (trolley_id, user_id, product_id, quantity)
                VALUES ($1, $2, $3, $4);
            `;
            const insertValues = [newTrolleyId, user_id, product_id, quantity];
            await pool.query(insertQuery, insertValues);

            return res.status(200).json({ message: 'Item added to trolley.', trolley_id: newTrolleyId });
        }
    } catch (err) {
        console.error('Error adding to trolley:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


app.get('/api/products', async (req, res) => { // gets products provided with a category
    const { category } = req.query;
    try {
        const query = `
            SELECT * FROM products WHERE "Category" = $1;
        `;
        const values = [category];
        const result = await pool.query(query, values);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
    }
});

// Remove an item from the trolley
app.delete('/api/trolley/remove', async (req, res) => {
    const { user_id, product_id } = req.body;
    try {
        const query = `
            DELETE FROM trolley 
            WHERE user_id = $1 AND product_id = $2;
        `;
        const values = [user_id, product_id];
        await pool.query(query, values);

        res.status(200).json({ message: 'Item removed from trolley.' });
    } catch (err) {
        console.error(err);
    }
});

const getPublicTrolleyStatus = async (user_id) => {
    try {
        const query = `
            SELECT public_trolley 
            FROM users 
            WHERE user_id = $1;
        `;
        const values = [user_id];
        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            throw new Error('User not found');
        }

        return result.rows[0].public_trolley; // Return the current public_trolley status
    } catch (err) {
        console.error('Error fetching public trolley status:', err);
        throw err; // Re-throw the error to be handled by the caller
    }
};


app.get('/api/trolley/public-trolley-status', async (req, res) => {
    const { user_id } = req.query; // Extract user_id from query parameters

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    try {
        // Use getPublicTrolleyStatus to fetch the current status
        const publicTrolleyStatus = await getPublicTrolleyStatus(user_id);

        // Send the status to the client
        res.status(200).json({
            user_id,
            public_trolley: publicTrolleyStatus,
        });
    } catch (err) {
        console.error('Error fetching public trolley status:', err);
        if (err.message === 'User not found') {
            res.status(404).json({ error: 'User not found.' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});



app.post('/api/trolley/toggle-public-trolley', async (req, res) => {
    const { user_id } = req.body; // Extract user_id from the request body

    if (!user_id) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    try {
        // Get the current public_trolley status
        const currentStatus = await getPublicTrolleyStatus(user_id);

        // Toggle the value
        const newStatus = !currentStatus;

        // Update the public_trolley attribute
        const updateQuery = `
            UPDATE users 
            SET public_trolley = $1 
            WHERE user_id = $2;
        `;
        const updateValues = [newStatus, user_id];
        await pool.query(updateQuery, updateValues);

        res.status(200).json({
            message: 'Public trolley status updated successfully.',
            user_id,
            public_trolley: newStatus,
        });
    } catch (err) {
        console.error('Error toggling public trolley:', err);
        if (err.message === 'User not found') {
            res.status(404).json({ error: 'User not found.' });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});


// Start HTTP server
app.listen(PORT, () => {
    console.log(`HTTP server running on http://localhost:${PORT}`);
});
