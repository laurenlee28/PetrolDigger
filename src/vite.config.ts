import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Figma Make Asset Resolver Plugin
 * ---------------------------------
 * Figma Make uses a virtual `figma:asset/xxx.png` import scheme.
 * This plugin maps those imports to local files in /public/assets/.
 *
 * Just place your images in /public/assets/ with the matching filename.
 */
function figmaAssetPlugin(): Plugin {
  return {
    name: "figma-asset-resolver",
    enforce: "pre",

    resolveId(source) {
      if (source.startsWith("figma:asset/")) {
        const filename = source.replace("figma:asset/", "");
        return `\0figma-asset:${filename}`;
      }
      return null;
    },

    load(id) {
      if (id.startsWith("\0figma-asset:")) {
        const filename = id.replace("\0figma-asset:", "");
        return `export default "/assets/${filename}";`;
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [figmaAssetPlugin(), react(), tailwindcss()],
  root: ".",
  publicDir: "public",
  server: {
    port: 5173,
    open: true,
  },
});
