const express = require('express');
const router = express.Router();
const db = require('../db.js');
require('dotenv').config();

router.get('/', (req, res) => {
    const category = req.query.category;

    db.client.collection(process.env.NAME_COLLECTION_EXCHANGE).findOne({category:category}, (err, result) => {
        if (err) return console.log(err);

        if (result != null) {
            res.send(result.items);
        } else {
            res.send(null);
        }
    });
});

module.exports = router;