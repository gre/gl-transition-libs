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

declare module "save-pixels" {
  import type { NdArray } from "ndarray";
  import type { Stream } from "stream";
  export default function savePixels(
    pixels: NdArray,
    format: "png" | "jpg" | "jpeg" | "gif" | "canvas"
  ): Stream;
}
