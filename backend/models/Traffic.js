const mongoose = require("mongoose");

const TrafficSchema = new mongoose.Schema({
  location: String,
  vehicles: Number,
  congestionLevel: String,
  time: String
});

module.exports = mongoose.model("Traffic", TrafficSchema);