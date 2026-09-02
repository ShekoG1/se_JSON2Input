const esbuild = require("esbuild");

esbuild.build({
    entryPoints: ["src/index.js"],
    bundle: true,

    outfile: "dist/json2input.js",

    format: "esm",

    external: [
        "react",
        "react-dom"
    ],

    jsx: "automatic",

    sourcemap: true,

    minify: false
}).catch(() => process.exit(1));