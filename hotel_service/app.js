const express = require('express')
const app = express()
const cors = require('cors');
const port = 3000

const hotelRoutes = require('./routes/hotelRoutes');
const userRoutes = require('./routes/user');
const uploadRoutes = require('./routes/upload');


app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.use('/api/hotels', hotelRoutes);
app.use('/api/user', userRoutes);
app.use('/api/upload', uploadRoutes);
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
