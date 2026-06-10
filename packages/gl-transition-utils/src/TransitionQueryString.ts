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
    const [key, rawVal] = kv.split("=");
    if (!key || !rawVal) return;
    const val = decodeURIComponent(rawVal);
    const splitByComma = val.split(",");
    query[key] =
      splitByComma.length > 1 ? splitByComma.map(parseValue) : parseValue(val);
  });
  return query;
}
function stringifyValue(v: unknown): string {
  return String(v);
}
function stringify(params: Params): string {
  return Object.keys(params)
    .map((key) => key + "=" + stringifyValue(params[key]))
    .join("&");
}

export default {
  parseValue,
  parse,
  stringifyValue,
  stringify,
};
