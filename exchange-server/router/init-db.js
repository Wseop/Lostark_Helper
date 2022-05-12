const express = require('express');
const router = express.Router();
const fs = require('fs');
const db = require('../db.js');
require('dotenv').config();

router.get('/:collectionName', async (req, res) => {
    const collectionName = req.params.collectionName;
    let result;

    try {
        // 초기화하고자 하는 collection이 이미 존재하면 drop
        let collections = await db.client.listCollections().toArray();
        await Promise.all(collections.map(async (collection, i) => {
            if (collection.name === collectionName) {
                await db.client.collection(collectionName).drop();
            }
        }));
        // collection 생성
        await db.client.createCollection(collectionName);
        // data 초기값 세팅
        // TODO. params or query에 따라 다르게 세팅하도록 수정
        const items = JSON.parse(fs.readFileSync(`${__dirname}/../data/${collectionName}.json`, 'utf-8'));
        result = await Promise.all(items.map(async (item, i) => {
            let data = {};
            data.itemName = item.itemName;
            data.category = item.category;
            data.prices = [];
            await db.client.collection(collectionName).insertOne(data);
            
            return data;
        }));
        res.send(result);
    } catch (e) {
        console.log(e);
        res.send(result);
    }
});

module.exports = router;