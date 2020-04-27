const { returnPomXml } = require('./pom.js');
const xml2js = require('xml2js');
const assert = require('assert');

const testData = [
  {
    data: {
      'npm:@jspm/core@1.0.4': {
        source: '',
      },
    },
    expected: {
      groupId: 'jspm',
      artifactId: 'core',
      version: '1.0.4',
      dependencies: 0,
    },
  },
  {
    data: {
      'npm:loose-envify@1.4.0': {
        source: '',
        resolve: {
          'js-tokens': 'npm:js-tokens@4.0.0',
        },
      },
    },
    expected: {
      groupId: 'js',
      artifactId: 'loose-envify',
      version: '1.4.0',
      dependencies: 1,
    },
  },
  {
    data: {
      'npm:react@16.13.1': {
        source: '',
        resolve: {
          'prop-types': 'npm:prop-types@15.7.2',
          'loose-envify': 'npm:loose-envify@1.4.0',
          'object-assign': 'npm:object-assign@4.1.1',
        },
      },
    },
    expected: {
      groupId: 'js',
      artifactId: 'react',
      version: '16.13.1',
      dependencies: 3,
    },
  },
];

describe('Array', function () {
  describe('#returnPomXml()', function () {
    it('should return pom xml string', function () {
      testData.forEach((dep) => {
        const pom = returnPomXml(dep.data);
        // console.log(pom);
        const parser = new xml2js.Parser();

        parser.parseString(pom, function (err, result) {
          assert.equal(result.project.modelVersion[0], '4.0.0', 'modelVersion is wrong!');
          assert.equal(result.project.groupId[0], dep.expected.groupId, 'groupId is wrong!');
          assert.equal(
            result.project.artifactId[0],
            dep.expected.artifactId,
            'artifactId is wrong!'
          );
          assert.equal(result.project.version[0], dep.expected.version, 'version is wrong!');

          dep.expected.dependencies > 0
            ? assert.equal(
                result.project.dependencies[0].dependency.length,
                dep.expected.dependencies,
                'dependencies is wrong!'
              )
            : assert.equal(!!result.project.dependencies, false);
        });
      });
    });
  });
});
