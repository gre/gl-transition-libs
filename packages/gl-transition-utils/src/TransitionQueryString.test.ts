import { test, expect } from "vitest";
import TransitionQueryString from "./TransitionQueryString";

test("parses scalars and arrays", () => {
  expect(TransitionQueryString.parse("a=1.5&b=true&c=false&d=hello")).toEqual({
    a: 1.5,
    b: true,
    c: false,
    d: "hello",
  });
  expect(TransitionQueryString.parse("color=0.9,0.4,0.2")).toEqual({
    color: [0.9, 0.4, 0.2],
  });
});

test("keeps everything after the first = in a value", () => {
  expect(TransitionQueryString.parse("url=https://x.com/i.png?sig=abc")).toEqual(
    { url: "https://x.com/i.png?sig=abc" }
  );
});

test("round-trips values containing = & and ,", () => {
  const params = {
    progress: 0.5,
    flag: true,
    color: [1, 0.5, 0.25],
    luma: "https://x.com/a,b.png?k=v&t=2",
  };
  const str = TransitionQueryString.stringify(params);
  expect(TransitionQueryString.parse(str)).toEqual(params);
});

test("ignores empty or valueless entries", () => {
  expect(TransitionQueryString.parse("&a=&=b&c=1")).toEqual({ c: 1 });
});
