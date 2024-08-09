const express = require('express');
const router = express.Router();
const { upload } = require('../config/multerConfig');
const Product = require('../models/Product');
const authenticate = require('../middleware/authenticate');

router.get('/distributor-products', authenticate, async (req, res) => {
  try {
    // Ensure the authenticated user is a distributor
    if (req.user.role !== 'distributor') {
      return res.status(403).json({ message: 'Access denied. Only distributors can access this route.' });
    }

    // Fetch products that belong to the authenticated distributor
    const products = await Product.find({ distributor: req.user._id });

    res.status(200).json(products);
  } catch (error) {
    console.error('Failed to fetch distributor products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});



router.get('/search', async (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ message: 'Query parameter is missing' });
  }

  try {
    const regex = new RegExp(query, 'i'); // 'i' for case-insensitive
    const products = await Product.find({ name: regex }); // Search by product name

    res.status(200).json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Error searching products', error });
  }
});

router.post('/add', authenticate, upload.array('images', 4), async (req, res) => {
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
  
    try {
      const { name, description, price, category, subcategory, quantity, distributor, images } = req.body;
      let imagePaths = [];
  
      // If files are uploaded, use their paths
      if (req.files && req.files.length > 0) {
        imagePaths = req.files.map(file => `uploads/${file.filename}`);
      }
  
      // If image URLs are provided in the body, use them
      if (images && images.length > 0) {
        imagePaths = imagePaths.concat(images);
      }
  
      const newProduct = new Product({
        name,
        description,
        price,
        category,
        subcategory,
        quantity,
        distributor,
        images: imagePaths,
        userId: req.user.id 
      });
  
      await newProduct.save();
      res.status(201).json(newProduct);
    } catch (error) {
      console.error('Failed to add product:', error);
      res.status(400).json({ message: 'Failed to add product', error: error.message });
    }
  });

router.get('/user/:userId', async (req, res) => {
  try {
    console.log('Fetching products for userId:', req.params.userId); 
    const products = await Product.find({ userId: req.params.userId });
    console.log('Fetched products:', products); 
    res.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    res.status(400).json({ message: 'Failed to fetch products', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/filter', async (req, res) => {
  console.log("Received filter parameters:", req.query);
  const { category, subcategory, priceMin, priceMax } = req.query;
  let query = {};
  if (category) query.category = category;
  if (subcategory) query.subcategory = subcategory;
  if (priceMin) query.price = { ...query.price, $gte: Number(priceMin) };
  if (priceMax) query.price = { ...query.price, $lte: Number(priceMax) };
  try {
      const products = await Product.find(query);
      console.log("Sending filtered products:", products);
      res.json(products);
  } catch (error) {
      console.error("Error fetching filtered products:", error);
      res.status(500).send("Error on fetching products: " + error);
  }
});

router.get('/:productId', async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId)
      .populate('distributor', 'firstName lastName')
      .populate('reviews.user', 'firstName lastName');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product details', error: error.message });
  }
});

router.post('/:productId/reviews', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const review = {
      user: req.user._id,
      rating,
      comment,
      createdAt: new Date()
    };

    product.reviews.push(review);
    await product.save();

    res.status(201).json(review);
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Failed to add review' });
  }
});

router.put('/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, description, price, quantity, distributor } = req.body;

    if (!distributor) {
      return res.status(400).json({ message: 'Distributor is required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.quantity = quantity || product.quantity;
    product.distributor = distributor;

    await product.save();

    res.json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/distributor-products', authenticate, async (req, res) => {
  try {
    // Ensure the authenticated user is a distributor
    if (req.user.role !== 'distributor') {
      return res.status(403).json({ message: 'Access denied. Only distributors can access this route.' });
    }

    // Fetch products that belong to the authenticated distributor
    const products = await Product.find({ distributor: req.user._id });

    res.status(200).json(products);
  } catch (error) {
    console.error('Failed to fetch distributor products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});




router.delete('/:productId', authenticate, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    await product.remove();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
