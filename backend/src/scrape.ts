import puppeteer from 'puppeteer'
import { Unit, UnitModel } from './entity/Unit';
import { PatchModel } from './entity/Patch';
import { mongoose } from '@typegoose/typegoose';

function processSingleUnit(unit: Element, patch: number){
    // unit div (no class or id) with the following structure:
    // anchor  with the item image
    // h3 -- item title
    // blockquote -- context of the change
    // list of divs with attribute changes
        // each div has a number of spans (this is variable)
    const children = Array.from(unit.children);
    //children [0] is the item image.
    const title = (children[1] as HTMLElement).innerText.toLowerCase();
    const context = (children[2] as HTMLElement).innerText;
    const changes = children.slice(3).map((e) => (e as HTMLElement).innerText);
    console.log("processed: ", title);
    return {
        title,
        context,
        changes,
        patch
    };
}

function processMultipleUnitBlock (block: Element, patch: number) {
    let elements = Array.from(block.children);
    const context = (elements[1] as HTMLElement).innerText;
    elements = elements.slice(3);
    // I wasn't able to find any docs on how to expose types to puppetteer.
    // HACK to make the type to work with puppeteer
    const UNIT_HACK = {
        title: '',
        context,
        changes: <string[]>[],
        patch
    }
    let unit = {...UNIT_HACK};
    let units: Unit[] = [];
    elements.forEach((element) => {
        if (element.tagName === "H4" || element.tagName === "H3"){
            unit.title = (element as HTMLElement).innerText.toLowerCase();
            console.log("processed ", unit.title);
        } else if (element.tagName === "DIV"){
            unit.changes.push((element as HTMLElement).innerText);
        } else {
            // HR divider
            units.push(unit);
            unit = {...UNIT_HACK, changes: <string[]>[]};
        }
    });
    // last unit doesn't have HR divider so doesn't get added
    units.push(unit);
    return units;
}

function unitStructure(item: Element, patch: number) {
    // remove the outer .content-border div
    // remove the .white-stone accent-before div
    const container = item.firstElementChild?.firstElementChild;
    // each change has a min. of 4 elements: title, image, context block, change details.
    const minElem = 4;
    if (container == undefined || container.children.length < minElem){
        console.log(item);
        console.log("item passed doesn't have the expected structure, patch: ", patch)
        return null;
    } else {
        // Minor changes following a certain "theme" are grouped together in a single section
        // the grouped section always has an H4 while the ungrouped ones dont.
        const isMultipleUnitBlock = Array.from(container.children).map((e) => e.tagName).includes('H4');
        if (isMultipleUnitBlock)
            return processMultipleUnitBlock(container, patch);
        else
            return processSingleUnit(container, patch);
    }
}


function processUnits(header: Element ){
    let itemElements: Element[] = [];
    while (header.nextElementSibling != null && header.nextElementSibling.className !== 'header-primary') {
        header = header.nextElementSibling;
        itemElements.push(header);
    }
    let units: Unit[] = [];
    itemElements.forEach((item) => {
        const processed = unitStructure(item, 11.1);
        if (Array.isArray(processed)){
            units = units.concat(processed);
        } else if (processed !== null){
            units.push(processed);
        }
    });
    return units;
}


export const scrape = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const base_URL = 'https://na.leagueoflegends.com/en-us/news/game-updates/patch-11-';
    const patch_minor = 1;
    const notes = 'notes/';
    let URL = base_URL + patch_minor + '-' + notes;
    await page.setViewport({
        width: 1200, height: 800,
        deviceScaleFactor: 1
    });
    await page.goto(URL, {waitUntil: 'networkidle2'});
    // await page.exposeFunction('getUnits', e => getUnits(e));
    await page.addScriptTag({content: `${processUnits} ${unitStructure} ${processSingleUnit} ${processMultipleUnitBlock}`});
    const items = await page.evaluate(() => {
        const titles = document.querySelectorAll(".header-primary");
        const itemHeader = Array.from(titles).filter((e) => {
            return (e as HTMLElement).innerText.toLowerCase() === 'items'
        })[0];
        if (itemHeader.nextElementSibling != null){
            return processUnits(itemHeader.nextElementSibling);
        }
        return [];
    });
    browser.close();
    UnitModel.insertMany(items).then(()=>{
        console.log(`inserted ${items.length} items, for patch: 11.1`);
    });
};

(async () => {
    await mongoose
    .connect("mongodb://127.0.0.1:27017", { useNewUrlParser: true, dbName: 'nautlol', useUnifiedTopology: true})
    .then(()=>{
      console.log('connected to mongodb')
    });
    scrape();
})();
