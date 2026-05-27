// Load environment variables from .env (keeps credentials out of the codebase)
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2');

const app = express();

/* ---------------------- Middleware ---------------------- */

// Allow the frontend to communicate with this backend
app.use(cors());

// Parse incoming JSON request bodies
app.use(express.json());

// Serve static frontend files (HTML, CSS, JS) from /public
app.use(express.static(path.join(__dirname, 'public')));


/* ---------------------- MySQL Connection ---------------------- */

// Create a MySQL connection using environment variables for security
const db = mysql.createConnection({
    host: process.env.DB_HOST,     // Database host
    user: process.env.DB_USER,     // Database username
    password: process.env.DB_PASS, // Database password
    database: process.env.DB_NAME  // Database name
});

// Connect to the database and log the result
db.connect(err => {
    if (err) throw err;
    console.log('MySQL connected');
});


/* ---------------------- API Routes ---------------------- */

/* ----- PRODUCTS ----- */

// Return all products
app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) throw err;
        res.json(results); // Send product list as JSON
    });
});

// Return a single product by ID
app.get('/api/products/:id', (req, res) => {
    const id = req.params.id;

    db.query('SELECT * FROM products WHERE id = ?', [id], (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(results[0]); // Send the product data
    });
});


/* ----- CART ----- */

// Add a product to the cart (default quantity = 1)
app.post('/api/cart/add', (req, res) => {
    const { product_id } = req.body;

    db.query(
        'INSERT INTO cart (product_id, quantity) VALUES (?, 1)',
        [product_id],
        (err) => {
            if (err) throw err;
            res.json({ message: 'Added to cart' });
        }
    );
});

// Return all items in the cart (joined with product details)
app.get('/api/cart', (req, res) => {
    db.query(
        `SELECT cart.id, products.name, products.price, products.image, cart.quantity
         FROM cart
         JOIN products ON cart.product_id = products.id`,
        (err, results) => {
            if (err) throw err;
            res.json(results); // Send cart items with product info
        }
    );
});

// Remove an item from the cart by its cart ID
app.delete('/api/cart/remove/:id', (req, res) => {
    const id = req.params.id;

    db.query('DELETE FROM cart WHERE id = ?', [id], (err) => {
        if (err) throw err;
        res.json({ message: 'Item removed' });
    });
});


/* ---------------------- Start Server ---------------------- */

// Start the server on port 3000
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
