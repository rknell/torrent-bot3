var address = require('network-address');
var peerflix = require('./torrent-engine2');
var numeral = require('numeral');

var ontorrent = function (torrent, cb) {

  var engine = peerflix(torrent, null);

  var status = {
    hotswaps: 0,
    verified: 0,
    invalid: 0,
    started: Date.now(),
    //wires: engine.swarm.wires,
    //swarm: engine.swarm,
    //path: engine.path
  };

  var wires = engine.swarm.wires;
  var swarm = engine.swarm;

  engine.on('verify', function () {
    status.verified++
  });

  engine.on('invalid-piece', function () {
    status.invalid++
  });

  engine.on('hotswap', function () {
    status.hotswaps++
  });

  var bytes = function (num) {
    return numeral(num).format('0.0b')
  }

  var active = function (wire) {
    return !wire.peerChoking
  };

  var peers = [];
  peers.forEach(function (peer) {
    engine.connect(peer)
  });

  engine.server.on('listening', function () {
    status.host = address();
    status.href = 'http://' + status.host + ':' + engine.server.address().port + '/';
    status.localHref = 'http://localhost:' + engine.server.address().port + '/';
    status.filename = engine.server.index.name.split('/').pop().replace(/\{|\}/g, '');
    status.filelength = engine.server.index.length;

    var paused;
    var draw = function (cb) {
      status.unchoked = engine.swarm.wires.filter(active);
      status.timeCurrentPause = 0;
      if (paused === true) {
        status.timeCurrentPause = Date.now() - pausedAt
      }
      status.runtime = Math.floor((Date.now() - status.started - status.timePaused - status.timeCurrentPause) / 1000);
      status.downloadSpeed = bytes(swarm.downloadSpeed());
      status.activePeers = status.unchoked.length;
      status.totalPeers = wires.length;
      status.downloaded = bytes(swarm.downloaded);
      status.uploaded = bytes(swarm.uploaded);
      status.queueLength = swarm.queued;
      status.wires = [];
      wires.forEach(function (wire) {
        var wireOutput = {
          choking: wire.peerChoking,
          address: wire.peerAddress,
          downloaded: bytes(wire.downloaded),
          speed: bytes(wire.downloadSpeed())
        };
        status.wires.push(wireOutput);
      });

      //if (cb) {
      //  cb(status);
      //}
    };

    draw();

    cb(status);

    setInterval(draw, 1000);
  });

  engine.server.once('error', function () {
    engine.server.listen(0, argv.hostname)
  });

  function noop() {
  }

  engine.swarm.on('wire', noop);

  engine.on('ready', function () {
    engine.swarm.removeListener('wire', noop);
    engine.files.forEach(function (file) {
      file.select()
    })
  });

  var onexit = function () {
    // we're doing some heavy lifting so it can take some time to exit... let's
    // better output a status message so the user knows we're working on it :)
  };

  process.on('SIGINT', function () {
    onexit();
    process.exit()
  });

  engine.stop = function () {
    engine.swarm.pause();
  }

  return engine;
};

module.exports = ontorrent;