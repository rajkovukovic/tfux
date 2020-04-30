'use strict';

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const { copyFolder } = require('../filesystem/copy-folder.js');
const { installGlobally } = require('../install/install-globally.js');
const { linkDependencies } = require('../link-dependencies/link-dependencies.js');
const { logger } = require('../logger/logger.js');
const { PROJECT_TEMPLATE_OPTIONS, VATRA_TEMPLATES_PATH } = require('../constants/constants.js');

const frameworkOptions = [PROJECT_TEMPLATE_OPTIONS.svelte, PROJECT_TEMPLATE_OPTIONS.vue];

const optionsPriority = [
  // frameworks
  ...frameworkOptions,
  // flags
  PROJECT_TEMPLATE_OPTIONS.typescript,
];

/**
 *
 * @param {PathLike} destinationPath
 * @param {Object}   options
 * @param {string[]} options.deps (dependencies)
 * @param {boolean}  options.editor (should it launch a code editor)
 * @param {boolean}  options.jsx
 * @param {boolean}  options.svelte
 * @param {boolean}  options.vue
 * @param {boolean}  options.typescript
 */
async function initProject(destinationPath, { deps: dependencies, editor, ...restOptions }) {
  try {
    // create destination dir
    if (!fs.existsSync(destinationPath)) {
      mkdirp.sync(destinationPath);
    }

    // validate options
    const selectedFrameworkOptions = frameworkOptions.filter((option) =>
      Boolean(restOptions[option])
    );
    if (selectedFrameworkOptions.length > 1) {
      throw new Error(
        `You can choose max one frontend framework. You have chosen ${JSON.stringify(
          selectedFrameworkOptions
        )}`
      );
    }

    // calculate which project template should be the staring point
    let concatenatedOptions = optionsPriority
      .filter((option) => Boolean(restOptions[option]))
      .join('-');
    concatenatedOptions = concatenatedOptions || 'js';
    const templatePath = path.join(FIREX_TEMPLATES_PATH, concatenatedOptions);

    // copy project template files to destination dir
    if (fs.existsSync(templatePath)) {
      copyFolder(templatePath, destinationPath);
    } else throw new Error(`Template "${concatenatedOptions}" has not been implemented yet.`);

    // install dependencies
    const hasDependencies = dependencies && dependencies.length > 0;
    if (hasDependencies) {
      const installedDependenciesMap = await installGlobally(dependencies);

      const installedDependencies = Array.from(installedDependenciesMap.entries())
        .filter(([packageName]) => packageName !== 'node')
        .map(([_, info]) => info.relativeDestinationPath);

      // link dependencies
      linkDependencies(destinationPath, installedDependencies);
    }

    // create POM file
    fs.writeFileSync(path.join(destinationPath, 'pom.xml'), '', 'utf8');
  } catch (error) {
    logger.info(error.trace);
  }
}

exports.initProject = initProject;
