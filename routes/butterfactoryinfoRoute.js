const express = require('express');
const router = express.Router();
const sql = require('mssql');


router.get('/', async (req, res) => {

    try {
        const response = await sql.query`SELECT * FROM BuyingInfo order by createddate desc`
        res.status(200).json(response.recordset);
    } catch (error) {
        res.status(500).json({ error: error });
    }
})



router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const newData = req.body;

    try {

        let updateQuery = 'UPDATE BuyingInfo SET ';
        const queryParams = [];

        for (const [key, value] of Object.entries(newData)) {
            if (key in {
                Price: true, Liquidity: true, Locked: true, Total_Volume: true, Buy_Volume: true,
                Sell_Volume: true, Net_Volume: true, Traders_Count: true, Trades_Count: true,
                Buy_Count: true, Sell_Count: true, Top_10_Holders: true, Marktecap: true,
                Circulating: true, Mintable: true, Mutable: true, Token_Name: true,
                Token_Symbol: true, Contract_Address: true, DexTools_link: true, CreatedDate: true,
                Status: true, Supply: true, Launch_marketcap: true, Current_marketcap: true,
                Initial_lp: true, Lp_tokens: true, Top_holders: true, Volume_24h: true,
                Transactions_24h: true, Airdrops: true, Mint: true, Lp_status: true,
                ChannelName: true, Timestamp: true, User_Name: true, Win_Rate: true,
                Total_Calls: true, Volume: true
            }) {
                updateQuery += `${key} = @${key}, `;
                queryParams.push({ name: key, type: sql.NVarChar, value });
            }
        }

        // Remove the trailing comma and space
        updateQuery = updateQuery.slice(0, -2);
        updateQuery += ' WHERE ID = @ID';
        queryParams.push({ name: 'ID', type: sql.Int, value: parseInt(id) });


        // Create the prepared statement
        const request = new sql.Request();

        // Add parameters to the request
        queryParams.forEach(param => {
            request.input(param.name, param.type, param.value);
        });

        // Execute the update query
        const result = await request.query(updateQuery);
        const retRow = await sql.query`select * from BuyingInfo where ID = ${id}`
        res.status(200).json({ ...retRow.recordset[0] });
    } catch (error) {
        res.status(500).json({ message: 'Error updating record', error: error.message });
    }
})

module.exports = router;