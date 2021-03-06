const express = require('express');
const app = express();
const mongoose = require('mongoose');

/* Initial setup */
require('dotenv/config');
process.env.TZ = 'America/Sao_Paulo';
app.use(express.json());
app.use(express.urlencoded());

/* Set image folder public */
app.use(express.static('www'));
app.use(express.static('public'));
app.use(express.static('scripts'));
//app.all('/img/mapbox-icon.png', (req, res) => { res.sendFile(fetchFile("/public/img/mapbox-icon.png")); });

/* HTML requests */
app.get('/', (req, res) => { 
    res.render(fetchFile('/www/home.html'),
    { 
        token: process.env.MAPS_TOKEN,
        env: process.env.NODE_ENV  
    }) 
});

/* Import default routes */
const adminPost = require('./routes/adminPost');
app.use('/admin', adminPost);

const mapPost = require('./routes/mapPost');
app.use('/map', mapPost);

const userAuth = require('./routes/userPost');
app.use('/user', userAuth);

const emailAuth = require('./routes/emailAuth');
app.get("/confirm/:confirmationCode", emailAuth.verifyEmail);

const reportPost = require('./routes/reportPost');
app.use('/report', reportPost);

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*', (req, res) => {
    res.render(fetchFile('/www/pageNotFound.html'))
});

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

/* Auxiliar function to fetch the file */
const path = require('path');
function fetchFile(filename) { return path.join(__dirname + filename) };

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