"use strict";

const { AbstractEngine } = require("../abstract-engine/abstract-engine.js");

class NpmEngine extends AbstractEngine {
  constructor(...args) {
    super(...args);
    throw new Error("NpmEngine needs to be implemented");
  }
}

exports.NpmEngine = NpmEngine;
