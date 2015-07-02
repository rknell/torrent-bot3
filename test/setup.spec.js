/* global before */
var path = require('path');
var fs = require('fs');

dbPath = path.join(__dirname, "db-test.json");

before(function (done) {
  fs.writeFile(dbPath, "[]", function (err) {
    done();
  });
})