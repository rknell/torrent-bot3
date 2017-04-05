var moment = require('moment');

function parseShowData(item) {

  var blackListRegex = /Spanish|\[ITA\]|Lektor Pl|ITTV|Subtitulado|flemish/i;
  var isBlacklisted = blackListRegex.exec(item.title);
  var showData;

  if (!isBlacklisted) {
    var qualityRegex = /720p|1080p/i;
    var formatRegex = /x264|xvid/i;


    var quality = qualityRegex.exec(item.title);

    if (!quality || !quality.length) {
      quality = "SD";
    } else {
      quality = quality[0];
    }

    var format = formatRegex.exec(item.title);

    var magnetUri;
    if (item['torrent:magneturi']) {
      magnetUri = item['torrent:magneturi']['#'];
    } else if (item['rss:link']) {
      magnetUri = item['rss:link']['#'];
    } else if (item.magnetUri) {
      magnetUri = item.magnetUri;
    }

    //Try seasonXepisode format
    var regExp = /^(.*?)([0-9]{1,})x([0-9]{1,})(.*)/i;
    var result = regExp.exec(item.title);

    if (result) {
      if (!result[4]) result[4] = "";
      showData = {
        name: result[1].trim(),
        season: Number(result[2]),
        episode: Number(result[3]),
        episodeName: result[4].trim(),
        quality: quality,
        magnetUrl: magnetUri,
        originalName: item.title
      };
    }

    //Try SxxExx format
    var regExp = /^(.*?)S([0-9]{1,})E([0-9]{1,})/i;
    var result = regExp.exec(item.title);
    if (result) {
      showData = {
        name: result[1].trim(),
        season: Number(result[2]),
        episode: Number(result[3]),
        quality: quality,
        magnetUrl: magnetUri,
        originalName: item.title,
      };
    }


    //Try date episode format (late shows)
    var regExp = /^(.*?)([0-9]{4})\-([0-9]{2}\-[0-9]{2})(.*|)(720p|1080p|)/i;
    var result = regExp.exec(item.title);
    if (result) {
      showData = {
        name: result[1].trim(),
        season: Number(result[2]),
        episode: result[3].trim(),
        episodeName: result[4].trim(),
        quality: quality,
        magnetUrl: magnetUri,
        originalName: item.title,
        airDate: new Date(result[2].trim() +"-"+ result[3].trim())
      };

      if (showData.episodeName == "720p" || showData.episodeName == "1080p") {
        showData.quality = showData.episodeName;
        showData.episodeName = null;
      }

    }

    //Try date episode format 2 (late shows)
    var regExp = /^(.*?)([0-9]{4})\ ([0-9]{2}\ [0-9]{2})(.*|)(720p|1080p|)/i;
    var result = regExp.exec(item.title);
    if (result) {
      showData = {
        name: result[1].trim(),
        season: Number(result[2]),
        episode: result[3].trim(),
        episodeName: result[4].trim(),
        quality: quality,
        magnetUrl: magnetUri,
        originalName: item.title
      };

      if (showData.episodeName == "720p" || showData.episodeName == "1080p") {
        showData.quality = showData.episodeName;
        showData.episodeName = null;
      }

    }



    if (showData && showData.name) {
      showData.name = cleanName(showData.name);
      showData.format = format || "Unknown";
    }

    //TODO: Can probably move serialisation into here
    if(showData){
      showData.size = item.size;
    } else {
      //console.log("Could not parse show data", item);
    }

    return showData;

  }
}

function cleanName(name) {
  name = name.replace(/\./gi, " ");
  name = name.replace(/\&/gi, " ");
  name = name.replace(/\'|\!|\(|\)|\-/gi, "");
  name = name.replace(/ US/, "");
  name = name.replace(/[0-9]{4}/gi, "");
  name = name.trim();
  name = name.toUpperCase();
  return name;
}

module.exports = {
  parse: parseShowData,
  _cleanName: cleanName
}