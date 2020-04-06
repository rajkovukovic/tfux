"use strict";

const os = require("os");
const path = require("path");
const untildify = require("untildify");

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
const VERSION_SEPARATOR = ".";

exports.TMP_DIR = TMP_DIR;
exports.VATRA_PATH = VATRA_PATH;
exports.VATRA_LIB_NAME = VATRA_LIB_NAME;
exports.VATRA_LIB_PATH = VATRA_LIB_PATH;
exports.JS_EXTENSIONS = JS_EXTENSIONS;
exports.DEFAULT_GROUP = DEFAULT_GROUP;
exports.GROUP_SEPARATOR = GROUP_SEPARATOR;
exports.VERSION_SEPARATOR = VERSION_SEPARATOR;

