var express = require("express");
var app = express();
const PORT = process.env.PORT || 3000;
var hbs = require("express-handlebars");
app.use(express.static("static"));
const path = require("path");

const Datastore = require("nedb");

const coll1 = new Datastore({
  filename: "kolekcja1.db",
  autoload: true,
});

app.set("views", path.join(__dirname, "views")); // ustalamy katalog views
app.engine(
  "hbs",
  hbs({
    defaultLayout: "main.hbs",
    helpers: {
      Add: function (index) {
        return parseInt(index) + 1;
      },
    },
  })
); // domyślny layout, potem można go zmienić
app.set("view engine", "hbs");

app.get("/", function (req, res) {
  coll1.find({}, function (err, docs) {
    let json = {
      items: docs,
    };

    res.render("index.hbs", json);
  });
});
app.get("/handleForm", function (req, res) {
  let obj = {
    a: req.query.ubezpieczenie == "on" ? "TAK" : "NIE",
    b: req.query.benzyna == "on" ? "TAK" : "NIE",
    c: req.query.uszkodzenie == "on" ? "TAK" : "NIE",
    d: req.query.xdrive == "on" ? "TAK" : "NIE",
  };

  coll1.insert(obj);
  res.redirect("/");
});

app.get("/actionA", function (req, res) {
  if (req.query.deleteInput === "delete") {
    coll1.remove({ _id: req.query.record }, {}, function (err, numRemoved) {
      coll1.find({}, function (err, docs) {
        let json = {
          items: docs,
        };

        res.render("index.hbs", json);
      });
    });
  } else {
    coll1.find({}, function (err, docs) {
      let json = {
        items: docs,
      };

      res.render("index.hbs", json);
    });
  }
});

app.get("/actionB", function (req, res) {
  coll1.find({}, function (err, docs1) {
    let docs = docs1.map((item) => {
      if (req.query.record == item._id) {
        return {
          a: item.a,
          b: item.b,
          c: item.c,
          d: item.d,
          _id: item._id,
          selected: true,
        };
      } else {
        return {
          a: item.a,
          b: item.b,
          c: item.c,
          d: item.d,
          _id: item._id,
        };
      }
    });
    let json = {
      edit: true,
      items: docs,
    };
    res.render("index.hbs", json);
  });
});

app.get("/actionUPDATE", function (req, res) {
  coll1.update(
    { _id: req.query.records },
    {
      $set: {
        a: req.query.selectA,
        b: req.query.selectB,
        c: req.query.selectC,
        d: req.query.selectD,
      },
    },
    {},
    function (err, numUptaded) {
      coll1.find({}, function (err, docs) {
        let json = {
          items: docs,
        };

        res.render("index.hbs", json);
      });
    }
  );
});

app.listen(PORT, function () {
  console.log("start serwera na porcie " + PORT);
});
