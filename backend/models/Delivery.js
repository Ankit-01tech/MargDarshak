const mongoose = require('mongoose');

const DeliverySchema = new mongoose.Schema({
    orderId: { type: String, required: true, unique: true },
    address: { type: String, required: true },
    priority: { type: Number, default: 50 }, // 0-100
    status: { type: String, default: 'Pending' }, // Pending, In Transit, Completed
    parkingDifficulty: { type: String, default: 'Medium' },
    lat: Number,
    lng: Number
});

module.exports = mongoose.model('Delivery', DeliverySchema);