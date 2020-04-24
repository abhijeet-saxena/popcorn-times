const express = require("express");
const puppeteer = require("puppeteer");
const app = express();
const cors = require("cors");

const port = process.env.PORT || 3000;

app.use(cors());

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("home", { name: "a" });
});

let browser = null;

const initPuppeteer = async function (req, res, next) {
  if (!browser) {
    browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disk-cache-dir=./Temp/browser-cache-disk"],
    });
  }
  next();
};

app.use(initPuppeteer);

app.get("/search/:title", async (req, res) => {
  const { title } = req.params;
  let ottProviders = [];

  try {
    const page = await browser.newPage();

    await page.goto(`https://www.justwatch.com/in/tv-show/${title}`);
    await page.waitForSelector(".price-comparison__grid__row__element");

    // This will allow logging in dev environment
    if (process.env.TIER === "dev") {
      page.on("console", (consoleObj) => console.log(consoleObj.text()));
    }

    ottProviders = await page.evaluate(() => {
      let outputArray = [];
      let elements = document.querySelectorAll(
        ".price-comparison__grid__row__element a"
      );

      for (let element of elements) {
        const url = new URL(decodeURIComponent(element.getAttribute("href")));

        const provider = element.childNodes[0].getAttribute("alt");
        const providerUrl = url.searchParams.get("r");

        outputArray.push(provider);
        outputArray.push(providerUrl);
      }

      return outputArray;
    });

    await page.close();
  } catch (e) {
    console.log(e);
  }
  res.render("home", { ottProviders });
});

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
