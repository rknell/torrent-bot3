var kickassTV = require('../../../lib/scrapers/kickassTV');
var expect = require('chai').expect;

describe('kickassTV', function () {
  it("should scrape a page", function (done) {
    this.timeout(10000);
    kickassTV.scrape(1)
      .then(function (results) {
        console.log(results);
        expect(results.length).to.be.above(10);
        done()
      })
      .catch(done);
  });

  it('should save the page to the database', function (done) {
    this.timeout(1000000);
    kickassTV.scrapeAndSave(1)
      .then(function (results) {
        console.log(results);
        done()
      })
      .catch(done);

  });

  it('should scrape and save all', function (done) {
    this.timeout(1000000000);

    kickassTV.scrapeAndSaveAll(3)
      .then(function (result) {
        done()
      })
      .catch(done);
  });
});