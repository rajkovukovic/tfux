'use strict';

const fs = require('fs');
const archiver = require('archiver');
const path = require('path');
const childProcess = require('child_process');
const untildify = require('untildify');
const mkdirp = require('mkdirp');
const config = require('../../../vatra.config.json');
const xml2js = require('xml2js');
const UglifyES = require('uglify-es');
const {
  GROUP_SEPARATOR,
  VERSION_SEPARATOR,
  VATRA_LIB_PATH,
} = require('../../constants/constants.js');
const { getGroupAndArt } = require('../../versions/versions');
const {
  parseJspmJSONDependency,
} = require('../../engines/jspm/tools/parse-jspm.js');
const M2_DEFAULT = '~/.m2';
const MVN_SETTINGS_DEFAULT = 'settings.xml';

const MVN_LOCAL_REPO_DEFAULT = path.join(
  config.mvn_m2_path ? config.mvn_m2_path : M2_DEFAULT,
  'repository'
);

async function checkMvnInstalled() {
  try {
    const child = childProcess.execSync(`mvn -v`);
    return Buffer.isBuffer(child) ? child.toString() : child;
  } catch (error) {
    // console.log(error);
    return null;
  }
}

function createDirPath(dirPath) {
  mkdirp.sync(path.resolve(untildify(dirPath)));
}

function getMvnRepositoryPath() {
  if (config.mvn_repo_path) return config.mvn_repo_path;
  // find it from setting.xml
  const settingsPath = path.join(
    untildify(config.mvn_m2_path ? config.mvn_m2_path : M2_DEFAULT),
    config.mvn_settings_file ? config.mvn_settings_file : MVN_SETTINGS_DEFAULT
  );
  if (fs.existsSync(settingsPath)) {
    let result = MVN_LOCAL_REPO_DEFAULT;
    const parser = new xml2js.Parser();
    const xmlSettings = fs.readFileSync(settingsPath, 'utf-8').toString();

    parser.parseString(xmlSettings, function (err, result) {
      if (err) console.log("Can't find settings.xml!");
      result =
        result.settings && result.settings.localRepository
          ? result.settings.localRepository
          : MVN_LOCAL_REPO_DEFAULT;
    });

    return result;
  } else {
    // return default
    return MVN_LOCAL_REPO_DEFAULT;
  }
}

function zipAndCopyToRepo(name) {
  const depVersionParts = parseJspmJSONDependency(name);
  const versionDep = getGroupAndArt(depVersionParts[1]);
  const groupParts = versionDep.group.split(GROUP_SEPARATOR);
  let pathToRepo = getMvnRepositoryPath();
  groupParts.forEach((p) => (pathToRepo = path.join(pathToRepo, p)));
  pathToRepo = path.join(pathToRepo, versionDep.artifact, depVersionParts[2]);
  // create repo
  createDirPath(pathToRepo);
  // Copy pom.xml
  const sourcePath = path.join(
    VATRA_LIB_PATH,
    `${versionDep.group}${GROUP_SEPARATOR}${versionDep.artifact}${VERSION_SEPARATOR}${depVersionParts[2]}`
  );
  // pom name lib-version.pom
  fs.copyFileSync(
    path.join(sourcePath, 'pom.xml'),
    path.join(
      path.resolve(untildify(pathToRepo)),
      `${versionDep.artifact}${VERSION_SEPARATOR}${depVersionParts[2]}.pom`
    )
  );
  // Zip files
  zipFolder(
    sourcePath,
    path.join(
      path.resolve(untildify(pathToRepo)),
      `${versionDep.artifact}${VERSION_SEPARATOR}${depVersionParts[2]}.zip`
    )
  );
  // Create min versions
  minZipFolder(
    sourcePath,
    path.join(
      path.resolve(untildify(pathToRepo)),
      `${versionDep.artifact}${VERSION_SEPARATOR}${depVersionParts[2]}-min.zip`
    ),
    `${versionDep.artifact}${VERSION_SEPARATOR}${depVersionParts[2]}`
  );
}

function zipFolder(sourcePath, pathToZip) {
  const output = fs.createWriteStream(pathToZip);
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Sets the compression level.
  });

  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log(
      'archiver has been finalized and the output file descriptor has closed.'
    );
  });

  output.on('end', function () {
    console.log('Data has been drained');
  });

  archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
      console.warn(err);
    } else {
      throw err;
    }
  });

  archive.on('error', function (err) {
    throw err;
  });

  archive.pipe(output);
  archive.directory(sourcePath, false);
  archive.finalize();
}

function minZipFolder(sourcePath, pathToZip, zipRoot) {
  const output = fs.createWriteStream(pathToZip);
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Sets the compression level.
  });

  output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log(
      'archiver has been finalized and the output file descriptor has closed.'
    );
  });

  output.on('end', function () {
    console.log('Data has been drained');
  });

  archive.on('warning', function (err) {
    if (err.code === 'ENOENT') {
      console.warn(err);
    } else {
      throw err;
    }
  });

  archive.on('error', function (err) {
    throw err;
  });

  archive.pipe(output);

  getAllFiles(sourcePath).forEach((f) => {
    // is js, mjs or css - minimize, else - copy
    const ext = ['js', 'mjs', 'css'];
    if (ext.find((e) => f.name.split('.').pop() === e)) {
      //minify
      // console.log(f.fullName);
      const min = minify(f.fullName);
      archive.append(min.code, { name: f.fullName.split(zipRoot).pop() });
    } else {
      archive.file(f.fullName, { name: f.fullName.split(zipRoot).pop() });
    }
  });

  archive.finalize();
}

const getAllFiles = function (dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function (file) {
    if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
      arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
    } else {
      arrayOfFiles.push({ fullName: path.join(dirPath, file), name: file });
    }
  });

  return arrayOfFiles;
};

const minify = function (file) {
  try {
    const options = {
      toplevel: true,
      compress: {
        passes: 2,
      },
      output: {
        beautify: false,
        preamble: '/* uglified */',
      },
      warnings: true,
    };

    const codeString = fs.readFileSync(untildify(file), 'utf-8').toString();
    return UglifyES.minify(codeString, options);
  } catch (error) {
    console.error('\x1b[31m', 'minify file ' + file, error);
  }
};

exports.checkMvnInstalled = checkMvnInstalled;
exports.createDirPath = createDirPath;
exports.getMvnRepositoryPath = getMvnRepositoryPath;
exports.zipAndCopyToRepo = zipAndCopyToRepo;
exports.getAllFiles = getAllFiles;
