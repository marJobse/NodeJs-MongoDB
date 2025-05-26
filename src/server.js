const express = require("express");
const app = express();

const { connectToMongoDB, disconnectFromMongoDB } = require("./mongodb");
const PORT = process.env.PORT || 3000;

//const connectToDB = async () => { // está en cada endpoint, al ppio
// await MongoClient.connection();
//};

app.use((req, res, next) => {
  res.header("Content-type", "application/json, charset=utf-8"); // tenia "," en "/json," --> error: {invalida media type}
  next();
});

app.get("/", (req, res) => {
  res.status(200).end("<h1> Bienvenidos a la API de frutas RESTful </h1>");
});

app.get("/frutas", async (req, res) => {
  const client = await connectToMongoDB();
  if (!client) {
    res.status(500).send("Error al conectarse a MongoDB");
    return;
  }
  const db = client.db("frutas");
  const frutas = await db.collection("frutas").find().toArray();

  await disconnectFromMongoDB();
  res.json(frutas);
});

app.get("/frutas/:id", async (req, res) => {
  const id_buscado = parseInt(req.params.id) || 0; // guardo el parámetro a buscar, que se guarda en Int o 0 si no existe o no lo encuentra

  const client = await connectToMongoDB();
  if (!client) {
    res.status(500).send("Error al conectarse a MongoDB");
    return;
  }
  const db = client.db("frutas");
  const fruta = await db.collection("frutas").findOne({ id: id_buscado });

  await disconnectFromMongoDB();
  res.json(fruta);
});

//http://localhost:3000/frutas/nombre/:nombre
app.get("/frutas/nombre/:nombre", async (req, res) => {
  const client = await connectToMongoDB();
  if (!client) {
    res.status(500).send("Error al conectarse a MongoDB");
    return;
  }
  const nombre_buscado = req.params.nombre.trim().toLocaleLowerCase();

  //.find({ nombre: { $regex: nombre_buscado, $options: "i" } }) // otra forma de usar RegExp
  const db = client.db("frutas");
  const frutas_por_nombre = await db
    .collection("frutas")
    .find({ nombre: new RegExp(nombre_buscado, "i") })
    .toArray();

  if (frutas_por_nombre.length === 0) {
    res.json({
      error: 404,
      message:
        "La búsqueda de la fruta que incluya en su nombre " +
        nombre_buscado +
        " no arrojo resultados",
    });
  } else {
    res.json(frutas_por_nombre);
  }
  await disconnectFromMongoDB();
});

//http://localhost:3000/frutas/precio/:precio
app.get("/frutas/precio/:precio", async (req, res) => {
  const client = await connectToMongoDB();
  if (!client) {
    res.status(500).send("Error al conectarse a MongoDB");
    return;
  }
  const importe_buscado = parseInt(req.params.precio) || 0; // si precio isNaN, va 0 y muestra todas las frutas
  const db = client.db("frutas");

  const frutas_por_precio = await db
    .collection("frutas")
    .find({ importe: { $gte: importe_buscado } })
    .toArray();

  if (frutas_por_precio.length === 0) {
    res.json({
      error: 404,
      message:
        "La búsqueda de frutas con importe mayor o igual que " +
        importe_buscado +
        " no arrojo resultados",
    });
  } else {
    res.send(frutas_por_precio);
  }
  await disconnectFromMongoDB();
});

app.use((req, res) => {
  // para manejar rutas inexistentes
  res.status(404).send("Lo siento, la página buscada no existe");
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
