//@flow
import type { UniformDefaultValue } from "./transformSource";
type Params = { [_: string]: UniformDefaultValue };

function parseValue(s: string): * {
  if (!isNaN(s)) return parseFloat(s, 10);
  else if (s === "true") return true;
  else if (s === "false") return false;
  else return s; // it's probably just a URL! for sampler2D
}
function parse(str: string): Params {
  const query = {};
  str.split("&").forEach(kv => {
    if (!kv) return;
    let [key, val] = kv.split("=");
    if (!key || !val) return;
    val = decodeURIComponent(val);
    const splitByComma = val.split(",");
    query[key] = splitByComma.length > 1
      ? splitByComma.map(parseValue)
      : parseValue(val);
  });
  return query;
}
function stringifyValue(v: *): string {
  return String(v);
}
function stringify(params: Params): string {
  return Object.keys(params)
    .map(key => key + "=" + stringifyValue(params[key]))
    .join("&");
}

export default {
  parseValue,
  parse,
  stringifyValue,
  stringify,
};
