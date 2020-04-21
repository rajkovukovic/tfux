'use strict';

const path = require('path');

const modulesToSkip = new Set(['fs', 'module']);

function isGlobalModule(path) {
  if (!path) return false;
  return /[a-zA-Z0-9@]/.test(path[0]);
}

function makeImportsRelative({ inputFilePath, moduleInfo, importPrefix, dependencyMap }) {
  let options = null;
  return {
    name: 'granular-imports',
    options(currentOptions) {
      options = currentOptions;
      // console.log("options", options);
    },
    resolveId(lib) {
      if (modulesToSkip.has(lib)) {
        return { id: lib, external: true };
      }

      let libPath;
      let libName;
      let isNodeInternalLib = false;

      try {
        if (options.input.indexOf(lib) === -1 && isGlobalModule(lib)) {
          libPath = lib.split('/');

          libName = libPath.shift();

          // if lib name starts with @ symbol
          // it is in format "@groupName/libName"
          if (libName[0] === '@') {
            libName += '/' + libPath.shift();
          }

          libPath = libPath.join('/');

          const libMapKey =
            moduleInfo && moduleInfo.dependencies
              ? moduleInfo.dependencies.find((dependencyFullName) => {
                  const key = dependencyMap.get(dependencyFullName);
                  return key && key.name === libName;
                }) || null
              : null;

          let libInfo = libMapKey ? dependencyMap.get(libMapKey) : null;

          if (!libInfo) {
            const nodeInternalLibs = dependencyMap.get('node');
            isNodeInternalLib = true;
            libInfo = nodeInternalLibs.get(libName);
          }

          if (!libInfo) {
            throw new Error(
              Boolean(libMapKey)
                ? `dependencyMap does not have "${libMapKey}" lib. Can not resolve.`
                : `In file "${inputFilePath}": can not find "${
                    libName ? libName : `lib: ${lib}`
                  }" in "${moduleInfo.fullName}" module's dependencies`
            );
          }

          let nextSource = path.join(
            importPrefix,
            `${libInfo.importPath}${libPath ? '/' + libPath : ''}${
              libPath || isNodeInternalLib ? '' : '/index.js'
            }`
          );

          // console.log("make-imports-relative replacing", {
          //   lib,
          //   nex: nextSource,
          // });
          return { id: nextSource, external: true };
        }
        return null;
      } catch (error) {
        console.error('makeImportsRelative -> resolveId', error);
        return { id: libName, external: true };
      }
    },
  };
}

exports.makeImportsRelative = makeImportsRelative;
