const express = require("express");
const puppeteer = require("puppeteer");
const app = express();
const cors = require("cors");

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static("public"));
app.set("view engine", "ejs");

const localeAndSearchMap = new Map([
  ["in", "search"],
  ["us", "search"],
  ["uk", "search"],
  ["ca", "search"],
  ["au", "search"],
  ["fr", "recherche"],
  ["de", "Suche"],
  ["it", "cerca"],
  ["es", "buscar"],
]);

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

const scrape = async (title, locale, type, page) => {
  const searchAlias = localeAndSearchMap.get(locale) || "search";
  let searchURL = `https://www.justwatch.com/${locale}/${searchAlias}?q=${title}`;
  if (type === "show" || type === "movie") searchURL += `&content_type=${type}`;

  try {
    // This will allow logging in dev environment
    if (process.env.TIER === "dev") {
      page.on("console", (consoleObj) => console.log(consoleObj.text()));
    }

    await page.goto(searchURL);

    await page.waitForSelector(".title-list-row__row__title", {
      timeout: 10000,
    });

    const scrappedInfo = await page.evaluate(async () => {
      const ottProviders = [];

      const posterElement =
        document.querySelector(".title-poster__image") || {};
      const poster = posterElement.src.replace("s166", "s332");

      const titles =
        document.querySelectorAll(".title-list-row__row__title") || [];
      const titleYear =
        document.querySelectorAll(".title-list-row__row--muted") || [];
      let searchSuggestions = [];

      for (let i = 1; i < titles.length; i++) {
        searchSuggestions.push({
          titleName: titles[i].innerText,
          titleYear: titleYear[i].innerText,
        });
      }

      const elements = document.querySelector(".monetizations").children;
      for (let i = 0; i < elements.length; i++) {
        const innerElements = elements[i].children[1].children;
        for (let ii = 0; ii < innerElements.length; ii++) {
          const link = innerElements[ii].childNodes[0].childNodes[0];
          const url = new URL(decodeURIComponent(link.href));
          const provider = link.childNodes[0].getAttribute("alt");
          const icon = link.childNodes[0].getAttribute("src");
          const providerUrl = url.searchParams.get("r");

          const alreadyExists = ottProviders.some(
            (item) => item.provider === provider
          );

          if (!alreadyExists)
            ottProviders.push({
              provider,
              icon,
              url: providerUrl,
            });
        }
      }

      return { ottProviders, poster, searchSuggestions };
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

// API Route to search for title/s
app.get("/search", async (req, res) => {
  let { titles = "", json = false, locale = "in", type = "all" } = req.query;
  titles = titles.split(",").map((item) => item.trim());
  const slugifiedTitles = titles.map((item) => encodeURIComponent(item));
  const returnObj = { data: [], results: 0 };

  for (let i = 0; i < slugifiedTitles.length; i++) {
    if (slugifiedTitles[i] === "") continue;
    const page = await browser.newPage();
    let {
      poster = "N/A",
      ottProviders = [],
      searchSuggestions = [],
    } = await scrape(slugifiedTitles[i], locale, type, page);
    if (ottProviders.length) returnObj.results++;

    searchSuggestions = searchSuggestions.map((item) => {
      item.titleLink = `/search?locale=${locale}&titles=${item.titleName}&type=${type}`;
      return item;
    });

    returnObj.data.push({
      title: titles[i],
      poster,
      ottProviders,
      searchSuggestions,
    });
  }

  if (json) res.json(returnObj);
  else
    res.render("results", { data: returnObj.data, results: returnObj.results });
});

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
