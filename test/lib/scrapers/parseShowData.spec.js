var parseShowData = require('../../../lib/scrapers/parseShowData');
var expect = require('chai').expect;

describe('parseShowData', function () {
    it('should parse Alaskan Bush People 2x13 A Big Gamble 720p', function () {
        var result = parseShowData.parse({
            title: "Alaskan Bush People 2x13 A Big Gamble 720p",
            magnetUri: "magnetUri"
        })

        expect(result.name).to.equal("ALASKAN BUSH PEOPLE");
        expect(result.season).to.equal(2);
        expect(result.episode).to.equal(13);
        expect(result.quality).to.equal("720p");
        expect(result.magnetUrl).to.equal("magnetUri");
        expect(result.originalName).to.equal("Alaskan Bush People 2x13 A Big Gamble 720p");
    });

    it('should parse Dark Matter 1x03 720p', function () {
        var result = parseShowData.parse({
            title: "Dark Matter 1x03 720p",
            magnetUri: "magnetUri"
        })

        expect(result.name).to.equal("DARK MATTER");
        expect(result.season).to.equal(1);
        expect(result.episode).to.equal(3);
        expect(result.quality).to.equal("720p");
        expect(result.magnetUrl).to.equal("magnetUri");
        expect(result.originalName).to.equal("Dark Matter 1x03 720p");
    });

    it('should parse Defiance 3x04 Dead Air', function () {
        var result = parseShowData.parse({
            title: "Defiance 3x04 Dead Air",
            magnetUri: "magnetUri"
        })

        expect(result.name).to.equal("DEFIANCE");
        expect(result.season).to.equal(3);
        expect(result.episode).to.equal(4);
        expect(result.quality).to.equal("SD");
        expect(result.magnetUrl).to.equal("magnetUri");
        expect(result.originalName).to.equal("Defiance 3x04 Dead Air");
    });

    it('should parse The Graham Norton Show 17x12 Lewis Hamilton, Ewan McGregor, Jack Whitehall, Rita Ora 720p', function () {
        var result = parseShowData.parse({
            title: "The Graham Norton Show 17x12 Lewis Hamilton, Ewan McGregor, Jack Whitehall, Rita Ora 720p",
            magnetUri: "magnetUri"
        })

        expect(result.name).to.equal("THE GRAHAM NORTON SHOW");
        expect(result.season).to.equal(17);
        expect(result.episode).to.equal(12);
        expect(result.quality).to.equal("720p");
        expect(result.magnetUrl).to.equal("magnetUri");
        expect(result.originalName).to.equal("The Graham Norton Show 17x12 Lewis Hamilton, Ewan McGregor, Jack Whitehall, Rita Ora 720p");
    });

    it('should parse The Flash 2014 s01e01 ', function () {
        var result = parseShowData.parse({
            title: "The Flash 2014 s01e01 ",
            magnetUri: "magnetUri"
        })

        expect(result.name).to.equal("THE FLASH");
        expect(result.season).to.equal(1);
        expect(result.episode).to.equal(1);
        expect(result.quality).to.equal("SD");
        expect(result.magnetUrl).to.equal("magnetUri");
        expect(result.originalName).to.equal("The Flash 2014 s01e01 ");
    });


});