module.exports = function (app) {
  // Handlers =========

  const {
    signinHandler,
    welcomeHandler,
    logoutHandler,
    createUserHandler,
    loginHandler,
    registerHandler,
    welcomeHandlerPost,
    getParams,
  } = require("./handlers");

  app.get("/", welcomeHandler);
  app.post("/", welcomeHandlerPost);
  app.post("/signin", signinHandler);
  app.get("/logout", logoutHandler);
  app.post("/newUser", createUserHandler);
  app.get("/getParams", getParams);
  // ==================

  app.get("/login", loginHandler);
  app.get("/register", registerHandler);
};
