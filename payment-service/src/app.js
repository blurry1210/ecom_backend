require('dotenv').config();  
const express = require('express');
const cors = require('cors');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Payment Service running on port ${PORT}`));
