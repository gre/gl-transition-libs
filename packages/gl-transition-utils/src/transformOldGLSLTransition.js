//@flow
import tokenize from "glsl-tokenizer/string";
import print from "glsl-token-string";

type Token = {
  type: string,
  data: string,
};

type Result = {
  data: ?{
    glsl: string,
  },
  errors: Array<*>,
};

const tokenWithType = (token: Token, type: string): boolean =>
  token.type === type;

const tokenWithTypeAndData = (
  token: Token,
  type: string,
  data: string
): boolean => token.type === type && token.data === data;

const isMainFunctionDefinitionAt = (tokens: Array<*>, i: number): boolean => {
  if (!tokenWithTypeAndData(tokens[i], "keyword", "void")) return false;
  for (
    i = i + 1;
    i < tokens.length && tokenWithType(tokens[i], "whitespace");
    i++
  );
  if (i >= tokens.length) return false;
  if (!tokenWithTypeAndData(tokens[i], "ident", "main")) return false;
  return true;
};

const isFromOrToTexture2DCallAt = (tokens: Array<*>, i: number): boolean => {
  if (!tokenWithTypeAndData(tokens[i], "builtin", "texture2D")) return false;
  for (
    i = i + 1;
    i < tokens.length && tokenWithType(tokens[i], "whitespace");
    i++
  );
  if (i >= tokens.length) return false;
  if (tokenWithType(tokens[i], "operator", "(")) {
    i++;
  }
  for (
    i = i + 1;
    i < tokens.length && tokenWithType(tokens[i], "whitespace");
    i++
  );
  if (i >= tokens.length) return false;
  i--;
  const token = tokens[i];
  if (
    token.type === "ident" &&
    (token.data === "from" || token.data === "to")
  ) {
    return true;
  }
  return false;
};

const uniformsToRemove = ["from", "to", "progress", "resolution"];

export default (glsl: string): Result => {
  const errors = [];

  const tokens: Array<Token> = tokenize(glsl);
  const newTokens: Array<Token> = [];

  let eatWhitespaces = false;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (eatWhitespaces) {
      if (tokenWithType(token, "whitespace")) {
        continue;
      } else {
        eatWhitespaces = false;
      }
    }
    if (token.type === "preprocessor" && token.data.indexOf("#ifdef") === 0) {
      while (i < tokens.length) {
        const token = tokens[i];
        i++;
        if (token.type === "preprocessor" && token.data === "#endif") {
          break;
        }
      }
      eatWhitespaces = true;
    } else if (token.type === "keyword" && token.data === "uniform") {
      let foundToRemove = [], foundToKeep = [];
      let j;
      for (
        j = i + 1;
        j < tokens.length && !tokenWithTypeAndData(tokens[j], "operator", ";");
        j++
      ) {
        if (tokens[j].type === "ident") {
          const ident = tokens[j];
          if (uniformsToRemove.includes(ident.data)) {
            foundToRemove.push(ident);
          } else {
            foundToKeep.push(ident);
          }
        }
      }
      if (foundToRemove.length > 0) {
        if (foundToKeep.length > 0) {
          errors.push({
            type: "old_glsl_mixed_uniforms",
            message: "Please manually removes uniforms: " +
              foundToRemove.map(n => n.data).join(", "),
          });
          // legit uniforms
          newTokens.push(token);
        } else {
          i = j;
          eatWhitespaces = true;
        }
      } else {
        // legit uniforms
        newTokens.push(token);
      }
    } else if (isMainFunctionDefinitionAt(tokens, i)) {
      newTokens.push({
        type: "keyword",
        data: "vec4",
      });
      for (
        i = i + 1;
        i < tokens.length && tokenWithType(tokens[i], "whitespace");
        i++
      ) {
        newTokens.push(tokens[i]);
      }
      newTokens.push({
        type: "ident",
        data: "transition",
      });
      for (
        i = i + 1;
        i < tokens.length && tokenWithType(tokens[i], "whitespace");
        i++
      ) {
        newTokens.push(tokens[i]);
      }
      if (i >= tokens.length) break;
      newTokens.push(tokens[i]);
      newTokens.push({
        type: "keyword",
        data: "vec2",
      });
      newTokens.push({
        type: "whitespace",
        data: " ",
      });
      newTokens.push({
        type: "ident",
        data: "uv",
      });

      // The 2 following replacement is just a dump step that user will have to clean up: gl_FragCoord is replaces with uv and resolution to a vec2(1.0). it's the safest solution for now
    } else if (tokenWithTypeAndData(token, "builtin", "gl_FragCoord")) {
      newTokens.push({
        type: "ident",
        data: "uv",
      });
    } else if (tokenWithTypeAndData(token, "ident", "resolution")) {
      newTokens.push({
        type: "keyword",
        data: "vec2",
      });
      newTokens.push({
        type: "operator",
        data: "(",
      });
      newTokens.push({
        type: "literal",
        data: "1.0",
      });
      newTokens.push({
        type: "operator",
        data: ")",
      });
    } else if (tokenWithTypeAndData(token, "builtin", "gl_FragColor")) {
      newTokens.push({
        type: "keyword",
        data: "return",
      });
      for (
        i = i + 1;
        i < tokens.length && tokenWithType(tokens[i], "whitespace");
        i++
      ) {
        newTokens.push(tokens[i]);
      }
      if (i >= tokens.length) return;
      if (tokenWithType(tokens[i], "operator", "=")) {
        i++;
      }
      for (
        i = i + 1;
        i < tokens.length && tokenWithType(tokens[i], "whitespace");
        i++
      ) {
        newTokens.push(tokens[i]);
      }
      i--;
    } else if (isFromOrToTexture2DCallAt(tokens, i)) {
      let identData;
      for (i = i + 1; i < tokens.length; i++) {
        const t = tokens[i];
        if (t.type === "whitespace") {
        } else if (t.type === "ident") {
          identData = t.data;
        } else if (t.type === "operator") {
          if (t.data === ",") break;
        }
      }
      for (
        i = i + 1;
        i < tokens.length && tokenWithType(tokens[i], "whitespace");
        i++
      );
      i--;
      newTokens.push({
        type: "keyword",
        data: identData === "to" ? "getToColor" : "getFromColor",
      });
      newTokens.push({
        type: "operator",
        data: "(",
      });
    } else {
      // in any other case, we let the token pass-in
      newTokens.push(token);
    }
  }

  const head = `\
// Author:
// License: MIT
`;

  return {
    data: {
      glsl: head + print(newTokens),
    },
    errors,
  };
};
