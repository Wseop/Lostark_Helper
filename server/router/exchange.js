const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

require('dotenv').config();

let browser;
let db;
let loginInfo;

if (loginInfo == null) {
    // DB에서 stove 로그인 정보를 가져와서 stove 로그인
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

            //browser = await puppeteer.launch({headless:false});
            browser = await puppeteer.launch();
            let page = await browser.newPage();

            // DEBUG - set viewport
            await page.setViewport({
                width: 1920,
                height: 1080
            });

            await page.goto('https://member.onstove.com/auth/login?inflow_path=lost_ark&game_no=45&redirect_url=https%3a%2f%2flostark.game.onstove.com%2fmarket');
            await page.focus('#user_id');
            await page.keyboard.type(loginInfo.email);
            await page.focus('#user_pwd');
            await page.keyboard.type(loginInfo.pw);
            await page.click('#idLogin > div.row.grid.el-actions > button');
            // 로그인 버튼 클릭 후 완료될 때 까지 대기!
            await page.waitForNavigation();

            console.log('[EXCHANGE] : exchange login success');
        })();
    });
}

// 경매장에서 item의 최저가 탐색
async function GetLowPrice(itemName) {
    let page = await browser.newPage();

    await page.goto('https://lostark.game.onstove.com/Auction');
    await page.waitForSelector('#txtItemName');
    await page.focus('#txtItemName');
    await page.keyboard.type(itemName);
    await page.click('#btnSearch');
    // 검색 결과 최저가로 정렬
    await page.waitForSelector('.price-buy');
    await page.click('#BUY_PRICE');
    await page.waitForTimeout(300);
    
    let paginationIndex = 3;
    while (true) {
        const content = await page.content();
        const $ = cheerio.load(content);

        for (let j = 0; j < 10; j++) {
            let selector = '#auctionListTbody > tr:nth-child(' + (j + 1) + ') > td:nth-child(6) > div > em';
            let price = $(selector).text().trim();

            if (price !== '-') {
                let result = {};
                result['imgSrc'] = $('#auctionListTbody > tr:nth-child(' + (j + 1) + ') > td:nth-child(1) > div.grade > span.slot > img').attr('src');
                result['name'] = $('#auctionListTbody > tr:nth-child(' + (j + 1) + ') > td:nth-child(1) > div.grade > span.name').text();
                result['price'] = price;

                await page.close();
                return result;
            }
        }
        // 최저가를 못찾은 경우 다음 tab에서 다시 검색
        if (paginationIndex === 12) {
            await page.click('#auctionList > div.pagination > a.pagination__next');
            paginationIndex = 3;
        } else {
            paginationIndex++;

            let selector = '#auctionList > div.pagination > a:nth-child(' + (paginationIndex) + ')';
            if (await page.$(selector) != null) {
                await page.click(selector);
            } else {
                // 검색 결과에 최저가 즉구가 없는 경우
                await page.close();
                return null;
            }
        }
        await page.waitForTimeout(300);
    }
}

// 거래소에서 item 최저가 탐색
async function GetPrice(page, itemName) {
    await page.waitForSelector('#txtItemName');
    await page.focus('#txtItemName');
    await page.keyboard.type(itemName);
    await page.click('#lostark-wrapper > div > main > div > div.deal > div.deal-contents > form > fieldset > div > div.bt > button.button.button--deal-submit');
    await page.waitForSelector('.price');
    
    const content = await page.content();
    const $ = cheerio.load(content);
    let result = {};
    result['imgSrc'] = $('#tbodyItemList > tr:nth-child(1) > td:nth-child(1) > div > span.slot > img').attr('src');
    result['name'] = $('#tbodyItemList > tr:nth-child(1) > td:nth-child(1) > div > span.name').text();
    result['price'] = $('#tbodyItemList > tr:nth-child(1) > td:nth-child(4) > div > em').text().trim();

    await page.click('#lostark-wrapper > div > main > div > div.deal-tab > a.tab__item--active');
    
    return result;
}

// 경매장 데이터 전달
router.get('/auction', (req, res) => {
    (async() => {
        let items = req.query.items;
        let results = [];

        for (let item of items) {
            let result = await GetLowPrice(item);
            results.push(result);
        }
        res.send(results);
    })();
});

// 거래소 데이터 전달
router.get('/market', (req, res) => {
    (async() => {
        let items = req.query.items;
        let results = [];
        let page = await browser.newPage();

        await page.goto('https://lostark.game.onstove.com/Market');

        for (let item of items) {
            let result = await GetPrice(page, item);
            results.push(result);
        }

        await page.close();
        res.send(results);
    })();
});

// DEBUG
router.get('/jewel', (req, res) => {
    let jewels = [
        '10레벨 멸화', '10레벨 홍염'
    ];
    let results = [];

    (async() => {
        for (let jewel of jewels) {
            let result = await GetLowPrice(jewel);
            results.push(result);
        }
        res.send(results);
    })();
});
// DEBUG
router.get('/markettest', (req, res) => {
    (async() => {
        res.send(await GetPrice('빛나는 정령의 회복약'));
    })();
});

module.exports = router;