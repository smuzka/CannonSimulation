module.exports = function createDatabase() {
  var newdb = new sqlite3.Database("dataBase.db", (err) => {
    if (err) {
      console.log("Getting error " + err);
      exit(1);
    }
    var createTables = require("./createTables.js");
    createTables(newdb);
  });
};
