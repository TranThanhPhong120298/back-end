const express = require("express");
const app = express();
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));

//config
const config = require("config");
//MongoDB test_cluster: EkJdt8cVSJP9c1dL
const mongoose = require("mongoose");

//body-parser
const bodyParser = require("body-parser");
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);



//Db config
const db = config.get("mongoURI");

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDb Connected Yo..."))
  .catch((err) => console.log(err));

//Models
const ThongTin = require("./models/ThongTin");

//multer
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/upload");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    console.log(file);
    if (
      file.mimetype == "image/bmp" ||
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/gif" ||
      file.mimetype == "image/tiff" ||
      file.mimetype == "image/jpg"
    ) {
      cb(null, true);
    } else {
      return cb(new Error("Only image are allowed!"));
    }
  },
}).single("Image");

app.get("/add", function (req, res) {
  res.render("add");
});
app.post("/add", function (req, res) {
  //upload file
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      res.json({
        kp: 0,
        errMsg: "A Multer error occurred when uploading.",
      });
    } else if (err) {
      res.json({
        kp: 0,
        errMsg: "An unknown error occurred when uploading." + err,
      });
    } else {
      // save MongoDB (req.file.filename)
      const Item = ThongTin({
        Name: req.body.txtName,
        Image: req.file.filename,
        Note: req.body.txtNote,
        Number: req.body.txtNumber,
      });
      Item.save(function (err) {
        if (err) {
          res.json({
            kp: 0,
            errMsg: err,
          });
        } else {
          res.redirect("./list")
        }
      });
    }
  });
});

//Danh sách

app.get('/list', function (req, res) {
  ThongTin.find(function (err, data) {
    if (err) {
      res.json({
        "kq": 0,
        "errMsg": err
      })
    } else {
      res.render('list', {
        danhsach: data
      });
    }
  })
})

//Edit
app.get('/edit/:id', function (req, res) {

  ThongTin.findById(req.params.id, function (err, data) {
    if (err) {
      res.json({
        "kq": 0,
        "errMsg": err
      })
    } else {
      console.log(data);
      res.render('edit', {
        thongtin: data
      });
    }
  })

  //Lay thong tin chi tiet cua :id

})

app.post('/edit', function (req, res) {

  //Check khach hang CO CHON FILE IMG MOI HAY KHONG?
  /*
    return {}/Undefined
    console.log(req.body);
    console.log(req.file);
  */

  //Khach hang co upload file new
  //upload file
  upload(req, res, function (err) {

    //Khach hang khong chon file img
    if (!req.file) {
      ThongTin.updateOne({
        _id: req.body.IDThongTin
      }, {
        Name: req.body.txtName,
        Notes: req.body.txtNotes,
        Number: req.body.txtNumber
      }, function (err) {
        if (err) {
          res.json({
            "kq": 0,
            "errMsg": err
          })
        } else {
          res.redirect("./list");
        }
      });
    } else {
      //Khach hang chon file img new
      if (err instanceof multer.MulterError) {
        res.json({
          kp: 0,
          errMsg: "A Multer error occurred when uploading.",
        });
      } else {
        if (err) {
          res.json({
            kp: 0,
            errMsg: "An unknown error occurred when uploading." + err,
          });
        } else {
          // Upload MongoDB (req.file.filename)
          ThongTin.updateOne({
            _id: req.body.IDThongTin
          }, {
            Name: req.body.txtName,
            Image: req.file.filename,
            Notes: req.body.txtNotes,
            Number: req.body.txtNumber
          }, function (err) {
            if (err) {
              res.json({
                "kq": 0,
                "errMsg": err
              })
            } else {
              res.redirect("./list");
            }
          });
        }
      }
    }
  });

})

app.get("/delete/:id", function (req, res) {
  ThongTin.deleteOne({
    _id: req.params.id
  }, function (err) {
    if (err) {
      res.json({
        "kq": 0,
        "errMsg": err
      })
    } else {
      res.redirect("../list");
    }
  })
})
// Run Server -----------------------------
const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server has started on port ${port}`));