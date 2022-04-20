const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const schedule = require('node-schedule');
const fs = require('fs');

require('dotenv').config();

// value값 자동으로 갱신할 수 있는 방법?...
const COOKIE = {
    name: 'SUAT',
    value: process.env.STOVE_COOKIE,
    domain: '.onstove.com'
};

let db;
const urlAuction = 'https://lostark.game.onstove.com/Auction/GetAuctionListV2?sortOption.Sort=BUY_PRICE&sortOption.IsDesc=false';
const urlMarket = 'https://lostark.game.onstove.com/Market/List_v2?firstCategory=0&secondCategory=0&tier=0&pageNo=1&isInit=false&sortType=7';
const items = JSON.parse(fs.readFileSync(__dirname + '/../data/marketprice.json', 'utf-8'));

if (db == null) {
    MongoClient.connect(process.env.DB_URL, (err, client) => {
        if (err) return console.log(err);

        db = client.db('LoaHelper');

        console.log('[MARKET_PRICE] db connected');

        const job = schedule.scheduleJob('0 */1 * * *', () => {
            (async() => {
                const browser = await puppeteer.launch();
                const page = await browser.newPage();

                await page.setRequestInterception(true);
                page.on('request', (request) => {
                    switch (request.resourceType()) {
                        case 'stylesheet':
                        case 'font':
                        case 'image':
                            request.abort();
                            break;
                        default:
                            request.continue();
                            break;
                    }
                });
                await page.setCookie(COOKIE);

                for (let item of items) {
                    let ret = await UpdateLowPrice(page, item);
                    
                    if (ret === false) {
                        console.log(`${item.name} update fail`);
                    }
                }

                await page.close();
                await browser.close();
            })();
        });
    });
}

async function UpdateLowPrice(page, item) {
    let price;

    if (item.type === 'market') {
        await page.goto(`${urlMarket}&grade=${item.grade}&itemName=${item.name}`);
        await page.waitForSelector('#tbodyItemList');

        const content = await page.content();
        const $ = cheerio.load(content);

        price = $('#tbodyItemList > tr:nth-child(1) > td:nth-child(4) > div > em').text();
    } else if (item.type === 'auction') {
        await page.goto(`${urlAuction}&pageNo=1&itemName=${item.name}`);
        await page.waitForSelector('.pagination__last');

        let content = await page.content();
        let $ = cheerio.load(content);
        const pageCount = Number($('.pagination__last').attr('onclick').split(/.*?\(|\)/)[1]);
        const pageArr = Array.from({length: pageCount}, (v, i) => i + 1);
        let find = false;

        for (let pageNo of pageArr) {
            const url = `${urlAuction}&pageNo=${pageNo}&itemName=${item.name}`;

            await page.goto(url);
            await page.waitForSelector('#auctionListTbody');
            content = await page.content();
            $ = cheerio.load(content);
            
            const itemList = $('#auctionListTbody').children();
            for (let item of itemList) {
                let data = $(item).find('.price-buy').children('em').text().trim();
                
                if (data !== '-') {
                    price = data;
                    find = true;
                    break;
                }
            }
            if (find) {
                break;
            }
        }
    }
    if (price != null) {
        let data = {time : new Date().toLocaleString(), price : price};
        db.collection(item.collection).insertOne(data, (err, res) => {
            if (err) return console.log(err);

            console.log(`[MARKET_PRICE] ${item.name} updated at ${data.time}`);
            return true;
        });
    } else {
        return false;
    }
}

router.get('/jewel', (req, res) => {});
router.get('/esther', (req, res) => {});
router.get('/engraveCommon', (req, res) => {});
router.get('/engraveClass', (req, res) => {});

module.exports = router;