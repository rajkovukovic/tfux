'use strict';

const fs = require('fs');
const path = require('path');
const { AbstractEngine } = require('../abstract-engine/abstract-engine.js');
const {
  transformAndCopyModules,
} = require('./transform/transform-and-copy-modules.js');
const { transformJsFile } = require('./transform/transform-js-file.js');
const {
  installDependenciesWithPeer,
} = require('./install/install-dependencies-with-peer.js');
const { returnPomXml } = require('../../versions/pom.js');

class JspmEngine extends AbstractEngine {
  constructor(...args) {
    super(...args);

    this._installedModulesRootPath = this._installedModulesPath;
    this._installedModulesPath = path.join(
      this._installedModulesPath,
      'jspm_packages'
    );

    this.transformAndCopyModules = transformAndCopyModules.bind(this);
    this.transformJsFile = transformJsFile.bind(this);
  }

  installDependencies(dependencies, installTransitiveDependencies = false) {
    installDependenciesWithPeer(this, dependencies, installTransitiveDependencies, new Set());
  }

  reloadJspmJSON() {
    const jspmJSONPath = path.join(this._installedModulesRootPath, 'jspm.json');
    if (!fs.existsSync(jspmJSONPath)) {
      throw new Error(
        `can not find "jspm.json" on path "${this.installedModulesPath}"`
      );
    }
    this._jspmJSON = require(jspmJSONPath);
    return this._jspmJSON;
  }

  get jspmJSON() {
    if (!this._jspmJSON) this.reloadJspmJSON();
    return this._jspmJSON;
  }

  saveJspmJSON() {
    const jspmJSONPath = path.join(this._installedModulesRootPath, 'jspm.json');
    fs.writeFileSync(
      jspmJSONPath,
      JSON.stringify(this.jspmJSON, null, 2),
      'utf8'
    );
  }

  addPomXml(moduleInfo) {
    const pom = returnPomXml({
      [moduleInfo.fullName]: this.jspmJSON.dependencies[moduleInfo.fullName],
    });
    fs.writeFile(
      this.destinationPath +
        '/' +
        moduleInfo.relativeDestinationPath +
        '/pom.xml',
      pom,
      (err) =>
        (err && console.error(err)) ||
        console.log(`### Finished writing pom.xml File`)
    );
  }
}

exports.JspmEngine = JspmEngine;
