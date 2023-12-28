const express = require('express')
const { Cluster } = require('puppeteer-cluster');
const fs = require('fs').promises;

let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    chrome = require("chrome-aws-lambda");
    puppeteer = require("puppeteer-core");
} else {
    puppeteer = require("puppeteer");
}

let product = [];
const nrk = (async () => {
    let addresses = ["./ke/nrk/the-hub-karen.json", "./ke/nrk/maiyan-mall-rongai.json", "./ke/nrk/galleria-mall.json"];

    for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i];

        if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
            const cluster = await Cluster.launch({
                concurrency: Cluster.CONCURRENCY_PAGE,
                maxConcurrency: 10,
                options: {
                    args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
                    defaultViewport: chrome.defaultViewport,
                    executablePath: await chrome.executablePath,
                    headless: true,
                    ignoreHTTPSErrors: true,
                }
            })

            await cluster.task(async ({ page, data: url }) => {

                //Prevent from loading images, styles and fonts
                await page.setRequestInterception(true);
                page.on('request', (req) => {
                    if (req.resourceType() == 'stylesheet' || req.resourceType() == 'font' || req.resourceType() == 'image') {
                        req.abort();
                    }
                    else {
                        req.continue();
                    }
                });

                //Load cookies
                const cookiesString = await fs.readFile(`${address}`);
                const cookies = JSON.parse(cookiesString);
                await page.setCookie(...cookies);

                await page.goto(url, { waitUntil: 'networkidle0' }); //Go to the search link of the first product

                //Extract the title name of the product and its price
                try {
                    const productHandles = await page.$$('.store__body__dynamic-content');
                    for (const productHandle of productHandles) {
                        const locationHandles = await page.waitForXPath('//*[@id="user-address"]');
                        location = await page.evaluate
                            (el => el.querySelector('#user-address > div > div')
                                .textContent, locationHandles)

                        title = await page.evaluate
                            (el => el.querySelector('.product-row__content > div > div.product-row__name')
                                .textContent, productHandle)

                        price = await page.evaluate
                            (el => el.querySelector('.product-price__effective.product-price__effective--new-card')
                                .textContent, productHandle)

                        product.push({ "city": "NRK", "address": location, "title": title, "price": price })
                        //console.log({ "city": "NRK", "address": location, "title": title, "price": price })
                    }
                } catch (error) {
                    product.push({ "city": "NRK", "address": location, "title": url.split("=").pop() + ' Not Found', "price": '-' });
                    //console.log({ "city": "NRK", "address": location, "title": url.split("=").pop() + ' Not Found', "price": '-' });
                }

                await page.waitForNavigation({ waitUntil: 'networkidle0' });

                await browser.close();

            });

            cluster.queue('https://glovoapp.com/ke/en/ngong-rongai-karen/kfc-nrk?search=Rice Bliss');
            cluster.queue('https://glovoapp.com/ke/en/ngong-rongai-karen/kfc-nrk?search=Streetwise 2');
            cluster.queue('https://glovoapp.com/ke/en/ngong-rongai-karen/kfc-nrk?search=Streetwise 3');
            cluster.queue('https://glovoapp.com/ke/en/ngong-rongai-karen/kfc-nrk?search=Streetwise 5');
            cluster.queue('https://glovoapp.com/ke/en/ngong-rongai-karen/kfc-nrk?search=Streetwise 7');
            cluster.queue('https://glovoapp.com/ke/en/ngong-rongai-karen/kfc-nrk?search=KFC Krusher');
            cluster.queue('https://glovoapp.com/ke/en/ngong-rongai-karen/kfc-nrk?search=Double Crunch Burger');

            // List of product search pages

            await cluster.idle();
            await cluster.close();
        }
    }
})();
const app = express()

module.exports = { nrk, product };
