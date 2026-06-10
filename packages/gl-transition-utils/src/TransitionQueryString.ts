export type QueryParamValue =
  | string
  | number
  | boolean
  | (string | number | boolean)[];
type Params = { [key: string]: QueryParamValue };

function parseValue(s: string): number | boolean | string {
  if (!isNaN(Number(s))) return parseFloat(s);
  else if (s === "true") return true;
  else if (s === "false") return false;
  else return s; // it's probably just a URL! for sampler2D
}
function parse(str: string): Params {
  const query: Params = {};
  str.split("&").forEach((kv) => {
    if (!kv) return;
    // split on the first "=" only: values can contain "=" (e.g. signed URLs)
    const i = kv.indexOf("=");
    if (i <= 0 || i === kv.length - 1) return;
    const key = decodeURIComponent(kv.slice(0, i));
    const rawVal = kv.slice(i + 1);
    // comma-split before decoding so encoded commas inside values don't split
    const splitByComma = rawVal.split(",");
    query[key] =
      splitByComma.length > 1
        ? splitByComma.map((s) => parseValue(decodeURIComponent(s)))
        : parseValue(decodeURIComponent(rawVal));
  });
  return query;
}
function stringifyValue(v: unknown): string {
  return Array.isArray(v)
    ? v.map((x) => encodeURIComponent(String(x))).join(",")
    : encodeURIComponent(String(v));
}
function stringify(params: Params): string {
  return Object.keys(params)
    .map((key) => encodeURIComponent(key) + "=" + stringifyValue(params[key]))
    .join("&");
}

export default {
  parseValue,
  parse,
  stringifyValue,
  stringify,
};
