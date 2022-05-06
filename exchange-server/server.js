const express = require('express');
const app = express();
require('dotenv').config();
const db = require('./db.js');
const webLoa = require('./web-loa.js');
const exchange = require('./update-exchange.js');
const marketPrice = require('./update-marketprice.js');

app.listen(process.env.PORT, async () => {
    await webLoa.refreshCookie();

    console.log(`Listening on ${process.env.PORT}`);
});