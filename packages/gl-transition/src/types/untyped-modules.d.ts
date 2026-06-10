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
