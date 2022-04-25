const express = require('express');
const app = express();
require('dotenv').config();
require('events').EventEmitter.defaultMaxListeners = 0;
const db = require('./db.js');
const webLoa = require('./web-loa.js');

// Error handle - Access-Control-Allow-Origin
app.use((req, res, next) => { 
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); 
  next(); 
});

// router
const character = require('./router/character.js');
app.use('/character', character);
//const exchange = require('./router/exchange.js');
//app.use('/exchange', exchange);
//const marketPrice = require('./router/marketprice.js');
//app.use('/marketprice', marketPrice);

app.listen(process.env.PORT, () => {
  (async() => {
    //await webLoa.RefreshCookie();
    console.log('listening on ' + process.env.PORT);
  })();
});