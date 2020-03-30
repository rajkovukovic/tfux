"use strict";

const path = require("path");

function isGlobalModule(path) {
  if (!path) return false;
  return /[a-zA-Z0-9@]/.test(path[0]);
}

function granularImports({ importPrefix, dependencyVersions }) {
  let options = null;
  return {
    name: "granular-imports",
    options(currentOptions) {
      options = currentOptions;
      // console.log("options", options);
    },
    resolveId(lib) {
      console.log("resolveId", lib);
      if (options.input.indexOf(lib) === -1 && isGlobalModule(lib)) {
        console.log("FIXING LIB", lib);
        let libPath = lib.split("/");
        let libName = libPath.shift();
        if (libName[0] === "@") {
          libName += "/" + libPath.shift();
        }
        libPath = libPath.join("/");
        let libVersion = dependencyVersions[libName];
        if (!libVersion) {
          throw new Error(
            `dependencyVersions does not have "${lib}" in it's dependencies list`
          );
        }
        if (libVersion[0] === "^") libVersion = libVersion.slice(1);
        libVersion = libVersion
          .split(".")
          .slice(0, 2)
          .join(".");
        let nextSource = path.join(
          importPrefix,
          `${libName}-${libVersion}${libPath ? "/" + libPath : ""}${
            libPath ? ".js" : "/index.js"
          }`
        );
        // console.log("resolveId replacing", source, nextSource);
        return { id: nextSource, external: true };
      }
      // console.log("resolveId", source);
      return null;
    }
  };
}

exports.granularImports = granularImports;
