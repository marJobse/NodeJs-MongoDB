const dotenv = require("dotenv");
dotenv.config();
const { MongoClient } = require("mongodb"); // referencia al Driver mongoDb

const URI = process.env.MONGODB_URLSTRING;
const client = new MongoClient(URI); // conecta al cluster remoto

//funciones de conexión y desconexión a Mongo

const connectToMongoDB = async () => {
  try {
    await client.connect();
    console.log("Conectado a MongoDB");
    return client;
  } catch (error) {
    console.error("Error al conectar a MongoDB", error);
    return null;
  }
};

const disconnectFromMongoDB = async () => {
  try {
    await client.close();
    console.log("Desconectado de MongoDB");
  } catch (error) {
    console.error("Error al desconectar a MongoDB", error);
  }
};
module.exports = { connectToMongoDB, disconnectFromMongoDB };
