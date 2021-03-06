///
/// TEST APPS
///

// an empty app. notably this app has no .meteor/release file.
var emptyAppDir = path.join(__dirname, 'empty-app');


///
/// TESTS
///

console.log("nodeModules: 'skip'");
assert.doesNotThrow(function () {
  var tmpOutputDir = tmpDir();
  var errors = bundler.bundle(emptyAppDir, tmpOutputDir, {nodeModulesMode: 'skip', releaseStamp: 'none', minify: true});
  assert.strictEqual(errors, undefined, errors && errors[0]);

  // sanity check -- main.js has expected contents.
  assert.strictEqual(fs.readFileSync(path.join(tmpOutputDir, "main.js"), "utf8").trim(),
                     "require('./server/server.js');");
  // no top level node_modules directory
  assert(!fs.existsSync(path.join(tmpOutputDir, "server", "node_modules")));
  // yes package node_modules directory
  assert(fs.lstatSync(path.join(
    tmpOutputDir, "app", "packages", "livedata", "node_modules"))
         .isDirectory());

  // verify that contents are minified
  var appHtml = fs.readFileSync(path.join(tmpOutputDir, "app.html"));
  assert(/src=\"\/[0-9a-f]{40,40}.js\"/.test(appHtml));
  assert(!(/src=\"\/packages/.test(appHtml)));
});

console.log("nodeModules: 'skip', no minify");
assert.doesNotThrow(function () {
  var tmpOutputDir = tmpDir();
  var errors = bundler.bundle(emptyAppDir, tmpOutputDir, {nodeModulesMode: 'skip', minify: false, releaseStamp: 'none'});
  assert.strictEqual(errors, undefined);

  // sanity check -- main.js has expected contents.
  assert.strictEqual(fs.readFileSync(path.join(tmpOutputDir, "main.js"), "utf8").trim(),
                     "require('./server/server.js');");
  // verify that contents are not minified
  var appHtml = fs.readFileSync(path.join(tmpOutputDir, "app.html"));
  assert(!(/src=\"\/[0-9a-f]{40,40}.js\"/.test(appHtml)));
  assert(/src=\"\/packages\/meteor/.test(appHtml));
  assert(/src=\"\/packages\/deps/.test(appHtml));
  // verify that tests aren't included
  assert(!(/src=\"\/packages\/meteor\/url_tests.js/.test(appHtml)));
});

console.log("nodeModules: 'skip', no minify, testPackages: ['meteor']");
assert.doesNotThrow(function () {
  var tmpOutputDir = tmpDir();
  var errors = bundler.bundle(
    emptyAppDir, tmpOutputDir, {nodeModulesMode: 'skip', minify: false, testPackages: ['meteor'], releaseStamp: 'none'});
  assert.strictEqual(errors, undefined);

  // sanity check -- main.js has expected contents.
  assert.strictEqual(fs.readFileSync(path.join(tmpOutputDir, "main.js"), "utf8").trim(),
                     "require('./server/server.js');");
  // verify that tests for the meteor package are included
  var appHtml = fs.readFileSync(path.join(tmpOutputDir, "app.html"));
  assert(/src=\"\/packages\/meteor\/url_tests.js/.test(appHtml));
});

console.log("nodeModules: 'copy'");
assert.doesNotThrow(function () {
  var tmpOutputDir = tmpDir();
  var errors = bundler.bundle(emptyAppDir, tmpOutputDir, {nodeModulesMode: 'copy', releaseStamp: 'none'});
  assert.strictEqual(errors, undefined);

  // sanity check -- main.js has expected contents.
  assert.strictEqual(fs.readFileSync(path.join(tmpOutputDir, "main.js"), "utf8").trim(),
                     "require('./server/server.js');");
  // node_modules directory exists and is not a symlink
  assert(!fs.lstatSync(path.join(tmpOutputDir, "server", "node_modules")).isSymbolicLink());
  // node_modules contains fibers
  assert(fs.existsSync(path.join(tmpOutputDir, "server", "node_modules", "fibers")));
});

console.log("nodeModules: 'symlink'");
assert.doesNotThrow(function () {
  var tmpOutputDir = tmpDir();
  var errors = bundler.bundle(emptyAppDir, tmpOutputDir, {nodeModulesMode: 'symlink', releaseStamp: 'none'});
  assert.strictEqual(errors, undefined);

  // sanity check -- main.js has expected contents.
  assert.strictEqual(fs.readFileSync(path.join(tmpOutputDir, "main.js"), "utf8").trim(),
                     "require('./server/server.js');");
  // node_modules directory exists and is a symlink
  assert(fs.lstatSync(path.join(tmpOutputDir, "server", "node_modules")).isSymbolicLink());
  // node_modules contains fibers
  assert(fs.existsSync(path.join(tmpOutputDir, "server", "node_modules", "fibers")));

  // package node_modules directory also a symlink
  assert(fs.lstatSync(path.join(
    tmpOutputDir, "app", "packages", "livedata", "node_modules"))
         .isSymbolicLink());
});
