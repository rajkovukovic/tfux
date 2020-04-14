'use strict';
const Constants = require('../constants/constants.js');

const semver = require('semver');

/**
 *
 * @param {[{min: string, max: string}]} arr
 * @param {string} resolved version
 *
 * @returns {string[]} eg. ['[1.2.7, 1.3.0)', '[1.3.5, 1.4.3)']
 */
function getPomVersionFormat(arr, resolved) {
  if (arr.length == 1) return [`[${arr[0].min}, ${arr[0].max})`];
  let range = {};
  const outOf = [];
  let resp = [];
  arr.forEach((r, i) => {
    if (i == 0) {
      range = r;
    } else {
      const tmpRange = intersectRange(range, r);
      range = tmpRange == null ? range : tmpRange;
      if (tmpRange == null) {
        // New range
        outOf.push(r);
      }
    }
  });
  resp.push(`[${range.min}, ${range.max})`);
  if (outOf.length > 1)
    resp = [...resp, ...getPomVersionFormat(outOf, resolved)];
  if (outOf.length == 1)
    resp = [...resp, ...outOf.map((o) => `[${o.min}, ${o.max})`)];
  return resp;
}

/**
 *
 * @param {string} range eg. ^6.2.3, *, 1.2.*, ~1.2.3 ... (see semver)
 * @param {string} resolved version
 *
 * @returns {{min: string, max: string}} eg. {min: 6.2.3, max: 6.3.0}
 */
function getPomRange(range, resolved) {
  // If exist =, or v or concrete version, then that version should be used, or new dependency added if version not mach some range
  // if || exist  - can  be treated as  new range - fixed in create range
  // if we can't find version which match all ranges, we should split in in 2 deps
  const minMax = { min: resolved, max: resolved };
  range = !range ? '*' : range;
  const rangeParts = range.split('.');
  range = rangeParts.length < 3 ? range + '.x' : range;
  range = range.replace(/ /g, '');
  range = range.startsWith('=') ? range.substring(1) : range;
  range = range.startsWith('v') ? range.substring(1) : range;
  // if (range) {
  try {
    //  Standard ranges
    if (range.startsWith('>=') || range.startsWith('>')) {
      const operator = range.indexOf('<=') > -1 ? '<=' : '<';
      const parts = range.split(operator);
      minMax.min = range.startsWith('>=')
        ? normalizeVersion(parts[0].substring(2))
        : nextPatch(normalizeVersion(parts[0].substring(1)));

      if (parts.length == 1) {
        minMax.max = nextMajor(minMax.min);
        return minMax;
      } else {
        minMax.max = operator === '<' ? parts[1] : nextPatch(parts[1]);
        return minMax;
      }
    }
    // Caret Ranges ^1.2.3 ^0.2.5 ^0.0.4
    if (range.startsWith('^')) {
      minMax.min = normalizeVersion(range.substring(1));
      minMax.max = range.startsWith('^0.0.')
        ? nextPatch(minMax.min)
        : range.startsWith('^0.')
        ? nextMinor(minMax.min)
        : nextMajor(minMax.min);
      return minMax;
    }
    //  Tilde Ranges ~1.2.3 ~1.2 ~1
    if (range.startsWith('~')) {
      minMax.min = normalizeVersion(range.substring(1));
      const part = minMax.min.split('.');
      minMax.max =
        part[1] == 0 && part[2] == 0
          ? nextMajor(minMax.min)
          : nextMinor(minMax.min);
      return minMax;
    }
    //  Hyphen Ranges X.Y.Z - A.B.C
    if (range.indexOf('-') > -1) {
      const rangePart = range.split('-');
      minMax.min = normalizeVersion(rangePart[0]);
      const maxNorm = normalizeVersion(rangePart[1]);
      const part = maxNorm.split('.');
      minMax.max =
        part[1] == 0 && part[2] == 0
          ? nextMajor(maxNorm)
          : part[2] == 0
          ? nextMinor(maxNorm)
          : nextPatch(maxNorm);
      return minMax;
    }

    // X-Ranges 1.2.x 1.X 1.2.* *
    if (range.indexOf('*') > -1 || range.indexOf('x') > -1) {
      minMax.min = normalizeVersion(range);
      const part = minMax.min.split('.');
      minMax.max =
        part[0] == 0
          ? '9999.9999.9999'
          : part[1] == 0
          ? nextMajor(minMax.min)
          : nextMinor(minMax.min);
      return minMax;
    }

    // Versions =1.2.3, v1.2.3, 1.2.3, =v1.2.3
    minMax.min = range;
    minMax.max = range;
    return minMax;
  } catch (err) {
    console.log(err, range);
  }
  return minMax;
}

