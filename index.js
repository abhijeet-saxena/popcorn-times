const express = require("express");
const puppeteer = require("puppeteer");
const app = express();
const cors = require("cors");

const port = process.env.PORT || 3000;

app.use(cors());
app.set("view engine", "ejs");

let browser = null;

const initPuppeteer = async function (req, res, next) {
  //Use singleton instance if browser already opened
  if (!browser) {
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disk-cache-dir=./Temp/browser-cache-disk"],
    });
  }
  next();
};

const scrape = async (title, page) => {
  const tvShowURL = `https://www.justwatch.com/in/tv-show/${title}`;
  const movieURL = `https://www.justwatch.com/in/movie/${title}`;

  try {
    // This will allow logging in dev environment
    if (process.env.TIER === "dev") {
      page.on("console", (consoleObj) => console.log(consoleObj.text()));
    }

    page.on("response", async (resp) => {
      if (resp.status() === 404 && resp.url().indexOf(movieURL) === -1)
        await page.goto(movieURL);
    });

    await page.goto(tvShowURL);

    await page.waitForSelector(".price-comparison__grid__row__element", {
      timeout: 10000,
    });

    const scrappedInfo = await page.evaluate(async () => {
      let outputArray = [];
      let elements = document.querySelectorAll(
        ".price-comparison__grid__row__element a"
      );

      for (let element of elements) {
        const url = new URL(decodeURIComponent(element.getAttribute("href")));

        const provider = element.childNodes[0].getAttribute("alt");
        const providerUrl = url.searchParams.get("r");

        if (outputArray.indexOf(provider) === -1) {
          outputArray.push(provider);
          outputArray.push(providerUrl);
        }
      }
      return outputArray;
    });
    await page.close();
    return scrappedInfo;
  } catch (e) {
    console.log(e.message);
    await page.close();
    return ["No Streamer available", "Check title"];
  }
};

// Landing page Route
app.get("/", (req, res) => {
  res.render("home");
});

app.use(initPuppeteer);

// API Route to seatch for a title
app.get("/search", async (req, res) => {
  let { title } = req.query;
  title = title.trim().replace(/[\s]+/g, "-");
  const page = await browser.newPage();
  const ottProviders = await scrape(title, page);

  res.json({ providers: ottProviders });
});

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
