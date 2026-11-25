import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { TransitionQueryString, acceptedLicenses } from "gl-transition-utils";
import { transitionsByName, transitionsOrderByCreatedAt } from "./data";
import AnimatedVignette from "./AnimatedVignette";
import TransitionAuthorAndName from "./TransitionAuthorAndName";
import dateAgo from "./dateAgo";
import ScrollToTop from "./ScrollToTop";
import {
  FaChevronLeft,
  FaChevronRight,
  FaEdit,
  FaRandom,
} from "react-icons/fa";
import "./Preview.css";
import { images } from "./sampleImages";
import useWidth from "./useWidth";

const tnames = Object.keys(transitionsByName);
const MAX_WIDTH = 800;

// shared links carry unrelated keys (fbclid, utm_…) that must not reach the shader
function paramsFromSearch({ defaultParams }, search) {
  const params = {};
  Object.entries(TransitionQueryString.parse(search.slice(1))).forEach(
    ([key, value]) => {
      if (!Object.hasOwn(defaultParams, key)) return;
      const expected = [].concat(defaultParams[key]);
      const values = [].concat(value);
      if (
        Array.isArray(value) === Array.isArray(defaultParams[key]) &&
        values.length === expected.length &&
        values.every((v, i) => typeof v === typeof expected[i])
      ) {
        params[key] = value;
      }
    },
  );
  return params;
}

const round = (n) => Math.round(n * 1000) / 1000;

function formatValue(value) {
  if (Array.isArray(value)) return "[" + value.map(round).join(", ") + "]";
  if (typeof value === "number") return String(round(value));
  return String(value);
}

function ParamDefault({ param }) {
  const { default: value, color } = param;
  if (color && Array.isArray(value)) {
    const [r, g, b, a = 1] = value.map((v) => Math.round(v * 255));
    return (
      <span className="color">
        <span
          className="swatch"
          style={{ background: `rgba(${r},${g},${b},${a / 255})` }}
        />
        <code>{formatValue(value)}</code>
      </span>
    );
  }
  return <code>{formatValue(value)}</code>;
}

function Params({ params }) {
  const keys = Object.keys(params || {});
  if (keys.length === 0) return null;
  return (
    <section>
      <h3>Parameters</h3>
      <dl className="params">
        {keys.map((key) => {
          const p = params[key];
          const range =
            p.min !== undefined && p.max !== undefined
              ? formatValue(p.min) + " – " + formatValue(p.max)
              : null;
          return (
            <div key={key}>
              <dt>
                <code className="name">{key}</code>{" "}
                <code className="type">{p.type}</code>
              </dt>
              <dd>
                <span className="meta">
                  default <ParamDefault param={p} />
                  {range ? (
                    <>
                      {" · range "}
                      <code>{range}</code>
                    </>
                  ) : null}
                </span>
                {p.description ? <p>{p.description}</p> : null}
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}

export default function Preview({ name }) {
  const location = useLocation();
  const [playerRef, containerWidth] = useWidth();
  const transition = transitionsByName[name];

  const randomName = useMemo(() => {
    const others = tnames.filter((t) => t !== name);
    return others[Math.floor(Math.random() * others.length)];
  }, [name]);

  const index = transitionsOrderByCreatedAt.indexOf(transition);
  const n = transitionsOrderByCreatedAt.length;
  const prev = transitionsOrderByCreatedAt[(index - 1 + n) % n];
  const next = transitionsOrderByCreatedAt[(index + 1) % n];

  const transitionParams = paramsFromSearch(transition, location.search);
  const query = TransitionQueryString.stringify(transitionParams);
  const width = Math.min(containerWidth, MAX_WIDTH);
  const height = Math.round((width * 3) / 4);
  const { description, tags, params, textures } = transition;

  return (
    <ScrollToTop>
      <div className="Preview">
        <header>
          <h2 className="tname">
            <TransitionAuthorAndName withGithubLink transition={transition} />
          </h2>
          <Link
            className="open-editor"
            to={"/editor/" + name + (query ? "?" + query : "")}
          >
            <FaEdit /> Open in editor
          </Link>
        </header>
        <div className="player" ref={playerRef} style={{ height }}>
          {width > 0 ? (
            <AnimatedVignette
              key={name}
              transitions={[transition]}
              transitionsParams={[transitionParams]}
              images={images}
              width={width}
              height={height}
              duration={3000}
              delay={500}
            />
          ) : null}
        </div>
        <div className="info">
          {description ? <p className="description">{description}</p> : null}
          <p className="meta">
            <a
              href={acceptedLicenses[transition.license]}
              target="_blank"
              rel="noopener noreferrer"
            >
              {transition.license}
            </a>
            {" · added "}
            {dateAgo(transition.createdAt)}
            {transition.updatedAt !== transition.createdAt ? (
              <>
                {" · updated "}
                {dateAgo(transition.updatedAt)}
              </>
            ) : null}
          </p>
          {tags && tags.length > 0 ? (
            <p className="tags">
              Tags:{" "}
              {tags.map((tag, i) => (
                <React.Fragment key={tag}>
                  {i > 0 ? ", " : null}
                  <Link to={"/gallery?q=" + encodeURIComponent(tag)}>
                    {tag}
                  </Link>
                </React.Fragment>
              ))}
            </p>
          ) : null}
          <Params params={params} />
          {textures && textures.length > 0 ? (
            <section>
              <h3>Textures</h3>
              <p>
                {textures.map((t, i) => (
                  <React.Fragment key={t}>
                    {i > 0 ? ", " : null}
                    <code>{t}</code>
                  </React.Fragment>
                ))}{" "}
                (sampler2D: an extra image you provide)
              </p>
            </section>
          ) : null}
          <section>
            <h3>Use it</h3>
            <pre>
              <code>{`import transitions from "gl-transitions";
const transition = transitions.find((t) => t.name === "${name}");`}</code>
            </pre>
            <p>
              <Link to="/#platforms">
                Use it on the web, in Node, in video editors and more
              </Link>
            </p>
          </section>
        </div>
        <nav className="prevnext">
          <Link to={"/transition/" + prev.name}>
            <FaChevronLeft /> <span>{prev.name}</span>
          </Link>
          <Link to={"/transition/" + randomName}>
            <FaRandom /> random
          </Link>
          <Link to={"/transition/" + next.name}>
            <span>{next.name}</span> <FaChevronRight />
          </Link>
        </nav>
      </div>
    </ScrollToTop>
  );
}
