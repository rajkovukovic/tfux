"use strict";

const {
  CLI_TOOL_NAME,
  ENGINE_TYPES,
  VATRA_LIB_PATH,
  TMP_DIR,
} = require("../constants/constants.js");
const { JspmEngine } = require("../engines/jspm/jspm.js");
const { NpmEngine } = require("../engines/npm/npm.js");

const engineFactories = {
  [ENGINE_TYPES.jspm]: JspmEngine,
  [ENGINE_TYPES.npm]: NpmEngine,
};

async function installGlobally(dependencyOrDependencies, engineName = ENGINE_TYPES.jspm) {
  console.log({ VATRA_LIB_PATH, TMP_DIR });
  if (!engineName || !engineFactories[engineName])
    throw new Error(
      `engineName is must be one of ${JSON.stringify(
        Object.keys(engineFactories)
      )}\nGot engineName="${engineName}"`
    );

  const dependencyArray = Array.isArray(dependencyOrDependencies)
    ? dependencyOrDependencies
    : [dependencyOrDependencies];

  const engine = new engineFactories[engineName](VATRA_LIB_PATH, TMP_DIR);

  console.log(
    `${CLI_TOOL_NAME} is installing ${JSON.stringify(dependencyArray)}`
  );

  try {
    // install dependency to TMP folder
    await engine.installDependencies(dependencyArray, true);

    // make dependencies vatra compatible and copy them to the vatra lib
    await engine.transformAndCopyModules();
  } catch (error) {
    console.error("\x1b[31m", error);
  }
}

exports.installGlobally = installGlobally;
