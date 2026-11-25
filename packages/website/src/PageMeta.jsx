import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { transitionsByName } from "./data";
import { authorDisplayName } from "./TransitionAuthorAndName";

// keeps what scripts/og-pages.mjs prerenders in sync with client-side navigation
export default function PageMeta() {
  const { pathname } = useLocation();
  useEffect(() => {
    const match = pathname.match(/^\/(?:transition|editor)\/([^/]+)\/?$/);
    const transition =
      match && Object.hasOwn(transitionsByName, match[1])
        ? transitionsByName[match[1]]
        : null;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!transition) {
      document.title = "GL Transitions";
      if (canonical) canonical.remove();
      return;
    }
    const { name, author } = transition;
    document.title = `${name} by ${authorDisplayName(author)} – GL Transitions`;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = "https://gl-transitions.com/transition/" + name;
  }, [pathname]);
  return null;
}
