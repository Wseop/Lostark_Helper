// 참고한 코드
// puppeteer 불필요한 리소스 차단 - https://gracefullight.dev/2019/07/29/increase-puppeteer-crawling-speed/

const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

require('dotenv').config();

// value값 자동으로 갱신할 수 있는 방법?...
const COOKIE = {
    name: 'SUAT',
    value: process.env.STOVE_COOKIE,
    domain: '.onstove.com'
};
let db;
let loginInfo;

// TODO
// 쿠키값 SUAT가 갱신되면 DB에 업데이트 하도록 구현? How?
if (loginInfo == null) {
    MongoClient.connect(process.env.DB_URL, (err, client) => {
        if (err) return console.log(err);

        db = client.db('LoaHelper');
        (async () => {
            await db.collection('stove_login_info').find().next()
            .then((res) => {
                loginInfo = res;
            })
            .catch((err) => {
                return console.log(err);
            });
        })();
    });
}

// 경매장에서 item의 최저가 탐색
async function GetLowPrice(page, itemName) {
    let urlAuction = 'https://lostark.game.onstove.com/Auction/GetAuctionListV2?sortOption.Sort=BUY_PRICE&sortOption.IsDesc=false';
    let result = {};

    await page.goto(`${urlAuction}&pageNo=1&itemName=${itemName}`);
    await page.waitForSelector('.pagination__last');
    
    let content = await page.content();
    let $ = cheerio.load(content);
    const pageCount = Number($('.pagination__last').attr('onclick').split(/.*?\(|\)/)[1]);
    const pageArr = Array.from({length: pageCount}, (v, i) => i + 1);

    for (let pageNo of pageArr) {
        const url = `${urlAuction}&pageNo=${pageNo}&itemName=${itemName}`;

        await page.goto(url);
        await page.waitForSelector('#auctionListTbody');
        content = await page.content();
        $ = cheerio.load(content);
        
        const itemList = $('#auctionListTbody').children();
        for (let item of itemList) {
            let price = $(item).find('.price-buy').children('em').text().trim();
            
            if (price !== '-') {
                result['imgSrc'] = $(item).find('img').attr('src');
                result['name'] = $(item).find('.name').text();
                result['price'] = price;
                result['dataGrade'] = $(item).find('.grade').attr('data-grade');

                return result;
            }
        }
    }
    result = null;

    return result;
}

// 거래소에서 item 최저가 탐색
async function GetPrice(page, itemName) {
    let url = `https://lostark.game.onstove.com/Market/List_v2?firstCategory=0&secondCategory=0&tier=0&grade=99&pageNo=1&isInit=false&sortType=7&itemName=${itemName}`;

    await page.goto(url);
    await page.waitForSelector('#tbodyItemList');
    
    const content = await page.content();
    const $ = cheerio.load(content);
    let result = {};

    result['imgSrc'] = $('#tbodyItemList > tr:nth-child(1) > td:nth-child(1) > div > span.slot > img').attr('src');
    result['name'] = $('#tbodyItemList > tr:nth-child(1) > td:nth-child(1) > div > span.name').text();
    result['price'] = $('#tbodyItemList > tr:nth-child(1) > td:nth-child(4) > div > em').text();
    result['dataGrade'] = $('#tbodyItemList > tr:nth-child(1) > td:nth-child(1) > div').attr('data-grade');
    
    return result;
}

// 경매장 데이터 전달
router.get('/auction', (req, res) => {
    (async() => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // 불필요한 리소스 차단
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

        let items = req.query.items;
        let results = [];

        for (let item of items) {
            let result = await GetLowPrice(page, item);
            if (result != null) {
                results.push(result);
            }
        }

        await page.close();
        await browser.close();
        res.send(results);
    })();
});

// 거래소 데이터 전달
router.get('/market', (req, res) => {
    (async() => {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // 불필요한 리소스 차단
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

        let items = req.query.items;
        let results = [];

        for (let item of items) {
            let result = await GetPrice(page, item);
            if (result != null) {
                results.push(result);
            }
        }

        await page.close();
        await browser.close();
        res.send(results);
    })();
});

module.exports = router;