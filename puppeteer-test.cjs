const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  let nudgeLog = null;

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('NUDGE CHECK:')) {
      nudgeLog = text;
    }
  });

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

    // Wait for the toggle
    await page.waitForSelector('button[aria-label*="Reasoning Mode"]');
    
    // Check if it's ON and click it
    const toggleAria = await page.$eval('button[aria-label*="Reasoning Mode"]', el => el.getAttribute('aria-label'));
    if (toggleAria.includes('ON')) {
      await page.click('button[aria-label*="Reasoning Mode"]');
      await new Promise(r => setTimeout(r, 500));
    }

    // Type the prompt
    await page.type('#live-chat-input', 'Should I hire a designer or work with a freelancer for my early stage product?');

    // Click send
    await page.click('#live-send-btn');

    // Wait for API and log
    await new Promise(r => setTimeout(r, 8000));

    console.log('---- CAPTURED NUDGE CHECK OUTPUT ----');
    console.log(nudgeLog || "NO LOG CAPTURED");
    console.log('-------------------------------------');

  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
    process.exit(0);
  }
})();
