'use strict';

const fs = require('fs');
const path = require('path');
const untildify = require('untildify');
const xml2js = require('xml2js');

const remove = function (dependencies, options) {
  // read pom.xml from project
  const pomPath = options.pomPath
    ? options.pomPath.endsWith('pom.xml')
      ? options.pomPath.substring(0, options.pomPath.lastIndexOf('/'))
      : options.pomPath
    : process.cwd();
  const pom = fs.readFileSync(untildify(path.join(pomPath, 'pom.xml')), 'utf-8');
  // remove dependency
  const parser = new xml2js.Parser();
  const builder = new xml2js.Builder();
  let xml = null;
  parser.parseString(pom, function (err, result) {
    if (err) {
      console.log("Can't find pom.xml!");
    } else {
      result.project.dependencies[0].dependency = result.project.dependencies[0].dependency.filter(
        (dep) => !dependencies.find((d) => d === dep.artifactId[0])
      );
      xml = builder.buildObject(result);
    }
  });
  // save pom.xml
  fs.writeFileSync(untildify(path.join(pomPath, 'pom.xml')), xml, 'utf8');
};

exports.remove = remove;
