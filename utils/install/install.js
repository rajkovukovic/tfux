"use strict";

const { VATRA_LIB_PATH, TMP_DIR } = require("../constants");
const { installDependenciesToTempPath } = require("./install-dependencies");

function install(dependencyOrDependencies) {
  console.log({ VATRA_LIB_PATH, TMP_DIR });
  const dependencyArray = Array.isArray(dependencyOrDependencies)
    ? dependencyOrDependencies.join(" ")
    : dependencyOrDependencies;
    installDependenciesToTempPath(dependencyArray);
}

exports.install = install;
