# Popcorn

<img src ="Logo.png" alt="Popcorn" />

A simple web crawler that searches OTT providers for a particular TV series or movie.

https://popcorn-times.netlify.app

## Technical Implementation

All info is gathered from https://www.justwatch.com/.
App levereges [Puppeteer](https://pptr.dev/) to scrape the information and [Node.js](https://nodejs.org/en/) and [Express](https://expressjs.com/) to spin up a simple server with [ejs](https://ejs.co/) as templating engine.

## JSON API Endpoint

https://popcorn-times.netlify.app/search?titles=[slugified-search-string]&json=true

### Sample Response

```
{
  "data": [
    {
      "title": "friends",
      "poster": "https://images.justwatch.com/poster/177294807/s592",
      "ottProviders": [
        {
          "provider": "Netflix",
          "url": "http://www.netflix.com/title/70153404",
          "icon": "https://images.justwatch.com/icon/430997/s100"
        },
        {
          "provider": "Hotstar",
          "url": "http://www.hotstar.com/1000050598",
          "icon": "https://images.justwatch.com/icon/174849096/s100"
        }
      ]
    }
  ],
  "results": 1
}
```

## Google Sheets Integration

https://docs.google.com/spreadsheets/d/1iGvKRLYnDj2GIW1K2wy1bFPIfRF_4njw_69YuTmXcNQ/edit

<img src ="demo.gif" alt="Demo" />

### Script Code needed in Sheets

```
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Web Scraping Options')
  .addItem('Update All','updateProviders')
  .addItem('Clear All','clearProviders')
  .addToUi();
}

// This function will run whenever we want to clear all OTT provider info
function clearProviders() {
  var sheet = SpreadsheetApp.getActiveSheet();

  for(var row=2; row<=sheet.getLastRow();row++){
    var count = 2;
    for(var i=0; i<20;i++){
      sheet.getRange(row, count).setValue("");
      count++
    }
 }
}


// This function will run whenever we want to update all
function updateProviders() {
  var sheet = SpreadsheetApp.getActiveSheet();

  for(var row=2; row<=sheet.getLastRow();row++){
    var inputTitle = sheet.getRange(row, 2).getValue();
    if(inputTitle === "") continue;

    var apiResponse = UrlFetchApp.fetch("https://popcorn-times.herokuapp.com/search?titles="+inputTitle+"&json=true");
    var response = JSON.parse(apiResponse.getContentText());
    var providers = response.data[0].ottProviders

    var count = 3;
    for(var i=0; i<providers.length;i++){
      sheet.getRange(row, count).setValue(providers[i].provider ? providers[i].provider : '-');
      sheet.getRange(row, count+1).setValue(providers[i].url ? providers[i].url : '-');
      count += 2
    }
 }
}

// This function will run whenever we update a title
function runOnEdit(e) {
 if (e.range.columnStart !== 2 || !e.value || e.range.rowStart === 1) return;
 var inputTitle = e.range.getSheet().getActiveCell().getValue();
 var row = e.range.getSheet().getActiveCell().getRow();

 var apiResponse = UrlFetchApp.fetch("https://popcorn-times.herokuapp.com/search?titles="+inputTitle+"&json=true");
 var response = JSON.parse(apiResponse.getContentText());
 var providers = response.data[0].ottProviders

 var count = 3;
 for(var i=0; i<providers.length;i++){
   e.source.getActiveSheet().getRange(row, count).setValue(providers[i].provider ? providers[i].provider : '-');
   e.source.getActiveSheet().getRange(row, count+1).setValue(providers[i].url ? providers[i].url : '-');
   count += 2
 }
}
```

### **Disclaimer**

All rights belong to their respective owners. I do not own any of this content. This app is meant for experimental/educational purposes only as a discovery platform with no commercial intent.

This website may contain copyrighted material, the use of which may not have been specifically authorized by the copyright owner. The material contained in this website is distributed without profit for educational purposes. Only small portions of the original work are being used and those could not be used easily to duplicate the original work.

If you wish to use any copyrighted material from this site for purposes of your own that go beyond ‘fair use’, you must obtain expressed permission from the copyright owner.

Made with ️❤︎ by **[Abhijeet](https://abhijeetsaxena.in/ "Abhijeet Saxena")**
