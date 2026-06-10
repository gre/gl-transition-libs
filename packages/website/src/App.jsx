import React, { Component } from "react";
import {
  Route,
  Routes,
  NavLink,
  Link,
  useParams,
  useLocation,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import Gallery from "./Gallery";
import Edit from "./Edit";
import Preview from "./Preview";
import EditNew from "./EditNew";
import Intro from "./Intro";
import NotFound from "./NotFound";
import { transitionsByName } from "./data";
import { githubRepoPath } from "./conf";
import { FaGithub } from "react-icons/fa";
import { FaBug } from "react-icons/fa";

function PreviewRoute() {
  const { name } = useParams();
  if (name in transitionsByName) {
    return <Preview name={name} />;
  }
  return <NotFound />;
}

function EditorRoute() {
  const { name } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  if (name in transitionsByName) {
    return (
      <Edit key={name} name={name} location={location} navigate={navigate} />
    );
  }
  if (name) {
    return <NotFound />;
  }
  return <EditNew location={location} navigate={navigate} />;
}

function GalleryRoute() {
  const location = useLocation();
  const navigate = useNavigate();
  return <Gallery location={location} navigate={navigate} />;
}

class App extends Component {
  render() {
    return (
      <div className="App">
        <header>
          <Link to="/">
            <h1 className="logo">
              <span>GL</span>
              <span>
                T<span className="full">ransitions</span>
              </span>
            </h1>
          </Link>
          <nav>
            <NavLink end to="/gallery">
              Gallery
            </NavLink>
            <NavLink to="/editor">Editor</NavLink>
          </nav>
          <div style={{ flex: 1 }} />
          <div className="external">
            <a
              href={"https://github.com/" + githubRepoPath}
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGithub />
              <span>&nbsp;gl-transitions</span>
            </a>
            <a
              href="https://github.com/gre/gl-transition-libs/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaBug />
              <span>&nbsp;Found a Bug?</span>
            </a>
          </div>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Intro />} />
            <Route path="/gallery" element={<GalleryRoute />} />
            <Route path="/editor" element={<EditorRoute />} />
            <Route path="/editor/:name" element={<EditorRoute />} />
            <Route path="/transition/:name" element={<PreviewRoute />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    );
  }
}

export default App;
