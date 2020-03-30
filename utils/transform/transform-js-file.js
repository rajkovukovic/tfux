"use strict";

const path = require("path");
const rollup = require("rollup");
const resolve = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const typescript = require("rollup-plugin-typescript2");
const typescriptCompiler = require("typescript");
const {
  makeImportsRelative
} = require("./rollup-plugins/rollup-plugin-make-imports-relative/make-imports-relative");

/**
 *
 * @param {PathLike} destinationPath
 * @param {PathLike} modulePath
 * @param {ModuleInfo} moduleInfo
 * @param {string} jsFile
 * @param {HashMap<string, ModuleInfo>} dependencyMap
 */
async function transformJsFile({
  destinationPath,
  modulePath,
  moduleInfo,
  jsFile,
  dependencyMap
}) {
  const destinationDir = path.join(destinationPath, path.dirname(jsFile));

  const inputFilePath = path.join(modulePath, jsFile);

  const inputOptions = {
    input: inputFilePath,
    plugins: [
      // commonjs({
      //   extensions: [".js"]
      // }),
      makeImportsRelative({
        currentModule: moduleInfo,
        importPrefix: path.relative(inputFilePath, modulePath),
        dependencyMap
      })
    ]
  };

  const outputOptions = {
    dir: destinationDir,
    format: "esm"
  };

  try {
    // create a bundle
    const bundle = await rollup.rollup(inputOptions);

    // console.log(bundle.watchFiles); // an array of file names this bundle depends on

    // generate code
    const { output } = await bundle.generate(outputOptions);

    // or write the bundle to disk
    await bundle.write(outputOptions);
  } catch (error) {
    console.error("transformJsFile", error);
  }
}

exports.transformJsFile = transformJsFile;
