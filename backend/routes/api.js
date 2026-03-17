const express = require('express');
const router = express.Router();
const Delivery = require("../models/Delivery"); 
const createCsvWriter = require('csv-writer').createObjectCsvStringifier;

// Shared memory for activity logs (This captures your clicks!)
let userActivityLogs = [];

/**
 * 1. GET ALL PENDING DELIVERIES
 * This feeds your Priority Panel and Driver App.
 * URL: https://margdarshak-4.onrender.com/api/deliveries
 */
router.get('/deliveries', async (req, res) => {
    try {
        // We only fetch 'Pending' or 'In Transit' so the UI updates live
        const data = await Delivery.find({ status: { $ne: 'Completed' } }); 
        res.status(200).json(data);
    } catch (err) {
        console.error("Fetch Error:", err);
        res.status(500).json({ error: "Database fetch failed" });
    }
});

/**
 * 2. CONFIRM ARRIVAL (The Sync Trigger)
 * This is called when you click the button in the Driver App.
 * URL: https://margdarshak-4.onrender.com/api/delivery/confirm
 */
router.post('/delivery/confirm', async (req, res) => {
    const { orderId, driverName } = req.body;

    if (!orderId) {
        return res.status(400).json({ error: "Order ID is required" });
    }

    try {
        // 1. Update the database status to 'Completed'
        const updated = await Delivery.findOneAndUpdate(
            { orderId: orderId }, 
            { status: 'Completed' },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ error: "Order not found in MongoDB" });
        }

        // 2. Log the activity for the CSV Export
        const logEntry = {
            user: driverName || "Ankit",
            action: "ARRIVED & CONFIRMED",
            order: orderId,
            timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        };

        userActivityLogs.push(logEntry);
        
        // This prints in your Render logs so you can see it working!
        console.log("Activity Captured:", logEntry);

        res.status(200).json({ 
            success: true, 
            message: `Order ${orderId} confirmed successfully.`,
            currentLogs: userActivityLogs.length 
        });
    } catch (err) {
        console.error("Confirmation Error:", err);
        res.status(500).json({ error: "Server sync failed" });
    }
});

/**
 * 3. DOWNLOAD ACTIVITY CSV
 * Generates the audit trail of all your "Confirm Arrival" clicks.
 * URL: https://margdarshak-4.onrender.com/api/download-activity-csv
 */
router.get("/download-activity-csv", (req, res) => {
    try {
        const csvWriter = createCsvWriter({
            header: [
                { id: "user", title: "Operator" },
                { id: "action", title: "Action" },
                { id: "order", title: "Order ID" },
                { id: "timestamp", title: "Time (IST)" }
            ]
        });

        // Use recorded logs, or a placeholder if no one has clicked yet
        const records = userActivityLogs.length > 0 
            ? userActivityLogs 
            : [{ user: "System", action: "No activity yet", order: "N/A", timestamp: "N/A" }];

        const csvString = csvWriter.getHeaderString() + csvWriter.stringifyRecords(records);

        // Force browser to treat this as a file download
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=Ankit_MargDarshak_Activity.csv");
        
        console.log(`Exporting ${userActivityLogs.length} activity records.`);
        res.status(200).send(csvString);
    } catch (err) {
        console.error("CSV Generation Error:", err);
        res.status(500).send("Failed to generate CSV");
    }
});

module.exports = router;