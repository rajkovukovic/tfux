'use strict';

const {
  CLI_TOOL_NAME,
  ENGINE_TYPES,
  FIREX_LIB_PATH,
  TMP_DIR,
} = require('../constants/constants.js');
const { JspmEngine } = require('../engines/jspm/jspm.js');
const { NpmEngine } = require('../engines/npm/npm.js');
const { logger } = require('../logger/logger.js');

const engineFactories = {
  [ENGINE_TYPES.jspm]: JspmEngine,
  [ENGINE_TYPES.npm]: NpmEngine,
};

async function installGlobally(dependencyOrDependencies, options, engineName = ENGINE_TYPES.jspm) {
  logger.info({ FIREX_LIB_PATH, TMP_DIR });

  try {
    if (!engineName || !engineFactories[engineName])
      throw new Error(
        `engineName is must be one of ${JSON.stringify(
          Object.keys(engineFactories)
        )}\nGot engineName="${engineName}"`
      );

    if (!engineName || !engineFactories[engineName])
      throw new Error(
        `engineName is must be one of ${JSON.stringify(
          Object.keys(engineFactories)
        )}\nGot engineName="${engineName}"`
      );

    const dependencyArray = Array.isArray(dependencyOrDependencies)
      ? dependencyOrDependencies
      : [dependencyOrDependencies];

    const engine = new engineFactories[engineName](FIREX_LIB_PATH, TMP_DIR, options);

    logger.info(`${CLI_TOOL_NAME} is installing ${JSON.stringify(dependencyArray)}`);
    // install dependency to TMP folder
    return await engine.installDependencies(dependencyArray, true);
  } catch (error) {
    logger.error(error.stack);
  }
}

exports.installGlobally = installGlobally;
