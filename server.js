// server.js
const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(express.json());

app.post('/screenshot', async (req, res) => {
    let browser = null;
    try {
        console.log('Starting screenshot process...');
        
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ],
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
        });

        console.log('Browser launched successfully');
        
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        
        const url = req.body.url;
        console.log('Taking screenshot of:', url);
        
        await page.goto(url, { waitUntil: 'networkidle0' });
        const screenshot = await page.screenshot();
        
        console.log('Screenshot taken successfully');
        
        res.set('Content-Type', 'image/png');
        res.send(screenshot);

    } catch (error) {
        console.error('Screenshot error:', error);
        res.status(500).json({ 
            error: 'Failed to take screenshot',
            details: error.message 
        });
    } finally {
        if (browser) {
            await browser.close();
            console.log('Browser closed');
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});