const express = require('express');
const app = express();
const mongoose = require('mongoose');

/* Initial setup */
require('dotenv/config');
process.env.TZ = 'America/Sao_Paulo';
app.use(express.json());

/* Import default routes */
const userAuth = require('./routes/userPost');
app.use('/user', userAuth);

const emailAuth = require('./routes/emailAuth');
app.get("/confirm/:confirmationCode", emailAuth.verifyEmail);

/* Connect to DataBase */
let dbUrl = "mongodb+srv://" + process.env.MONGO_USER + ":" + process.env.MONGO_PASS + "@" + process.env.MONGO_URL + "/" + process.env.MONGO_DB_NAME + "?retryWrites=true&w=majority";
mongoose.connect(
    dbUrl, 
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log("[Server] Connected to DB!"));


/* The port was given by the host */
let port = process.env.PORT;
if (port == undefined) port = 3030;

console.log("Starting server...");
app.listen(port);
console.log("[Server] Listening on port " + port);