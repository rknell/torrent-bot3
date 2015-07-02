var moviedb = require('../../../lib/scrapers/moviedb');
var expect = require('chai').expect;
var q = require('q');


describe('moviedb', function () {
  it('should search for a show', function (done) {
    this.timeout(10000);
    moviedb.search("HOME AND AWAY", 1, 1)
      .then(function (result) {
        console.log(result);
        done()
      })
      .catch(done);
  });

  it('should not break the rate limit', function (done) {
    this.timeout(100000);
    var requests = [];
    for (var i = 0; i < 120; i++) {
      requests.push(moviedb.api.searchTv({query: "test"}));
    }
    q.all(requests)
      .then(function(result){
        console.log(result);
        done();
      })
      .catch(done);
  })
});