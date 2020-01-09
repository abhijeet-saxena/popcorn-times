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

app.get("/search/:title", async (req, res) => {
  const { title } = req.params;

  let ottProviders = [];

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(`https://www.justwatch.com/in/tv-show/${title}`);

    await page.waitForSelector(".price-comparison__grid__row__element");

    page.on("console", (consoleObj) => console.log(consoleObj.text()));

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

    await browser.close();
  } catch (e) {
    console.log(e);
  }
  res.render("home", { ottProviders });
});

app.listen(port, () => {
  console.log(`Server running at ${port}`);
});
