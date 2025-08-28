const express = require('express');
const cors = require('cors');
const productosRoutes = require('./routes/productos');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/productos', productosRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
