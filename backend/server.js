const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');

require("dotenv").config();

const app = express();

connectDB(); // connect MongoDB

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

const PORT = 8080;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
});