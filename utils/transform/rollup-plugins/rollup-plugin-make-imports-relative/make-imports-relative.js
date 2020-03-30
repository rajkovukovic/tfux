"use strict";

const path = require("path");

function isGlobalModule(path) {
  if (!path) return false;
  return /[a-zA-Z0-9@]/.test(path[0]);
}

function makeImportsRelative({ currentModule, importPrefix, dependencyMap }) {
  let options = null;
  return {
    name: "granular-imports",
    options(currentOptions) {
      options = currentOptions;
      // console.log("options", options);
    },
    resolveId(lib) {
      let libPath;
      let libName;
      let isNodeInternalLib = false;

      try {
        if (options.input.indexOf(lib) === -1 && isGlobalModule(lib)) {
          libPath = lib.split("/");

          libName = libPath.shift();

          // if lib name starts with @ symbol
          // it is in format "@groupName/libName"
          if (libName[0] === "@") {
            libName += "/" + libPath.shift();
          }

          libPath = libPath.join("/");

          const libMapKey =
            currentModule && currentModule.dependencies
              ? currentModule.dependencies.find(dependencyFullName => {
                  const libMapKey = dependencyMap.get(dependencyFullName);
                  return libMapKey && libMapKey.name === libName;
                }) || null
              : null;

          let libInfo = libMapKey ? dependencyMap.get(libMapKey) : null;

          if (!libInfo) {
            const nodeInternalLibs = dependencyMap.get("node");
            isNodeInternalLib = true;
            libInfo = nodeInternalLibs.get(libName);
          }

          if (!libInfo) {
            if (!libName) debugger;
            throw new Error(
              Boolean(libMapKey)
                ? `dependencyMap does not have "${libMapKey}" lib. Can not resolve.`
                : `can not find "${libName ? libName : `lib: ${lib}`}" in "${
                    currentModule.fullName
                  }" module's dependencies`
            );
          }

          let nextSource = path.join(
            importPrefix,
            `${libInfo.libDirectoryName}${libPath ? "/" + libPath : ""}${
              libPath || isNodeInternalLib ? "" : "/index.js"
            }`
          );

          console.log("resolveId replacing", {
            lib,
            nextSource,
          });
          return { id: nextSource, external: true };
        }
        // console.log("resolveId", source);
        return null;
      } catch (error) {
        console.error("makeImportsRelative -> resolveId", error);
        return { id: libName, external: true };
      }
    }
  };
}

exports.makeImportsRelative = makeImportsRelative;
