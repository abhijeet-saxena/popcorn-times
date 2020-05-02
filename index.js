const express = require("express");
const puppeteer = require("puppeteer");
const app = express();
const cors = require("cors");

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static("public"));
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

      let icons = document.querySelectorAll(
        ".price-comparison__grid__row__element a img"
      );

      const posterElement =
        document.querySelector(
          ".title-poster.title-poster--no-radius-bottom img"
        ) || {};

      poster = posterElement.src;

      for (let i = 0; i < elements.length; i++) {
        const url = new URL(
          decodeURIComponent(elements[i].getAttribute("href"))
        );
        const provider = elements[i].childNodes[0].getAttribute("alt");
        const providerUrl = url.searchParams.get("r");
        const alreadyExists = ottProviders.some(
          (item) => item.provider === provider
        );

        if (!alreadyExists) {
          ottProviders.push({
            provider,
            url: providerUrl,
            icon: icons[i].getAttribute("src"),
          });
        }
      }
      return { ottProviders, poster };
    });
    await page.close();
    return scrappedInfo;
  } catch (e) {
    await page.close();
    return [
      {
        poster: "N/A",
        url: "N/A",
        provider: "No Streamer available. Check title.",
      },
    ];
  }
};

// Landing page Route
app.get("/", (req, res) => {
  res.render("home");
});

app.use(initPuppeteer);

// API Route to seatch for a title
app.get("/search", async (req, res) => {
  let { titles, json } = req.query;
  titles = titles.split(",").map((item) => item.trim());
  const slugifiedTitles = titles.map((item) => item.replace(/[\s]+/g, "-"));
  const returnObj = { data: [], results: 0 };

  for (let i = 0; i < slugifiedTitles.length; i++) {
    if (slugifiedTitles[i] === "") continue;
    const page = await browser.newPage();
    const { poster = "N/A", ottProviders = [] } = await scrape(
      slugifiedTitles[i],
      page
    );
    if (ottProviders.length) returnObj.results++;
    returnObj.data.push({ title: titles[i], poster, ottProviders });
  }

  if (json) res.json(returnObj);
  else
    res.render("results", { data: returnObj.data, results: returnObj.results });
});

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
