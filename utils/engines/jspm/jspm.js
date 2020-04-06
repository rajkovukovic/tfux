"use strict";

const fs = require("fs");
const path = require("path");
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

    this._installedModulesRootPath = this._installedModulesPath;
    this._installedModulesPath = path.join(
      this._installedModulesPath,
      "jspm_packages"
    );

    this.transformAndCopyModules = transformAndCopyModules.bind(this);
    this.transformJsFile = transformJsFile.bind(this);
  }

  installDependencies(dependencies, recursively = false) {
    return childProcess.execSync(
      `cd ${
        this._installedModulesRootPath
      } && ${JSPM_BIN_PATH} install ${dependencies.join(" ")}`,
      {
        stdio: "inherit",
      }
    );
    if (recursively) {
    }
  }

  reloadJspmJSON() {
    const jspmJSONPath = path.join(this._installedModulesRootPath, "jspm.json");
    if (!fs.existsSync(jspmJSONPath)) {
      throw new Error(`can not find "jspm.json" on path "${this.installedModulesPath}"`);
    }
    this._jspmJSON = require(jspmJSONPath);
    return this._jspmJSON;
  }

  get jspmJSON() {
    if (!this._jspmJSON) this.reloadJspmJSON();
    return this._jspmJSON;
  }
}

exports.JspmEngine = JspmEngine;
