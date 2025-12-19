import { MongoClient } from "mongodb";
import { test } from "./test.js";
import dotenv from "dotenv";

dotenv.config();

const url = process.env.MONGO_URI;

if (!url) {
    console.error("Error: MONGO_URI is not defined in .env file");
    process.exit(1);
}

const client = new MongoClient(url)

export async function connection() {
    await client.connect()
    const error  =  await test(url);
    if(error){
        console.log("Failed Database connection!")
        process.exit(1);
    }
    console.log("successful connection")
    return client.db("schooldb") // ur db name
}

// connection();
// process.exit();