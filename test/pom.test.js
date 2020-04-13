const assert = require('assert');
const xml2js = require('xml2js');

const { getDependencies, getPom } = require("../utils/versions/versions");

const testDepData = [
    {
        data: [
            { name: '@rollup/plugin-commonjs', versionRanges: ['^11.0.2'], resolvedVersion: '11.0.2' },
            { name: 'rollup', versionRanges: ['^2.2.0'], resolvedVersion: '2.2.0' },
            { name: 'lodash', versionRanges: ['^4.17.13'], resolvedVersion: '4.17.15' },
            { name: 'estree-walker', versionRanges: ['^1.0.1', '^1.0.1', '^0.6.1'], resolvedVersion: '2.0.1' },
            { name: 'magic-string', versionRanges: ['^0.25.2'], resolvedVersion: '0.25.7' },
            { name: 'resolve', versionRanges: ['^1.11.0', '^1.14.2', '1.15.1'], resolvedVersion: '1.15.1' },
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
            '<dependency>\n\t<groupId>types</groupId>\n\t<artifactId>resolve</artifactId>\n\t<version>[0.0.8, 0.0.8)</version>\n</dependency>'
        ]
    },
];

describe('Array', function () {
    describe('#getDependencies()', function () {
        it('should return xml string array', function () {
            testDepData.forEach(d => {
                const res = getDependencies(d.data);
                res.forEach((r, i) => {
                    assert.equal(r, d.expected[i], "dependency data is wrong!");
                })
            })
        });
    }),
        describe('#getPom()', function () {
            it('should return pom.xml as string', function () {
                const artifact = "tribefire.js.components:my-fancy-project#1.0"
                testDepData.forEach(d => {
                    const xmlPom = getPom(artifact, d.data);
                    const parser = new xml2js.Parser();

                    parser.parseString(xmlPom, function (err, result) {
                        assert.equal(result.project.modelVersion[0], '4.0.0', "modelVersion is wrong!");
                        assert.equal(result.project.groupId[0], 'tribefire.js.components', "groupId is wrong!");
                        assert.equal(result.project.artifactId[0], 'my-fancy-project', "artifactId is wrong!");
                        assert.equal(result.project.version[0], '1.0', "version is wrong!");
                        assert.equal(result.project.name[0], artifact, "artifactId is wrong!");
                        assert.equal(result.project.dependencies[0].dependency.length, d.expected.length, "dependencies is wrong!");
                    });
                })
            });
        });
});