import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import imdb from "../assets/imdb-logo.png";

const Results = () => {
  const [result, setResult] = useState({});
  const [loading, setLoading] = useState(true);
  const {
    location: { search = "?q=" },
  } = useHistory();

  useEffect(() => {
    fetch(`https://itsrockyy-api.netlify.app/popcorn${search}`)
      .then((res) => res.json())
      .then((data) => {
        setResult(data);
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, [search]);

  return !loading ? (
    <main>
      <div className="search-results">
        <div className="card">
          <img className="poster" src={result.poster} alt={result.title} />
          <div className="links">
            {result.ottProviders.map((ott) => (
              <a
                target="_blank"
                href={ott.url}
                rel="noreferrer"
                key={ott.provider}
              >
                <img src={ott.icon} alt={ott.provider} />
              </a>
            ))}
          </div>
          <div className="imdb">
            <img width="24px" src={imdb} alt="imdbRating" />
            <span>{result.imdb}</span>
          </div>
        </div>
      </div>
      <div className="search-suggestions">
        <div className="search-suggestions-links">
          <h3>Similar Results</h3>
          {result.searchSuggestions.map((item, index) => (
            <a
              key={item + index}
              href={`/results?q=${item}&locale=en_IN&type=`}
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </main>
  ) : null;
};

export default Results;
