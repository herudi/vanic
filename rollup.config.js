import { terser } from "rollup-plugin-terser";
import { uglify } from "rollup-plugin-uglify";
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import * as fs from "fs";

const VERSION = "0.0.16";
try {
  fs.rmSync("npm", { recursive: true });
} catch (error) {/* noop */ }
try {
  fs.mkdirSync("npm");
} catch (error) {/* noop */ }

fs.writeFileSync("./npm/index.d.ts", fs.readFileSync("./src/index.d.ts"));
fs.writeFileSync("./npm/README.md", fs.readFileSync("./README.md"));
fs.writeFileSync("./npm/package.json", JSON.stringify({
  "name": "vanic",
  "version": VERSION,
  "description": "A small, hook-based library for creating reactive-ui in Vanilla.",
  "main": "index.js",
  "unpkg": "index.min.js",
  "module": "esm.js",
  "types": "index.d.ts",
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
    "Hook in vanillajs",
    "1kb Reactive-UI vanillajs",
    "Tiny jsx for vanilla"
  ],
  "dependencies": {},
  "devDependencies": {}
}, null, 2), { encoding: "utf-8" });
const config = [
  {
    input: "src/esm.js",
    output: [
      { file: 'npm/index.js', format: 'cjs' },
      { file: 'npm/esm.js', format: 'esm' }
    ]
  },
  {
    input: 'src/browser.js',
    output: [
      {
        sourcemap: true,
        file: 'npm/index.min.js',
        format: 'iife',
        name: 'Vanic',
        plugins: [
          terser(),
          getBabelOutputPlugin({
            allowAllFormats: true,
            presets: [
              [
                '@babel/preset-env',
                {
                  exclude: ["@babel/plugin-transform-typeof-symbol"]
                }
              ]
            ]
          }),
          uglify()
        ]
      }
    ]
  }
];

export default config;