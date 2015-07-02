var data = require('../../../lib/scrapers/data');
var expect = require('chai').expect;

describe('data', function () {
  it('should save a TV Show', function (done) {
    this.timeout(20000);
    data.saveEpisode('test', 1, 1, "test", "SD", "Test Original Name")
      .then(function () {
        var database = require("../../db-test.json");
        expect(database.shows.test.seasons["1"]["1"].sources.length).to.equal(1);
        done();
      })
      .catch(done);
  });

  it('should not double up a TV Show', function (done) {
    data.saveEpisode('test', 1, 1, "test", "SD", "Test Original Name")
      .then(function () {
        var database = require("../../db-test.json");
        expect(database.shows.test.seasons["1"]["1"].sources.length).to.equal(1);
        done();
      })
      .catch(done);
  });
});