function intersectRange(r1, r2) {
  const resp = {
    min: semver.compare(r1.min, r2.min) == 1 ? r1.min : r2.min,
    max: semver.compare(r1.max, r2.max) == 1 ? r2.max : r1.max,
  };
  return resp.min > resp.max ? null : resp;
}

function nextPatch(version) {
  const parts = version.split('.');
  return parts[0] + '.' + parts[1] + '.' + (Number(parts[2]) + 1);
}

function nextMajor(version) {
  const parts = version.split('.');
  return Number(parts[0]) + 1 + '.0.0';
}

function nextMinor(version) {
  const parts = version.split('.');
  return parts[0] + '.' + (Number(parts[1]) + 1) + '.0';
}

function normalizeVersion(version) {
  if (version === '') return '0.0.0';
  version = version.toLowerCase().replace(/\*/g, '0').replace(/\x/g, '0');
  const parts = version.split('.');
  return parts.length == 3
    ? parts.join('.')
    : parts.length == 2
    ? parts.join('.') + '.0'
    : version + '.0.0';
}

/**
 *
 * @param {[{ name, versionRanges, resolvedVersion }]} depMap
 *
 * @return {[string]} - xml dependency
 */
function getDependencies(depMap) {
  const resp = [];
  depMap.forEach((dep) => {
    const artifact = getGroupAndArt(dep.name);
    const ranges = getPomVersionFormat(
      dep.versionRanges.map((r) => getPomRange(r, dep.resolvedVersion)),
      dep.resolvedVersion
    );
    ranges.forEach((r) => {
      resp.push(
        '<dependency>\n' +
          `\t<groupId>${artifact.group}</groupId>\n` +
          `\t<artifactId>${artifact.artifact}</artifactId>\n` +
          `\t<version>${r}</version>\n` +
          '</dependency>'
      );
    });
  });
  return resp;
}

function getGroupAndArt(name) {
  const parts = name.split('/');
  if (parts.length > 1) {
    return {
      group: parts
        .splice(0, parts.length - 1)
        .join(Constants.GROUP_SEPARATOR)
        .replace('@', ''),
      artifact: parts[parts.length - 1],
    };
  } else {
    return {
      group: Constants.DEFAULT_GROUP,
      artifact: parts[0],
    };
  }
}

function getPom(artifact, depMap) {
  const tmp = artifact.replace('#', ':').split(':');
  let txt =
    '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">\n' +
    '\t<modelVersion>4.0.0</modelVersion>\n' +
    `\t<groupId>${tmp[0]}</groupId>\n` +
    `\t<artifactId>${tmp.length > 1 ? tmp[1] : ''}</artifactId>\n` +
    `\t<version>${tmp.length > 2 ? tmp[2] : ''}</version>\n` +
    '\t<packaging>pom</packaging>\n' +
    `\t<name>${artifact}</name>\n`;

  if (depMap.length > 0) txt += '\t<dependencies>\n';

  getDependencies(depMap).forEach((dep) => {
    txt += dep;
  });

  if (depMap.length > 0) txt += '\t</dependencies>\n';
  txt += '</project>';
  return txt;
}

exports.getPomVersionFormat = getPomVersionFormat;
exports.getPomRange = getPomRange;
exports.getDependencies = getDependencies;
exports.getPom = getPom;
exports.getGroupAndArt = getGroupAndArt;
