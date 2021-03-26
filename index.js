const { chromium } = require('playwright');
const axios = require('axios');

(async () => {
  const browser = await chromium.launch({
    headless: true,
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://symbolnodes.org/nodes/');

  const rowCount = await (await page.$$('//html/body/table[2]/tbody/tr'))
    .length;
  const ipList = new Array();
  for (let i = 2; i < rowCount; i++) {
    const ip = await (
      await page.$(`//html/body/table[2]/tbody/tr[${i}]/td[2]`)
    ).innerText();

    const superNode = await (
      await page.$(`//html/body/table[2]/tbody/tr[${i}]/td[4]`)
    ).innerText();

    const height = await (
      await page.$(`//html/body/table[2]/tbody/tr[${i}]/td[11]`)
    ).getAttribute('class');

    if (superNode == ' ☑' && height == 'd2') {
      ipList.push(ip.trim());
    }
  }
  // Close page
  await page.close();
  await context.close();
  await browser.close();

  console.log('=================');

  ipList.forEach((ip) => {
    const unlockedAccountUrl = `http://${ip}:3000/node/unlockedaccount`;
    axios
      .get(unlockedAccountUrl)
      .then(function (response) {
        const len = response.data['unlockedAccount'].length;
        if (len % 5 > 0 || len == 0) {
          console.log(`${ip} : ${len}`);
        }
      })
      .catch(function (error) {});
  });
})();
