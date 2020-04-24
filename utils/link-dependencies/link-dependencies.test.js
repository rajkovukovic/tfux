const assert = require('assert');
const sinon = require('sinon');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

const { VATRA_LIB_NAME, VATRA_LIB_PATH } = require('../constants/constants.js');
const { linkDependencies } = require('./link-dependencies.js');

let fakeExistsSync = sinon.fake.returns(true);
let fakeMkdirpSync = sinon.fake();
let symlinkMap = new Map();

function beforeAll() {
  sinon.stub(fs, 'symlinkSync').callsFake((target, source) => {
    if (symlinkMap.has(target)) {
      throw new Error(`Can not overwrite symlink at location '${target}'`);
    }
    symlinkMap.set(target, source);
  });

  fakeExistsSync = sinon.fake();
  fakeMkdirpSync = sinon.fake();
  sinon.replace(fs, 'existsSync', fakeExistsSync);
  sinon.replace(mkdirp, 'sync', fakeMkdirpSync);
}

function afterAll() {
  sinon.restore();
}

function beforeEach() {
  fakeExistsSync.resetHistory();
  fakeMkdirpSync.resetHistory();
  symlinkMap.clear();
}

function checkSymLinks(targetPath, targetFiles, sourcePath, sourceFiles) {
  const notLinkedTargets = [];
  const extraLinkedTargets = [];
  const incorrectlyLinkedSources = [];

  targetFiles.forEach((_, index) => {
    const targetFile = path.join(targetPath, targetFiles[index]);
    const sourceFile = path.join(sourcePath, sourceFiles[index]);
    if (!symlinkMap.has(targetFile)) {
      notLinkedTargets.push([targetFile, sourceFile]);
    } else if (symlinkMap.get(targetFile) !== sourceFile) {
      incorrectlyLinkedSources.push({
        actual__: `${targetFile} -> ${symlinkMap.get(targetFile)}`,
        expected: `${targetFile} -> ${sourceFile}`,
      });
    }
  });

  const targetFilesSet = new Set(
    targetFiles.map((targetFile) => path.join(targetPath, targetFile))
  );
  Array.from(symlinkMap.keys()).forEach((linkedTarget) => {
    if (!targetFilesSet.has(linkedTarget)) {
      extraLinkedTargets.push([linkedTarget, symlinkMap.get(linkedTarget)]);
    }
  });

  if (notLinkedTargets.length + extraLinkedTargets.length + incorrectlyLinkedSources.length === 0) {
    return true;
  }

  return {
    errors: {
      notLinkedTargets: notLinkedTargets.length > 0 ? notLinkedTargets : null,
      extraLinkedTargets: extraLinkedTargets.length > 0 ? extraLinkedTargets : null,
      incorrectlyLinkedSources:
        incorrectlyLinkedSources.length > 0 ? incorrectlyLinkedSources : null,
    },
  };
}

describe('generateModuleName()', function () {
  this.beforeAll(beforeAll);
  this.afterAll(afterAll);
  this.beforeEach(beforeEach);

  const destinationPath = '/';
  const sourceFiles = ['js.lodash-4.0.0', 'js.rxjs-5.0.0'];
  const destinationFiles = ['js.lodash-4.0', 'js.rxjs-5.0'];
  const destinationLibPath = path.join(destinationPath, VATRA_LIB_NAME);

  it(`should create destination lib folder`, function () {
    linkDependencies(destinationPath, sourceFiles);
    assert.equal(fakeMkdirpSync.calledOnceWith(destinationLibPath), true);
  });

  it(`should create symlinks`, function () {
    linkDependencies(destinationPath, sourceFiles);
    assert.deepEqual(
      checkSymLinks(VATRA_LIB_PATH, sourceFiles, destinationLibPath, destinationFiles),
      true
    );
  });
});
