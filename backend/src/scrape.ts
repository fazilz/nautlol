import puppeteer from 'puppeteer'
import { Unit, UnitModel } from './entity/Unit';
import { Attribute } from './entity/Attribute';
import { Patch, PatchModel } from './entity/Patch';
import { mongoose } from '@typegoose/typegoose';

function processSingleUnit(unit: Element, patch: string): Unit {
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
    const changes : Attribute[] = children.slice(3).map(processAttributeChange).filter((e): e is Attribute => !!e);
    console.log("processed: ", title);
    return {
        title,
        context,
        changes,
        patch
    };
}

function processAttributeChange(attribute: Element): Attribute | undefined {
    const children = Array.from(attribute.children);
    // Usual Case: we have attribute, attribute-before, change-indicator and attribute-after
    // Some Cases: only 2, usually attribute and attribute-after for changes
    //             only 2, usually attribute and attribute-removed for removals
    if (children.length > 0){
        if (children.length == 4) {
            return {
                attribute: (children[0] as HTMLElement).innerText,
                before: (children[1] as HTMLElement).innerText,
                after: (children[3] as HTMLElement).innerText
            };
        }
        return {
            attribute: (children[0] as HTMLElement).innerText,
            before: (children[1] as HTMLElement).innerText
        };
    }
    return undefined;
}

function processMultipleUnitBlock (block: Element, patch: string) : Unit[] {
    let elements = Array.from(block.children);
    const context = (elements[1] as HTMLElement).innerText;
    if (elements[0].tagName == 'A')
        return [];
    elements = elements.slice(3);
    let unit: Unit = {
        title: '',
        context,
        changes: <Attribute[]>[],
        patch
    };
    let units: Unit[] = [];
    elements.forEach((element) => {
        if (element.tagName === "H4" || element.tagName === "H3"){
            unit.title = (element as HTMLElement).innerText.toLowerCase();
            console.log("processed ", unit.title);
        } else if (element.tagName === "DIV"){
            const c = processAttributeChange(element);
            if (c)
                unit.changes.push(c);
        } else {
            // HR divider
            units.push(unit);
            unit = {...unit, changes: <Attribute[]>[]};
        }
    });
    // last unit doesn't have HR divider so doesn't get added
    units.push(unit);
    return units;
}

function unitStructure(item: Element, patch: string) {
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


function processUnits(header: Element, patch: string){
    let itemElements: Element[] = [];
    while (header.nextElementSibling != null && header.nextElementSibling.className !== 'header-primary') {
        header = header.nextElementSibling;
        itemElements.push(header);
    }
    let units: Unit[] = [];
    itemElements.forEach((item) => {
        const processed = unitStructure(item, patch);
        if (Array.isArray(processed)){
            units = units.concat(processed);
        } else if (processed !== null){
            units.push(processed);
        }
    });
    return units;
}


export const scrape = async (URL: string, patch: string) => {
    console.log(`entering ${URL}`)
    const browser = await puppeteer.launch();
    console.log('started puppeteer')
    const page = await browser.newPage();
    await page.setViewport({
        width: 1200, height: 800,
        deviceScaleFactor: 1
    });
    await page.goto(URL, {waitUntil: 'networkidle2'});
    const page_exists = await page.evaluate(() => (document.getElementsByTagName('h1').length > 0));
    if (!page_exists){
        return false;
    }
    // await page.exposeFunction('getUnits', e => getUnits(e));
    await page.addScriptTag({
        content: `${processUnits} ${unitStructure} ${processSingleUnit} ${processMultipleUnitBlock} ${processAttributeChange}`
    });
    const items = await page.evaluate((patch) => {
        const titles = document.querySelectorAll(".header-primary");
        const itemHeader = Array.from(titles).filter((e) => {
            return (e as HTMLElement).innerText.toLowerCase() === 'items'
        })[0];
        if (itemHeader.nextElementSibling != null){
            return processUnits(itemHeader.nextElementSibling, patch);
        }
        return [];
    }, patch);
    browser.close();
    UnitModel.insertMany(items).then(()=>{
        console.log(`inserted ${items.length} items, for url: ${URL}`);
    });
    return true;
};

(async () => {
    await mongoose
    .connect("mongodb://127.0.0.1:27017", { useNewUrlParser: true, dbName: 'nautlol', useUnifiedTopology: true})
    .then(()=>{
      console.log('connected to mongodb')
    });
    let patch_minor = 1;
    let loop = true;
    while(loop) {
        let URL = `https://na.leagueoflegends.com/en-us/news/game-updates/patch-11-${patch_minor}-notes/`;
        loop = await scrape(URL, `11.${patch_minor}`);
        patch_minor += 1;
    };
})();
