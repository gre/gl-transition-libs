declare module "glsl-tokenizer/string" {
  export interface GlslToken {
    type: string;
    data: string;
    position?: number;
    line?: number;
    column?: number;
  }
  export default function tokenize(glsl: string): GlslToken[];
}

declare module "glsl-token-string" {
  import type { GlslToken } from "glsl-tokenizer/string";
  export default function print(tokens: Array<Pick<GlslToken, "type" | "data">>): string;
}

declare module "glsl-parser/direct" {
  import type { GlslToken } from "glsl-tokenizer/string";
  // glsl-parser AST nodes are untyped; we keep them loose.
  export interface GlslAstNode {
    type: string;
    data: string;
    token: GlslToken;
    parent: GlslAstNode;
    children: GlslAstNode[];
    scope: { [key: string]: GlslAstNode };
  }
  export default function parse(tokens: GlslToken[]): GlslAstNode;
}

declare module "gl-shader" {
  export interface GLShader {
    bind(): void;
    dispose(): void;
    attributes: { [key: string]: { pointer(): void } };
    uniforms: { [key: string]: unknown };
    types: { uniforms: { [key: string]: string } };
  }
  export default function createShader(
    gl: WebGLRenderingContext,
    vertex: string,
    fragment: string
  ): GLShader;
}

declare module "gl-texture2d" {
  import type { NdArray } from "ndarray";
  export interface GLTexture2D {
    bind(unit?: number): number;
    dispose(): void;
    shape: [number, number];
    minFilter: number;
    magFilter: number;
  }
  export default function createTexture(
    gl: WebGLRenderingContext,
    data: NdArray | [number, number]
  ): GLTexture2D;
}
