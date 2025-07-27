const mongoose = require("mongoose");

const mandiSchema = new mongoose.Schema({
  Commodity: String,
  Variety: String,
  State: String,
  District: String,
  Mandi: String,
  MinPrice: String,
  ModalPrice: String,
  MaxPrice: String,
  ArrivalDate: Date,
  Trend: String,
});

module.exports = mongoose.model("MandiPrice", mandiSchema);
