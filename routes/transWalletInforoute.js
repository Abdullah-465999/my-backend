const express = require('express')
const router = express.Router()
const sql = require('mssql')


router.get('/', async (req, res) => {
    try {
        const walletInfo = await sql.query`select * from TransWalletInfo`;
        res.status(200).json(walletInfo.recordset)
    } catch (error) {
        res.status(500).json({ error })
    }
})


router.post('/', async (req, res) => {
    const transaction = req.body;

    // Define the query
    const query = `
        INSERT INTO TransWalletInfo (
            WalletPrivateAddress, TransAddress, TransAmount, SolanaNetwork, 
            SlipagePercentage, ParseTransactionURL, ChannelName, 
            TotalNoOfSells, FeePayerPrivateAddress, PriceTrackingFrequency, 
            SupertrendSelling, IsJitoTrans, Status
        ) VALUES (
            @WalletPrivateAddress, @TransAddress, @TransAmount, @SolanaNetwork, 
            @SlipagePercentage, @ParseTransactionURL, @ChannelName, 
            @TotalNoOfSells, @FeePayerPrivateAddress, @PriceTrackingFrequency, 
            @SupertrendSelling, @IsJitoTrans, @Status
        ); SELECT SCOPE_IDENTITY() AS ID`;

    try {
        // Create a request object
        const request = new sql.Request();

        // Add parameters to the request
        request.input('WalletPrivateAddress', sql.NVarChar, transaction.WalletPrivateAddress);
        request.input('TransAddress', sql.NVarChar, transaction.TransAddress);
        request.input('TransAmount', sql.Decimal, parseFloat(transaction.TransAmount));
        request.input('SolanaNetwork', sql.NVarChar, transaction.SolanaNetwork);
        request.input('SlipagePercentage', sql.TinyInt, parseInt(transaction.SlipagePercentage));
        request.input('ParseTransactionURL', sql.NVarChar, transaction.ParseTransactionURL);
        request.input('ChannelName', sql.NVarChar, transaction.ChannelName);
        request.input('TotalNoOfSells', sql.TinyInt, parseInt(transaction.TotalNoOfSells));
        request.input('FeePayerPrivateAddress', sql.NVarChar, transaction.FeePayerPrivateAddress);
        request.input('PriceTrackingFrequency', sql.Int, parseInt(transaction.PriceTrackingFrequency));
        request.input('SupertrendSelling', sql.Bit, transaction.SupertrendSelling);
        request.input('IsJitoTrans', sql.Bit, transaction.IsJitoTrans);
        request.input('Status', sql.VarChar, transaction.Status);

        // Execute the query
        const result = await request.query(query);
        const walletInfo = await sql.query`select * from TransWalletInfo where ID=${result.recordset[0].ID}`;
        res.status(200).json({ ...walletInfo.recordset[0] });
    } catch (error) {
    }
});



router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const newData = req.body;
    // Define the query
    const query = `
        UPDATE TransWalletInfo
        SET 
            WalletPrivateAddress = @WalletPrivateAddress, 
            TransAddress = @TransAddress, 
            TransAmount = @TransAmount, 
            SolanaNetwork = @SolanaNetwork, 
            SlipagePercentage = @SlipagePercentage, 
            ParseTransactionURL = @ParseTransactionURL, 
            ChannelName = @ChannelName, 
            TotalNoOfSells = @TotalNoOfSells, 
            FeePayerPrivateAddress = @FeePayerPrivateAddress, 
            PriceTrackingFrequency = @PriceTrackingFrequency, 
            SupertrendSelling = @SupertrendSelling, 
            IsJitoTrans = @IsJitoTrans,
            Status = @Status
        WHERE ID = @ID;
        
        SELECT * FROM TransWalletInfo WHERE ID = @ID
    `;
    try {
        // Create a request object
        const request = new sql.Request();

        // Add parameters to the request
        request.input('WalletPrivateAddress', sql.NVarChar, newData.WalletPrivateAddress || null);
        request.input('TransAddress', sql.NVarChar, newData.TransAddress || null);
        const transAmount = newData.TransAmount !== undefined && newData.TransAmount !== null
            ? parseFloat(newData.TransAmount)
            : null;
        request.input('TransAmount', sql.Float, transAmount);
        request.input('SolanaNetwork', sql.NVarChar, newData.SolanaNetwork || null);
        request.input('SlipagePercentage', sql.TinyInt, parseInt(newData.SlipagePercentage) || 0);
        request.input('ParseTransactionURL', sql.NVarChar, newData.ParseTransactionURL || null);
        request.input('ChannelName', sql.NVarChar, newData.ChannelName || null);
        request.input('TotalNoOfSells', sql.TinyInt, parseInt(newData.TotalNoOfSells) || 0);
        request.input('FeePayerPrivateAddress', sql.NVarChar, newData.FeePayerPrivateAddress || null);
        request.input('PriceTrackingFrequency', sql.Int, parseInt(newData.PriceTrackingFrequency) || 0);
        request.input('SupertrendSelling', sql.Bit, newData.SupertrendSelling ? 1 : 0);
        request.input('IsJitoTrans', sql.Bit, newData.IsJitoTrans ? 1 : 0);
        request.input('Status', sql.VarChar, newData.Status || null);
        request.input('ID', sql.Int, parseInt(id));

        // Execute the query
        const result = await request.query(query);
        // Send the updated record as the response
        res.status(200).json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error });
    }
});


module.exports = router