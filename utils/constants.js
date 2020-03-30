"use strict";

const os = require("os");
const path = require("path");
const untildify = require("untildify");

const CWD = process.cwd();
const JSPM_BIN_PATH = path.join(CWD, "node_modules/.bin/jspm");
const TMP_DIR = path.resolve(untildify(path.join(os.tmpdir(), "vatra")));
const VATRA_PATH_ENV = process.env.VATRA_PATH;
const VATRA_PATH = path.resolve(
  VATRA_PATH_ENV ? untildify(VATRA_PATH_ENV) : untildify("~/.vatra")
);
const VATRA_LIB_NAME = "lib";
const VATRA_LIB_PATH = path.join(VATRA_PATH, VATRA_LIB_NAME);
const JS_EXTENSIONS = [".js", ".mjs"];

exports.CWD = CWD;
exports.JSPM_BIN_PATH = JSPM_BIN_PATH;
exports.TMP_DIR = TMP_DIR;
exports.VATRA_PATH = VATRA_PATH;
exports.VATRA_LIB_NAME = VATRA_LIB_NAME;
exports.VATRA_LIB_PATH = VATRA_LIB_PATH;
exports.JS_EXTENSIONS = JS_EXTENSIONS;
