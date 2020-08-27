const fs = require('fs');
const  puppeteer = require('puppeteer');
const  link = 'https://meduza.io/';

const parseNewsWebView =async click =>{
    try {
        let browser = await puppeteer.launch({headless: true, slowMo:100,devtools:true});
        let page = await browser.newPage();
        await page.setViewport({width: 1200,height:800});
        await page.goto(link,{waitUntil:"domcontentloaded"});
        const selector = await page.$('div.InfoPanel-switcher');
        await selector.click();
        await page.waitForSelector("div.Chronology-wrapper");
        for (let i=0;i < click; i++){
            const button = await page.$("button.Button-root.Button-default.Button-gold");
            await button.click();
        }
        let html = await page.evaluate(async ()=>{
            let res = [];
            let container = await document.querySelectorAll("div.Chronology-item");

            await container.forEach(item =>{
                let title = item.querySelector("div.ChronologyItem-header strong").innerText;
                let time = item.querySelector("time.Timestamp-root").innerText;
                let link = item.querySelector("a.ChronologyItem-link").href;
                let img;
                try{
                     img= item.querySelector("div.ChronologyItem-image").getAttribute('style');

                }catch (e) {
                    img = null;
                }
                res.push({
                    title, time, link,img
                })

            });
            return res;
        });

        for (let i=0; i<html.length; i++){
            await page.goto(html[i].link,{waitUntil:"domcontentloaded"});
           // await page.waitForSelector("div.GeneralMaterial-article").catch(e=>console.log(e));
            console.log(i);
            html[i]['text']= await page.evaluate(async () => {
                let article;
                let text=null;
                try {
                    //article = document.querySelector("p.SimpleBlock-p").innerText;

                    article = document.querySelectorAll("div.GeneralMaterial-article p");
                    for(let i=0;i<article.length;i++){
                        text+=article[i].textContent;
                    }

                } catch (e) {
                    console.log(e);
                }
                return text;
            });
        }
        console.log("Length:",html.length);
        await browser.close();

        fs.writeFile("medusa.json", JSON.stringify(html),function (err) {
            if(err) throw err;
            console.log("Saved medusa.json file");
        });
    }catch (e) {
        console.log(e);
    }
};
parseNewsWebView(0);

