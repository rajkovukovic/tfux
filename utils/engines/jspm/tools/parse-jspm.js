"use strict";

function parseJspmJSONDependency(fullDependencyName) {
  const splitAtAt = fullDependencyName.split("@");
  const version = splitAtAt.pop();
  const splitAtColon = splitAtAt.join("@").split(":");
  const name = splitAtColon.pop();
  if (splitAtColon.length > 1) {
    throw new Error(
      `Can not parse JspmJSONDependency "${fullDependencyName}". Seems like too many colons`
    );
  }
  const group = splitAtColon.length > 0 ? splitAtColon[0] : null;
  return [group, name, version];
}

exports.parseJspmJSONDependency = parseJspmJSONDependency;
