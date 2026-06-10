import React, { Component, PureComponent } from "react";
import { Link } from "react-router-dom";
import {
  transitionsOrderByCreatedAt,
  transitionsOrderByUpdatedAt
} from "./data";
import Vignette from "./Vignette";
import dateAgo from "./dateAgo";
import ScrollToTop from "./ScrollToTop";
import TransitionAuthorAndName from "./TransitionAuthorAndName";
import { FaExpand, FaSearch } from "react-icons/fa";
import "./Gallery.css";
import { fromImage, toImage } from "./galleryImages";

const footerForOrder = (getDate) =>
  class GalleryVignetteFooter extends PureComponent {
    render() {
      const { transition } = this.props;
      return (
        <div>
          <Link className="expand" to={"/transition/" + transition.name}>
            <FaExpand />
          </Link>
          <footer>
            <TransitionAuthorAndName transition={transition} />
            <span className="dateago">{dateAgo(getDate(transition))}</span>
          </footer>
        </div>
      );
    }
  };
const UpdatedFooter = footerForOrder(t => t.updatedAt);
const CreatedFooter = footerForOrder(t => t.createdAt);

class GalleryVignette extends PureComponent {
  render() {
    const { transition, order } = this.props;
    return (
      <Link to={"/editor/" + transition.name}>
        <Vignette
          transition={transition}
          from={fromImage}
          to={toImage}
          width={300}
          height={200}
          Footer={order === "updated" ? UpdatedFooter : CreatedFooter}
        />
      </Link>
    );
  }
}

function galleryPath(query, page) {
  const params = new URLSearchParams();
  if (query.order) params.set("order", query.order);
  if (query.q) params.set("q", query.q);
  if (page > 1) params.set("page", page);
  const search = params.toString();
  return "/gallery" + (search ? "?" + search : "");
}

class PageLink extends PureComponent {
  render() {
    const { page, current, query, children } = this.props;
    return (
      <Link
        className={page === current ? "active" : ""}
        to={galleryPath(query, page)}
      >
        {children}
      </Link>
    );
  }
}

// debounced: each URL change re-renders the grid, remounting costly WebGL contexts
class SearchInput extends PureComponent {
  state = { value: this.props.query.q || "" };
  timeout = null;
  componentDidUpdate(prevProps) {
    const q = this.props.query.q || "";
    // q changed from outside (Show all, back button): sync the input
    if (q !== (prevProps.query.q || "") && q !== this.state.value) {
      clearTimeout(this.timeout);
      this.timeout = null;
      this.setState({ value: q });
    }
  }
  componentWillUnmount() {
    clearTimeout(this.timeout);
  }
  apply = () => {
    clearTimeout(this.timeout);
    this.timeout = null;
    const { query, navigate } = this.props;
    if ((query.q || "") === this.state.value) return;
    navigate(galleryPath({ ...query, q: this.state.value }, 1), {
      replace: true
    });
  };
  onChange = e => {
    this.setState({ value: e.target.value });
    clearTimeout(this.timeout);
    this.timeout = setTimeout(this.apply, 300);
  };
  onKeyDown = e => {
    if (e.key === "Enter") this.apply();
  };
  render() {
    return (
      <label className="search">
        <FaSearch />
        <input
          type="search"
          placeholder="Search by name or author…"
          value={this.state.value}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
        />
      </label>
    );
  }
}

// Android does not look to support more than ~ 8 GL contexts
const pageSize = (navigator.userAgent || "").includes("Android") ? 8 : 12;

function getPage(page, transitions) {
  const from = (page - 1) * pageSize;
  return transitions.slice(from, from + pageSize);
}

function searchTransitions(transitions, q) {
  const s = q.toLowerCase();
  return transitions.filter(
    t =>
      t.name.toLowerCase().includes(s) ||
      (t.author || "").toLowerCase().includes(s)
  );
}

export default class Gallery extends Component {
  render() {
    const { location, navigate } = this.props;
    const query = Object.fromEntries(
      new URLSearchParams(location.search || "")
    );
    const page = !isNaN(query.page) ? parseInt(query.page, 10) : 1;
    const order = query.order;
    const q = (query.q || "").trim();
    const all =
      order === "updated"
        ? transitionsOrderByUpdatedAt
        : transitionsOrderByCreatedAt;
    const transitions = q ? searchTransitions(all, q) : all;
    const nbPages = Math.ceil(transitions.length / pageSize);
    const pagination = Array(nbPages) // the time we have too much pages we refactor this xD
      .fill(null)
      .map((_, i) => i + 1)
      .map(p => (
        <PageLink key={p} page={p} current={page} query={query}>
          {p}
        </PageLink>
      ));
    return (
      <ScrollToTop>
        <div className="gallery">
          <SearchInput query={query} navigate={navigate} />
          <div className="pager">{pagination}</div>
          {transitions.length === 0 ? (
            <div className="no-results">
              No transition matches “{q}”.{" "}
              <Link to="/gallery">Show all</Link>
            </div>
          ) : (
            <div className="transitions">
              {getPage(page, transitions).map(transition => (
                <GalleryVignette
                  key={transition.name}
                  transition={transition}
                  order={order}
                />
              ))}
            </div>
          )}
          <div className="pager">
            {page === nbPages && page !== 1 ? (
              <PageLink page={1} current={page} query={query}>
                Back to First Page
              </PageLink>
            ) : (
              pagination
            )}
          </div>
        </div>
      </ScrollToTop>
    );
  }
}
