const express = require("express");
const puppeteer = require("puppeteer");
const app = express();
const cors = require("cors");

app.use(cors());

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("home", { name: "a" });
});

app.get("/search/:title", async (req, res) => {
  const { title } = req.params;

  //   try {
  //     const browser = await puppeteer.launch();
  //     const page = await browser.newPage();

  //     await page.goto(`https://www.justwatch.com/in/tv-show/${title}`);

  //     await page.waitForSelector(".price-comparison__grid__row__element");

  //     page.on("console", (consoleObj) => console.log(consoleObj.text()));

  //     await page.evaluate(() => {
  //       let elements = document.querySelectorAll(
  //         ".price-comparison__grid__row__element a"
  //       );
  //       for (let element of elements) {
  //         const url = new URL(decodeURIComponent(element.getAttribute("href")));

  //         console.log(url.searchParams.get("r"));

  //         console.log(element.childNodes[0].getAttribute("alt"));
  //       }
  //     });

  //     await browser.close();
  //   } catch (e) {
  //     console.log(e);
  //   }
  res.render("home", { name: title });
});

app.listen(3000, () => {
  console.log(`Server running at 3000`);
});
