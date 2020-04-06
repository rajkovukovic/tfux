const assert = require('assert');

const { getPomVersionFormat } = require("../utils/versions/versions");
const { getPomRange } = require("../utils/versions/versions");

const testData = [
    { data: [{ max: '1.3.3', min: '1.2.7' }], expected: ['[1.2.7, 1.3.3)'] },
    { data: [{ max: '1.3.0', min: '1.2.7' }, { max: '1.3.3', min: '1.2.7' }], expected: ['[1.2.7, 1.3.0)'] },
    { data: [{ max: '1.3.0', min: '1.2.7' }, { max: '1.3.3', min: '1.2.7' }, { max: '1.4.3', min: '1.2.0' }], expected: ['[1.2.7, 1.3.0)'] },
    { data: [{ max: '1.3.0', min: '1.2.7' }, { max: '1.3.3', min: '1.2.7' }, { max: '1.4.3', min: '1.3.0' }], expected: ['[1.3.0, 1.3.0)'] },
    { data: [{ max: '1.3.0', min: '1.2.7' }, { max: '1.3.3', min: '1.2.7' }, { max: '1.4.3', min: '1.3.5' }], expected: ['[1.2.7, 1.3.0)', '[1.3.5, 1.4.3)'] },
    { data: [{ max: '1.3.0', min: '1.2.7' }, { max: '1.3.3', min: '1.2.7' }, { max: '1.4.3', min: '1.3.5' }, { max: '1.4.3', min: '1.4.1' }], expected: ['[1.2.7, 1.3.0)', '[1.4.1, 1.4.3)'] },
    { data: [{ max: '1.3.0', min: '1.2.7' }, { max: '1.3.3', min: '1.2.7' }, { max: '1.4.3', min: '1.3.7' }, { max: '1.3.5', min: '1.3.4' }], expected: ['[1.2.7, 1.3.0)', '[1.3.7, 1.4.3)', '[1.3.4, 1.3.5)'] },
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
    { data: '^0.0.x', expected: { max: '0.0.1', min: '0.0.0' } },  // ???  max = 0.1.0 ?
    { data: '^0.0.x', expected: { max: '0.0.1', min: '0.0.0' } },  // ???  max = 0.1.0 ?
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

describe('Array', function () {
    describe('#getPomRange()', function () {
        it('should return min and max version', function () {
            testRangeData.forEach(d => {
                const res = getPomRange(d.data, '');
                // console.log(d, res);
                assert.equal(res.min, d.expected.min, "min data is wrong for " + d.data);
                assert.equal(res.max, d.expected.max, "max data is wrong for " + d.data);
            })
        });
    });


    describe('#getPomVersionFormat()', function () {
        it('should return ranges', function () {
            testData.forEach(d => {
                const res = getPomVersionFormat(d.data, '');
                assert.equal(JSON.stringify(res), JSON.stringify(d.expected), "range data is wrong for " + JSON.stringify(d.data) + " resp: " + res);
            })
        });
    });
});