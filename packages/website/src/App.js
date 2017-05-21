//@flow
import React, { Component } from "react";
import { Redirect, Route, NavLink, Switch, Link } from "react-router-dom";
import "./App.css";
import Gallery from "./Gallery";
import Edit from "./Edit";
import EditNew from "./EditNew";
//import About from "./About";
import NotFound from "./NotFound";
import { transitionsByName } from "./data";

const notImpl = () => <Redirect to={{ pathname: "/gallery" }} />;

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
          <Link className="logo" to="/">
            <h1>
              <span>GL</span>
              <span>Transitions</span>
            </h1>
          </Link>
          <nav>
            <NavLink exact to="/gallery">Gallery</NavLink>
            <NavLink to="/editor">Editor</NavLink>
          </nav>
        </header>
        <main>
          <Switch>
            <Route exact path="/" component={notImpl /*About*/} />
            <Route path="/gallery" component={Gallery} />
            <Route path="/editor/:name" component={renderEditor} />
            <Route path="/editor" component={renderEditor} />
            <Route component={NotFound} />
          </Switch>
        </main>
      </div>
    );
  }
}

export default App;
