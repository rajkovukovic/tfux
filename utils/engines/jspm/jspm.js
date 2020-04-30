'use strict';

const fs = require('fs');
const path = require('path');
const { AbstractEngine } = require('../abstract-engine/abstract-engine.js');
const { transformAndCopyModules } = require('./transform/transform-and-copy-modules.js');
const { transformJsFile } = require('./transform/transform-js-file.js');
const { installDependenciesWithPeer } = require('./install/install-dependencies-with-peer.js');
const { returnPomXml } = require('../../versions/pom.js');
const { zipAndCopyToRepo } = require('../utils/generate-repo.js');

class JspmEngine extends AbstractEngine {
  constructor(...args) {
    super(...args);

    this._installedModulesRootPath = this._installedModulesPath;
    this._installedModulesPath = path.join(this._installedModulesPath, 'jspm_packages');

    this.transformAndCopyModules = transformAndCopyModules.bind(this);
    this.transformJsFile = transformJsFile.bind(this);
  }

  async installDependencies(dependencies, installTransitiveDependencies = true) {
    installDependenciesWithPeer(this, dependencies, installTransitiveDependencies, new Set());
    // make dependencies firex compatible and copy them to the global firex lib
    return await this.transformAndCopyModules();
  }

  reloadJspmJSON() {
    const jspmJSONPath = path.join(this._installedModulesRootPath, 'jspm.json');
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

  get jspmCoreVersion() {
    return this.jspmJSON.resolve['@jspm/core'].split('@').pop();
  }

  saveJspmJSON() {
    const jspmJSONPath = path.join(this._installedModulesRootPath, 'jspm.json');
    fs.writeFileSync(jspmJSONPath, JSON.stringify(this.jspmJSON, null, 2), 'utf8');
  }

  addPomXml(moduleInfo) {
    const pom = returnPomXml({
      [moduleInfo.fullName]: this.jspmJSON.dependencies[moduleInfo.fullName],
    });
    console.log({
      pom,
      deps: {
        [moduleInfo.fullName]: this.jspmJSON.dependencies[moduleInfo.fullName],
      },
    });
    if (pom) {
      fs.writeFileSync(
        path.join(this.destinationPath, moduleInfo.relativeDestinationPath, 'pom.xml'),
        pom,
        'utf8'
      );
      console.log('Finished writing pom.xml File for ' + moduleInfo.relativeDestinationPath);
    } else {
      console.log(`Pom file can not be generated for ${moduleInfo.fullName} !!!`);
    }
  }

  copyToRepo(moduleInfo) {
    zipAndCopyToRepo(moduleInfo.fullName, this._options);
  }
}

exports.JspmEngine = JspmEngine;
