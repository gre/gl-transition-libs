import { useEffect, useRef, useState } from "react";

// vignettes draw at a fixed pixel size, so their container is measured
export default function useWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    let latest = 0;
    let measured = false;
    let timeout = null;
    const update = () => {
      timeout = null;
      setWidth(latest);
    };
    const observer = new ResizeObserver(entries => {
      latest = Math.floor(entries[0].contentRect.width);
      if (!measured) {
        measured = true;
        update();
      } else if (!timeout) {
        // each size change redraws the WebGL surfaces
        timeout = setTimeout(update, 150);
      }
    });
    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, []);
  return [ref, width];
}
