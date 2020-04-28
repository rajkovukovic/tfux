#!/usr/bin/env node

'use strict';
const program = require('commander');
const path = require('path');

const { installGlobally } = require('./utils/install/install-globally.js');
const { uninstallDep } = require('./utils/uninstall/uninstall.js');
const { initProject } = require('./utils/init-project/init-project.js');

const install = function (value, options) {
  if (value.length < 1) fatal('Please provide at least one dependency name!');
  installGlobally(value, options); // send options.args - to install all
};

const uninstall = function (value, options) {
  if (value.length < 1) fatal('Please provide at least one dependency name!');
  uninstallDep(value, options); // send options.args - to install all
};

const create = function (value, options) {
  initProject(path.join(process.cwd(), value), options);
};

const initialize = function (options) {
  initProject(path.join(process.cwd()), options);
};

function collect(value, previous) {
  return previous.concat(value.split(','));
}

function fatal(msg) {
  print_error(msg);
  process.exit(1);
}

function print_error(msg) {
  process.stderr.write(msg);
  process.stderr.write('\n');
}

program
  .version('0.1.0')
  .command('install')
  .alias('i')
  .description('Install package and prepare to upload')
  .arguments('[name...]')
  .option('-g, --global', 'Install globally')
  .option('-zp  --zip-path <dir>', 'Path to repository.')
  .option('-m --mvn <dir>', 'Use MVN structure for repository.')
  .action(install);

program
  .command('uninstall')
  .alias('u')
  .description('Uninstall packages')
  .arguments('[names...]')
  .option('-pom  --pom-path <dir>', "Path to folder with pom.xml file. Default '.'")
  .action(uninstall);

program
  .command('create')
  .description('Create vatra project')
  .arguments('<name>')
  .option('-d, --deps [name]', 'Install dependencies (comma separated names)', collect, [])
  .option('-e --editor', 'Open editor')
  .option('-j --jsx', 'Create jsx project.')
  .option('-s --svelte', 'Create svelte project.')
  .option('-v --vue', 'Create vue project.')
  .option('-t --typescript', 'Create typescript project.')
  .action(create);

program
  .command('init')
  .description('Initialize vatra project')
  .option('-d, --deps <name>', 'Install dependencies (comma separated names)', collect, [])
  .option('-e --editor', 'Open editor')
  .option('-j --jsx', 'Create jsx project.')
  .option('-s --svelte', 'Create svelte project.')
  .option('-v --vue', 'Create vue project.')
  .option('-t --typescript', 'Create typescript project.')
  .action(initialize);

program.parse(process.argv);
