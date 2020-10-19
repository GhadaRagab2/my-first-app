const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const app = express();
const bcrypt = require("bcrypt");
const saltRounds = 10;
var serviceAccount = require("./permissions.json");

app.use(cors({ origin: true }));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://login-form-d8a23.firebaseio.com",
});
const db = admin.firestore();
// app.get("/hello-world", (req, res) => {
//   return res.status(200).send("Hello World!");
// });

// app.post("/api/create", (req, res) => {
//   (async () => {
//     try {
//       await db
//         .collection("items")
//         .doc("/" + req.body.id + "/")
//         .create({ item: req.body.item });
//       return res.status(200).send();
//     } catch (error) {
//       console.log(error);
//       return res.status(500).send(error);
//     }
//   })();
// });
app.post("/api/login", (req, res) => {
  (async () => {
    try {
      const document = db.collection("users").doc(req.body.email);
      let item = await document.get();
      let response = item.data();
      let status = 200;
      let msg = "";

      bcrypt.compare(req.body.password, response.password, (err, res) => {
        if (res === true) {
          // status = 200;
          msg = "login successfully";
        } else {
          msg = "confidential info is wrong";
          status = 404;
        }
        console.log(err);
      });
      setTimeout(() => {
        return res.status(status).send(msg);
      }, 2000);
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});
app.post("/api/register", (req, res) => {
  (async () => {
    try {
      const password = req.body.password;
      let hashedPassword = "";
      bcrypt.hash(password, saltRounds, (err, hash) => {
        hashedPassword = hash;
        console.log(err);
      });
      setTimeout(() => {
        db.collection("users")
          .doc("/" + req.body.email + "/")
          .create({ password: hashedPassword });
      }, 2000);

      return res.status(200).send();
    } catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })();
});
exports.app = functions.https.onRequest(app);
