const uuid = require("uuid");

var users;

var sqlite3 = require("sqlite3");
const createDatabase = require("./db/createDatabase");
let db = new sqlite3.Database(
  "./db/dataBase.db",
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (err) => {
    if (err && err.code == "SQLITE_CANTOPEN") {
      createDatabase();
      return;
    } else if (err) {
      console.log("Getting error " + err);
      exit(1);
    }
    const createTables = require("./db/createTables");
    createTables(db);

    var result = {};
    new Promise((resolve, reject) => {
      db.all(
        `select user_name, user_pass, user_speed, user_gravity from user`,
        (err, rows) => {
          if (err) {
            console.log(err);
          } else {
            rows.forEach((row) => {
              result[row.user_name] = row.user_pass;
              result[`${row.user_name}_speed`] = row.user_speed;
              result[`${row.user_name}_grav`] = row.user_gravity;
            });
            resolve(result);
          }
        }
      );
    }).then((result) => {
      users = result;
    });
  }
);

const fetchData = () => {
  let db = new sqlite3.Database(
    "./db/dataBase.db",
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err && err.code == "SQLITE_CANTOPEN") {
        createDatabase();
        return;
      } else if (err) {
        console.log("Getting error " + err);
        exit(1);
      }
      const createTables = require("./db/createTables");
      createTables(db);

      var result = {};
      new Promise((resolve, reject) => {
        db.all(
          `select user_name, user_pass, user_speed, user_gravity from user`,
          (err, rows) => {
            if (err) {
              console.log(err);
            } else {
              rows.forEach((row) => {
                result[row.user_name] = row.user_pass;
                result[`${row.user_name}_speed`] = row.user_speed;
                result[`${row.user_name}_grav`] = row.user_gravity;
              });
              resolve(result);
            }
          }
        );
      }).then((result) => {
        users = result;
      });
    }
  );
};

class Session {
  constructor(username, expiresAt) {
    this.username = username;
    this.expiresAt = expiresAt;
  }

  isExpired() {
    this.expiresAt < new Date();
  }
}

const sessions = {};

const signinHandler = (req, res) => {
  fetchData();

  const { username, password } = req.body;
  if (!username) {
    res.status(401).end();
    return;
  }

  const expectedPassword = users[username];
  if (!expectedPassword || expectedPassword !== password) {
    res.status(401).end();
    return;
  }

  const sessionToken = uuid.v4();

  const now = new Date();
  const expiresAt = new Date(+now + 12000 * 1000);

  const session = new Session(username, expiresAt);
  sessions[sessionToken] = session;

  res.cookie("session_token", sessionToken, { expires: expiresAt });
  res.redirect("/");
  res.end();
};

const updateUserParams = (speed, grav) => {
  const updateParameters = require("../db/updateParameters");

  updateParameters(userSession.username, speed, grav);
};

const getParams = (req, res) => {
  fetchData();

  const sessionToken = req.cookies["session_token"];
  userSession = sessions[sessionToken];
  res.json({
    name: `${userSession.username}`,
    speed: `${users[userSession.username + "_speed"]}`,
    gravity: `${users[userSession.username + "_grav"]}`,
  });
};

const welcomeHandler = (req, res) => {
  if (!req.cookies) {
    res.render("notLogged", { width: "200px" });
    return;
  }

  const sessionToken = req.cookies["session_token"];
  if (!sessionToken) {
    res.render("notLogged", { width: 200 });
    return;
  }

  userSession = sessions[sessionToken];
  if (!userSession) {
    res.render("notLogged", { width: "200px" });
    return;
  }
  if (userSession.isExpired()) {
    delete sessions[sessionToken];
    // res.status(401).end();
    res.render("notLogged", { width: "200px" });
    return;
  }

  res.render("logged");
  return false;
};

const welcomeHandlerPost = (req, res) => {
  const sessionToken = req.cookies["session_token"];
  userSession = sessions[sessionToken];
  const updateParameters = require("./db/updateParameters");
  updateParameters(db, userSession.username, req.body.speed, req.body.gravity);
  fetchData();

  res.render("logged");
};

const loginHandler = (req, res) => {
  if (req.cookies) {
    const sessionToken = req.cookies["session_token"];
    if (sessionToken) {
      userSession = sessions[sessionToken];
      if (userSession) {
        if (!userSession.isExpired()) {
          res.redirect("/");
        }
      }
    }
  }

  res.render("login");
};

const registerHandler = (req, res) => {
  if (req.cookies) {
    const sessionToken = req.cookies["session_token"];
    if (sessionToken) {
      userSession = sessions[sessionToken];
      if (userSession) {
        if (!userSession.isExpired()) {
          res.redirect("/");
        }
      }
    }
  }

  res.render("register");
};

const logoutHandler = (req, res) => {
  if (!req.cookies) {
    res.status(401).end();
    return;
  }

  const sessionToken = req.cookies["session_token"];
  if (!sessionToken) {
    res.status(401).end();
    return;
  }

  delete sessions[sessionToken];

  res.cookie("session_token", "", { expires: new Date() });
  res.redirect("/");
  res.end();
};

const createUserHandler = (req, res) => {
  const { username, password } = req.body;
  if (!username) {
    res.status(401).end();
    return;
  }
  if (!password) {
    res.status(401).end();
    return;
  }

  if (users[username]) {
    res.json({
      modal: "true",
    });
    res.end();
    return;
  } else {
    db.exec(
      `
      insert into user (user_name, user_pass)
        values ('${username}', '${password}');
  
            `,
      () => {
        var result = {};

        new Promise((resolve, reject) => {
          db.all(`select user_name, user_pass from user`, (err, rows) => {
            if (err) {
              console.log(err);
            } else {
              rows.forEach((row) => {
                result[row.user_name] = row.user_pass;
              });
              resolve(result);
            }
          });
        }).then((result) => {});
      }
    );
  }

  fetchData();

  res.end();
};

module.exports = {
  signinHandler,
  welcomeHandler,
  logoutHandler,
  createUserHandler,
  loginHandler,
  registerHandler,
  updateUserParams,
  welcomeHandlerPost,
  getParams,
};
