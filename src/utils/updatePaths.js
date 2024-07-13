const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config();  

const dbURI = 'mongodb+srv://alexborzza:pibmewanr1@cluster0.w7ujeto.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

if (!dbURI) {
    console.error('Error: DB_URI is not defined in .env file');
    process.exit(1);
}

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB connected…');
        return Product.find();
    })
    .then(products => {
        const updatePromises = products.map(product => {
            product.images = product.images.map(imagePath => {
                const imageName = path.basename(imagePath);
                return `uploads/${imageName}`;
            });
            return product.save();
        });

        return Promise.all(updatePromises);
    })
    .then(() => {
        console.log('All product image paths updated successfully');
        mongoose.disconnect();
    })
    .catch(err => {
        console.error('Error:', err);
    });
