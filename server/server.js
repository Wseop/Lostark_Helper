const express = require('express');
const path = require('path');
const app = express();
const axios = require('axios');
const fs = require('fs');
const cheerio = require('cheerio');

// router
const character = require('./router/character.js');
app.use('/character', character);

// Error handle - Access-Control-Allow-Origin
app.use((req, res, next) => { 
    res.header("Access-Control-Allow-Origin", "*"); 
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); 
    next(); 
});

const http = require('http').createServer(app);
http.listen(8942, function () {
  console.log('listening on 8942')
});