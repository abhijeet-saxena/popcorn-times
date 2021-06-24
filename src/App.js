import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Home from "./Home";
import Results from "./Results";

function App() {
  return (
    <div className="container">
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
    </div>
  );
}

export default App;
