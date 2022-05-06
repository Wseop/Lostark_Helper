const puppeteer = require('puppeteer');
const db = require('./db.js');

const URL_LOGIN = 'https://member.onstove.com/auth/login?redirect_url=https%3A%2F%2Flostark.game.onstove.com%2FMain';
const URL_MAIN = 'https://lostark.game.onstove.com/';

let webLoa = {};
let browser, page;

webLoa.refreshCookie = async function() {
    // 이미 열려있는 페이지(탭)가 있으면 닫고 새로 오픈
    if (browser != null) {
        await browser.close();
        browser = null;
    }
    browser = await puppeteer.launch(
        {
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        }
    );
    page = await browser.newPage();
    await page.goto(URL_LOGIN);
    await page.focus('#user_id');
    await page.keyboard.type(db.loginInfo.email);
    await page.focus('#user_pwd');
    await page.keyboard.type(db.loginInfo.pw);
    await page.click('#idLogin > div.row.grid.el-actions > button');
    await page.waitForNavigation();

    let cookies = await page.cookies(URL_MAIN);
    cookies.map((v, i) => {
        if (v.name === 'SUAT') {
            let cookie = {
                name: 'SUAT',
                value: null,
                domain: '.onstove.com'
            };
            cookie.value = v.value;
            webLoa['cookie'] = cookie;
        }
    });
    // session cookie 유지를 위해 page 열린채로 유지
}

webLoa.filterResource = async function(page) {
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
}

module.exports = webLoa;