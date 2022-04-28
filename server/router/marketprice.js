const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const schedule = require('node-schedule');
const fs = require('fs');
const db = require('../db.js');
const webLoa = require('../web-loa.js');

require('dotenv').config();

let browser;
const URL_AUCTION = 'https://lostark.game.onstove.com/Auction/GetAuctionListV2?sortOption.Sort=BUY_PRICE&sortOption.IsDesc=false';
const URL_MARKET = 'https://lostark.game.onstove.com/Market/List_v2?firstCategory=0&secondCategory=0&tier=0&isInit=false&sortType=7';
const items = JSON.parse(fs.readFileSync(__dirname + '/../data/marketprice.json', 'utf-8'));

schedule.scheduleJob('0 */1 * * *', () => {
    (async() => {
        browser = await puppeteer.launch();

        // 10렙 보석 + 에스더의 기운
        for (let item of items) {
            let ret = await UpdateLowPrice(item);
            
            if (ret === false) {
                console.log(`${item.name} update fail`);
            }
        }
        // 각인서
        await UpdateEngrave();
    })();
});

async function UpdateLowPrice(item) {
    let price;

    const page = await browser.newPage();
    await webLoa.FilterResource(page);
    await page.setCookie(webLoa.cookie);
    
    if (item.type === 'market') {
        await page.goto(`${URL_MARKET}&pageNo=1&grade=${item.grade}&itemName=${item.name}`);
        try {
            await page.waitForSelector('#tbodyItemList');
        } catch (e) {
            console.log(e);
            // 쿠키 Refresh
            await webLoa.RefreshCookie();
            await page.goto(`${URL_MARKET}&pageNo=1&grade=${item.grade}&itemName=${item.name}`);
            await page.waitForSelector('#tbodyItemList');
        }

        const content = await page.content();
        const $ = cheerio.load(content);

        price = $('#tbodyItemList > tr:nth-child(1) > td:nth-child(4) > div > em').text();
    } else if (item.type === 'auction') {
        await page.goto(`${URL_AUCTION}&pageNo=1&itemName=${item.name}`);
        try {
            await page.waitForSelector('.pagination__last');
        } catch (e) {
            console.log(e);
            // 쿠키 Refresh
            await webLoa.RefreshCookie();
            await page.goto(`${URL_AUCTION}&pageNo=1&itemName=${item.name}`);
            await page.waitForSelector('.pagination__last');
        }

        let content = await page.content();
        let $ = cheerio.load(content);
        const pageCount = Number($('.pagination__last').attr('onclick').split(/.*?\(|\)/)[1]);
        const pageArr = Array.from({length: pageCount}, (v, i) => i + 1);
        let find = false;

        for (let pageNo of pageArr) {
            const url = `${URL_AUCTION}&pageNo=${pageNo}&itemName=${item.name}`;

            await page.goto(url);
            try {
                await page.waitForSelector('#auctionListTbody');
            } catch (e) {
                console.log(e);
                // 쿠키 Refresh
                await webLoa.RefreshCookie();
                await page.goto(url);
                await page.waitForSelector('#auctionListTbody');
            }
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
    await page.close();

    if (price != null) {
        let data = {time : new Date().toLocaleString(), price : price};
        db.client.collection(item.collection).insertOne(data, (err, res) => {
            if (err) return console.log(err);

            console.log(`[MARKET_PRICE] ${item.name} updated at ${data.time}`);
            return true;
        });
    } else {
        return false;
    }
}

async function UpdateEngrave() {
    let url = `${URL_MARKET}&pageNo=1&grade=4&itemName=각인서`;
    let commons = [];
    let classes = [];

    const page = await browser.newPage();
    await webLoa.FilterResource(page);
    await page.setCookie(webLoa.cookie);

    await page.goto(url);
    try {
        await page.waitForSelector('.pagination__last');
    } catch (e) {
        console.log(e);
        // 쿠키 Refresh
        await webLoa.RefreshCookie();
        await page.goto(url);
        await page.waitForSelector('.pagination__last');
    }

    let content = await page.content();
    let $ = cheerio.load(content);
    const pageCount = Number($('.pagination__last').attr('onclick').split(/.*?\(|\)/)[1]);
    const pageArr = Array.from({length: pageCount}, (v, i) => i + 1);

    for (let pageNo of pageArr) {
        url = `${URL_MARKET}&pageNo=${pageNo}&grade=4&itemName=각인서`;

        await page.goto(url);
        try {
            await page.waitForSelector('#tbodyItemList');
        } catch (e) {
            console.log(e);
            // 쿠키 Refresh
            await webLoa.RefreshCookie();
            await page.goto(url);
            await page.waitForSelector('#tbodyItemList');
        }

        content = await page.content();
        $ = cheerio.load(content);
        
        const itemList = $('#tbodyItemList').children();
        for (let item of itemList) {
            let name = $(item).find('.name').text();
            let price = $($(item).find('.price')[2]).children('em').text();
            let engrave = {name:name, price:price};
        
            if (name[0] === '[') {
                classes.push(engrave);
            } else {
                commons.push(engrave);
            }
        }
    }
    commons.sort((a, b) => { return b.name - a.name });
    classes.sort((a, b) => { return b.name - a.name });

    let date = new Date().toLocaleString();
    db.client.collection('price_engrave_common').insertOne({time:date, engrave:commons}, (err, res) => {
        if (err) return console.log(err);

        console.log(`[MARKET_PRICE] engrave_common updated at ${date}`);
    });
    db.client.collection('price_engrave_class').insertOne({time:date, engrave:classes}, (err, res) => {
        if (err) return console.log(err);

        console.log(`[MARKET_PRICE] engrave_class updated at ${date}`);
    });

    await page.close();
}


// TODO
// JSON으로 빼기?...
function GetCollectionName(item) {
    let collection;

    switch (item) {
        case 'myul':
            collection = 'price_10myul';
            break;
        case 'hong':
            collection = 'price_10hong';
            break;
        case 'esther':
            collection = 'price_esther';
            break;
        case 'common':
            collection = 'price_engrave_common';
            break;
        case 'class':
            collection = 'price_engrave_class';
            break;
        default:
            collection = null;
            break;
    }

    return collection;
}

router.get('/single/:item', (req, res) => {
    let item = req.params.item;
    const COLLECTION = GetCollectionName(item);
    
    new Promise((resolve, reject) => {
        let datas = [];

        db.client.collection(COLLECTION).find().toArray((err, res) => {
            if (err) return console.log(err);
    
            res.map((v, i) => {
                let data = {time:v.time, price:v.price};
                datas.push(data);
            });
            resolve(datas);
        });
    }).then((datas) => {
        res.json(datas);
    });
});
router.get('/engrave/:item', (req, res) => {
    let item = req.params.item;
    const COLLECTION = GetCollectionName(item);

    new Promise((resolve, reject) => {
        let datas = [];

        db.client.collection(COLLECTION).find().toArray((err, res) => {
            if (err) return console.log(err);

            res.map((v, i) => {
                let data = {time:v.time, engraves:v.engrave};
                datas.push(data);
            });
            resolve(datas);
        });
    }).then((datas) => {
        res.json(datas);
    });
});

module.exports = router;