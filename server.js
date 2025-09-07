const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 3000;

app.get('/:videoId', async (req, res) => {
  const videoId = req.params.videoId;
  const url = `https://youtubetotranscript.com/transcript?v=${videoId}`;

  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'networkidle2' });

    // Wait for the <p> element
    await page.waitForSelector('p.inline.NA.text-primary-content');

    // Get all matching <p> elements
    const texts = await page.$$eval(
      'p.inline.NA.text-primary-content',
      elements => elements.map(el => el.innerText)
    );

    // Log to console
    console.log(`Transcript for video ${videoId}:`);
    console.log(texts.join('\n'));

    res.send({ success: true, videoId, transcript: texts });
  } catch (error) {
    console.error(error);
    res.status(500).send({ success: false, error: error.message });
  } finally {
    if (browser) await browser.close();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
