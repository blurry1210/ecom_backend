const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const statsRoutes = require('./routes/statsRoutes');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to Database
connectDB();

// Routes
app.use('/api/stats', statsRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Stats Service is running');
});

// Start the server
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Stats Service running on port ${PORT}`));
