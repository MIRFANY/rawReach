
const express = require('express');
const mongoose = require("mongoose");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const cron = require('node-cron');
const MandiPrice = require("./models/MandiPrice");

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Configure EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection with Pooling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mandiDB", {
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 30000
    });
    console.log("✅ MongoDB Connected");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  }
};

// Excel Downloader
const downloadExcel = async (url, downloadDir) => {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();

  try {
    // Configure downloads
    const client = await page.target().createCDPSession();
    await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: downloadDir
    });

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.click('#exportButton');
    await new Promise(resolve => setTimeout(resolve, 10000)); // Wait for download

    // Get latest downloaded file
    const files = fs.readdirSync(downloadDir)
      .filter(file => file.match(/\.xlsx?$/i))
      .sort((a,b) => 
        fs.statSync(path.join(downloadDir,b)).mtimeMs - 
        fs.statSync(path.join(downloadDir,a)).mtimeMs
      );

    return path.join(downloadDir, files[0]);
  } finally {
    await browser.close();
  }
};

// Data Processor
const processData = async (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

  await MandiPrice.insertMany(data.map(row => ({
    Commodity: row["Commodity"],
    Variety: row["Variety"],
    State: row["State"],
    District: row["District"],
    Mandi: row["Mandi / Market"],
    MinPrice: row["Min Price"],
    ModalPrice: row["Modal Price"],
    MaxPrice: row["Max Price"],
    ArrivalDate: new Date(),
    Trend: row["Trend"]
  })));

  fs.unlinkSync(filePath); // Cleanup
};

// Daily Sync Job

const runDailySync = async () => {
  await MandiPrice.deleteMany({});
  console.log("\n⏳ Starting Daily Sync...");
  try {
    const downloadDir = path.join(__dirname, "downloads");
    if (!fs.existsSync(downloadDir)) fs.mkdirSync(downloadDir);

    const filePath = await downloadExcel(
      `https://www.kisandeals.com/mandiprices/ALL/ALL/ALL`,
      downloadDir
    );

    await processData(filePath);
    console.log("✅ Sync Completed at", new Date().toLocaleTimeString());
  } catch (err) {
    console.error("❌ Sync Failed:", err);
  }
};

// Express Routes
app.get('/', (req, res) => res.redirect('/mandi-prices'));

app.get('/mandi-prices', async (req, res) => {
  try {
    const { page = 1, commodity, state, district } = req.query;
    const limit = 50;
    const skip = (page - 1) * limit;

    const filter = {};
    if (commodity) filter.Commodity = new RegExp(commodity, 'i');
    if (state) filter.State = new RegExp(state, 'i');
    if (district) filter.District = new RegExp(district, 'i');

    const [prices, count] = await Promise.all([
      MandiPrice.find(filter)
        .sort({ ArrivalDate: -1 })
        .skip(skip)
        .limit(limit),
      MandiPrice.countDocuments(filter)
    ]);

    res.render('mandi-prices', {
      prices,
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      filters: { commodity, state, district }
    });
  } catch (err) {
    console.error("Route Error:", err);
    res.status(500).render('error');
  }
});


// Startup Sequence
const startServer = async () => {
  await connectDB();
  
  // Initial sync
  await runDailySync(); 
  
  // Schedule daily at 8 AM IST
  cron.schedule('0 8 * * *', runDailySync, {
    timezone: "Asia/Kolkata"
  });
  console.log("⏰ Auto-sync scheduled for 8 AM daily");

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

// Graceful Shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log("🛑 Server stopped gracefully");
  process.exit(0);
});

startServer().catch(err => {
  console.error("🔥 Fatal Startup Error:", err);
  process.exit(1);
});