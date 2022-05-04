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
        browser = await puppeteer.launch(
            {
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            }
        );

        for (let item of items) {
            let ret = await updateLowPrice(item);
            
            if (ret === false) {
                console.log(`${item.name} update fail`);
            }
        }
    })();
});

function getTime() {
    let date = new Date();

    let month = String(date.getMonth() + 1).padStart(2, '0');
    let d = String(date.getDate()).padStart(2, '0');
    let h = String(date.getHours()).padStart(2, '0');
    let minutes = String(date.getMinutes()).padStart(2, '0');

    return `${month}.${d}. ${h}:${minutes}`;
}

async function updateLowPrice(item) {
    let price;

    const page = await browser.newPage();
    await webLoa.filterResource(page);
    await page.setCookie(webLoa.cookie);
    
    if (item.type === 'market') {
        await page.goto(`${URL_MARKET}&pageNo=1&grade=${item.grade}&itemName=${item.name}`);
        try {
            await page.waitForSelector('#tbodyItemList');
        } catch (e) {
            // 쿠키 Refresh
            await webLoa.refreshCookie();
            await page.setCookie(webLoa.cookie);
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
            // 쿠키 Refresh
            await webLoa.refreshCookie();
            await page.setCookie(webLoa.cookie);
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
                // 쿠키 Refresh
                await webLoa.refreshCookie();
                await page.setCookie(webLoa.cookie);
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
        let data = {time : getTime(), price : price};
        db.client.collection(item.collection).insertOne(data, (err, res) => {
            if (err) return console.log(err);

            console.log(`[${Date()}][MARKET_PRICE] ${item.name} updated`);
            return true;
        });
    } else {
        return false;
    }
}

// MAP or JSON으로 해도 될듯
function getCollectionName(item) {
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
        default:
            collection = null;
            break;
    }

    return collection;
}

router.get('/:item', (req, res) => {
    let item = req.params.item;
    const COLLECTION = getCollectionName(item);
    
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
        res.send(datas);
    });
});

module.exports = router;