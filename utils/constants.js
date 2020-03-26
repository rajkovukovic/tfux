"use strict";

const os = require("os");
const path = require("path");
const untildify = require("untildify");

const TMP_DIR = path.resolve(untildify(path.join(os.tmpdir(), 'tfux')));
const TFUX_PATH = path.resolve(untildify(process.env.TFUX_PATH));
const TFUX_LIB_NAME = "lib";
const TFUX_LIB_PATH = path.join(TFUX_PATH, TFUX_LIB_NAME);
const JS_EXTENSIONS = [".js", ".mjs"];

exports.TMP_DIR = TMP_DIR;
exports.TFUX_PATH = TFUX_PATH;
exports.TFUX_LIB_NAME = TFUX_LIB_NAME;
exports.TFUX_LIB_PATH = TFUX_LIB_PATH;
exports.JS_EXTENSIONS = JS_EXTENSIONS;
