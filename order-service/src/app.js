require('dotenv').config(); // Load environment variables

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// Routes
app.use('/api/orders', orderRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Order Service is running');
});

// Start the server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Order Service running on port ${PORT}`));
