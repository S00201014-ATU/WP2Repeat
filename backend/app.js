const express = require('express');
const app = express();
const cors = require('cors');
const stripe = require('stripe')('sk_test_51OcmsIGnZL6XZrQyZOsS7htl9iLbd2RkgMuVkzyjX8dOd90zGbV4Y1mpm6lnuFcKbgeVhR9ZqwEyzmVMvRFtXisX00fmu8uAcC');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { MongoClient } = require('mongodb');
const Product = require('./product.model');
const authRoutes = require ('./authRoutes')

// MongoDB connection URI
const uri = 'mongodb+srv://Matthew902:oBaEpV6HcZqdkYeW@angularwork.8gpqktd.mongodb.net/?retryWrites=true&w=majority&appName=AngularWork';

app.use('/api/auth', authRoutes);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors({ origin: 'http://localhost:4200' }));

app.post('/products/send-email', (req, res) => {
    const { name, email, phone, cardNumber, expiryDate, cvc } = req.body;

    // Create a transporter
    let transporter = nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'mmurphy123@hotmail.co.uk', // Your Hotmail email address
            pass: 'fartgas!' // Your Hotmail password
        }
    });

    // Email content
    let mailOptions = {
        from: 'mmurphy123@hotmail.co.uk', // Sender address
        to: email, // Receiver address
        subject: 'Order Confirmation', // Subject line
        text: `Dear ${name},\n\nYour order has been successfully placed.\n\nThank you for shopping with us.\n\nSincerely,\nYour Store`
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error sending email:', error);
            res.status(500).json({ success: false, message: 'Error sending email' });
        } else {
            console.log('Email sent:', info.response);
            res.status(200).json({ success: true, message: 'Email sent successfully' });
        }
    });
});

MongoClient.connect(uri, {})
    .then(client => {
        console.log('Connected to MongoDB');
        const db = client.db('store'); // Replace <database> with your database name
        const productsCollection = db.collection('products');

        // GET all products
        // GET all products
app.get('/products', async (req, res) => {
    try {
        const products = await productsCollection.find().toArray();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Unable to fetch products' });
    }
});


        // GET a specific product by ID
        // GET a specific product by ID
app.get('/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await productsCollection.findOne({ _id: productId });
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Unable to fetch product' });
    }
});


        // POST create a new product
       // POST create a new product
       // POST create a new product
app.post('/products', async (req, res) => {
    try {
        const newProduct = req.body;
        const insertedProduct = await productsCollection.insertOne(newProduct);
        if (insertedProduct && insertedProduct.ops && insertedProduct.ops.length > 0) {
            res.status(201).json(insertedProduct.ops[0]);
        } else {
            throw new Error('No product inserted');
        }
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Unable to create product' });
    }
});



        // PUT update an existing product by ID
       // PUT update an existing product by ID
app.put('/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const updatedProduct = await productsCollection.findOneAndUpdate(
            { _id: productId },
            { $set: req.body },
            { returnOriginal: false }
        );
        if (updatedProduct.value) {
            res.json(updatedProduct.value);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Unable to update product' });
    }
});


        // DELETE a product by ID
        // DELETE a product by ID
app.delete('/products/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const deletionResult = await productsCollection.deleteOne({ _id: productId });
        if (deletionResult.deletedCount > 0) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Unable to delete product' });
    }
});

    })
    .catch(error => {
        console.error('Error connecting to MongoDB:', error);
    });


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
