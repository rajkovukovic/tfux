"use strict";

const childProcess = require("child_process");
const { AbstractEngine } = require("../abstract-engine/abstract-engine.js");
const { JSPM_BIN_PATH } = require("../../constants/constants.js");
const {
  transformAndCopyModules,
} = require("./transform/transform-and-copy-modules.js");
const { transformJsFile } = require("./transform/transform-js-file.js");

class JspmEngine extends AbstractEngine {
  constructor(...args) {
    super(...args);
    this.transformAndCopyModules = transformAndCopyModules.bind(this);
    this.transformJsFile = transformJsFile.bind(this);
  }

  installDependencies(dependencies) {
    return childProcess.execSync(
      `cd ${
        this.installedModulesPath
      } && ${JSPM_BIN_PATH} install ${dependencies.join(" ")}`,
      {
        stdio: "inherit",
      }
    );
  }
}

exports.JspmEngine = JspmEngine;
