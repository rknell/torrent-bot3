var Datastore = require('nedb');
var path = require('path');

var output = {
  allShows: new Datastore({autoload: true, filename: path.join(process.cwd(), "db", "allShows")}),
  recentShows: new Datastore({autoload: true, filename: path.join(process.cwd(), "db", "recentShows")}),
  allMovies: new Datastore({autoload: true, filename: path.join(process.cwd(), "db", "allMovies")}),
  recentMovies: new Datastore({autoload: true, filename: path.join(process.cwd(), "db", "recentMovies")})
};

// Using a unique constraint with the index
output.allShows.ensureIndex({fieldName: 'name', unique: true}, function (err) {
  if (err) console.log("Error creating index allShows", err);
});

// Using a unique constraint with the index
output.allMovies.ensureIndex({fieldName: 'name', unique: true}, function (err) {
  if (err) console.log("Error creating index showData", err);
});

module.exports = output;