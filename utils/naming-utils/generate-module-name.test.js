const assert = require('assert');

const { generateModuleName, moduleInfoToFolderName } = require('./generate-module-name.js');
const {
  DEFAULT_GROUP_FOR_3RD_PARTY,
  GROUP_SEPARATOR,
  VERSION_SEPARATOR,
} = require('../constants/constants.js');

describe('generateModuleName()', function () {
  const moduleGroup = 'tribefire';
  const moduleName = 'my_module';
  const moduleVersion = '1.0.0';

  /**
   * moduleGroup errors
   */
  it(`should throw an Error when module group is an Object`, function () {
    assert.throws(() => generateModuleName({}, moduleName, moduleVersion));
  });

  /**
   * moduleName errors
   */
  it(`should throw an Error when module name is an empty string`, function () {
    assert.throws(() => generateModuleName('npm', '', moduleVersion));
  });

  it(`should throw an Error when module name is null`, function () {
    assert.throws(() => generateModuleName('npm', null, moduleVersion));
  });

  it(`should throw an Error when module name is undefined`, function () {
    assert.throws(() => generateModuleName('npm', undefined, moduleVersion));
  });

  it(`should throw an Error when module name is an Object`, function () {
    assert.throws(() => generateModuleName('npm', {}, moduleVersion));
  });

  /**
   * moduleVersion errors
   */
  it(`should throw an Error when module version is an empty string`, function () {
    assert.throws(() => generateModuleName('npm', moduleName, ''));
  });

  it(`should throw an Error when module version is null`, function () {
    assert.throws(() => generateModuleName('npm', moduleName, null));
  });

  it(`should throw an Error when module version is undefined`, function () {
    assert.throws(() => generateModuleName('npm', moduleName, undefined));
  });

  it(`should throw an Error when module version is an Object`, function () {
    assert.throws(() => generateModuleName('npm', moduleName, {}));
  });

  it(`should throw an Error when module name has more than 1 layer of nesting`, function () {
    assert.throws(() =>
      generateModuleName(null, `@${moduleGroup}/nested/${moduleName}`, moduleVersion)
    );
  });

  /**
   * happy paths
   */
  it(`should use read group name from module name i.e. '@${moduleGroup}/${moduleName}'`, function () {
    assert.equal(
      generateModuleName(null, `@${moduleGroup}/${moduleName}`, moduleVersion),
      `${moduleGroup}${GROUP_SEPARATOR}${moduleName}${VERSION_SEPARATOR}${moduleVersion}`
    );
  });

  it(`should use read group name from module name without '@'`, function () {
    assert.equal(
      generateModuleName(null, `${moduleGroup}/${moduleName}`, moduleVersion),
      `${moduleGroup}${GROUP_SEPARATOR}${moduleName}${VERSION_SEPARATOR}${moduleVersion}`
    );
  });

  it(`should use '${DEFAULT_GROUP_FOR_3RD_PARTY}' as a default group name, when provided group name is null`, function () {
    assert.equal(
      generateModuleName(null, moduleName, moduleVersion),
      `${DEFAULT_GROUP_FOR_3RD_PARTY}${GROUP_SEPARATOR}${moduleName}${VERSION_SEPARATOR}${moduleVersion}`
    );
  });

  it(`should use '${DEFAULT_GROUP_FOR_3RD_PARTY}' as a default group name, when provided group name is undefined`, function () {
    assert.equal(
      generateModuleName(undefined, moduleName, moduleVersion),
      `${DEFAULT_GROUP_FOR_3RD_PARTY}${GROUP_SEPARATOR}${moduleName}${VERSION_SEPARATOR}${moduleVersion}`
    );
  });

  it(`should use '${DEFAULT_GROUP_FOR_3RD_PARTY}' as a default group name, when provided group name is an empty string`, function () {
    assert.equal(
      generateModuleName('', moduleName, moduleVersion),
      `${DEFAULT_GROUP_FOR_3RD_PARTY}${GROUP_SEPARATOR}${moduleName}${VERSION_SEPARATOR}${moduleVersion}`
    );
  });

  it(`should use '${DEFAULT_GROUP_FOR_3RD_PARTY}' as a default group name, when provided group name is 'npm'`, function () {
    assert.equal(
      generateModuleName('npm', moduleName, moduleVersion),
      `${DEFAULT_GROUP_FOR_3RD_PARTY}${GROUP_SEPARATOR}${moduleName}${VERSION_SEPARATOR}${moduleVersion}`
    );
  });
});

describe('moduleInfoToFolderName()', function () {
  const moduleGroup = 'tribefire';
  const moduleName = 'my_module';
  const moduleVersion = '1.0.0';

  const moduleInfo = {
    group: moduleGroup,
    name: moduleName,
    version: moduleVersion,
  };

  it(`should throw an Error when moduleInfo is null`, function () {
    assert.throws(() => moduleInfoToFolderName(null));
  });

  it(`should throw an Error when moduleInfo is a string`, function () {
    assert.throws(() => moduleInfoToFolderName('this should throw an error'));
  });

  it(`should have accurate return value with properly object as argument`, function () {
    assert.equal(
      moduleInfoToFolderName(moduleInfo),
      `${moduleGroup}${GROUP_SEPARATOR}${moduleName}${VERSION_SEPARATOR}${moduleVersion}`
    );
  });
});
