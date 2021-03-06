const assert = require('assert');
const xml2js = require('xml2js');

const { getPomVersionFormat, getDependencies, getPom, getPomRange } = require('./versions.js');

const testData = [
  { data: [{ max: '1.3.3', min: '1.2.7' }], expected: ['[1.2.7, 1.3.3)'] },
  {
    data: [
      { max: '1.3.0', min: '1.2.7' },
      { max: '1.3.3', min: '1.2.7' },
    ],
    expected: ['[1.2.7, 1.3.0)'],
  },
  {
    data: [
      { max: '1.3.0', min: '1.2.7' },
      { max: '1.3.3', min: '1.2.7' },
      { max: '1.4.3', min: '1.2.0' },
    ],
    expected: ['[1.2.7, 1.3.0)'],
  },
  {
    data: [
      { max: '1.3.0', min: '1.2.7' },
      { max: '1.3.3', min: '1.2.7' },
      { max: '1.4.3', min: '1.3.0' },
    ],
    expected: ['[1.3.0, 1.3.0)'],
  },
  {
    data: [
      { max: '1.3.0', min: '1.2.7' },
      { max: '1.3.3', min: '1.2.7' },
      { max: '1.4.3', min: '1.3.5' },
    ],
    expected: ['[1.2.7, 1.3.0)', '[1.3.5, 1.4.3)'],
  },
  {
    data: [
      { max: '1.3.0', min: '1.2.7' },
      { max: '1.3.3', min: '1.2.7' },
      { max: '1.4.3', min: '1.3.5' },
      { max: '1.4.3', min: '1.4.1' },
    ],
    expected: ['[1.2.7, 1.3.0)', '[1.4.1, 1.4.3)'],
  },
  {
    data: [
      { max: '1.3.0', min: '1.2.7' },
      { max: '1.3.3', min: '1.2.7' },
      { max: '1.4.3', min: '1.3.7' },
      { max: '1.3.5', min: '1.3.4' },
    ],
    expected: ['[1.2.7, 1.3.0)', '[1.3.7, 1.4.3)', '[1.3.4, 1.3.5)'],
  },
];

const testRangeData = [
  //  Standard ranges
  { data: '>=1.2.7 <1.3.0', expected: { max: '1.3.0', min: '1.2.7' } },
  { data: '>=1.2.7', expected: { max: '2.0.0', min: '1.2.7' } }, // ??? Check it
  { data: '>=1.2.7 <=1.3.0', expected: { max: '1.3.1', min: '1.2.7' } },
  { data: '>1.2.7 <1.3.0', expected: { max: '1.3.0', min: '1.2.8' } },
  { data: '>1.2.7', expected: { max: '2.0.0', min: '1.2.8' } },
  { data: '>1.2.x', expected: { max: '2.0.0', min: '1.2.1' } },
  { data: '>1.2', expected: { max: '2.0.0', min: '1.2.1' } },
  { data: '>=1.2.x', expected: { max: '2.0.0', min: '1.2.0' } },
  { data: '>=1.2', expected: { max: '2.0.0', min: '1.2.0' } },
  // Caret Ranges ^1.2.3 ^0.2.5 ^0.0.4
  { data: '^1.2.3', expected: { max: '2.0.0', min: '1.2.3' } },
  { data: '^0.2.3', expected: { max: '0.3.0', min: '0.2.3' } },
  { data: '^0.0.3', expected: { max: '0.0.4', min: '0.0.3' } },
  { data: '^1.2.x', expected: { max: '2.0.0', min: '1.2.0' } },
  { data: '^0.0.x', expected: { max: '0.0.1', min: '0.0.0' } }, // ???  max = 0.1.0 ?
  { data: '^0.0.x', expected: { max: '0.0.1', min: '0.0.0' } }, // ???  max = 0.1.0 ?
  { data: '^1.x', expected: { max: '2.0.0', min: '1.0.0' } },
  { data: '^0.x', expected: { max: '0.1.0', min: '0.0.0' } },
  //  Tilde Ranges ~1.2.3 ~1.2 ~1
  { data: '~1.2.3', expected: { max: '1.3.0', min: '1.2.3' } },
  { data: '~1.2', expected: { max: '1.3.0', min: '1.2.0' } },
  { data: '~1', expected: { max: '2.0.0', min: '1.0.0' } },
  { data: '~1.2.x', expected: { max: '1.3.0', min: '1.2.0' } },
  { data: '~1.x', expected: { max: '2.0.0', min: '1.0.0' } },
  { data: '~0.2.3', expected: { max: '0.3.0', min: '0.2.3' } },
  { data: '~0.2', expected: { max: '0.3.0', min: '0.2.0' } },
  { data: '~0', expected: { max: '1.0.0', min: '0.0.0' } },
  { data: '~0.2.x', expected: { max: '0.3.0', min: '0.2.0' } },
  { data: '~0.x', expected: { max: '1.0.0', min: '0.0.0' } },
  //  Hyphen Ranges X.Y.Z - A.B.C
  { data: '1.2.3 - 2.3.4', expected: { max: '2.3.5', min: '1.2.3' } },
  { data: '1.2 - 2.3', expected: { max: '2.4.0', min: '1.2.0' } },
  { data: '1 - 2.3.4', expected: { max: '2.3.5', min: '1.0.0' } },
  { data: '1.2.3 - 2.3', expected: { max: '2.4.0', min: '1.2.3' } },
  { data: '1.2.3 - 2', expected: { max: '3.0.0', min: '1.2.3' } },
  // X-Ranges 1.2.x 1.X 1.2.* *
  { data: '*', expected: { max: '9999.9999.9999', min: '0.0.0' } },
  { data: '1.x', expected: { max: '2.0.0', min: '1.0.0' } },
  { data: '1.2.x', expected: { max: '1.3.0', min: '1.2.0' } },
  { data: '', expected: { max: '9999.9999.9999', min: '0.0.0' } },
  { data: '1', expected: { max: '2.0.0', min: '1.0.0' } },
  { data: '1.2', expected: { max: '1.3.0', min: '1.2.0' } },
  // Versions =1.2.3, v1.2.3, 1.2.3, =v1.2.3
  { data: '1.2.3', expected: { max: '1.2.3', min: '1.2.3' } },
  { data: '=1.2.3', expected: { max: '1.2.3', min: '1.2.3' } },
  { data: 'v1.2.3', expected: { max: '1.2.3', min: '1.2.3' } },
];

