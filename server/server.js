const express = require('express');
const app = express();

require('dotenv').config();

// Error handle - Access-Control-Allow-Origin
app.use((req, res, next) => { 
  res.header("Access-Control-Allow-Origin", "*"); 
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept"); 
  next(); 
});

// router
const character = require('./router/character.js');
app.use('/character', character);
const exchange = require('./router/exchange.js');
app.use('/exchange', exchange);

app.listen(process.env.PORT, () => {
  console.log('listening on ' + process.env.PORT);
});