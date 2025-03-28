const express = require("express");
const app = express();
 

const port = process.env.PORT || 8000;
const db = require("../db/index.js");
const bodyParser = require("body-parser");
const cors = require("cors");
app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");



app.get("/", (req, res) => {
    res.send("Hello World!");
});
app.use("/api/admin", require("../routes/admin.js"));
app.use("/api/user", require("../routes/user.js"));
db.sequelize.sync().then(() => {
    console.log("Database Connected.");
  });

app.listen(port, () => {
    console.log(`Commanding at ${port}`);
});