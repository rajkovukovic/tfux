const assert = require('assert');
const sinon = require('sinon');
const childProcess = require('child_process');

const { jspmFormatDependencies } = require('./install-dependencies-with-peer.js');

let reloadJspmJSON = sinon.fake();
let engine = {
  reloadJspmJSON,
};
let fakeExistsSync = sinon.fake();

function beforeAll() {
  sinon.replace(childProcess, 'execSync', fakeExistsSync);
}

function afterAll() {
  sinon.restore();
}

function beforeEach() {
  engine.reloadJspmJSON.resetHistory();
}

describe('generateModuleName()', function () {
  this.beforeAll(beforeAll);
  this.afterAll(afterAll);
  this.beforeEach(beforeEach);

  it(`jspmFormatDependencies should work properly`, function () {
    const input = {
      '@jspm/core': 'npm:@jspm/core@1.1.1',
      react: 'npm:react@16.13.1',
    };
    const expectedOutput = ['npm:react@16.13.1'];
    const output = jspmFormatDependencies(input);
    assert.deepEqual(output, expectedOutput);
  });

  // TODO: test installDependenciesWithPeer function
});
