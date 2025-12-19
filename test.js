import { MongoClient } from "mongodb";

export async function test(url) {
  try {
    const client = new MongoClient(url);
    await client.connect();

    console.log("Connected to MongoDB Atlas successfully");
    await client.close();
    return ;
  } 
  catch (err) {
    console.error("Connection failed");
    return err.message;
  }
}