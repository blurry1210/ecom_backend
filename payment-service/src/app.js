require('dotenv').config();  // Ensure this is at the top
const express = require('express');
const cors = require('cors');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/payments', paymentRoutes);

// Start the server
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Payment Service running on port ${PORT}`));
