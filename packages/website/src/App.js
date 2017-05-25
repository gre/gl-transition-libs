//@flow
import React, { Component } from "react";
import { Route, NavLink, Switch, Link } from "react-router-dom";
import "./App.css";
import Gallery from "./Gallery";
import Edit from "./Edit";
import EditNew from "./EditNew";
import Intro from "./Intro";
import NotFound from "./NotFound";
import { transitionsByName } from "./data";
import { githubRepoPath } from "./conf";

const renderEditor = (props: *) => {
  const { name } = props.match.params;
  if (name in transitionsByName) {
    return <Edit {...props} name={name} />;
  }
  if (name) {
    return <NotFound {...props} />;
  }
  return <EditNew {...props} />;
};

class App extends Component {
  render() {
    return (
      <div className="App">
        <header>
          <Link to="/">
            <h1 className="logo">
              <span>GL</span>
              <span>Transitions</span>
            </h1>
          </Link>
          <nav>
            <NavLink exact to="/gallery">Gallery</NavLink>
            <NavLink to="/transition/new">Editor</NavLink>
          </nav>
          <div style={{ flex: 1 }} />
          <div className="external">

            <a
              href={"https://github.com/" + githubRepoPath}
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa fa-github" />
              <span> gl-transitions</span>
            </a>
            <a
              href="https://github.com/gre/gl-transition-libs/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fa fa-bug" />
              <span> Found a Bug?</span>
            </a>
          </div>
        </header>
        <main>
          <Switch>
            <Route exact path="/" component={Intro} />
            <Route path="/gallery" component={Gallery} />
            <Route path="/transition/new" component={renderEditor} />
            <Route path="/transition/:name" component={renderEditor} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    );
  }
}

export default App;
