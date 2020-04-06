"use strict";

const os = require("os");
const path = require("path");
const untildify = require("untildify");

const NODE_MODULES_PATH = path.join(
  require.resolve("jspm").split("/node_modules/")[0],
  "node_modules"
);
const JSPM_BIN_PATH = path.join(NODE_MODULES_PATH, ".bin/jspm");
const CWD = process.cwd();
const TMP_DIR = path.resolve(untildify(path.join(os.tmpdir(), "vatra")));
const VATRA_PATH_ENV = process.env.VATRA_PATH;
const VATRA_PATH = path.resolve(
  VATRA_PATH_ENV ? untildify(VATRA_PATH_ENV) : untildify("~/.vatra")
);
const VATRA_LIB_NAME = "lib";
const VATRA_LIB_PATH = path.join(VATRA_PATH, VATRA_LIB_NAME);
const JS_EXTENSIONS = [".js", ".mjs"];

const DEFAULT_GROUP = "js";
const GROUP_SEPARATOR = ".";
const VERSION_SEPARATOR = "-";

exports.JSPM_BIN_PATH = JSPM_BIN_PATH;
exports.CWD = CWD;
exports.TMP_DIR = TMP_DIR;
exports.VATRA_PATH = VATRA_PATH;
exports.VATRA_LIB_NAME = VATRA_LIB_NAME;
exports.VATRA_LIB_PATH = VATRA_LIB_PATH;
exports.JS_EXTENSIONS = JS_EXTENSIONS;
exports.DEFAULT_GROUP = DEFAULT_GROUP;
exports.GROUP_SEPARATOR = GROUP_SEPARATOR;
exports.VERSION_SEPARATOR = VERSION_SEPARATOR;
