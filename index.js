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

const scrape = async (slugifiedTitle, page) => {
  const tvShowURL = `https://www.justwatch.com/in/tv-show/${slugifiedTitle}`;
  const movieURL = `https://www.justwatch.com/in/movie/${slugifiedTitle}`;

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
      const ottProviders = [];
      let elements = document.querySelectorAll(
        ".price-comparison__grid__row__element a"
      );

      for (let element of elements) {
        const url = new URL(decodeURIComponent(element.getAttribute("href")));
        const provider = element.childNodes[0].getAttribute("alt");
        const providerUrl = url.searchParams.get("r");
        const alreadyExists = ottProviders.some(
          (item) => item.provider === provider
        );

        if (!alreadyExists) {
          ottProviders.push({
            provider,
            url: providerUrl,
          });
        }
      }

      return ottProviders;
    });
    await page.close();
    return scrappedInfo;
  } catch (e) {
    await page.close();
    return [{ provider: "No Streamer available. Check title.", url: "N/A" }];
  }
};

// Landing page Route
app.get("/", (req, res) => {
  res.render("home");
});

app.use(initPuppeteer);

// API Route to seatch for a title
app.get("/search", async (req, res) => {
  let { titles } = req.query;
  titles = titles.split(",").map((item) => item.trim());

  const slugifiedTitles = titles.map((item) => item.replace(/[\s]+/g, "-"));

  const returnObj = { data: [] };
  for (let i = 0; i < slugifiedTitles.length; i++) {
    if (slugifiedTitles[i] === "") continue;
    const page = await browser.newPage();
    const ottProviders = await scrape(slugifiedTitles[i], page);
    returnObj.data.push({ title: titles[i], ottProviders });
  }

  res.json(returnObj);
});

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
