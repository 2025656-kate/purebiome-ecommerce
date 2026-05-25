// Load environment variables from .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql2');

const app = express();

// Middleware

// Allows frontend to access backend 
app.use(cors());     
// Parses JSON request bodies         
app.use(express.json());      

// Serve static frontend files from /public
app.use(express.static(path.join(__dirname, 'public')));


// MySQL Connection
//MySQL connection details are stored in .env file for security and flexibility

const db = mysql.createConnection({
    host: process.env.DB_HOST,     // Database host
    user: process.env.DB_USER,     // Database username
    password: process.env.DB_PASS, // Database password
    database: process.env.DB_NAME  // Database name
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL connected');
});


// API Routes //

// Get all products
app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) throw err;
        res.json(results); // Return all products as JSON
    });
});

// Get a single product by ID
app.get('/api/products/:id', (req, res) => {
    const id = req.params.id;

    db.query('SELECT * FROM products WHERE id = ?', [id], (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(results[0]); // Return the product
    });
});

// Add item to cart
app.post('/api/cart/add', (req, res) => {
    const { product_id } = req.body;

    db.query(
        'INSERT INTO cart (product_id, quantity) VALUES (?, 1)',
        [product_id],
        (err, result) => {
            if (err) throw err;
            res.json({ message: 'Added to cart' });
        }
    );
});

// Get all cart items
app.get('/api/cart', (req, res) => {
    db.query(
        `SELECT cart.id, products.name, products.price, products.image, cart.quantity
         FROM cart
         JOIN products ON cart.product_id = products.id`,
        (err, results) => {
            if (err) throw err;
            res.json(results); // Return cart items with product details
        }
    );
});

// Remove item from cart
app.delete('/api/cart/remove/:id', (req, res) => {
    const id = req.params.id;

    db.query('DELETE FROM cart WHERE id = ?', [id], (err, result) => {
        if (err) throw err;
        res.json({ message: 'Item removed' });
    });
});


// Start Server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
