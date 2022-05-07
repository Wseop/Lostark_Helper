const express = require('express');
const router = express.Router();
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const schedule = require('node-schedule');
const fs = require('fs');
require('dotenv').config();
const db = require('./db.js');
const webLoa = require('./web-loa.js');
const time = require('./format-time.js');

let exchange = {};
const categories = ['valuable', 'reforge', 'recovery', 'bomb', 'bombShine', 'util'];
let browser;

schedule.scheduleJob('*/10 * * * *', async () => {
    if (browser == null) {
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }

    await updateEngrave();
    for (let category of categories) {
        await updateExchange(category);
    }
});

async function updateExchange(category) {
    let items = [];
    const page = await browser.newPage();
    
    await webLoa.filterResource(page);
    await page.setCookie(webLoa.cookie);

    const params = JSON.parse(fs.readFileSync(__dirname + `/data/${category}.json`, 'utf-8'));
    for (let param of params) {
        if (param.type === 'market') {
            items.push(await exchange.getPriceFromMarket(page, {
                grade:param.grade, itemName:param.itemName
            }));
        } else if (param.type === 'auction') {
            items.push(await exchange.getPriceFromAuction(page, param.itemName));
        }
    }

    await db.client.collection(process.env.NAME_COLLECTION_EXCHANGE).updateOne({category:category}, {$set:{items:items}}, () => {
        console.log(`[${time.getTime()}] | [UPDATE_EXCHANGE] | ${category} updated`);
    });
    await page.close();
}
// 각인서 업데이트는 종류가 많아서 따로 구현
async function updateEngrave() {
    let engraves = [];
    const page = await browser.newPage();

    await webLoa.filterResource(page);
    await page.setCookie(webLoa.cookie);

    let url = `https://lostark.game.onstove.com/Market/List_v2?firstCategory=0&secondCategory=0&tier=0&grade=4&pageNo=1&isInit=false&sortType=7&itemName=각인서`;

    await page.goto(url);
    try {
        await page.waitForSelector('.pagination__last');
    } catch (e) {
        await webLoa.refreshCookie();
        await page.setCookie(webLoa.cookie);
        await page.goto(url);
    }

    let content = await page.content();
    let $ = cheerio.load(content);
    const pageCount = Number($('.pagination__last').attr('onclick').split(/.*?\(|\)/)[1]);
    const pageArr = Array.from({length: pageCount}, (v, i) => i + 1);

    for (let pageNo of pageArr) {
        url = `https://lostark.game.onstove.com/Market/List_v2?firstCategory=0&secondCategory=0&tier=0&grade=4&pageNo=${pageNo}&isInit=false&sortType=7&itemName=각인서`;

        await page.goto(url);
        try {
            await page.waitForSelector('#tbodyItemList');
        } catch (e) {
            await webLoa.refreshCookie();
            await page.setCookie(webLoa.cookie);
            await page.goto(url);
        }

        content = await page.content();
        $ = cheerio.load(content);
        
        const itemList = $('#tbodyItemList').children();
        for (let item of itemList) {
            let result = {};
            
            result['imgSrc'] = $(item).find('img').attr('src');
            result['name'] = $(item).find('.name').text();
            result['price'] = $($(item).find('.price')[2]).children('em').text();
            result['dataGrade'] = $(item).find('.grade').attr('data-grade');
            
            // 각인 효과 parsing
            let itemInfo = $(item).find('.grade > .slot').attr('data-key');
            itemInfo = JSON.parse(itemInfo);
            result['effect'] = itemInfo.Element_008.value.Element_001.toLowerCase();

            engraves.push(result);
        }
    }

    // 각인서 검색 결과를 공용, 직업으로 분류
    let common = [];
    let cls = [];

    for (let engrave of engraves) {
        if (engrave.name[0] === '[') {
            cls.push(engrave);
        } else {
            common.push(engrave);
        }
    }

    await db.client.collection(process.env.NAME_COLLECTION_EXCHANGE).updateOne({category:"engraveCommon"}, {$set:{items:common}}, () => {
        console.log(`[${time.getTime()}] | [UPDATE_EXCHANGE] | engraveCommon updated`);
    });
    await db.client.collection(process.env.NAME_COLLECTION_EXCHANGE).updateOne({category:"engraveClass"}, {$set:{items:cls}}, () => {
        console.log(`[${time.getTime()}] | [UPDATE_EXCHANGE] | engraveClass updated`);
    });

    await page.close();
}

// params : {grade, itemName}
exchange.getPriceFromMarket = async function (page, params) {
    const url = 'https://lostark.game.onstove.com/Market/List_v2';
    const param = `?firstCategory=0&secondCategory=0&tier=0&pageNo=1&isInit=false&sortType=7&grade=${params.grade}&itemName=${params.itemName}`;

    await page.goto(url + param);
    try {
        await page.waitForSelector('#tbodyItemList');
    } catch (e) {
        await webLoa.refreshCookie();
        await page.setCookie(webLoa.cookie);
        await page.goto(url + param);
    }

    const content = await page.content();
    const $ = cheerio.load(content);
    let result = {};

    result['imgSrc'] = $('#tbodyItemList > tr:nth-child(1) > td:nth-child(1) > div > span.slot > img').attr('src');
    result['name'] = $('#tbodyItemList > tr:nth-child(1) > td:nth-child(1) > div > span.name').text();
    result['price'] = $('#tbodyItemList > tr:nth-child(1) > td:nth-child(4) > div > em').text();
    result['dataGrade'] = $('#tbodyItemList > tr:nth-child(1) > td:nth-child(1) > div').attr('data-grade');
    
    return result;
}
exchange.getPriceFromAuction = async function (page, itemName) {
    const url = 'https://lostark.game.onstove.com/Auction/GetAuctionListV2';
    let param = `?sortOption.Sort=BUY_PRICE&sortOption.IsDesc=false&pageNo=1&itemName=${itemName}`;

    await page.goto(url + param);
    try {
        await page.waitForSelector('.pagination__last');
    } catch (e) {
        await webLoa.refreshCookie();
        await page.setCookie(webLoa.cookie);
        await page.goto(url + param);
    }

    let content = await page.content();
    let $ = cheerio.load(content);
    const pageCount = Number($('.pagination__last').attr('onclick').split(/.*?\(|\)/)[1]);
    const pageArr = Array.from({length: pageCount}, (v, i) => i + 1);
    let result = {};

    for (let pageNo of pageArr) {
        param = `?sortOption.Sort=BUY_PRICE&sortOption.IsDesc=false&pageNo=${pageNo}&itemName=${itemName}`;

        await page.goto(url + param);
        try {
            await page.waitForSelector('#auctionListTbody');
        } catch (e) {
            await webLoa.refreshCookie();
            await page.setCookie(webLoa.cookie);
            await page.goto(url + param);
        }

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

module.exports = exchange;