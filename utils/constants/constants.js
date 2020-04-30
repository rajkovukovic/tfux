'use strict';

const os = require('os');
const path = require('path');
const untildify = require('untildify');

const { name: CLI_TOOL_NAME } = require('../../package.json');
const JSPM_BIN_PATH = path.join(
  require.main.filename.substring(0, require.main.filename.lastIndexOf('/')),
  'node_modules/jspm',
  'bin/jspm'
);
const CWD = process.cwd();
const TMP_DIR = path.resolve(untildify(path.join(os.tmpdir(), 'firex')));
const FIREX_PATH_ENV = process.env.FIREX_PATH;
const FIREX_PATH = path.resolve(FIREX_PATH_ENV ? untildify(FIREX_PATH_ENV) : untildify('~/.firex'));
const FIREX_LIB_NAME = 'lib';
const FIREX_LIB_PATH = path.join(FIREX_PATH, FIREX_LIB_NAME);
const FIREX_TEMPLATES_PATH = path.join(
  path.dirname(require.main.filename),
  'new-project-templates'
);
const JS_EXTENSIONS = ['.js', '.mjs'];

const ENGINE_TYPES = {
  jspm: 'jspm',
  npm: 'npm',
};

const DEFAULT_GROUP_FOR_NEW_PROJECT = 'js';
const DEFAULT_GROUP_FOR_3RD_PARTY = 'js';
const GROUP_SEPARATOR = '.';
const VERSION_SEPARATOR = '-';

const PROJECT_TEMPLATE_OPTIONS = {
  svelte: 'svelte',
  typescript: 'typescript',
  vue: 'vue',
};

exports.CLI_TOOL_NAME = CLI_TOOL_NAME;
exports.JSPM_BIN_PATH = JSPM_BIN_PATH;
exports.CWD = CWD;
exports.TMP_DIR = TMP_DIR;
exports.FIREX_PATH = FIREX_PATH;
exports.FIREX_LIB_NAME = FIREX_LIB_NAME;
exports.FIREX_LIB_PATH = FIREX_LIB_PATH;
exports.FIREX_TEMPLATES_PATH = FIREX_TEMPLATES_PATH;
exports.JS_EXTENSIONS = JS_EXTENSIONS;

exports.ENGINE_TYPES = ENGINE_TYPES;

exports.DEFAULT_GROUP_FOR_NEW_PROJECT = DEFAULT_GROUP_FOR_NEW_PROJECT;
exports.DEFAULT_GROUP_FOR_3RD_PARTY = DEFAULT_GROUP_FOR_3RD_PARTY;
exports.GROUP_SEPARATOR = GROUP_SEPARATOR;
exports.VERSION_SEPARATOR = VERSION_SEPARATOR;
exports.PROJECT_TEMPLATE_OPTIONS = PROJECT_TEMPLATE_OPTIONS;
