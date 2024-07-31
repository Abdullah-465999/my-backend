const express = require('express');
const sql = require('mssql')
const router = express.Router();


router.get('/', async (req, res) => {
    try {
        const transInfo = await sql.query`select * from SuperTrendCandleData`
        res.status(200).json(transInfo.recordset);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/tokens', async (req, res) => {
    try {
        const tokens = await sql.query`SELECT DISTINCT ContractAddress FROM SuperTrendCandleData`;
        res.status(200).json(tokens.recordset);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

router.get('/data/:ContractAddress', async (req, res) => {
    const { ContractAddress } = req.params;
    try {
        const tokenData = await sql.query`SELECT * FROM SuperTrendCandleData WHERE ContractAddress = ${ContractAddress}`;
        res.status(200).json(tokenData.recordset);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
})

module.exports = router