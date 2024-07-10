// database.js
const { MongoClient } = require('mongodb');

// Updated URI with username and password for a local MongoDB connection
const uri = "";

// Create a new MongoClient
const client = new MongoClient(uri);

async function connect() {
    try {
        // Connect the client to the server
        await client.connect();
        console.log("Successfully connected to MongoDB.");
    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
    }
}

// Call connect function to establish database connection
connect().catch(console.dir);

module.exports = { client, getDb: () => client.db("") };
