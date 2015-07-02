var showRss = require('../../../lib/scrapers/showRss');
var expect = require('chai').expect;

describe('showRss', function () {
  it('should get a list of torrents', function (done) {
    this.timeout(4000);
    showRss.fetch("http://showrss.info/feeds/all.rss")
      .then(function(result){
        console.log(result);
        expect(result).to.exist;
        expect(result.length).to.be.above(5);
        expect(result[0].magnetUrl).to.exist;
        expect(result[0].season).to.exist;
        expect(result[0].episode).to.exist;
        expect(result[0].name).to.exist;
        expect(result[0].quality).to.exist;
        expect(result[0].originalName).to.exist;
        done();
      })
      .catch(done);
  });

  it('should scrape and save all', function(done){
    this.timeout(10000000);
    showRss.updateAndSave()
      .then(function(result){
        done();
      })
      .catch(done)
  })
});