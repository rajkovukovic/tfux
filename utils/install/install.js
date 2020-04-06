"use strict";

const { VATRA_LIB_PATH, TMP_DIR } = require("../constants/constants.js");
const { JspmEngine } = require("../engines/jspm/jspm.js");

const engineFactories = {
  jspm: JspmEngine,
  // npm: NpmEngine, // needs to be implemented if JSPM can not handle all the tasks
};

async function install(engineName, dependencyOrDependencies) {
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

  console.log(`vatra is installing ${JSON.stringify(dependencyArray)}`);

  try {
    // install dependency to TMP folder
    await engine.installDependencies(dependencyArray);

    // make dependencies vatra compatible and copy them to the vatra lib
    await engine.transformAndCopyModules();
  } catch (error) {
    console.error("\x1b[31m", error);
  }
}

exports.install = install;
