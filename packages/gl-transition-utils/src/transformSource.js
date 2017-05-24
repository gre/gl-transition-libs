//@flow
import TokenString from "glsl-tokenizer/string";
import ParseTokens from "glsl-parser/direct";
import acceptedLicenses from "./acceptedLicenses";

type Token = {
  type: string,
  data: string,
  line?: number,
  column?: number,
};

export type UniformDefaultLiteralValue = number | boolean | null;
export type UniformDefaultValue =
  | Array<UniformDefaultLiteralValue>
  | UniformDefaultLiteralValue;

export type TransformResult = {
  data: {
    author: string,
    license: string,
    name: string,
    glsl: string,
    defaultParams: { [_: string]: UniformDefaultValue },
    paramsTypes: { [_: string]: string },
  },
  errors: Array<{
    type: "error" | "warn",
    message: string,
    code: string,
    line?: number,
    column?: number,
  }>,
};

function extraPositionFromToken(token: Token) {
  const { line, column } = token;
  const out = {};
  if (typeof line === "number") out.line = line;
  if (typeof column === "number") out.column = column;
  return out;
}

const whitelistMeta = ["author", "license"];

const blacklistScope = [
  "main",
  "getToColor",
  "getFromColor",
  "ratio",
  "uv",
  "progress",
  "from",
  "to",
];

const reservedTransitionNames = ["new"];

export const typeInfos = {
  float: {
    primitiveType: "float",
    exampleValue: "0.7",
    defaultValue: 0,
    arity: 1,
  },
  int: {
    primitiveType: "int",
    exampleValue: "42",
    defaultValue: 0,
    arity: 1,
  },
  bool: {
    primitiveType: "bool",
    exampleValue: "true",
    defaultValue: false,
    arity: 1,
  },
  sampler2D: {
    primitiveType: "sampler2D",
    defaultValue: null,
    arity: 1,
  },
  vec2: {
    primitiveType: "float",
    exampleValue: "vec2(1.1, 2.2)",
    defaultValue: Array(2).fill(0),
    arity: 2,
  },
  vec3: {
    primitiveType: "float",
    exampleValue: "vec3(1.0, 0.7, 0.3)",
    defaultValue: Array(3).fill(0),
    arity: 3,
  },
  vec4: {
    primitiveType: "float",
    exampleValue: "vec4(1.0, 0.7, 0.3, 0.9)",
    defaultValue: Array(4).fill(0),
    arity: 4,
  },
  ivec2: {
    primitiveType: "int",
    exampleValue: "ivec2(1, 2)",
    defaultValue: Array(2).fill(0),
    arity: 2,
  },
  ivec3: {
    primitiveType: "int",
    exampleValue: "ivec3(1, 2, 3)",
    defaultValue: Array(3).fill(0),
    arity: 3,
  },
  ivec4: {
    primitiveType: "int",
    exampleValue: "ivec4(1, 2, 3, 4)",
    defaultValue: Array(4).fill(0),
    arity: 4,
  },
  bvec2: {
    primitiveType: "bool",
    exampleValue: "bvec2(true, false)",
    defaultValue: Array(2).fill(false),
    arity: 2,
  },
  bvec3: {
    primitiveType: "bool",
    exampleValue: "bvec3(true, false, true)",
    defaultValue: Array(3).fill(false),
    arity: 3,
  },
  bvec4: {
    primitiveType: "bool",
    exampleValue: "bvec4(true, false, true, false)",
    defaultValue: Array(4).fill(false),
    arity: 4,
  },
  mat2: {
    primitiveType: "float",
    exampleValue: "mat2(1.0)",
    defaultValue: Array(4).fill(0),
    arity: 4,
  },
  mat3: {
    primitiveType: "float",
    exampleValue: "mat3(1.0)",
    defaultValue: Array(9).fill(0),
    arity: 9,
  },
  mat4: {
    primitiveType: "float",
    exampleValue: "mat4(1.0)",
    defaultValue: Array(16).fill(0),
    arity: 16,
  },
};

function extractCommentNode(token: Token): string {
  switch (token.type) {
    case "line-comment":
      return token.data.slice(2);
    case "block-comment":
      return token.data.slice(2, token.data.length - 2);
    default:
      return "";
  }
}

