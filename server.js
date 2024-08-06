const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const userRoutes = require('./routes/userRoutes');
const registerRoutes = require('./routes/registerRoutes');
const loginRoutes = require('./routes/loginRoutes');
const transInfo = require('./routes/transInfoRoute');
const transWalletInfo = require('./routes/transWalletInforoute');
const sellAndBuy = require('./routes/BuyAndSellRoute');
const butterfactoryinfoRoute = require('./routes/butterfactoryinfoRoute');
const SuperTrend = require('./routes/SuperTrend');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://45.55.97.152:3400',
    methods: ['GET', 'POST']
  }
});
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
  origin: 'http://45.55.97.152:3400'
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', userRoutes);
app.use('/register', registerRoutes);
app.use('/login', loginRoutes);
app.use('/transinfo', transInfo);
app.use('/transwalletinfo', transWalletInfo);
app.use('/butterfactoryinfo', butterfactoryinfoRoute);
app.use('/buyandsell', sellAndBuy);
app.use('/supertrend', SuperTrend);



// Socket.IO connection
io.on('connection', (socket) => {
  console.log('client connected');
  setInterval(async () => {
    const channelName = await sql.query`SELECT * FROM ChannelNames`;
    const allUsers = await sql.query`SELECT * FROM Users`;
    const TransInfos = await sql.query`SELECT * FROM TransInfo`;
    const transwalletinfo = await sql.query`select * from TransWalletInfo`;
    const butterfactoryinfo = await sql.query`SELECT * FROM BuyingInfo order by createddate desc`;
    const SuperTrendCandleData = await sql.query`select * from SuperTrendCandleData`;

    socket.emit('channelNamesUpdated', channelName.recordset);
    socket.emit('TransInfos', TransInfos.recordset);
    socket.emit('allUsers', allUsers.recordset);
    socket.emit('transwalletinfo', transwalletinfo.recordset);
    socket.emit('butterfactoryinfo', butterfactoryinfo.recordset);
    socket.emit('SuperTrendCandleData', SuperTrendCandleData.recordset);
  }, 5000)

  setInterval(async () => {
    const buyandsell = await sql.query`select * from TokenSellSlots`;

    socket.emit('buyandsell', buyandsell.recordset);
  }, 1000);

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});










server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


module.exports = { io }