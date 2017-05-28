//@flow
import React, { Component, PureComponent } from "react";
import querystring from "querystring";
import { Link } from "react-router-dom";
import { transitionsByCreatedAt, transitionsByUpdatedAt } from "./data";
import Vignette from "./Vignette";
import dateAgo from "./dateAgo";
import ScrollToTop from "./ScrollToTop";
import TransitionAuthorAndName from "./TransitionAuthorAndName";
import FaExpand from "react-icons/lib/fa/expand";
import "./Gallery.css";

export const fromImage = require("./images/600x400/barley.jpg");
export const toImage = require("./images/600x400/hBd6EPoQT2C8VQYv65ys_White_Sands.jpg");

const footerForOrder = (getDate: *) =>
  class EditorVignetteFooter extends PureComponent {
    props: {
      transition: *,
    };
    render() {
      const { transition } = this.props;
      return (
        <div>
          <Link className="expand" to={"/transition/" + transition.name}>
            <FaExpand />
          </Link>
          <footer>
            <TransitionAuthorAndName transition={transition} />
            <span className="dateago">
              {dateAgo(getDate(transition))}
            </span>
          </footer>
        </div>
      );
    }
  };
const UpdatedFooter = footerForOrder(t => t.updatedAt);
const CreatedFooter = footerForOrder(t => t.createdAt);

class EditorVignette extends PureComponent {
  props: {
    transition: *,
    order: *,
  };
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

class VignettePlaceholder extends PureComponent {
  render() {
    return (
      <div style={{ width: 300, height: 200, background: "rgba(0,0,0,0.1)" }} />
    );
  }
}

class PageLink extends PureComponent {
  props: {
    page: number,
    current: number,
    children?: *,
  };
  render() {
    const { page, current, children } = this.props;
    return (
      <Link
        className={page === current ? "active" : ""}
        to={page === 1 ? "/gallery" : "/gallery?page=" + page}
      >
        {children}
      </Link>
    );
  }
}

// Android does not look to support more than ~ 8 GL contexts
const pageSize = (navigator.userAgent || "").includes("Android") ? 8 : 12;

function getPage(page, transitions) {
  const arr = [];
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  for (let i = from; i < to; i++) {
    arr.push(transitions[i] || null);
  }
  return arr;
}

export default class Gallery extends Component {
  props: {
    location: *,
  };
  render() {
    const { location } = this.props;
    const query = location.search
      ? querystring.parse(location.search.slice(1))
      : {};
    const page = !isNaN(query.page) ? parseInt(query.page, 10) : 1;
    const order = query.order;
    const transitions = order === "updated"
      ? transitionsByUpdatedAt
      : transitionsByCreatedAt;
    const nbPages = Math.ceil(transitions.length / pageSize);
    const pagination = Array(nbPages) // the time we have too much pages we refactor this xD
      .fill(null)
      .map((_, i) => i + 1)
      .map(p => (
        <PageLink key={p} page={p} current={page}>
          {p}
        </PageLink>
      ));
    return (
      <ScrollToTop>
        <div className="gallery">
          <div className="pager">
            {pagination}
          </div>
          <div className="transitions">
            {getPage(page, transitions).map(
              (transition, i) =>
                transition
                  ? <EditorVignette
                      key={i}
                      transition={transition}
                      order={order}
                    />
                  : <VignettePlaceholder key={i} />
            )}
          </div>
          <div className="pager">
            {page === nbPages && page !== 1
              ? <PageLink page={1} current={page}>Back to First Page</PageLink>
              : pagination}
          </div>
        </div>
      </ScrollToTop>
    );
  }
}
