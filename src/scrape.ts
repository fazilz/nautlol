import puppeteer from 'puppeteer'

function itemStructure(item: Element) {
    // remove the outer .content-border div
    // remove the .patch-change-block div
    // container div (no class or id) with the following structure:
    // anchor  with the item image
    // h3 -- item title
    // blockquote -- context of the change
    // list of divs with attribute changes
        // each div has a number of spans (this is variable)
    console.log(item);
}


function getItems(header: Element ){
    let itemElements: Element[] = [];
    while (header.nextElementSibling != null && header.nextElementSibling.className !== 'header-primary') {
        header = header.nextElementSibling;
        itemElements.push(header);
    }
    return itemElements;
}

(async () => {
    const browser = await puppeteer.launch({headless: false})
    const page = await browser.newPage();
    const URL = 'https://na.leagueoflegends.com/en-us/news/game-updates/patch-11-1-notes/';
    await page.setViewport({
        width: 1200, height: 800,
        deviceScaleFactor: 1
    });
    await page.goto(URL, {waitUntil: 'networkidle2'})
    const items = await page.evaluate(() => {
        const titles = document.querySelectorAll(".header-primary");
        const itemHeader = Array.from(titles).filter((e) => {
            return (e as HTMLElement).innerText.toLowerCase() === 'items'
        })[0];
        console.log(itemHeader);
        if (itemHeader.nextElementSibling != null)
            return getItems(itemHeader.nextElementSibling);
        else
            return [];
    });
    console.log(items);
    // await browser.close();
})();