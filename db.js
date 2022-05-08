const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database(
  "./mydb.sqlite",
  sqlite3.OPEN_READWRITE,
  function (err) {
    if (err) return console.log("is it error", err.message);
    console.log("successfully connected to the db");
  }
);

// db.run("drop table if exists users");
// db.run("drop table if exists events");

module.exports = db;
