const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const schedule = require('node-schedule');
const fs = require('fs');
require('dotenv').config();
const db = require('./db.js');
const webLoa = require('./web-loa.js');
const exchange = require('./update-exchange.js');
const time = require('./format-time.js');
require('dotenv').config();

let marketprice = {};
let browser;

schedule.scheduleJob('0 */1 * * *', async() => {
    if (browser == null) {
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }

    const page = await browser.newPage();
    await webLoa.filterResource(page);
    await page.setCookie(webLoa.cookie);

    const items = JSON.parse(fs.readFileSync(__dirname + '/data/marketPrice.json', 'utf-8'));
    for (let item of items) {
        await updateMarketPrice(page, item);
    }
});

async function updateMarketPrice(page, item) {
    let price;

    if (item.type === 'market') {
        price = (await exchange.getPriceFromMarket(page, {grade:item.grade, itemName:item.itemName})).price;
    } else if (item.type === 'auction') {
        price = (await exchange.getPriceFromAuction(page, item.itemName)).price;
    }

    if (price != null) {
        let newData = {time:time.getTime(), price:price};
        let prices;

        // name이 일치하는 element를 find
        db.client.collection(process.env.NAME_COLLECTION_MARKETPRICE).findOne({itemName:item.itemName}, (err, res) => {
            if (err) throw err;

            prices = res.prices;
            // 가격 정보 추가
            prices.push(newData);
            // db update
            db.client.collection(process.env.NAME_COLLECTION_MARKETPRICE).updateOne({itemName:item.itemName}, {$set:{prices:prices}}, (err, res) => {
                if (err) throw err;

                console.log(`[${time.getTime()}] | [UPDATE_MARKETPRICE] | ${item.itemName} updated`);
            });
        });
    }
}

module.exports = marketprice;