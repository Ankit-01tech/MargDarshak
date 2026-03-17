const mongoose = require('mongoose');
const Delivery = require('./models/Delivery'); // Ensure path is correct
require('dotenv').config();

const mumbaiOrders = [
  { orderId: "ORD-1001", address: "Gateway of India, Colaba", priority: 95, status: "Pending", parkingDifficulty: "high", lat: 18.9220, lng: 72.8347, eta: "8 min" },
  { orderId: "ORD-1002", address: "Bandra-Kurla Complex (BKC)", priority: 82, status: "In Transit", parkingDifficulty: "medium", lat: 19.0674, lng: 72.8685, eta: "12 min" },
  { orderId: "ORD-1003", address: "Nariman Point Business Hub", priority: 91, status: "Pending", parkingDifficulty: "high", lat: 18.9256, lng: 72.8242, eta: "5 min" },
  { orderId: "ORD-1004", address: "Andheri East Metro Zone", priority: 65, status: "Pending", parkingDifficulty: "medium", lat: 19.1136, lng: 72.8697, eta: "18 min" },
  { orderId: "ORD-1005", address: "Worli Sea Face Road", priority: 45, status: "In Transit", parkingDifficulty: "low", lat: 19.0176, lng: 72.8161, eta: "22 min" },
  { orderId: "ORD-1006", address: "Lower Parel Palladium", priority: 88, status: "Pending", parkingDifficulty: "high", lat: 18.9926, lng: 72.8297, eta: "10 min" },
  { orderId: "ORD-1007", address: "Juhu Beach Residences", priority: 30, status: "Pending", parkingDifficulty: "medium", lat: 19.1075, lng: 72.8263, eta: "35 min" },
  { orderId: "ORD-1008", address: "Powai Hiranandani Gardens", priority: 77, status: "Pending", parkingDifficulty: "medium", lat: 19.1176, lng: 72.9060, eta: "15 min" },
  { orderId: "ORD-1009", address: "Dadar West Station Road", priority: 98, status: "Pending", parkingDifficulty: "high", lat: 19.0178, lng: 72.8478, eta: "3 min" },
  { orderId: "ORD-1010", address: "Vile Parle SV Road", priority: 55, status: "Pending", parkingDifficulty: "low", lat: 19.1025, lng: 72.8454, eta: "20 min" }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
    console.log("Connected to MongoDB for Seeding...");

    // Clear existing deliveries
    await Delivery.deleteMany({});
    console.log("Cleared old delivery data.");

    // Insert new Mumbai data
    await Delivery.insertMany(mumbaiOrders);
    console.log("Successfully seeded 10 Mumbai Logistics Orders! 🚀");

    process.exit();
  } catch (err) {
    console.error("Seeding Error:", err);
    process.exit(1);
  }
};

seedDB();