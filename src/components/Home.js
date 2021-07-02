import React from "react";
import { useHistory } from "react-router-dom";

const Home = () => {
  const history = useHistory();

  const submitForm = (e) => {
    e.preventDefault();
    const [locale, q, type] = e.target.elements;

    history.push(
      `/results?q=${q.value}&locale=${locale.value}&type=${type.value}`
    );
  };

  return (
    <form onSubmit={submitForm}>
      <label htmlFor="titles">
        Enter TV Series / Movie Title to find out live stream providers:
      </label>
      <div className="input-group">
        <select name="locale" id="locale">
          <option value="en_IN">🇮🇳</option>
          <option value="en_US">🇺🇸</option>
          <option value="en_GB">🇬🇧</option>
          <option value="en_CA">🇨🇦</option>
          <option value="en_AU">🇦🇺</option>
        </select>
        <input
          type="text"
          name="q"
          id="q"
          placeholder="Ex. Friends"
          required
          autoComplete="off"
        />
        <select name="type" id="type">
          <option value="">📺 + 🎬</option>
          <option value="show">📺 TV</option>
          <option value="movie">🎬 Movie</option>
        </select>
      </div>
      <br />
      <button id="submit" type="submit">
        Search
      </button>
    </form>
  );
};

export default Home;
