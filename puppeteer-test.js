import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const logs = [];
  page.on('console', async msg => {
    try {
      const args = await Promise.all(msg.args().map(arg => arg.jsonValue().catch(() => msg.text())));
      const text = args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ');
      if (text.includes('NUDGE') || text.includes('TIMER') || text.includes('RENDER CHECK') || text.includes('rl_dismissals') || text.includes('NETWORK') || text.includes('HTML output')) {
        logs.push(text);
      }
    } catch(e) {}
  });

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

    // Read the dismissal count from localStorage FIRST
    const dismissalCount = await page.evaluate(() => localStorage.getItem('rl_dismissals'));
    const reasoningMode = await page.evaluate(() => localStorage.getItem('rl_mode'));
    console.log('=== LOCALSTORAGE STATE ===');
    console.log('rl_dismissals:', dismissalCount);
    console.log('rl_mode:', reasoningMode);
    console.log('=========================');

    // Make sure Reasoning Mode is OFF
    const toggleAria = await page.$eval('button[aria-label*="Reasoning Mode"]', el => el.getAttribute('aria-label'));
    console.log('Toggle state before test:', toggleAria);
    if (toggleAria.includes('ON')) {
      await page.click('button[aria-label*="Reasoning Mode"]');
      await new Promise(r => setTimeout(r, 500));
      console.log('Turned Reasoning Mode OFF');
    }

    // Send a fresh non-correction prompt
    await page.type('#live-chat-input', "I'm a founder with 12 engineers. Should I hire a VP of Engineering or promote my best senior engineer?");
    await page.click('#live-send-btn');

    // Wait for full API response + nudge timer
    await new Promise(r => setTimeout(r, 8000));

    console.log('\n=== ALL RELEVANT CONSOLE LOGS ===');
    logs.forEach(l => console.log(l));
    console.log('=================================');

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
    process.exit(0);
  }
})();
