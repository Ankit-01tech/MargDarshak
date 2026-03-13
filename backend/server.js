const express = require('express');
const cors = require('cors'); 
const apiRoutes = require('./routes/api');

const app = express();
app.use(cors()); 
app.use(express.json());
app.use('/api', apiRoutes);

const PORT = 8080; // Changed from 5000 to 8080
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});