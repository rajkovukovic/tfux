'use strict';

const fs = require('fs');
const mkdirp = require('mkdirp');
const rimraf = require('rimraf');
const { transformModule } = require('./transform/transform-module.js');

class AbstractEngine {
  _destinationPath;
  _installedModulesPath;

  constructor(destinationPath, installedModulesPath) {
    if (!destinationPath)
      throw new Error(
        'destinationPath is a required param for PackageManagerEngine'
      );

    if (!installedModulesPath)
      throw new Error(
        'installedModulesPath is a required param for PackageManagerEngine'
      );

    // create destination path if not exists
    if (!fs.existsSync(destinationPath)) {
      mkdirp.sync(destinationPath);
    }

    // create tmp install path if does not already exist
    if (fs.existsSync(installedModulesPath)) {
      rimraf.sync(installedModulesPath);
    }
    mkdirp.sync(installedModulesPath);

    this._destinationPath = destinationPath;
    this._installedModulesPath = installedModulesPath;

    this.transformModule = transformModule.bind(this);
  }

  get destinationPath() {
    return this._destinationPath;
  }

  get installedModulesPath() {
    return this._installedModulesPath;
  }

  installDependencies() {
    throw new Error(
      'installDependencies is an abstract method that needs to be implemented by a derived class'
    );
  }

  transformAndCopyModules() {
    throw new Error(
      'transformAndCopyModules is an abstract method that needs to be implemented by a derived class'
    );
  }

  transformJsFile() {
    throw new Error(
      'transformJsFile is an abstract method that needs to be implemented by a derived class'
    );
  }

  addPomXml() {
    throw new Error(
      'addPomXml is an abstract method that needs to be implemented by a derived class'
    );
  }

  copyToMvnRepo() {
    throw new Error(
      'copyToMvnRepo is an abstract method that needs to be implemented by a derived class'
    );
  }
}

exports.AbstractEngine = AbstractEngine;
