const express = require('express');
const router = express.Router();
const fs = require('fs');
const db = require('../db.js');
require('dotenv').config();

const collections = JSON.parse(fs.readFileSync(__dirname + '/../data/item-collection.json', 'utf-8'));

router.get('/:itemName', (req, res) => {
    let itemName = req.params.itemName;
    const collection = collections[itemName];
    
    new Promise((resolve, reject) => {
        let datas = [];

        db.client.collection(collection).find().toArray((err, res) => {
            if (err) return console.log(err);
    
            res.map((v, i) => {
                let data = {time:v.time, price:v.price};
                datas.push(data);
            });
            resolve(datas);
        });
    }).then((datas) => {
        res.send(datas);
    });
});

module.exports = router;