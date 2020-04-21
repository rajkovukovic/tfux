import svelte from "rollup-plugin-svelte";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import serve from "rollup-plugin-serve";
import typescript from "rollup-plugin-typescript2";
import typescriptCompiler from "typescript";
import { terser } from "rollup-plugin-terser";
import livereload from "rollup-plugin-livereload";
import sveltePreprocessor from "svelte-preprocess";
import webComponentPackages from "./web-component-list.json";

const IS_DEV_MODE = process.env.NODE_ENV === "development";

const plugins = [
  svelte({
    dev: IS_DEV_MODE,
    extensions: [".svelte"],
    preprocess: sveltePreprocessor(),
    emitCss: true,
    css: true,
    customElement: true,
  }),
  // typescript({ typescript: typescriptCompiler }),
  commonjs({ include: "node_modules/**" }),
  resolve(),
];

if (IS_DEV_MODE) {
  plugins.push(
    serve({
      contentBase: "./output",
      open: true,
      port: 3200,
    }),
    livereload({ watch: "./output" })
  );
} else {
  plugins.push(terser({ sourcemap: true }));
}

const buildConfigs = webComponentPackages.map((webComponentPackage) => {
  const output = [
    {
      file: `output/${webComponentPackage.output}.js`,
      format: "esm",
      sourcemap: true,
    },
  ];
  // if (!IS_DEV_MODE) {
  //   output.push({
  //     file: `output/${webComponentPackage.output}.js`,
  //     format: "iife",
  //     name: webComponentPackage.output.split("-").join(""),
  //     sourcemap: true,
  //   });
  // }
  return {
    input: webComponentPackage.input,
    output,
    plugins,
  };
});

export default buildConfigs;
