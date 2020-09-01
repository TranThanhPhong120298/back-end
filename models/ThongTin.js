const mongoose = require("mongoose");

const Schema = new mongoose.Schema({
  Name: String,
  Image: String,
  Note: String,
  Number: Number,
});

module.exports = mongoose.model("ThongTin", Schema);