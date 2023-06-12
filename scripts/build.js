import esbuild from "esbuild";
import * as fs from "fs";
const VERSION = "0.0.26";
try {
  fs.rmSync("npm", { recursive: true });
} catch (_e) {/* noop */ }
try {
  fs.mkdirSync("npm");
  fs.mkdirSync("npm/cjs");
  fs.mkdirSync("npm/esm");
  fs.mkdirSync("npm/types");
  fs.mkdirSync("npm/browser");
} catch (_e) {/* noop */ }

fs.writeFileSync("npm/types/index.d.ts", fs.readFileSync("src/index.d.ts"));
fs.writeFileSync("npm/types/jsx-runtime.d.ts", fs.readFileSync("src/runtime/jsx-runtime.d.ts"));
fs.writeFileSync("npm/README.md", fs.readFileSync("README.md"));
fs.writeFileSync("npm/package.json", JSON.stringify({
  "name": "vanic",
  "version": VERSION,
  "description": "A small, hook-based library for creating reactive-ui in Vanilla.",
  "main": "./cjs/index.js",
  "unpkg": "./browser/index.min.js",
  "module": "./esm/index.js",
  "types": "./types/index.d.ts",
  "author": "herudi",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/herudi/vanic"
  },
  "publishConfig": {
    "registry": "https://registry.npmjs.org/"
  },
  "keywords": [
    "Html-attributes framework",
    "Hook in vanillajs",
    "Reactive-UI vanillajs",
    "Tiny jsx for vanilla"
  ],
  "dependencies": {},
  "devDependencies": {},
  "exports": {
    ".": {
      "types": "./types/index.d.ts",
      "require": "./cjs/index.js",
      "import": "./esm/index.js"
    },
    "./jsx-runtime": {
      "types": "./types/jsx-runtime.d.ts",
      "require": "./cjs/runtime/jsx-runtime.js",
      "import": "./esm/runtime/jsx-runtime.js"
    },
    "./jsx-dev-runtime": {
      "types": "./types/jsx-runtime.d.ts",
      "require": "./cjs/runtime/jsx-dev-runtime.js",
      "import": "./esm/runtime/jsx-dev-runtime.js"
    },
    "./*": "./*"
  }
}, null, 2), { encoding: "utf-8" });
fs.writeFileSync("npm/esm/package.json", JSON.stringify({ type: "module" }));
fs.writeFileSync("npm/cjs/package.json", JSON.stringify({ type: "commonjs" }));
const defObj = {
  platform: "node",
  bundle: true
};

async function buildCjs(){
  await esbuild.build({
    ...defObj,
    treeShaking: true,
    format: "cjs",
    entryPoints: ["src/index.js"],
    outfile: "npm/cjs/index.js"
  });
  await esbuild.build({
    ...defObj,
    bundle: false,
    format: "cjs",
    entryPoints: ["src/runtime/jsx-runtime.js"],
    outfile: "npm/cjs/runtime/jsx-runtime.js"
  });
  await esbuild.build({
    ...defObj,
    bundle: false,
    format: "cjs",
    entryPoints: ["src/runtime/jsx-dev-runtime.js"],
    outfile: "npm/cjs/runtime/jsx-dev-runtime.js"
  });
}

async function buildEsm(){
  defObj["target"] = "es2020";
  defObj["platform"] = "neutral";
  await esbuild.build({
    ...defObj,
    format: "esm",
    entryPoints: ["src/index.js"],
    outfile: "npm/esm/index.js"
  });
  await esbuild.build({
    ...defObj,
    bundle: false,
    format: "esm",
    entryPoints: ["src/runtime/jsx-runtime.js"],
    outfile: "npm/esm/runtime/jsx-runtime.js"
  });
  await esbuild.build({
    ...defObj,
    bundle: false,
    format: "esm",
    entryPoints: ["src/runtime/jsx-dev-runtime.js"],
    outfile: "npm/esm/runtime/jsx-dev-runtime.js"
  });
}

async function buildBrowser(){
  await esbuild.build({
    ...defObj,
    platform: "browser",
    format: "iife",
    target: "es6",
    globalName: "Vanic",
    minify: true,
    entryPoints: ["src/index.js"],
    outfile: "npm/browser/index.js",
    sourcemap: true
  });
}

try {
  await buildCjs();
  await buildEsm();
  await buildBrowser();
} catch (error) {
  console.log(error);
}