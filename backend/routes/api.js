const express = require('express');
const router = express.Router();
const Delivery = require("../models/Delivery"); 
const createCsvWriter = require('csv-writer').createObjectCsvStringifier;

// Shared memory for activity logs (resets if server restarts)
let userActivityLogs = [];

/**
 * 1. GET DELIVERIES
 * URL: https://margdarshak-3.onrender.com/api/deliveries
 */
router.get('/deliveries', async (req, res) => {
    try {
        const data = await Delivery.find({ status: { $ne: 'Completed' } }); 
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * 2. CONFIRM ARRIVAL
 * URL: https://margdarshak-3.onrender.com/api/delivery/confirm
 */
router.post('/delivery/confirm', async (req, res) => {
    const { orderId, driverName } = req.body;
    try {
        // Find and update status
        const updatedDelivery = await Delivery.findOneAndUpdate(
            { orderId: orderId }, 
            { status: 'Completed' },
            { new: true }
        );

        if (!updatedDelivery) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Log this action for the CSV export
        userActivityLogs.push({
            user: driverName || "Ankit",
            action: "ARRIVED & CONFIRMED",
            order: orderId,
            timestamp: new Date().toLocaleTimeString()
        });

        res.json({ success: true, message: "System Synced" });
    } catch (err) {
        res.status(500).json({ error: "Sync failed" });
    }
});

/**
 * 3. DOWNLOAD CSV
 * URL: https://margdarshak-3.onrender.com/api/download-activity-csv
 */
router.get("/download-activity-csv", (req, res) => {
    const csvWriter = createCsvWriter({
        header: [
            { id: "user", title: "Operator" },
            { id: "action", title: "Action" },
            { id: "order", title: "Order ID" },
            { id: "timestamp", title: "Time" }
        ]
    });

    const csvString = csvWriter.getHeaderString() + csvWriter.stringifyRecords(userActivityLogs);

    res.header("Content-Type", "text/csv");
    res.attachment("Ankit_MargDarshak_Logs.csv");
    res.status(200).send(csvString);
});

module.exports = router;