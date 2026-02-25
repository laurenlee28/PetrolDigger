/// <reference types="vite/client" />

// Allow importing figma:asset/* as modules (mapped to /public/assets/ by Vite plugin)
declare module "figma:asset/*" {
  const src: string;
  export default src;
}
