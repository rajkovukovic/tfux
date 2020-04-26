'use strict';

const fs = require('fs');
const { getPom } = require('./versions/versions');
const { logger } = require('./logger/logger.js');

logger.info('### Started Readin package-lock');

const packLock = require('../package-lock.json');
const pack = require('../package.json');

logger.info('### package-lock: ', packLock.name, packLock.version);

let requiresMap = {};

Object.entries(pack.dependencies).forEach((d) => {
  requiresMap[d[0]] = {
    name: d[0],
    versionRanges: [d[1]],
    resolvedVersion: packLock.dependencies[d[0]] ? packLock.dependencies[d[0]].version : '',
  };
});

Object.entries(packLock.dependencies)
  .filter((dep) => !dep[1].dev && dep[1].requires)
  .forEach((d) => {
    Object.entries(d[1].requires).forEach((r) => {
      requiresMap[r[0]] = requiresMap[r[0]]
        ? { ...requiresMap[r[0]], versionRanges: [...requiresMap[r[0]].versionRanges, r[1]] }
        : {
            name: r[0],
            versionRanges: [r[1]],
            resolvedVersion: packLock.dependencies[r[0]].version,
          };
    });
  });
writePom(
  'pom.xml',
  getPom(`test.pom.parser:${pack.name}#${pack.version}`, Object.values(requiresMap))
);

function writePom(name, txt) {
  fs.writeFile(
    name,
    txt,
    (err) => (err && logger.error(err)) || logger.info(`### Finished writing pom.xml File`)
  );
}