function typeCheckTransitionFunction(node) {
  node = node.parent;
  if (node.type !== "function") {
    return false;
  }
  // check return type
  if (node.parent.token.data !== "vec4") {
    return false;
  }
  // back to the function node, we'll check the args
  node = node.children.find(n => n.type === "functionargs");
  if (!node) {
    return false;
  }
  if (node.children.length !== 1) {
    return false;
  }
  node = node.children[0];
  if (node.type !== "decl") {
    return false;
  }
  const args = node.children.filter(n => n.type !== "placeholder");
  if (args.length !== 2) {
    return false;
  }
  const [keywordNode, decllist] = args;
  if (keywordNode.type !== "keyword" || keywordNode.token.data !== "vec2") {
    return false;
  }
  if (decllist.type !== "decllist" && decllist.children.length !== 1) {
    return false;
  }
  const [identNode] = decllist.children;
  if (identNode.type !== "ident") {
    return false;
  }
  return true;
}

export default function transformSource(
  filename: string,
  glsl: string
): TransformResult {
  const data = {
    name: "",
    author: null,
    license: null,
    paramsTypes: {},
    defaultParams: {},
    glsl,
  };
  const errors: Array<*> = [];

  const tokens: Array<Token> = TokenString(glsl);

  let ast;
  try {
    ast = ParseTokens(tokens);
  } catch (e) {
    const { message } = e;
    const r = message.split(" at line ");
    let line = 0;
    if (r.length === 2) {
      line = parseInt(r[1], 10);
    }
    errors.push({
      type: "error",
      code: "GLT_GLSL_error",
      message: "GLSL code error: " + e.message,
      line,
    });
  }

  if (ast) {
    const forbiddenScopes = Object.keys(ast.scope).filter(key =>
      blacklistScope.includes(key)
    );
    forbiddenScopes.forEach(id => {
      // $FlowFixMe
      const token = ast.scope[id].token;
      errors.push({
        type: "error",
        code: "GLT_reserved_variable_used",
        message: `You have defined these forbidden variables in the scope: ${id}. They are reserved for the wrapping code.`,
        ...extraPositionFromToken(token),
      });
    });

    if (!ast.scope.transition) {
      errors.push({
        type: "error",
        code: "GLT_transition_no_impl",
        message: "'vec4 transition(vec2 uv)' function is not implemented",
      });
    } else {
      if (!typeCheckTransitionFunction(ast.scope.transition)) {
        errors.push({
          type: "error",
          code: "GLT_transition_wrong_type",
          message: "transition must be a function with following signature: 'vec4 transition(vec2 uv)'",
          ...extraPositionFromToken(ast.scope.transition.token),
        });
      }
    }
  }

  function parseUniformCommentDefault(
    comment: string,
    type: string,
    uniformId: string,
    uniformToken: *
  ) {
    comment = comment.trim();
    if (comment.indexOf("=") !== 0) {
      return;
    }
    const tokens: Array<Token> = TokenString(uniformId + " " + comment + ";");
    // wrap with a more "valid" glsl

    let ast;
    try {
      ast = ParseTokens(tokens);
    } catch (e) {
      errors.push({
        type: "error",
        code: "GLT_invalid_default_value",
        message: `uniform '${uniformId}' default value '${comment}' does not parse as GLSL code: ${e.message}`,
        ...extraPositionFromToken(uniformToken),
      });
      return;
    }

    let node;

    (node = ast) &&
      (node = node.type === "stmtlist" && node.children[0]) &&
      (node = node.type === "stmt" && node.children[0]) &&
      (node = node.type === "expr" && node.children[0]) &&
      (node = node.type === "assign" && node.children[1]);

    const valueNode = node;
    if (!valueNode) {
      errors.push({
        type: "error",
        code: "GLT_invalid_default_value",
        message: `uniform '${uniformId}' has invalid format for default value. Got: '${comment}'. It should be an assignment in a comment.\nExample: uniform ${type} ${uniformId}; // = ${typeInfos[type].exampleValue}`,
        ...extraPositionFromToken(uniformToken),
      });
      return;
    }
    const { arity, primitiveType } = typeInfos[type];

    function literalToJSValue(literalNode: *): ?UniformDefaultLiteralValue {
      switch (primitiveType) {
        case "float": {
          const f = parseFloat(literalNode.data, 10);
          if (isNaN(f)) {
            errors.push({
              type: "error",
              code: "GLT_invalid_default_value",
              message: `uniform '${uniformId}' has invalid default value type. Expected a float but could not parseFloat it! Got: '${literalNode.data}'`,
              ...extraPositionFromToken(uniformToken),
            });
            return;
          }
          return f;
        }
        case "int": {
          const i = parseInt(literalNode.data, 10);
          if (isNaN(i)) {
            errors.push({
              type: "error",
              code: "GLT_invalid_default_value",
              message: `uniform '${uniformId}' has invalid default value type. Expected an int but could not parseInt it! Got: '${literalNode.data}'`,
              ...extraPositionFromToken(uniformToken),
            });
            return;
          }
          return i;
        }
        case "bool": {
          switch (literalNode.data) {
            case "1":
            case "true":
              return true;
            case "0":
            case "false":
              return false;
            default:
              errors.push({
                type: "error",
                code: "GLT_invalid_default_value",
                message: `uniform '${uniformId}' has invalid default value type. Expected a bool but could not parse it! Got: '${literalNode.data}'`,
                ...extraPositionFromToken(uniformToken),
              });
              return;
          }
        }
        default:
          return;
      }
    }

    if (valueNode.type === "call") {
      const values = [];
      for (let c = 0; c < valueNode.children.length; c++) {
        const node = valueNode.children[c];
        switch (node.type) {
          case "keyword":
            if (node.data !== type) {
              errors.push({
                type: "error",
                code: "GLT_invalid_default_value",
                message: `uniform '${uniformId}' has invalid format for default value: the value type '${node.data}' does not match the uniform type '${type}'. Got: '${comment}'.\nExample: uniform ${type} ${uniformId}; // = ${typeInfos[type].exampleValue}`,
                ...extraPositionFromToken(uniformToken),
              });
              return;
            }
            break;
          case "literal":
            const v = literalToJSValue(node);
            if (v === undefined) return;
            values.push(v);
            break;
          default:
            errors.push({
              type: "error",
              code: "GLT_invalid_default_value",
              message: `uniform '${uniformId}' has invalid format for default value: unsupported synthax. Got: '${comment}'.\nExample: uniform ${type} ${uniformId}; // = ${typeInfos[type].exampleValue}`,
              ...extraPositionFromToken(uniformToken),
            });
            return;
        }
      }
      if (arity === values.length) {
        return values;
      }
      if (values.length === 1) {
        return Array(arity).fill(values[0]);
      } else {
        errors.push({
          type: "error",
          code: "GLT_invalid_default_value",
          message: `uniform '${uniformId}' has invalid format for default value: invalid arity of ${type}. Got: '${comment}'.\nExample: uniform ${type} ${uniformId}; // = ${typeInfos[type].exampleValue}`,
          ...extraPositionFromToken(uniformToken),
        });
        return;
      }
    } else if (valueNode.type === "literal" || valueNode.type === "keyword") {
      if (arity !== 1) {
        errors.push({
          type: "error",
          code: "GLT_invalid_default_value",
          message: `uniform '${uniformId}' has invalid format for default value: you can't assign a literal value to a ${type} type. Got: '${comment}'.\nExample: uniform ${type} ${uniformId}; // = ${typeInfos[type].exampleValue}`,
          ...extraPositionFromToken(uniformToken),
        });
      } else {
        return literalToJSValue(valueNode);
      }
    } else {
      errors.push({
        type: "error",
        code: "GLT_invalid_default_value",
        message: `uniform '${uniformId}' has invalid format for default value. Got: '${comment}'.\nExample: uniform ${type} ${uniformId}; // = ${typeInfos[type].exampleValue}`,
        ...extraPositionFromToken(uniformToken),
      });
    }
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === "keyword" && token.data === "uniform") {
      const uniformToken = token;
      let idents = [],
        ident,
        typeTokens = [],
        parsingType = true,
        commentsPerIdent = {},
        commentsAll = [];
      // eat all the tokens until ";"
      while (++i < tokens.length) {
        const token = tokens[i];
        if (token.type === "operator" && token.data === ";") {
          break;
        }
        if (token.type === "block-comment" || token.type === "line-comment") {
          if (ident) {
            commentsPerIdent[ident] = (commentsPerIdent[ident] || [])
              .concat([extractCommentNode(token)]);
          }
          continue;
        }
        if (token.type === "ident") {
          parsingType = false;
          ident = token.data;
          idents.push(ident);
          continue;
        }
        if (parsingType && token.type !== "whitespace") {
          typeTokens.push(token);
          continue;
        }
      }
      // eat all the comments following the uniform
      for (let j = i + 1; j < tokens.length; j++) {
        const token = tokens[j];
        if (token.type === "whitespace") {
          continue;
        }
        if (token.type === "block-comment" || token.type === "line-comment") {
          commentsAll.push(extractCommentNode(token));
        }
        break;
      }

      idents.forEach(ident => {
        const type = typeTokens.map(n => n.data).join("");
        if (typeof type !== "string" || !(type in typeInfos)) {
          errors.push({
            type: "error",
            code: "GLT_unsupported_param_value_type",
            message: `uniform '${ident}' type '${String(type)}' is not supported`,
            ...extraPositionFromToken(uniformToken),
          });
        } else {
          // Extracting out uniform info
          let defaultParam;

          if (type === "sampler2D") {
            // for sampler2D, we use null by convention, we can't parse anything.
            defaultParam = null;
          } else {
            // try to parse one of the comment
            const comments = (commentsPerIdent[ident] || [])
              .concat(commentsAll);
            for (
              let j = 0;
              j < comments.length && defaultParam === undefined;
              j++
            ) {
              defaultParam = parseUniformCommentDefault(
                comments[j],
                type,
                ident,
                uniformToken
              );
            }
            // fallback on a default value
            if (defaultParam === undefined) {
              errors.push({
                type: "warn",
                code: "GLT_no_default_param_value",
                message: `uniform '${ident}' has not declared any commented default value.\nExample: uniform ${type} ${ident}; // = ${typeInfos[type].exampleValue};`,
                ...extraPositionFromToken(uniformToken),
              });
              defaultParam = typeInfos[type].defaultValue;
            }
          }
          data.defaultParams[ident] = defaultParam;
          data.paramsTypes[ident] = type;
        }
      });
      continue;
    }

    if (token.type === "line-comment") {
      // Extracting out meta
      const com = token.data.slice(2);
      const m = com.match(/^(.*):(.*)$/);
      if (m && m.length === 3) {
        let [_, key, value] = m;
        key = key.trim().toLowerCase();
        value = value.trim();
        if (whitelistMeta.indexOf(key) !== -1) {
          data[key] = value;
        }
      }
      continue;
    }
  }

  whitelistMeta.forEach(key => {
    if (!data[key]) {
      errors.push({
        type: "error",
        code: "GLT_meta_missing",
        message: `'${key}' is missing. Please define it in a '// ${key}: ...' comment`,
      });
    }
  });

  if (data.license && !(data.license in acceptedLicenses)) {
    errors.push({
      type: "error",
      code: "GLT_unknown_license",
      message: `'${data.license}' not found in supported licenses: ${Object.keys(acceptedLicenses).join(", ")}`,
    });
  }

  const m = filename.match(/^(.*).glsl$/);
  if (m) {
    const name = m[1];
    data.name = name;
    if (!name) {
      errors.push({
        type: "error",
        code: "GLT_invalid_filename",
        message: `A transition filename is required!`,
      });
    } else if (name.length > 40) {
      errors.push({
        type: "error",
        code: "GLT_invalid_filename",
        message: `filename is too long`,
      });
    } else if (!name.match(/^[a-zA-Z0-9-_]+$/)) {
      errors.push({
        type: "error",
        code: "GLT_invalid_filename",
        message: `filename can only contains letters, numbers or - and _ characters. Got '${filename}'`,
      });
    } else if (reservedTransitionNames.includes(name)) {
      errors.push({
        type: "error",
        code: "GLT_invalid_filename",
        message: `filename cannot be called '${name}'.`,
      });
    }
  } else {
    data.name = filename;
    errors.push({
      type: "error",
      code: "GLT_invalid_filename",
      message: `filename needs to ends with '.glsl'. Got '${filename}'`,
    });
  }

  return {
    data,
    errors,
  };
}
