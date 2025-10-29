// auth.test.js

const { JSDOM } = require("jsdom");

describe("Login functionality", () => {
  let document, window;

  beforeEach(() => {
    const dom = new JSDOM(`
      <div id="loginError"></div>
      <input id="username" />
      <input id="password" />
    `, { runScripts: "dangerously" });
    document = dom.window.document;
    window = dom.window;
    global.document = document;
    global.localStorage = {
      data: {},
      setItem(k, v) { this.data[k] = v; },
      getItem(k) { return this.data[k]; },
      removeItem(k) { delete this.data[k]; }
    };
  });

  test("Successful login sets localStorage", () => {
    document.getElementById("username").value = "admin";
    document.getElementById("password").value = "seedvault";
    require("../auth.js");
    window.handleLogin();
    expect(localStorage.getItem("loggedInUser")).toBe("admin");
  });
});
