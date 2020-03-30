function parseJspmJSONDependency(fullDependencyName) {
  "npm:@jspm/core@1.0.4";
  const splitAtAt = fullDependencyName.split("@");
  const version = splitAtAt.pop();
  const splitAtColon = splitAtAt.join("@");
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
