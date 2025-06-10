const mongoose = require("mongoose");

const CountrySchema = new mongoose.Schema({
  CountryCode: Number,
  Country: String
});

module.exports = mongoose.model("Country", CountrySchema);
