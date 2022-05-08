const express = require("express");
const cors = require("cors");
const db = require("./db");
const { faker } = require("@faker-js/faker");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

function populate() {
  for (let i = 0; i < 10; i++) {
    db.run(
      "insert into users(name) values(?)",
      [faker.name.findName()],
      function (err) {
        if (err) {
          console.log("error", err);
        }
      }
    );
  }
}

db.run(
  "create table if not exists events (id integer primary key autoincrement, content text, userId integer, foreign key(userId) references users(id))"
);

app.get("/users", function (req, res) {
  db.all("select * from users", function (err, results) {
    res.json(results);
  });
});

app.get("/", function (req, res) {
  res.json({ status: "success" });
});

app.get("/events", function (req, res) {
  db.all("select * from events", function (err, results) {
    res.json(results);
  });
});

app.get("/userswithevents", function (req, res) {
  db.all(
    "select users.id, users.name, group_concat(events.content) as events from users left join events on users.id=events.userId group by users.id order by users.id",
    function getUsersWithEvents(err, result) {
      if (err) {
        console.error(err);
      }
      let users = [];
      for (let i = 0; i < result.length; i++) {
        const { id, name, events } = result[i];
        users = [...users, { id, name, events: events?.split(",") || [] }];
      }
      //const events = result.split(',')
      res.json(users);
    }
  );
});
// db.run("delete from events where userId=7");
// db.run("insert into events(content, userId) values('messi', 7)");
app.get("/users/:id", async function (req, res) {
  const { id } = req.params;
  db.all(
    "select json_object('name', users.name, 'events', json_group_array(json_object('id', events.id, 'content', events.content))) result from users left join events on events.userId=users.id where users.id = ? group by users.id",
    [id],
    function (err, data) {
      if (err) {
        return console.error(err);
      }
      console.log("user info", data);

      res.json(data);
    }
  );
});

app.post("/users/:id", function (req, res) {
  console.log("hit");
  db.run(
    "insert into events(content, userId) values('yo yo yo', ?)",
    [req.params.id],
    function (err, result) {
      console.error(err);
    }
  );
  res.json({ status: "allgood" });
});

const port = 3001 || process.env.PORT;

app.listen(port, console.log("all good server is running on port 3001"));
