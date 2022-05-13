const express = require('express');
const router = express.Router();
const fs = require('fs');
const db = require('../db.js');
require('dotenv').config();

router.get('/', (req, res) => {
    let itemName = req.query.itemName;
    
    db.client.collection(process.env.NAME_COLLECTION_MARKETPRICE).findOne({itemName:itemName}, (err, result) => {
        if (err) throw err;

        if (result == null) {
            res.send(null);
        } else {
            res.send(result.prices);
        }
    });
});

module.exports = router;