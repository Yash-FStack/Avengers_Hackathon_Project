const { ethers, Mnemonic } = require('ethers');
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
//Include cors
const cors = require('cors');


// Include AXIOS to call webhook API
const axios = require('axios');
const { config } = require('dotenv');
// Include dotenv 
require("dotenv").config();

const PORT = 3000;          //define the PORT on which the server has to run

const app = express();      //initialize express app

// Database connection details
// Replace these values with your actual database connection details
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Password$2',
    database: 'WalletNotification'
})
// connect to db
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.use(express.json());

//Use Cors
app.use(cors());


// Middleware to parse JSON request bodies
// app.use(bodyParser.json());

app.get('/createAccount', async (request, response) => {
    try {
        const wallet = ethers.Wallet.createRandom();

        let newWallet = {
            "message": "Success",
            "Mnemonic": wallet.mnemonic.phrase.toString(),
            "Address": wallet.address.toString(),
            "PrivateKey": wallet.privateKey.toString()
        }

        response.send(newWallet);
    }
    catch {
        result = {
            "message": "error"
        }
        response.send(result)
    }

});

// recover account from mnemonic
app.post('/recover/mnemonic/:Mnemonic', async (request, response) => {
    try {
        let mnemonic = request.params.Mnemonic;

        // Create a wallet instance from the provided mnemonic
        const wallet = ethers.Wallet.fromMnemonic(mnemonic);
        // Retrieve the Ethereum address and private key
        const address = wallet.address;
        const privateKey = wallet.privateKey;
        result = {
            "message": "Success",
            "Mnemonic": mnemonic,
            "Address": address,
            "PrivateKey": privateKey
        }
        response.send(result);
    }
    catch {
        result = {
            "message": "error"
        }
        response.send(result)
    }
});

//Fetch Balance of an Ethereum Account
app.post('/balance', async (request, response) => {
    try {
        let rpc = request.query.RPC;
        let address = request.query.address;

        const provider = new ethers.providers.JsonRpcProvider(rpc);
        balance = await provider.getBalance(address);
        balanceInEthers = await ethers.utils.formatEther(balance);

        let networkDetails = {
            "message": "Success",
            "balance": balanceInEthers.toString()
        };
        response.send(networkDetails);
    }
    catch {
        result = {
            "message": "error"
        }
        response.send(result)
    }
});

app.post('/webhook', (req, res) => {
    let userAddress = req.body.event.activity[0].toAddress;
    let userMessage = `You received ${req.body.event.activity[0].value} ${req.body.event.activity[0].asset} from ${req.body.event.activity[0].fromAddress}`;

    // Store the data in the database
    const query = 'INSERT INTO notification (userAddress, notification_msg, isRead) VALUES (?,?,?)';
    const values = [userAddress, userMessage, false];
    connection.query(query, values, (err, results) => {
        if (err) {
            console.error('Error inserting data into MySQL:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
    });

    // Send a response if needed
    res.json({ status: 'Received the webhook payload' });
});

//Fetch the Notification from Databaseon the basis of useraddress
app.get('/notifications/:userAddress', (req, res) => {
    const userAddress = req.params.userAddress;

    // Query to fetch notifications for a given userId
    const query = 'SELECT * FROM notification WHERE userAddress = ?';
    connection.query(query, [userAddress], (err, results) => {
        if (err) {
            console.error('Error fetching notifications from MySQL:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        let finalResult = {
            status: true,
            result: results
        }
        res.setHeader('Content-Type', 'application/json');

        res.send(finalResult);
    });
});


app.post('/create-webhook', async (req, res) => {
    try {
        // Fetch Alchemy Webhook Token from .env Config
        const XAclechyToken = process.env.AlchemyWebhookToken;

        const requestData = {
            network: req.body.WebhookNetwork,
            webhook_type: "ADDRESS_ACTIVITY",
            webhook_url: req.body.WebhookURL,
            addresses: req.body.WebhookAddress
        }
        const response = await axios.post("https://dashboard.alchemy.com/api/create-webhook/", requestData, {
            headers: {
                "Accept": "application/json",
                "X-Alchemy-Token": XAclechyToken,
                "Content-Type": "application/json"
            }
        });

        // Check if the request was successful
        if (response.status !== 200) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Handle success
        const responseBody = {
            message: "Webhook Created",
            response: {
                Webhook_Id: response.data.data.id,
            }
        }
        res.status(200).send(responseBody);
    } catch (error) {
        // Handle errors
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to check and update the webhook addressess
app.post('/webhook/addAddress', (req, res) => {
    const address = req.body.address;
    console.log(address)
    const query = "SELECT COUNT(WalletAddress) as PresentOrNot FROM monitoringAddress where WalletAddress = ?"
    connection.query(query, [address[0]], async (err, results) => {
        if (err) {
            console.error('Error fetching notifications from MySQL:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        if (results[0].PresentOrNot == 1) {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json({ message: "Address already added for monitoring" });
        }

        else if (results[0].PresentOrNot == 0) {
            let finalResult =  await UpdateWebhookAddress(address)
            if(finalResult.statusCode == true){
                res.setHeader('Content-Type', 'application/json');

                const insertQuery = "INSERT INTO monitoringAddress VALUES (?);"
                connection.query(insertQuery,[address[0]], (err,result) => {
                    if (err) {
                        console.error('Error Inserting Address to monitoringAddress from MySQL:', err);
                        res.status(500).json({ error: 'Internal Server Error' });
                        return;
                    }  
                    res.status(200).send(finalResult);
                })
            }
            else if(finalResult.statusCode == false){
                res.setHeader('Content-Type', 'application/json');
                res.status(500).send(finalResult);    
            }
        }
    })
})

async function UpdateWebhookAddress(address) {
    try {
        const XAclechyToken = process.env.AlchemyWebhookToken;      // accessing the token stored in config.

        const requestData = {
            webhook_id: process.env.WebhookId,
            addresses_to_add: address,
            addresses_to_remove: []
        };

        const response = await axios.patch("https://dashboard.alchemy.com/api/update-webhook-addresses", requestData, {
            headers: {
                "Accept": "application/json",
                "X-Alchemy-Token": XAclechyToken,
                "Content-Type": "application/json"
            }
        });

        // Check if the request was successful
        if (response.status !== 200) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        result = {
            statusCode : true,
            message: 'Webhook addresses updated successfully!'
        }
        return result
    } catch (error) {
        result = {
            statusCode: false,
            error: error.message
        }
        console.log(error)
        return result;
    }
}

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);   //running script
});

