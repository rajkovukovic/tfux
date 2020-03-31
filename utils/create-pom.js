"use strict";

const fs = require('fs');
const { getPomVersionFormat } = require("./versions/versions");
const { getPomRange } = require("./versions/versions");

console.log('### Started Readin package-lock');

const packLock = require('../package-lock.json');

console.log('### package-lock: ', packLock.name, packLock.version);

let txt = '<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/maven-v4_0_0.xsd">\n' +
    '\t<modelVersion>4.0.0</modelVersion>\n' +
    `\t<groupId>tribefire.cortex.ux</groupId>\n` +
    `\t<artifactId>${packLock.name}</artifactId>\n` +
    `\t<version>${packLock.version}</version>\n` +
    '\t<packaging>pom</packaging>\n' +
    `\t<name>${packLock.name} - ${packLock.version}</name>\n` +
    '\t<dependencyManagement>\n' +
    '\t\t<dependencies>\n';

let requiresMap = {};
Object.entries(packLock.dependencies).filter(dep => !dep[1].dev && dep[1].requires)
    .forEach(d => {
        Object.entries(d[1].requires).forEach(
            r => {
                requiresMap[r[0]] = requiresMap[r[0]] ? [...requiresMap[r[0]], getPomRange(r[1], '')] : [getPomRange(r[1], '')];
            }
        )
    });

Object.entries(packLock.dependencies)
    .filter(dep => !dep[1].dev)
    .forEach((k) => {
        const dep = getGroupAndArt(k[0]);
        const ranges = getVersion(k);
        ranges.forEach(rang => {
            txt += '\t\t<dependency>\n' +
                `\t\t\t<groupId>${dep.group}</groupId>\n` +
                `\t\t\t<artifactId>${dep.artifact}</artifactId>\n` +
                `\t\t\t<version>${rang}</version>\n` +
                '\t\t</dependency>\n';
        })
    })

txt += '\t\t</dependencies> \n\t\ </dependencyManagement> \n </project>',

    writePom('pom.xml', txt);

function getGroupAndArt(name) {
    const parts = name.split('/')
    if (parts.length > 1) {
        return {
            group: parts.splice(0, parts.length - 1).join('.'),
            artifact: parts[parts.length - 1]
        }
    } else {
        return {
            group: parts[0],
            artifact: parts[0]
        }
    }
}
function getVersion(dep) {
    if (requiresMap[dep[0]]) {
        return getPomVersionFormat(requiresMap[dep[0]], dep[1].version);
    }
    return [dep[1].version];
}

function writePom(name, txt) {
    fs.writeFile(
        name,
        txt,
        (err) => (err && console.error(err)) || console.log(`### Finished writing pom.xml File`),
    );
}


