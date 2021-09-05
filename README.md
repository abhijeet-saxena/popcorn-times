# Popcorn

<img src ="Logo.png" alt="Popcorn" />

A simple web crawler that searches OTT providers for a particular TV series or movie.

https://popcorn-times.netlify.app

## Technical Implementation

All info is gathered from https://www.justwatch.com/.
App levereges [Puppeteer](https://pptr.dev/) to scrape the information and [Node.js](https://nodejs.org/en/) and [Express](https://expressjs.com/) to spin up a simple server with [ejs](https://ejs.co/) as templating engine.

## JSON API Endpoint

https://api.abhijeetsaxena.in/popcorn?q=[slugified-search-string]

### Sample Response

```json
{
  "title": "Friends",
  "poster": "https://images.justwatch.com/poster/177294807/s332",
  "imdb": 8.9,
  "ottProviders": [
    {
      "provider": "Netflix",
      "icon": "https://www.justwatch.com/images/icon/207360008/s100",
      "url": "http://www.netflix.com/title/70153404"
    }
  ],
  "searchSuggestions": [
    null,
    "Friends",
    "Mitron",
    "Beaches",
    "Kya Kehna",
    "Friends",
    "Friends: The Reunion",
    "Friends (With Benefits)",
    "Friends with Benefits",
    "Friends from College"
  ]
}
```

### **Disclaimer**

All rights belong to their respective owners. I do not own any of this content. This app is meant for experimental/educational purposes only as a discovery platform with no commercial intent.

This website may contain copyrighted material, the use of which may not have been specifically authorized by the copyright owner. The material contained in this website is distributed without profit for educational purposes. Only small portions of the original work are being used and those could not be used easily to duplicate the original work.

If you wish to use any copyrighted material from this site for purposes of your own that go beyond ‘fair use’, you must obtain expressed permission from the copyright owner.

Made with ️❤︎ by **[Abhijeet](https://abhijeetsaxena.in/ "Abhijeet Saxena")**
