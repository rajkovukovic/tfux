"use strict";

const path = require("path");
const rollup = require("rollup");
const {
  makeImportsRelative,
} = require("../../../rollup-plugins/rollup-plugin-make-imports-relative/make-imports-relative");

/**
 *
 * @param {PackageManagerEngine} this - implicit attribute
 * @param {Object}                      arg0
 * @param {string}                      arg0.modulePath
 * @param {ModuleInfo}                  arg0.moduleInfo
 * @param {string}                      arg0.jsFile
 * @param {HashMap<string, ModuleInfo>} arg0.dependencyMap
 */
async function transformJsFile({
  modulePath,
  moduleInfo,
  jsFile,
  dependencyMap,
}) {
  const engine = this;
  const destinationDir = path.join(
    engine.destinationPath,
    moduleInfo.relativeDestinationPath,
    path.dirname(jsFile)
  );

  const inputFilePath = path.join(modulePath, jsFile);

  const inputOptions = {
    input: inputFilePath,
    plugins: [
      makeImportsRelative({
        inputFilePath,
        moduleInfo,
        importPrefix: path.relative(inputFilePath, modulePath),
        dependencyMap,
      }),
    ],
  };

  const outputOptions = {
    dir: destinationDir,
    format: "esm",
  };

  try {
    // create a bundle
    const bundle = await rollup.rollup(inputOptions);

    // console.log(bundle.watchFiles); // an array of file names this bundle depends on

    // generate code
    await bundle.generate(outputOptions);

    // or write the bundle to disk
    await bundle.write(outputOptions);
  } catch (error) {
    console.error("\x1b[31m", "transformJsFile", error);
  }
}

exports.transformJsFile = transformJsFile;
