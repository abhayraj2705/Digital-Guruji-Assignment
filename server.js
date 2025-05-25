// server.js
const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Serve static files

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Screenshot endpoint
app.post('/screenshot', async (req, res) => {
    let browser;
    
    try {
        const { url } = req.body;
        
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        console.log(`Taking screenshot of: ${url}`);

        // Enhanced browser options for Render deployment
        const browserOptions = {
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--single-process',
                '--disable-extensions',
                '--disable-background-timer-throttling',
                '--disable-backgrounding-occluded-windows',
                '--disable-renderer-backgrounding'
            ]
        };

        // Only set executablePath if environment variable is provided
        if (process.env.PUPPETEER_EXECUTABLE_PATH) {
            browserOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
        }

        console.log('Launching browser with options:', { 
            headless: browserOptions.headless, 
            executablePath: browserOptions.executablePath || 'default' 
        });

        browser = await puppeteer.launch(browserOptions);

        const page = await browser.newPage();
        
        // Set viewport size
        await page.setViewport({
            width: 1200,
            height: 800,
            deviceScaleFactor: 1
        });

        // Navigate to the URL with timeout
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait a bit for any animations to complete
        await page.waitForTimeout(1000);

        // Take screenshot
        const screenshot = await page.screenshot({
            type: 'png',
            fullPage: true
        });

        // Set response headers
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Content-Disposition', 'attachment; filename="screenshot.png"');
        
        // Send screenshot
        res.send(screenshot);
        
        console.log('Screenshot taken successfully');

    } catch (error) {
        console.error('Error taking screenshot:', error);
        res.status(500).json({ 
            error: 'Failed to take screenshot',
            details: error.message,
            browserPath: process.env.PUPPETEER_EXECUTABLE_PATH || 'bundled',
            timestamp: new Date().toISOString()
        });
    } finally {
        if (browser) {
            await browser.close();
            console.log('Browser closed');
        }
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Screenshot service is running',
        port: PORT,
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Screenshot service is ready!');
    console.log('Puppeteer executable path:', process.env.PUPPETEER_EXECUTABLE_PATH || 'bundled');
});