import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Nav from "./components/Nav";
import Home from "./components/Home";
import Results from "./components/Results";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="container">
      <Nav />
      <Router>
        <Switch>
          <Route path="/results" exact>
            <Results />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </Router>
      <Footer />
    </div>
  );
}

export default App;
