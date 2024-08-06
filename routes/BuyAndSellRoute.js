const express = require('express')
const router = express.Router()
const sql = require('mssql')

router.get('/', async (req, res) => {
    try {
        const walletInfo = await sql.query`select * from TokenSellSlots`;
        res.status(200).json(walletInfo.recordset)
    } catch (error) {
        res.status(500).json({ error })
    }
})

router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const newData = req.body;
    // Log to check ID type

    try {
        const request = new sql.Request();

        request.input('ChannelName', sql.NVarChar, newData.ChannelName || null);
        request.input('SellNo', sql.TinyInt, parseInt(newData.SellNo) || 0);
        request.input('PriceUpCheck', sql.Float, parseFloat(newData.PriceUpCheck) || 0.0);
        request.input('SellTokenMultiplier', sql.Float, parseFloat(newData.SellTokenMultiplier) || 0.0);
        request.input('ID', sql.Int, parseInt(id)); // Ensure ID is an integer

        const result = await request.query(`
            UPDATE TokenSellSlots
            SET 
                ChannelName = @ChannelName, 
                SellNo = @SellNo, 
                PriceUpCheck = @PriceUpCheck, 
                SellTokenMultiplier = @SellTokenMultiplier
            WHERE ID = @ID
        `);
        const updated = await sql.query`select * from TokenSellSlots where ID = ${id}`;
        res.status(200).json(updated.recordset[0]);
    } catch (error) {
        res.status(500).json({ error });
    }
});






router.post('/manydata', async (req, res) => {
    try {
        const dataArray = req.body;

        // Validate the incoming data
        if (!Array.isArray(dataArray) || dataArray.length === 0) {
            return res.status(400).json({ error: 'Invalid input data' });
        }

        // Initialize the SQL request
        const pool = await sql.connect();
        const transaction = new sql.Transaction(pool);
        const insertedIds = [];

        try {
            await transaction.begin();

            for (const item of dataArray) {
                const request = new sql.Request(transaction);
                await request.input('ChannelName', sql.NVarChar, item.ChannelName);
                await request.input('SellNo', sql.TinyInt, item.SellNo);
                await request.input('PriceUpCheck', sql.Float, item.PriceUpCheck);
                await request.input('SellTokenMultiplier', sql.Float, item.SellTokenMultiplier);
                const result = await request.query(`
                    INSERT INTO TokenSellSlots (ChannelName, SellNo, PriceUpCheck, SellTokenMultiplier) 
                    OUTPUT INSERTED.ID
                    VALUES (@ChannelName, @SellNo, @PriceUpCheck, @SellTokenMultiplier)
                `);
                insertedIds.push(result.recordset[0].ID);
            }

            await transaction.commit();

            // Fetch only the newly inserted entries
            const newEntries = await pool.request()
                .query(`SELECT * FROM TokenSellSlots WHERE ID IN (${insertedIds.join(', ')})`);
            res.status(201).json(newEntries.recordset);

        } catch (error) {
            if (transaction.isActive) {
                await transaction.rollback();
            }
            res.status(500).json({ error: 'Error inserting data' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});



router.delete('/dlt/:id', async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'Invalid ID' });
        }

        const deleteResult = await sql.query`select * from TokenSellSlots where ID =${id}`

        if (!deleteResult.recordset[0]) {
            return res.status(404).json({ message: 'User not found' });
        }

        await sql.query`DELETE from TokenSellSlots where ID=${id}`;
        const users = await sql.query`SELECT * FROM TokenSellSlots`

        res.status(200).json({ message: 'User deleted successfully', users: users.recordset });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});



router.get('/channelnames', async (req, res) => {
    try {
        const Channels = await sql.query`SELECT * FROM ChannelNames`;
        res.status(200).json(Channels.recordset);
    } catch (error) {
        res.status(500).json({ error });
    }
}
)



router.put('/channel/:id', async (req, res) => {
    const { id } = req.params;
    const { ChannelName } = req.body;
    try {
        const result = await sql.query`UPDATE ChannelNames SET ChannelName = ${ChannelName} WHERE ID = ${id}`;
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Channel name not found' });
        }
        const updatedChannels = await sql.query`SELECT * FROM ChannelNames`;
        res.status(200).json(updatedChannels.recordset);
    } catch (error) {
        res.status(500).json({ error });
    }
});

router.post('/channel', async (req, res) => {
    try {
        const { ChannelName } = req.body;
        await sql.query`INSERT INTO ChannelNames (ChannelName) VALUES (${ChannelName})`;
        const allNames = await sql.query`SELECT * FROM ChannelNames`;
        res.status(200).json(allNames.recordset);
    } catch (error) {
        res.status(500).json({ error });
    }
});

module.exports = router