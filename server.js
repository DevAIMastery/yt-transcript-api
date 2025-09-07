const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/:videoId', async (req, res) => {
  const videoId = req.params.videoId;
  const url = `https://youtubetotranscript.com/transcript?v=${videoId}`;

  let browser;
  try {
    // Puppeteer launch for Render
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process'
      ]
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const transcriptSelector = 'p.inline.NA.text-primary-content';
    await page.waitForSelector(transcriptSelector);

    const texts = await page.$$eval(transcriptSelector, els =>
      els.map(el => el.innerText)
    );

    console.log(`Transcript for video ${videoId}:`);
    console.log(texts.join('\n'));

    res.json({ success: true, videoId, transcript: texts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
