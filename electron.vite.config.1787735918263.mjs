// electron.vite.config.ts
import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { transformWithEsbuild } from "vite";
var __electron_vite_injected_dirname = "D:\\KHACHCODE\\toolsngon-desktopapp\\toolsngon";
var reactNativeMarkdownDisplayJsx = () => ({
  name: "react-native-markdown-display-jsx",
  enforce: "pre",
  transform(code, id) {
    if (!id.includes("react-native-markdown-display") || !id.endsWith(".js")) return null;
    return transformWithEsbuild(code, id, {
      loader: "jsx",
      jsx: "automatic"
    });
  }
});
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__electron_vite_injected_dirname, "src/preload/index.ts"),
          // nếu có
          device: resolve(__electron_vite_injected_dirname, "src/preload/device-preload.ts")
        }
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src"),
        "@components": resolve("src/renderer/src/components"),
        "@routes": resolve("src/renderer/src/routes"),
        "@contexts": resolve("src/renderer/src/contexts"),
        "react-native": "react-native-web"
      }
    },
    plugins: [reactNativeMarkdownDisplayJsx(), react(), tailwindcss()]
  }
});
export {
  electron_vite_config_default as default
};
