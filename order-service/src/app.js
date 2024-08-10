require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/orders', orderRoutes);

app.get('/', (req, res) => {
  res.send('Order Service is running');
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Order Service running on port ${PORT}`));
