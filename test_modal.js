import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5173/#/transactions');
  await page.waitForSelector('button');
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text && text.includes('Tambah Transaksi')) {
      await btn.click();
      break;
    }
  }
  // Wait for the modal backdrop
  await page.waitForSelector('.fixed.inset-0', { timeout: 5000 });
  const bgStyles = await page.$eval('.fixed.inset-0', el => {
    const computed = window.getComputedStyle(el);
    return {
      top: computed.top,
      right: computed.right,
      bottom: computed.bottom,
      left: computed.left,
      width: computed.width,
      height: computed.height,
      position: computed.position
    };
  });
  console.log('Backdrop Styles:', bgStyles);
  await browser.close();
})();
