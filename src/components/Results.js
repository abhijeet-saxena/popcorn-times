import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";

const Results = () => {
  const [result, setResult] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const {
    location: { search = "?q=" },
  } = useHistory();

  useEffect(() => {
    fetch(`https://itsrockyy-api.netlify.app/popcorn${search}`)
      .then((res) => res.json())
      .then((data) => {
        setResult(data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setError(true);
      });
  }, [search]);

  return (
    <>
      {error && <p> 💀 No Results found</p>}
      {!error && (
        <main>
          {loading ? (
            <div className="loader"></div>
          ) : (
            <>
              <div className="search-results">
                <div className="card">
                  <img
                    className="poster"
                    src={result.poster}
                    alt={result.title}
                  />
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
                    <svg
                      width="40"
                      clipRule="evenodd"
                      fillRule="evenodd"
                      strokeLinejoin="round"
                      strokeMiterlimit="1.41421"
                      viewBox="0 0 560 400"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g transform="matrix(.959488 0 0 .959488 88.1023 56.1247)">
                        <path
                          d="m387.6 224.3v-148.9c-1-7.9-7.2-14.2-15.1-15.5h-344.9c-8.6 1.4-15.2 8.8-15.2 17.8v144.3c0 9.9 8.1 18 18 18h339.2c9.3 0 16.8-6.8 18-15.7z"
                          fill="#f5c518"
                        />
                        <path
                          d="m63.1 94.7h28.4v109.2h-28.4zm88.8 0-6.6 51-4.1-27.7c-1.2-8.9-2.3-16.7-3.4-23.3h-36.8v109.2h24.8l.1-72.1 10.5 72.1h17.7l9.9-73.7.1 73.7h24.8v-109.2zm111.1 35.4v41.3c0 9.8-.5 16.3-1.5 19.6-.9 3.3-2.5 5.9-4.8 7.7-2.3 1.9-5.1 3.2-8.5 3.9s-8.5 1.1-15.3 1.1h-34.4v-109h21.2c13.7 0 21.6.6 26.5 1.9 4.8 1.3 8.5 3.3 11 6.2s4.1 6.1 4.7 9.6c0 .2.1.4.1.6.6 3.3 1 9 1 17.1zm-36 54.9c4.1 0 6.6-.8 7.5-2.5.9-1.6 1.4-6.1 1.4-13.4v-42.3c0-4.9-.2-8.1-.5-9.5s-1-2.4-2.2-3.1c-.6-.4-1.5-.6-2.7-.8-.3 0-.6-.1-1-.1-.8-.1-1.6-.1-2.6-.1v71.8zm109.9-36.8v30.6c0 6.5-.4 11.4-1.3 14.6s-3 6-6.2 8.3c-3.3 2.4-7.1 3.5-11.6 3.5-3.2 0-7.4-.7-10.2-2.1s-5.3-3.5-7.6-6.3l-1.8 7h-25.5v-109.1h27.3v35.5c2.3-2.6 4.8-4.6 7.6-5.9s7-1.9 10.2-1.9h.7c3.5.1 6.5.6 9.1 1.7 2.8 1.2 4.9 2.8 6.3 4.9s2.3 4.2 2.6 6.2c.3 2.1.4 6.4.4 13zm-36 39.3c.6 1.3 1.7 2 3.4 2s4-.7 4.5-2.1.8-4.7.8-10v-28c0-4.6-.3-7.6-.9-9s-2.9-2.1-4.6-2.1h-.3c-1.5.1-2.5.7-3 1.8-.5 1.2-.8 4.3-.8 9.3v28.8c0 4.8.3 7.9.9 9.3z"
                          fillRule="nonzero"
                        />
                      </g>
                    </svg>
                    <span>{result.imdb}</span>
                  </div>
                </div>
              </div>
            </>
          )}
          <div className="search-suggestions-links">
            {!loading && (
              <div className="search-suggestions">
                <h3>Similar Results</h3>
                {result.searchSuggestions.map((item, index) =>
                  item ? (
                    <a
                      key={item + index}
                      href={`/results${search}&index=${index}`}
                    >
                      {item}
                    </a>
                  ) : null
                )}
              </div>
            )}
          </div>
        </main>
      )}
    </>
  );
};

export default Results;