const testDepData = [
  {
    data: [
      { name: '@rollup/plugin-commonjs', versionRanges: ['^11.0.2'], resolvedVersion: '11.0.2' },
      { name: 'rollup', versionRanges: ['^2.2.0'], resolvedVersion: '2.2.0' },
      { name: 'lodash', versionRanges: ['^4.17.13'], resolvedVersion: '4.17.15' },
      {
        name: 'estree-walker',
        versionRanges: ['^1.0.1', '^1.0.1', '^0.6.1'],
        resolvedVersion: '2.0.1',
      },
      { name: 'magic-string', versionRanges: ['^0.25.2'], resolvedVersion: '0.25.7' },
      {
        name: 'resolve',
        versionRanges: ['^1.11.0', '^1.14.2', '1.15.1'],
        resolvedVersion: '1.15.1',
      },
      { name: '@types/resolve', versionRanges: ['0.0.8'], resolvedVersion: '0.0.8' },
    ],
    expected: [
      '<dependency>\n\t<groupId>rollup</groupId>\n\t<artifactId>plugin-commonjs</artifactId>\n\t<version>[11.0.2, 12.0.0)</version>\n</dependency>',
      '<dependency>\n\t<groupId>js</groupId>\n\t<artifactId>rollup</artifactId>\n\t<version>[2.2.0, 3.0.0)</version>\n</dependency>',
      '<dependency>\n\t<groupId>js</groupId>\n\t<artifactId>lodash</artifactId>\n\t<version>[4.17.13, 5.0.0)</version>\n</dependency>',
      '<dependency>\n\t<groupId>js</groupId>\n\t<artifactId>estree-walker</artifactId>\n\t<version>[1.0.1, 2.0.0)</version>\n</dependency>',
      '<dependency>\n\t<groupId>js</groupId>\n\t<artifactId>estree-walker</artifactId>\n\t<version>[0.6.1, 0.7.0)</version>\n</dependency>',
      '<dependency>\n\t<groupId>js</groupId>\n\t<artifactId>magic-string</artifactId>\n\t<version>[0.25.2, 0.26.0)</version>\n</dependency>',
      '<dependency>\n\t<groupId>js</groupId>\n\t<artifactId>resolve</artifactId>\n\t<version>[1.15.1, 1.15.1)</version>\n</dependency>',
      '<dependency>\n\t<groupId>types</groupId>\n\t<artifactId>resolve</artifactId>\n\t<version>[0.0.8, 0.0.8)</version>\n</dependency>',
    ],
  },
];

describe('Array', function () {
  describe('#getPomRange()', function () {
    it('should return min and max version', function () {
      testRangeData.forEach((d) => {
        const res = getPomRange(d.data, '');
        // console.log(d, res);
        assert.equal(res.min, d.expected.min, 'min data is wrong for ' + d.data);
        assert.equal(res.max, d.expected.max, 'max data is wrong for ' + d.data);
      });
    });
  });

  describe('#getPomVersionFormat()', function () {
    it('should return ranges', function () {
      testData.forEach((d) => {
        const res = getPomVersionFormat(d.data, '');
        assert.equal(
          JSON.stringify(res),
          JSON.stringify(d.expected),
          'range data is wrong for ' + JSON.stringify(d.data) + ' resp: ' + res
        );
      });
    });
  });

  describe('#getDependencies()', function () {
    it('should return xml string array', function () {
      testDepData.forEach((d) => {
        const res = getDependencies(d.data);
        res.forEach((r, i) => {
          assert.equal(r, d.expected[i], 'dependency data is wrong!');
        });
      });
    });
  });
  describe('#getPom()', function () {
    it('should return pom.xml as string', function () {
      const artifact = 'tribefire.js.components:my-fancy-project#1.0';
      testDepData.forEach((d) => {
        const xmlPom = getPom(artifact, d.data);
        const parser = new xml2js.Parser();

        parser.parseString(xmlPom, function (err, result) {
          assert.equal(result.project.modelVersion[0], '4.0.0', 'modelVersion is wrong!');
          assert.equal(result.project.groupId[0], 'tribefire.js.components', 'groupId is wrong!');
          assert.equal(result.project.artifactId[0], 'my-fancy-project', 'artifactId is wrong!');
          assert.equal(result.project.version[0], '1.0', 'version is wrong!');
          assert.equal(result.project.name[0], artifact, 'artifactId is wrong!');
          assert.equal(
            result.project.dependencies[0].dependency.length,
            d.expected.length,
            'dependencies is wrong!'
          );
        });
      });
    });
  });
});
