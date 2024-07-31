const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const registerRoutes = require('./routes/registerRoutes');
const loginRoutes = require('./routes/loginRoutes');
const transInfo = require('./routes/transInfoRoute');
const transWalletInfo = require('./routes/transWalletInforoute');
const sellAndBuy = require('./routes/BuyAndSellRoute');
const butterfactoryinfoRoute = require('./routes/butterfactoryinfoRoute')
const SuperTrend = require('./routes/SuperTrend');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 7000;


const config = {
  user: process.env.NAME, // Database username
  password: process.env.PSWRD, // Database password
  server: process.env.SERVER, // SQL Server instance name
  database: process.env.DATABASE, // Database name
  options: {
    encrypt: false, // Set to true if you need encryption
    trustServerCertificate: true // Set to true if using self-signed certificates
  }
};


sql.connect(config).then(pool => {
  if (pool.connected) {
    console.log('Connected to MSSQL');
  }
}).catch(err => {
  console.error('Connection error', err);
  process.exit();
});

app.use(cors({
  credentials: true,
  origin: 'http://45.55.97.152:1400'
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', userRoutes);
app.use('/register', registerRoutes);
app.use('/login', loginRoutes)
app.use('/transinfo', transInfo);
app.use('/transwalletinfo', transWalletInfo)
app.use('/butterfactoryinfo', butterfactoryinfoRoute)
app.use('/buyandsell', sellAndBuy)
app.use('/supertrend',SuperTrend)


app.listen(PORT, () => {

  console.log(`Server is running on port ${7000}`);
});
