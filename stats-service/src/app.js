const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const statsRoutes = require('./routes/statsRoutes');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api/stats', statsRoutes);

app.get('/', (req, res) => {
  res.send('Stats Service is running');
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Stats Service running on port ${PORT}`));
